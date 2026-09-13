import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileText,
  UserCircle,
  History,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

// ==============================
// AUTH
// ==============================

const AUTH_STORAGE_KEY = "pkl_auth";

// ==============================
// MENU
// ==============================

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Data Siswa",
    path: "/admin/students",
    icon: Users,
  },

  {
    label: "Absensi",
    path: "/admin/attendance",
    icon: ClipboardCheck,
  },

  {
    label: "Izin",
    path: "/admin/izin",
    icon: FileText,
  },

  {
    label: "Riwayat",
    path: "/admin/riwayat",
    icon: History,
  },

  {
    label: "Profile",
    path: "/admin/profile",
    icon: UserCircle,
  },
];

// ==============================
// COMPONENT
// ==============================

export default function AdminNavbar() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  // ============================
  // LOGOUT
  // ============================

  const handleLogout = () => {
    localStorage.removeItem(
      AUTH_STORAGE_KEY
    );

    setMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  // ============================
  // RENDER
  // ============================

  return (
    <header className="sticky top-0 z-50 bg-brand-blue shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* =====================================
              BRAND
          ====================================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
              <img
                src="/logo.jpg"
                alt="Logo ABSENKU"
                className="h-full w-full rounded-lg object-contain"
              />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-base font-extrabold leading-tight text-white">
                ABSENKU
              </p>

              <p className="mt-0.5 text-[11px] leading-tight text-blue-100">
                Admin Panel
              </p>
            </div>
          </button>

          {/* =====================================
              DESKTOP MENU
          ====================================== */}

          <nav className="hidden items-center gap-1 lg:flex">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-brand-yellow text-brand-blue shadow-sm"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <Icon size={17} />

                  <span>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* =====================================
              ADMIN INFO
          ====================================== */}

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <div className="h-8 w-px bg-white/20" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <ShieldCheck
                  size={18}
                  className="text-white"
                />
              </div>

              <div className="text-left">
                <p className="text-sm font-bold leading-tight text-white">
                  Administrator
                </p>

                <p className="mt-0.5 text-[11px] leading-tight text-blue-100">
                  Admin PKL
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* =====================================
              MOBILE BUTTON
          ====================================== */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (value) => !value
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10 lg:hidden"
            aria-label={
              mobileOpen
                ? "Tutup menu"
                : "Buka menu"
            }
          >
            {mobileOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>

        {/* =====================================
            MOBILE MENU
        ====================================== */}

        {mobileOpen && (
          <div className="border-t border-white/10 py-3 lg:hidden">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-brand-yellow text-brand-blue"
                          : "text-white hover:bg-white/10"
                      }`
                    }
                  >
                    <Icon size={18} />

                    <span>
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            {/* =================================
                MOBILE ADMIN
            ================================== */}

            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between gap-3 px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <ShieldCheck
                      size={19}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Administrator
                    </p>

                    <p className="mt-0.5 text-xs text-blue-100">
                      Admin PKL
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <LogOut size={17} />

                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}