const express = require("express");
const router = express.Router();

const { verifyToken, requireRole } = require("../middleware/auth");

const {
  getLeaveBalance,
  getMyLeaves,
  applyLeave,
  getAdminStats,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} = require("../controllers/leaveController");

// Every leave route needs a valid login token
router.use(verifyToken);

// Employee
router.get("/balance/:userId", getLeaveBalance);
router.get("/my-leaves/:userId", getMyLeaves);
router.post("/", applyLeave);

// Admin only
router.use("/admin", requireRole("admin"));

router.get("/admin/stats", getAdminStats);
router.get("/admin/all", getAllLeaves);
router.put("/admin/:id/approve", approveLeave);
router.put("/admin/:id/reject", rejectLeave);

module.exports = router;