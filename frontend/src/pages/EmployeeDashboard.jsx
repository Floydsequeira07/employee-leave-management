import { useCallback, useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { FaCalendarPlus, FaSignOutAlt } from "react-icons/fa";

function EmployeeDashboard() {
  const [user, setUser] = useState(null);

  const [balance, setBalance] = useState({
    casual_total: 0,
    casual_leave: 0,
    sick_total: 0,
    sick_leave: 0,
    earned_total: 0,
    earned_leave: 0,
    unpaid_leave: 0,
  });

  const [leaves, setLeaves] = useState([]);

  const navigate = useNavigate();

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // Load balance and history in parallel (one round trip instead of two)
  const loadData = useCallback(async (userId) => {
    try {
      setError("");

      const [balanceRes, leavesRes] = await Promise.all([
        api.get(`/api/leaves/balance/${userId}`),
        api.get(`/api/leaves/my-leaves/${userId}`),
      ]);

      setBalance(balanceRes.data);
      setLeaves(leavesRes.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        "Could not load your data. The server may be waking up, please retry."
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate("/");
      return;
    }

    setUser(storedUser);

    loadData(storedUser.id);

    // Refresh every 60 seconds, only while the tab is visible
    const interval = setInterval(() => {
      if (!document.hidden) loadData(storedUser.id);
    }, 60000);

    // Refresh when the user comes back to this tab
    const handleFocus = () => loadData(storedUser.id);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/");
  };

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

  // Leave balance cards
  const balanceCards = [
    {
      label: "Casual Leave",
      total: balance.casual_total,
      remaining: balance.casual_leave,
    },
    {
      label: "Sick Leave",
      total: balance.sick_total,
      remaining: balance.sick_leave,
    },
    {
      label: "Earned Leave",
      total: balance.earned_total,
      remaining: balance.earned_leave,
    },
  ];

  const getPercent = (remaining, total) => {
    if (!total) return 0;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

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
          {/* TITLE */}

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

          {/* RIGHT SIDE */}

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
            <span
              className="
                text-sm
                text-indigo-100
                whitespace-nowrap
              "
            >
              Welcome,{" "}
              <span className="font-semibold text-white">
                {user.name}
              </span>
            </span>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate("/apply-leave")}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-indigo-700
                  bg-white
                  hover:bg-indigo-50
                  rounded-xl
                  shadow-md
                  transition
                  active:scale-[0.98]
                  whitespace-nowrap
                "
              >
                <FaCalendarPlus size={14} />
                Apply Leave
              </button>

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
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* WELCOME */}

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
            Employee Dashboard
          </h2>

          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Manage your leave requests and leave balance.
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
              onClick={() => loadData(user.id)}
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

        {/* ================= LEAVE BALANCE ================= */}

        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
          Leave Balance
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
          {balanceCards.map((card) => (
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
              <p className="text-slate-500 text-sm font-medium">
                {card.label}
              </p>

              <div className="flex items-end gap-2 mt-2">
                <h2 className="text-3xl font-bold text-indigo-600">
                  {card.remaining}
                </h2>

                <p className="text-slate-400 text-sm mb-1">
                  / {card.total} days left
                </p>
              </div>

              {/* Progress bar */}

              <div
                className="
                  w-full
                  h-2
                  bg-slate-100
                  rounded-full
                  overflow-hidden
                  mt-4
                "
              >
                <div
                  className="
                    h-full
                    bg-gradient-to-r
                    from-indigo-500
                    to-indigo-700
                    rounded-full
                    transition-all
                    duration-500
                  "
                  style={{
                    width: `${getPercent(card.remaining, card.total)}%`,
                  }}
                ></div>
              </div>

              <p className="text-slate-400 text-xs mt-2">
                Total allowed: {card.total} days
              </p>
            </div>
          ))}

          {/* UNPAID LEAVE */}

          <div
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
            <p className="text-slate-500 text-sm font-medium">
              Unpaid Leave (LOP)
            </p>

            <h2 className="text-3xl font-bold text-red-500 mt-2">
              {balance.unpaid_leave}
            </h2>

            <p className="text-slate-400 text-xs mt-1">Days taken</p>
          </div>
        </div>

        {/* ================= LEAVE HISTORY ================= */}

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
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
            Recent Leave Requests
          </h3>

          {leaves.length === 0 ? (
            <p className="text-slate-500 text-sm sm:text-base">
              {dataLoading ? "Loading your requests..." : "No leave requests yet."}
            </p>
          ) : (
            /*
              Only the table scrolls horizontally on small screens.
              The rest of the dashboard remains responsive.
            */

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
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
                      Leave Type
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

                    <th className="p-3 font-semibold whitespace-nowrap rounded-r-lg">
                      Status
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
                      <td
                        className="
                          p-3
                          capitalize
                          font-medium
                          text-slate-800
                          whitespace-nowrap
                        "
                      >
                        {leave.leave_type}
                      </td>

                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {leave.start_date}
                      </td>

                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {leave.end_date}
                      </td>

                      <td
                        className="
                          p-3
                          max-w-[250px]
                          truncate
                          text-slate-600
                        "
                        title={leave.reason || "-"}
                      >
                        {leave.reason || "-"}
                      </td>

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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;