const db = require("../config/db");

// Leave type -> balance column. Only these values are ever put into SQL.
const LEAVE_COLUMNS = {
  casual: "casual_leave",
  sick: "sick_leave",
  earned: "earned_leave",
};

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Employees can only read their own data. Admins can read anyone's.
const canAccess = (req, userId) =>
  req.user.role === "admin" || String(req.user.id) === String(userId);

const serverError = (res, label, error) => {
  console.error(label, error);

  res.status(500).json({
    message: "Server error",
  });
};

// ======================================================
// EMPLOYEE: Get leave balance
// ======================================================

const getLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!canAccess(req, userId)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const [rows] = await db.query(
      `SELECT
        casual_total,
        casual_leave,
        sick_total,
        sick_leave,
        earned_total,
        earned_leave,
        unpaid_leave
       FROM leave_balances
       WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Leave balance not found",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    serverError(res, "Get balance error:", error);
  }
};

// ======================================================
// EMPLOYEE: Get leave history
// ======================================================

const getMyLeaves = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!canAccess(req, userId)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const [rows] = await db.query(
      `SELECT
        id,
        leave_type,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        reason,
        status,
        admin_comment,
        applied_at
       FROM leave_requests
       WHERE user_id = ?
       ORDER BY applied_at DESC
       LIMIT 200`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    serverError(res, "Get my leaves error:", error);
  }
};

// ======================================================
// EMPLOYEE: Apply for leave
// ======================================================

const applyLeave = async (req, res) => {
  try {
    // The user comes from the verified token, never from the request body
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "Only employees can apply for leave",
      });
    }

    const { leave_type, start_date, end_date } = req.body;
    const reason = String(req.body.reason || "").trim();

    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!LEAVE_COLUMNS[leave_type]) {
      return res.status(400).json({
        message: "Invalid leave type",
      });
    }

    if (!DATE_REGEX.test(start_date) || !DATE_REGEX.test(end_date)) {
      return res.status(400).json({
        message: "Dates must be in YYYY-MM-DD format",
      });
    }

    // ISO dates compare correctly as plain strings
    if (end_date < start_date) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    if (reason.length > 500) {
      return res.status(400).json({
        message: "Reason must be 500 characters or less",
      });
    }

    await db.query(
      `INSERT INTO leave_requests
      (user_id, leave_type, start_date, end_date, reason)
      VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, leave_type, start_date, end_date, reason]
    );

    res.status(201).json({
      message: "Leave applied successfully",
    });
  } catch (error) {
    serverError(res, "Apply leave error:", error);
  }
};

// ======================================================
// ADMIN: Dashboard statistics (one query instead of four)
// ======================================================

const getAdminStats = async (req, res) => {
  try {
    const [[row]] = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'employee') AS totalEmployees,
        COALESCE(SUM(status = 'pending'), 0)  AS pendingLeaves,
        COALESCE(SUM(status = 'approved'), 0) AS approvedLeaves,
        COALESCE(SUM(status = 'rejected'), 0) AS rejectedLeaves
       FROM leave_requests`
    );

    res.json({
      totalEmployees: Number(row.totalEmployees),
      pendingLeaves: Number(row.pendingLeaves),
      approvedLeaves: Number(row.approvedLeaves),
      rejectedLeaves: Number(row.rejectedLeaves),
    });
  } catch (error) {
    serverError(res, "Admin stats error:", error);
  }
};

// ======================================================
// ADMIN: Get all leave requests (newest first, capped)
// ======================================================

const getAllLeaves = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);

    const [rows] = await db.query(
      `SELECT
        lr.id,
        lr.user_id,
        u.name AS employee_name,
        lr.leave_type,

        DATE_FORMAT(lr.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(lr.end_date, '%Y-%m-%d') AS end_date,

        lr.reason,
        lr.status,
        lr.admin_comment,

        lb.casual_total,
        lb.casual_leave,

        lb.sick_total,
        lb.sick_leave,

        lb.earned_total,
        lb.earned_leave,

        lb.unpaid_leave

       FROM leave_requests lr

       JOIN users u
         ON lr.user_id = u.id

       LEFT JOIN leave_balances lb
         ON lr.user_id = lb.user_id

       ORDER BY lr.applied_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json(rows);
  } catch (error) {
    serverError(res, "Get all leaves error:", error);
  }
};

// ======================================================
// ADMIN: Approve leave (runs as one transaction)
// ======================================================

const approveLeave = async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Lock the request row so two admins cannot approve it twice
    const [leaves] = await connection.query(
      `SELECT
        id,
        user_id,
        leave_type,
        status,
        DATEDIFF(end_date, start_date) + 1 AS days
       FROM leave_requests
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (leaves.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    const leave = leaves[0];

    if (leave.status !== "pending") {
      await connection.rollback();

      return res.status(400).json({
        message: "Leave request has already been processed",
      });
    }

    const column = LEAVE_COLUMNS[leave.leave_type];

    if (!column) {
      await connection.rollback();

      return res.status(400).json({
        message: "Invalid leave type",
      });
    }

    // Lock the balance row too
    const [balances] = await connection.query(
      `SELECT ${column} AS available
       FROM leave_balances
       WHERE user_id = ?
       FOR UPDATE`,
      [leave.user_id]
    );

    if (balances.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Leave balance not found",
      });
    }

    const leaveDays = Number(leave.days);
    const available = Math.max(Number(balances[0].available), 0);

    // Paid days come from the balance, the rest become unpaid (LOP)
    const paidDays = Math.min(leaveDays, available);
    const unpaidDays = leaveDays - paidDays;

    await connection.query(
      `UPDATE leave_balances
       SET
         ${column} = ${column} - ?,
         unpaid_leave = unpaid_leave + ?
       WHERE user_id = ?`,
      [paidDays, unpaidDays, leave.user_id]
    );

    await connection.query(
      `UPDATE leave_requests
       SET status = 'approved'
       WHERE id = ?`,
      [id]
    );

    await connection.commit();

    res.json({
      message: "Leave approved successfully",
      leaveDays,
      paidDays,
      unpaidDays,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    serverError(res, "Approve leave error:", error);
  } finally {
    connection.release();
  }
};

// ======================================================
// ADMIN: Reject leave
// ======================================================

const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `UPDATE leave_requests
       SET status = 'rejected'
       WHERE id = ? AND status = 'pending'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Leave request not found or already processed",
      });
    }

    res.json({
      message: "Leave rejected successfully",
    });
  } catch (error) {
    serverError(res, "Reject leave error:", error);
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getLeaveBalance,
  getMyLeaves,
  applyLeave,
  getAdminStats,
  getAllLeaves,
  approveLeave,
  rejectLeave,
};