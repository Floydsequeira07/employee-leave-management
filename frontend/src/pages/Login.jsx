import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  // Trigger fade-in animation after first render
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const options = [
    { value: "employee", label: "Employee" },
    { value: "admin", label: "Admin" },
  ];

  const validate = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (loading || !validate()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
          role,
        }
      );

      // Save token and user information
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(`${res.data.user.role} login successful`);

      setTimeout(() => {
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/employee");
        }
      }, 1000);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid Credentials"
      );
      setLoading(false);
    }
  };

  const inputClass = (hasError) => `
    w-full
    px-4
    py-2.5
    text-sm
    text-slate-900
    placeholder-slate-400
    bg-slate-50
    border
    rounded-xl
    outline-none
    transition
    duration-200
    focus:bg-white
    focus:ring-4
    ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-100"
    }
  `;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      backgroundColor: state.isFocused ? "#ffffff" : "#f8fafc",
      borderColor: state.isFocused ? "#4f46e5" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 4px #e0e7ff" : "none",
      "&:hover": {
        borderColor: "#4f46e5",
      },
      padding: "0 4px",
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
      zIndex: 20,
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
        flex
        items-center
        justify-center
        px-4
        py-4
        sm:px-6
        sm:py-6
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

      {/* MAIN CARD */}

      <div
        className={`
          transition-all
          duration-700
          ease-out
          ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }
          flex
          flex-col
          md:flex-row
          w-full
          max-w-[780px]
          bg-white
          rounded-3xl
          overflow-hidden
          shadow-[0_25px_60px_-15px_rgba(30,41,59,0.35)]
          ring-1
          ring-slate-200/70
        `}
      >
        {/* LEFT SIDE */}

        <div
          className="
            relative
            w-full
            md:w-[330px]
            md:shrink-0
            bg-gradient-to-br
            from-indigo-700
            via-indigo-800
            to-slate-900
            text-white
            p-6
            sm:p-8
            md:p-9
            flex
            flex-col
            justify-center
            overflow-hidden
          "
        >
          {/* Background decoration */}

          <div
            className="
              absolute
              -top-16
              -left-16
              w-56
              h-56
              bg-indigo-400
              rounded-full
              opacity-30
              blur-3xl
            "
          ></div>

          <div
            className="
              absolute
              -bottom-20
              -right-16
              w-64
              h-64
              bg-sky-400
              rounded-full
              opacity-20
              blur-3xl
            "
          ></div>

          <div className="relative z-10 text-center md:text-left">
            {/* Logo */}

            <div
              className="
                mx-auto
                md:mx-0
                w-12
                h-12
                sm:w-14
                sm:h-14
                flex
                items-center
                justify-center
                text-2xl
                sm:text-3xl
                bg-white/15
                backdrop-blur-sm
                rounded-2xl
                ring-1
                ring-white/20
                mb-4
                sm:mb-6
              "
            >
              📋
            </div>

            {/* Heading */}

            <h1
              className="
                text-xl
                sm:text-2xl
                font-bold
                tracking-tight
                leading-snug
                mb-3
              "
            >
              Leave Management{" "}
              <br className="hidden md:block" />
              System
            </h1>

            {/* Description */}

            <p
              className="
                max-w-xs
                mx-auto
                md:mx-0
                text-xs
                sm:text-sm
                text-indigo-100
                leading-5
                sm:leading-6
              "
            >
              Manage employee leaves, approvals and leave balances
              with a simple and efficient management system.
            </p>

            {/* Features */}

            <div
              className="
                hidden
                md:block
                mt-8
                space-y-3
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  bg-white/10
                  hover:bg-white/15
                  px-3
                  py-2.5
                  rounded-xl
                  text-xs
                  sm:text-sm
                  backdrop-blur-sm
                  ring-1
                  ring-white/10
                  transition
                "
              >
                <span>📝</span>
                <span>Apply Leave Easily</span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  bg-white/10
                  hover:bg-white/15
                  px-3
                  py-2.5
                  rounded-xl
                  text-xs
                  sm:text-sm
                  backdrop-blur-sm
                  ring-1
                  ring-white/10
                  transition
                "
              >
                <span>✅</span>
                <span>Quick Leave Approval</span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  bg-white/10
                  hover:bg-white/15
                  px-3
                  py-2.5
                  rounded-xl
                  text-xs
                  sm:text-sm
                  backdrop-blur-sm
                  ring-1
                  ring-white/10
                  transition
                "
              >
                <span>📊</span>
                <span>Track Leave Balance</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div
          className="
            flex-1
            flex
            flex-col
            justify-center
            p-5
            sm:p-6
            md:p-8
          "
        >
          {/* Heading */}

          <h2
            className="
              text-2xl
              sm:text-3xl
              font-bold
              text-center
              tracking-tight
              text-slate-900
              mb-2
            "
          >
            Welcome Back
          </h2>

          <p
            className="
              text-slate-500
              text-xs
              sm:text-sm
              text-center
              mb-4
              sm:mb-5
            "
          >
            Login to continue to your dashboard
          </p>

          {/* FORM */}

          <form
            onSubmit={handleLogin}
            noValidate
            className="flex flex-col gap-3"
          >
            {/* ROLE */}

            <div className="flex flex-col gap-1.5">
              <label
                className="
                  text-xs
                  sm:text-sm
                  font-medium
                  text-slate-700
                "
              >
                Login as
              </label>

              <Select
                options={options}
                defaultValue={options[0]}
                isSearchable={false}
                onChange={(selectedOption) =>
                  setRole(selectedOption.value)
                }
                styles={selectStyles}
              />
            </div>

            {/* EMAIL */}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="
                  text-xs
                  sm:text-sm
                  font-medium
                  text-slate-700
                "
              >
                Email Address
              </label>

              <div className="relative">
                <FaEnvelope
                  size={14}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    pointer-events-none
                  "
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  className={`${inputClass(emailError)} pl-11`}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {emailError && (
                <p className="text-red-500 text-xs">
                  {emailError}
                </p>
              )}
            </div>

            {/* PASSWORD */}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="
                  text-xs
                  sm:text-sm
                  font-medium
                  text-slate-700
                "
              >
                Password
              </label>

              <div className="relative">
                <FaLock
                  size={14}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    pointer-events-none
                  "
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  className={`${inputClass(passwordError)} pl-11 pr-12`}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Eye */}

                <button
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-indigo-700
                    transition
                    p-1.5
                  "
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>

              {passwordError && (
                <p className="text-red-500 text-xs">
                  {passwordError}
                </p>
              )}
            </div>

            {/* LOGIN */}

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
              {loading ? "Signing in..." : "Login"}
            </button>

            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                mt-1
                text-slate-500
              "
            >
              <span className="text-base">🛡️</span>
              <span className="text-xs sm:text-sm font-medium">
                Safe & Secure Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;