import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { FaArrowLeft } from "react-icons/fa";

function ApplyLeave() {
  const navigate = useNavigate();

  const [leaveType, setLeaveType] = useState("casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const leaveOptions = [
    { value: "casual", label: "Casual Leave" },
    { value: "sick", label: "Sick Leave" },
    { value: "earned", label: "Earned Leave" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/");
      return;
    }

    if (!startDate || !endDate || !reason) {
      toast.error("Please fill all fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/leaves", {
        user_id: user.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
      });

      toast.success("Leave applied successfully");

      setTimeout(() => {
        navigate("/employee");
      }, 1000);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to apply leave"
      );
      setLoading(false);
    }
  };

  const inputClass = `
    w-full
    px-4
    py-3
    text-sm
    text-slate-900
    placeholder-slate-400
    bg-slate-50
    border
    border-slate-200
    rounded-xl
    outline-none
    transition
    duration-200
    focus:bg-white
    focus:border-indigo-600
    focus:ring-4
    focus:ring-indigo-100
  `;

  const labelClass = `
    block
    text-sm
    font-medium
    text-slate-700
    mb-1.5
  `;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "46px",
      backgroundColor: state.isFocused ? "#ffffff" : "#f8fafc",
      borderColor: state.isFocused ? "#4f46e5" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 4px #e0e7ff" : "none",
      "&:hover": {
        borderColor: "#4f46e5",
      },
      padding: "1px 4px",
      borderRadius: "12px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#4f46e5"
        : state.isFocused
        ? "#eef2ff"
        : "white",
      color: state.isSelected ? "white" : "#0f172a",
      cursor: "pointer",
      fontSize: "14px",
      padding: "10px 14px",
    }),

    singleValue: (base) => ({
      ...base,
      fontSize: "14px",
      color: "#0f172a",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      color: "#94a3b8",
      "&:hover": {
        color: "#4f46e5",
      },
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    menu: (base) => ({
      ...base,
      borderRadius: "12px",
      overflow: "hidden",
      marginTop: "6px",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
      border: "1px solid #e2e8f0",
      zIndex: 50,
    }),
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
            sm:flex-row
            sm:items-center
            sm:justify-between
            items-center
            gap-3
          "
        >
          <div className="flex items-center gap-3">
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
              "
            >
              Leave Management System
            </h1>
          </div>

          <button
            onClick={() => navigate("/employee")}
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
            <FaArrowLeft size={13} />
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* ================= FORM CARD ================= */}

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div
          className="
            bg-white
            rounded-3xl
            ring-1
            ring-slate-200
            shadow-[0_25px_60px_-15px_rgba(30,41,59,0.25)]
            p-5
            sm:p-8
          "
        >
          <h2
            className="
              text-xl
              sm:text-2xl
              font-bold
              tracking-tight
              text-slate-900
              mb-1
            "
          >
            Apply for Leave
          </h2>

          <p className="text-slate-500 text-sm mb-6">
            Submit your leave request for approval.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 sm:gap-5"
          >
            {/* LEAVE TYPE */}

            <div>
              <label className={labelClass}>Leave Type</label>

              <Select
                options={leaveOptions}
                defaultValue={leaveOptions[0]}
                isSearchable={false}
                onChange={(selectedOption) =>
                  setLeaveType(selectedOption.value)
                }
                styles={selectStyles}
              />
            </div>

            {/* DATES */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label htmlFor="startDate" className={labelClass}>
                  Start Date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="endDate" className={labelClass}>
                  End Date
                </label>

                <input
                  id="endDate"
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* REASON */}

            <div>
              <label htmlFor="reason" className={labelClass}>
                Reason
              </label>

              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for leave"
                rows="4"
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="
                mt-1
                flex
                items-center
                justify-center
                gap-2
                w-full
                p-3
                text-sm
                font-semibold
                text-white
                bg-gradient-to-r
                from-indigo-600
                to-indigo-700
                hover:from-indigo-700
                hover:to-indigo-800
                rounded-xl
                shadow-lg
                shadow-indigo-200
                hover:shadow-xl
                transition
                duration-200
                active:scale-[0.99]
                disabled:opacity-70
                disabled:cursor-not-allowed
              "
            >
              {loading && (
                <span
                  className="
                    w-4
                    h-4
                    border-2
                    border-white/40
                    border-t-white
                    rounded-full
                    animate-spin
                  "
                ></span>
              )}
              {loading ? "Submitting..." : "Apply Leave"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplyLeave;