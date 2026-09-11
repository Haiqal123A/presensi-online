import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileText,
  UserCircle,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const AUTH_STORAGE_KEY = "pkl_auth";

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
    label: "Profile",
    path: "/admin/profile",
    icon: UserCircle,
  },
];

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const handleLogout = () => {
    localStorage.removeItem(
      AUTH_STORAGE_KEY
    );

    setMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-blue shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* BRAND */}

          <button
            type="button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
            className="flex items-center gap-3 shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm">
              <img
                src="/logo.jpg"
                alt="Logo ABSENKU"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-white font-extrabold text-base leading-tight">
                ABSENKU
              </p>

              <p className="text-blue-100 text-[11px] leading-tight mt-0.5">
                Admin Panel
              </p>
            </div>
          </button>

          {/* DESKTOP MENU */}

          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? "bg-brand-yellow text-brand-blue"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* ADMIN INFO */}

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="w-px h-8 bg-white/20" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <ShieldCheck
                  size={18}
                  className="text-white"
                />
              </div>

              <div className="text-left">
                <p className="text-white text-sm font-bold leading-tight">
                  Administrator
                </p>

                <p className="text-blue-100 text-[11px] leading-tight mt-0.5">
                  Admin PKL
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="w-9 h-9 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (value) => !value
              )
            }
            className="lg:hidden w-10 h-10 rounded-lg text-white hover:bg-white/10 flex items-center justify-center transition"
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

        {/* MOBILE MENU */}

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 py-3">
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
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                        isActive
                          ? "bg-brand-yellow text-brand-blue"
                          : "text-white hover:bg-white/10"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* MOBILE ADMIN INFO */}

            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between gap-3 px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <ShieldCheck
                      size={19}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <p className="text-white text-sm font-bold">
                      Administrator
                    </p>

                    <p className="text-blue-100 text-xs mt-0.5">
                      Admin PKL
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition"
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