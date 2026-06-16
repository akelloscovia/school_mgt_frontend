import { BrowserRouter, Routes, Route } from "react-router-dom";

/* LAYOUT */
import Layout from "../components/layout/layout";

/* AUTH */
import Login from "../pages/auth/login";
import Forgot from "../pages/auth/Forgot";
import Reset from "../pages/auth/Reset";
import ProtectedRoute from "./ProtectedRoute";

/* DASHBOARD */
import Dashboard from "../pages/dashboard/Dashboard";

/* STUDENTS */
import Students from "../pages/students/Students";
import RegisterStudent from "../pages/students/RegisterStudent";
import StudentProfile from "../pages/students/StudentProfile";

/* ATTENDANCE */
import Attendance from "../pages/attendance/Attendance";

/* ACADEMICS */
import Subjects from "../pages/academics/Subjects";
import Classes from "../pages/academics/Classes";
import Timetable from "../pages/academics/Timetable";

/* EXAMS */
import Exams from "../pages/exams/Exams";

/* FINANCE */
import Finance from "../pages/finance/Finance";

/* STAFF */
import Staff from "../pages/staff/Staff";

/* LIBRARY */
import Library from "../pages/library/Library";

/* TRANSPORT */
import Transport from "../pages/transport/Transport";

/* REPORTS */
import Reports from "../pages/reports/Reports";

/* SETTINGS */
import Settings from "../pages/settings/Settings";

/* MESSAGES */
import Messages from "../pages/messages/Messages";

export default function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN ROUTE */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset-password/:token" element={<Reset />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          {/* DASHBOARD */}
          <Route index element={<Dashboard />} />

          {/* STUDENTS */}
          <Route path="students" element={<Students />} />
          <Route
            path="students/register"
            element={<RegisterStudent />}
          />
          <Route
            path="students/profile"
            element={<StudentProfile />}
          />

          {/* ATTENDANCE */}
          <Route
            path="attendance"
            element={<Attendance />}
          />

          {/* ACADEMICS */}
          <Route
            path="subjects"
            element={<Subjects />}
          />

          <Route
            path="classes"
            element={<Classes />}
          />

          <Route
            path="timetable"
            element={<Timetable />}
          />

          {/* EXAMS */}
          <Route
            path="exams"
            element={<Exams />}
          />

          {/* FINANCE */}
          <Route
            path="finance"
            element={<Finance />}
          />

          {/* STAFF */}
          <Route
            path="staff"
            element={<Staff />}
          />

          {/* LIBRARY */}
          <Route
            path="library"
            element={<Library />}
          />

          {/* TRANSPORT */}
          <Route
            path="transport"
            element={<Transport />}
          />

          {/* REPORTS */}
          <Route
            path="reports"
            element={<Reports />}
          />

          {/* SETTINGS */}
          <Route
            path="settings"
            element={<Settings />}
          />

          {/* MESSAGES */}
          <Route
            path="messages"
            element={<Messages />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}