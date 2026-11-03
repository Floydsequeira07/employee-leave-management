import { useCallback, useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSignOutAlt,
} from "react-icons/fa";

function AdminDashboard() {
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  });

  const [leaves, setLeaves] = useState([]);

  // Confirmation popup state
  const [confirmation, setConfirmation] = useState({
    show: false,
    type: "",
    leaveId: null,
  });

  const navigate = useNavigate();

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // LOAD DASHBOARD DATA
  // (stats + requests in parallel)
  // =========================

  const loadData = useCallback(async () => {
    try {
      setError("");

      const [statsRes, leavesRes] = await Promise.all([
        api.get("/api/leaves/admin/stats"),
        api.get("/api/leaves/admin/all"),
      ]);

      setStats(statsRes.data);
      setLeaves(leavesRes.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        "Could not load dashboard data. The server may be waking up, please retry."
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  // =========================
  // INITIAL LOAD + LIGHT REFRESH
  // =========================

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.role !== "admin") {
      navigate("/");
      return;
    }

    setUser(storedUser);

    loadData();

    // Refresh every 60 seconds, only while the tab is visible
    const interval = setInterval(() => {
      if (!document.hidden) loadData();
    }, 60000);

    // Refresh when the admin comes back to this tab
    window.addEventListener("focus", loadData);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadData);
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/");
  };

  // =========================
  // OPEN / CLOSE CONFIRMATION POPUP
  // =========================

  const openConfirmation = (type, leaveId) => {
    setConfirmation({
      show: true,
      type: type,
      leaveId: leaveId,
    });
  };

  const closeConfirmation = () => {
    setConfirmation({
      show: false,
      type: "",
      leaveId: null,
    });
  };

  // =========================
  // CONFIRM APPROVE / REJECT
  // =========================

  const confirmAction = async () => {
    const { type, leaveId } = confirmation;

    try {
      if (type === "approve") {
        await api.put(`/api/leaves/admin/${leaveId}/approve`);
      } else {
        await api.put(`/api/leaves/admin/${leaveId}/reject`);
      }

      // Close popup
      closeConfirmation();

      toast.success(
  type === "approve"
    ? "Leave approved successfully"
    : "Leave rejected successfully"
);

      // Immediately refresh admin data
      await loadData();
    } catch (error) {
      console.error("Action error:", error);

      toast.error(
        error.response?.data?.message || `Failed to ${type} leave`
      );

      closeConfirmation();
    }
  };

  // =========================
  // CALCULATE LEAVE DAYS
  // =========================

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference =
      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    return difference;
  };

  // =========================
  // STATUS STYLES
  // =========================

  const statusStyle = (status) => {
    if (status === "approved") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }
    if (status === "rejected") {
      return "bg-red-50 text-red-700 ring-red-200";
    }
    return "bg-amber-50 text-amber-700 ring-amber-200";
  };

  const statusDot = (status) => {
    if (status === "approved") return "bg-emerald-500";
    if (status === "rejected") return "bg-red-500";
    return "bg-amber-500";
  };

  // =========================
  // LOADING
  // =========================

  if (!user) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gradient-to-br
          from-slate-100
          via-indigo-50
          to-sky-100
        "
      >
        <div
          className="
            w-10
            h-10
            border-4
            border-indigo-200
            border-t-indigo-600
            rounded-full
            animate-spin
          "
        ></div>
      </div>
    );
  }

  // Overview cards
  const statCards = [
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      icon: <FaUsers size={20} />,
      text: "text-indigo-600",
      box: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Pending Leaves",
      value: stats.pendingLeaves,
      icon: <FaClock size={20} />,
      text: "text-amber-600",
      box: "bg-amber-50 text-amber-600",
    },
    {
      label: "Approved Leaves",
      value: stats.approvedLeaves,
      icon: <FaCheckCircle size={20} />,
      text: "text-emerald-600",
      box: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Rejected Leaves",
      value: stats.rejectedLeaves,
      icon: <FaTimesCircle size={20} />,
      text: "text-red-500",
      box: "bg-red-50 text-red-500",
    },
  ];

  // =========================
  // UI
  // =========================

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-100
        via-indigo-50
        to-sky-100
      "
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: "14px",
            borderRadius: "12px",
          },
        }}
      />

      {/* ================= NAVBAR ================= */}

      <nav
        className="
          bg-gradient-to-r
          from-indigo-700
          via-indigo-800
          to-slate-900
          text-white
          shadow-lg
          px-4
          sm:px-6
          py-4
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
          "
        >
          {/* Title */}

          <div
            className="
              flex
              items-center
              justify-center
              md:justify-start
              gap-3
            "
          >
            <div
              className="
                w-10
                h-10
                flex
                items-center
                justify-center
                text-xl
                bg-white/15
                rounded-xl
                ring-1
                ring-white/20
              "
            >
              📋
            </div>

            <h1
              className="
                text-lg
                sm:text-xl
                font-bold
                tracking-tight
                whitespace-nowrap
              "
            >
              Leave Management System
            </h1>
          </div>

          {/* Right Side */}

          <div
            className="
              flex
              flex-col
              sm:flex-row
              items-center
              justify-center
              gap-3
              sm:gap-4
              w-full
              md:w-auto
            "
          >
            <span className="text-sm text-indigo-100 whitespace-nowrap">
              Welcome,{" "}
              <span className="font-semibold text-white">
                {user.name}
              </span>
            </span>

            <button
              onClick={handleLogout}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                bg-white/10
                hover:bg-white/20
                ring-1
                ring-white/20
                rounded-xl
                transition
                active:scale-[0.98]
                whitespace-nowrap
              "
            >
              <FaSignOutAlt size={14} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ================= */}

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* HEADING */}

        <div className="mb-6">
          <h2
            className="
              text-xl
              sm:text-2xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Admin Dashboard
          </h2>

          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Manage employee leave requests and approvals.
          </p>
        </div>

        {/* ERROR + RETRY */}

        {error && (
          <div
            className="
              mb-5
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-3
              p-4
              text-sm
              text-red-700
              bg-red-50
              ring-1
              ring-red-200
              rounded-xl
            "
          >
            <span>{error}</span>

            <button
              onClick={loadData}
              className="
                px-4
                py-2
                text-xs
                font-semibold
                text-white
                bg-red-500
                hover:bg-red-600
                rounded-lg
                transition
                whitespace-nowrap
              "
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= STATISTICS ================= */}

        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
          Overview
        </h3>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-4
            sm:gap-5
            mb-6
            sm:mb-8
          "
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              className="
                bg-white
                p-5
                rounded-2xl
                ring-1
                ring-slate-200
                shadow-sm
                hover:shadow-md
                transition
              "
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    {card.label}
                  </p>

                  <h2
                    className={`text-3xl font-bold mt-2 ${card.text}`}
                  >
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`
                    w-11
                    h-11
                    flex
                    items-center
                    justify-center
                    rounded-xl
                    ${card.box}
                  `}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= LEAVE REQUESTS ================= */}

        <div
          className="
            bg-white
            rounded-2xl
            ring-1
            ring-slate-200
            shadow-sm
            p-4
            sm:p-6
          "
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Leave Requests
            </h3>
          </div>

          {leaves.length === 0 ? (
            <p className="text-slate-500 text-sm sm:text-base">
              {dataLoading ? "Loading requests..." : "No leave requests yet."}
            </p>
          ) : (
            /*
              Only the table scrolls horizontally.
              The complete dashboard does not overflow.
            */

            <div className="w-full overflow-x-auto rounded-lg">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr
                    className="
                      text-left
                      text-xs
                      uppercase
                      tracking-wider
                      text-slate-500
                      bg-slate-50
                    "
                  >
                    <th className="p-3 font-semibold whitespace-nowrap rounded-l-lg">
                      Employee
                    </th>

                    <th className="p-3 font-semibold whitespace-nowrap">
                      Leave Type
                    </th>

                    <th className="p-3 font-semibold whitespace-nowrap">
                      Days
                    </th>

                    <th className="p-3 font-semibold whitespace-nowrap">
                      Start Date
                    </th>

                    <th className="p-3 font-semibold whitespace-nowrap">
                      End Date
                    </th>

                    <th className="p-3 font-semibold whitespace-nowrap">
                      Reason
                    </th>

                    <th className="p-3 font-semibold whitespace-nowrap">
                      Leave Balance
                    </th>

                    <th className="p-3 font-semibold whitespace-nowrap">
                      Status
                    </th>

                    <th className="p-3 font-semibold whitespace-nowrap rounded-r-lg">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr
                      key={leave.id}
                      className="
                        border-b
                        border-slate-100
                        hover:bg-indigo-50/40
                        transition
                      "
                    >
                      {/* Employee */}

                      <td
                        className="
                          p-3
                          font-semibold
                          text-slate-800
                          whitespace-nowrap
                        "
                      >
                        {leave.employee_name}
                      </td>

                      {/* Leave Type */}

                      <td
                        className="
                          p-3
                          capitalize
                          text-slate-600
                          whitespace-nowrap
                        "
                      >
                        {leave.leave_type}
                      </td>

                      {/* Days */}

                      <td
                        className="
                          p-3
                          font-medium
                          text-slate-800
                          whitespace-nowrap
                        "
                      >
                        {calculateDays(leave.start_date, leave.end_date)}{" "}
                        days
                      </td>

                      {/* Start Date */}

                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {leave.start_date}
                      </td>

                      {/* End Date */}

                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {leave.end_date}
                      </td>

                      {/* Reason */}

                      <td className="p-3 max-w-[220px]">
                        <span
                          className="block truncate text-slate-600"
                          title={leave.reason || "-"}
                        >
                          {leave.reason || "-"}
                        </span>
                      </td>

                      {/* Leave Balance */}

                      <td className="p-3">
                        <div
                          className="
                            text-xs
                            space-y-1
                            min-w-[130px]
                            text-slate-600
                          "
                        >
                          <p>
                            <span className="font-medium text-slate-700">
                              Casual:
                            </span>{" "}
                            {leave.casual_leave ?? 0} /{" "}
                            {leave.casual_total ?? 0}
                          </p>

                          <p>
                            <span className="font-medium text-slate-700">
                              Sick:
                            </span>{" "}
                            {leave.sick_leave ?? 0} /{" "}
                            {leave.sick_total ?? 0}
                          </p>

                          <p>
                            <span className="font-medium text-slate-700">
                              Earned:
                            </span>{" "}
                            {leave.earned_leave ?? 0} /{" "}
                            {leave.earned_total ?? 0}
                          </p>

                          <p className="text-red-500">
                            <span className="font-medium">LOP:</span>{" "}
                            {leave.unpaid_leave ?? 0}
                          </p>
                        </div>
                      </td>

                      {/* Status */}

                      <td className="p-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            capitalize
                            rounded-full
                            ring-1
                            whitespace-nowrap
                            ${statusStyle(leave.status)}
                          `}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${statusDot(
                              leave.status
                            )}`}
                          ></span>

                          {leave.status}
                        </span>
                      </td>

                      {/* Action */}

                      <td className="p-3">
                        {leave.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                openConfirmation("approve", leave.id)
                              }
                              className="
                                bg-emerald-500
                                text-white
                                px-3
                                py-1.5
                                rounded-lg
                                text-xs
                                font-semibold
                                shadow-sm
                                hover:bg-emerald-600
                                transition
                                active:scale-[0.97]
                                whitespace-nowrap
                              "
                            >
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                openConfirmation("reject", leave.id)
                              }
                              className="
                                bg-red-500
                                text-white
                                px-3
                                py-1.5
                                rounded-lg
                                text-xs
                                font-semibold
                                shadow-sm
                                hover:bg-red-600
                                transition
                                active:scale-[0.97]
                                whitespace-nowrap
                              "
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 whitespace-nowrap">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= CONFIRMATION POPUP ================= */}

      {confirmation.show && (
        <div
          className="
            fixed
            inset-0
            bg-slate-900/50
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
            p-4
          "
        >
          <div
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              ring-1
              ring-slate-200
              p-5
              sm:p-6
              w-full
              max-w-sm
              mx-auto
            "
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Confirm Action
            </h2>

            <p className="text-slate-600 text-sm mb-6 leading-6">
              Are you sure you want to{" "}
              <span className="font-semibold">
                {confirmation.type === "approve" ? "approve" : "reject"}
              </span>{" "}
              this leave request?
            </p>

            {/* Buttons */}

            <div
              className="
                flex
                flex-col-reverse
                sm:flex-row
                justify-end
                gap-2
                sm:gap-3
              "
            >
              <button
                onClick={closeConfirmation}
                className="
                  px-4
                  py-2
                  rounded-xl
                  border
                  border-slate-300
                  text-slate-700
                  text-sm
                  font-medium
                  hover:bg-slate-100
                  transition
                  w-full
                  sm:w-auto
                "
              >
                Cancel
              </button>

              <button
                onClick={confirmAction}
                className={`
                  px-4
                  py-2
                  rounded-xl
                  text-white
                  text-sm
                  font-semibold
                  shadow-md
                  transition
                  w-full
                  sm:w-auto
                  ${
                    confirmation.type === "approve"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-red-500 hover:bg-red-600"
                  }
                `}
              >
                {confirmation.type === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;