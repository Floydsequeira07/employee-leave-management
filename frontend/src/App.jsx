import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ApplyLeave from "./pages/ApplyLeave";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/employee"
          element={<EmployeeDashboard />}
        />
        <Route path="/admin" element={<AdminDashboard />} />
         <Route
    path="/apply-leave"
    element={<ApplyLeave />}
  />

      </Routes>
    </BrowserRouter>
  );
}

export default App;