import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";

import Login from "./pages/Login";

// ==============================
// USER PAGES
// ==============================

import Dashboard from "./pages/user/Dashboard";
import Attendance from "./pages/user/Attendance";
import AttendanceHistory from "./pages/user/AttendanceHistory";
import Izin from "./pages/user/Izin";
import Profile from "./pages/user/Profile";

// ==============================
// ADMIN PAGES
// ==============================

import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminAttendance from "./pages/admin/Attendance";
import AdminIzin from "./pages/admin/Izin";
import AdminProfile from "./pages/admin/Profile";

// ==============================
// AUTH
// ==============================

const AUTH_STORAGE_KEY = "pkl_auth";

function getAuthData() {
  const savedData = localStorage.getItem(
    AUTH_STORAGE_KEY
  );

  if (!savedData) {
    return null;
  }

  try {
    const parsedData = JSON.parse(savedData);

    if (parsedData?.isLoggedIn !== true) {
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error(
      "Gagal membaca data autentikasi:",
      error
    );

    localStorage.removeItem(
      AUTH_STORAGE_KEY
    );

    return null;
  }
}

// ==============================
// STUDENT ROUTE
// ==============================

function StudentRoute({ children }) {
  const location = useLocation();
  const authData = getAuthData();

  if (!authData) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  if (authData.user?.role !== "student") {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  return children;
}

// ==============================
// ADMIN ROUTE
// ==============================

function AdminRoute({ children }) {
  const location = useLocation();
  const authData = getAuthData();

  if (!authData) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  if (authData.user?.role !== "admin") {
    return (
      <Navigate
        to="/user/dashboard"
        replace
      />
    );
  }

  return children;
}

// ==============================
// USER LAYOUT
// ==============================

function UserLayout() {
  return (
    <StudentRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main>
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/attendance"
              element={<Attendance />}
            />

            <Route
              path="/attendance-history"
              element={
                <AttendanceHistory />
              }
            />

            <Route
              path="/izin"
              element={<Izin />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/user/dashboard"
                  replace
                />
              }
            />
          </Routes>
        </main>
      </div>
    </StudentRoute>
  );
}

// ==============================
// ADMIN LAYOUT
// ==============================

function AdminLayout() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />

        <main>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <AdminDashboard />
              }
            />

            <Route
              path="/students"
              element={
                <AdminStudents />
              }
            />

            <Route
              path="/attendance"
              element={
                <AdminAttendance />
              }
            />

            <Route
              path="/izin"
              element={<AdminIzin />}
            />

            <Route
              path="/profile"
              element={<AdminProfile />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />
          </Routes>
        </main>
      </div>
    </AdminRoute>
  );
}

// ==============================
// APP
// ==============================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* USER */}

        <Route
          path="/user/*"
          element={<UserLayout />}
        />

        {/* ADMIN */}

        <Route
          path="/admin/*"
          element={<AdminLayout />}
        />

        {/* UNKNOWN ROUTE */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}