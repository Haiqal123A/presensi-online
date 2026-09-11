import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  ClipboardList,
  FileText,
  User,
  Menu,
  X,
  GraduationCap,
  LogOut,
} from "lucide-react";

const AUTH_STORAGE_KEY = "pkl_auth";

const menuItems = [
  {
    label: "Dashboard",
    path: "/user/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Absensi",
    path: "/user/attendance",
    icon: Camera,
  },
  {
    label: "Riwayat",
    path: "/user/attendance-history",
    icon: ClipboardList,
  },
  {
    label: "Izin",
    path: "/user/izin",
    icon: FileText,
  },
  {
    label: "Profile",
    path: "/user/profile",
    icon: User,
  },
];

export default function Navbar() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);

    closeMobileMenu();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-blue shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-[78px] flex items-center justify-between gap-6">
          <NavLink
            to="/user/dashboard"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 shrink-0"
          >
            <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
              <img
                src="/logo.jpg"
                alt="ABSENKU"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-white font-extrabold text-lg leading-tight tracking-wide">
                ABSENKU
              </h1>

              <p className="text-white/70 text-xs mt-0.5">
                Sistem Absensi PKL
              </p>
            </div>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-brand-yellow text-brand-blue shadow-sm"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                  />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-brand-blue shadow-sm">
              <GraduationCap size={22} />
            </div>

            <div className="hidden xl:block">
              <p className="text-white font-bold text-sm leading-tight">
                Siswa PKL
              </p>

              <p className="text-white/65 text-xs mt-1">
                Peserta PKL
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-red-500/20 hover:text-red-100 transition"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={19} />
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((prev) => !prev)
            }
            className="lg:hidden w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
            aria-label="Buka menu"
          >
            {mobileMenuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4">
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-blue">
                <GraduationCap size={21} />
              </div>

              <div>
                <p className="text-white font-bold text-sm">
                  Siswa PKL
                </p>

                <p className="text-white/60 text-xs">
                  Peserta PKL
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? "bg-brand-yellow text-brand-blue"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={19} />

                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-white/10 mt-4 pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/90 hover:bg-red-500/20 hover:text-white transition"
              >
                <LogOut size={19} />

                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}