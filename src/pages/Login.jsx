import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";

import {
  login,
  getAuthSession,
  saveAuthSession,
} from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loginType, setLoginType] = useState("student");

  const [nisn, setNisn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedData = getAuthSession();

    if (!savedData) return;

    if (savedData?.user?.role === "admin") {
      navigate("/admin/dashboard", {
        replace: true,
      });
    } else {
      navigate("/user/dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    const identifier =
      loginType === "admin"
        ? email.trim()
        : nisn.trim();

    if (!identifier) {
      setError(
        loginType === "admin"
          ? "Email admin wajib diisi."
          : "NISN wajib diisi."
      );
      return;
    }

    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(
        identifier,
        password
      );

      /*
       * RESPONSE BACKEND:
       *
       * {
       *   success: true,
       *   message: "Login berhasil.",
       *   data: {
       *     access_token: "...",
       *     refresh_token: "...",
       *     expires_in: 3600,
       *     expires_at: 1234567890,
       *     user: {
       *       id: "...",
       *       full_name: "...",
       *       email: "...",
       *       nisn: "...",
       *       school: "...",
       *       major: "...",
       *       role: "user" / "admin"
       *     }
       *   }
       * }
       */

      const responseData = response?.data;

      if (!responseData) {
        throw new Error(
          "Response login dari server tidak memiliki data."
        );
      }

      // Backend menggunakan "access_token", BUKAN "token".
      const token = responseData?.access_token;

      const backendUser = responseData?.user;

      if (!token) {
        throw new Error(
          "Login berhasil tetapi access token dari server tidak ditemukan."
        );
      }

      if (!backendUser) {
        throw new Error(
          "Login berhasil tetapi data user dari server tidak ditemukan."
        );
      }

      /*
       * BACKEND ROLE:
       *
       * user  -> siswa
       * admin -> admin
       *
       * FRONTEND ROLE:
       *
       * student
       * admin
       */

      const backendRole = backendUser?.role;

      const role =
        backendRole === "admin"
          ? "admin"
          : "student";

      const authData = {
        isLoggedIn: true,

        // Simpan access token backend
        token,

        // Simpan refresh token jika nanti dibutuhkan
        refreshToken:
          responseData?.refresh_token || "",

        expiresIn:
          responseData?.expires_in || null,

        expiresAt:
          responseData?.expires_at || null,

        user: {
          id: backendUser?.id || "",

          name:
            backendUser?.full_name ||
            "Siswa PKL",

          full_name:
            backendUser?.full_name ||
            "Siswa PKL",

          email:
            backendUser?.email || "",

          nisn:
            backendUser?.nisn || "",

          school:
            backendUser?.school || "",

          major:
            backendUser?.major || "",

          phone:
            backendUser?.phone || "",

          birth_place:
            backendUser?.birth_place || "",

          birth_date:
            backendUser?.birth_date || "",

          gender:
            backendUser?.gender || "",

          nik:
            backendUser?.nik || "",

          role,

          // Simpan role asli dari backend
          backendRole:
            backendRole || "",
        },

        loginAt: new Date().toISOString(),
      };

      /*
       * Simpan token + user ke localStorage.
       *
       * saveAuthSession() juga menyimpan:
       * localStorage["token"] = access_token
       */
      saveAuthSession(authData);

      /*
       * Pastikan session benar-benar tersimpan
       * sebelum pindah halaman.
       */
      const savedSession = getAuthSession();

      if (!savedSession?.token) {
        throw new Error(
          "Session login gagal disimpan di browser."
        );
      }

      const redirectTo =
        location.state?.from ||
        (role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard");

      navigate(redirectTo, {
        replace: true,
      });
    } catch (error) {
      console.error("Login gagal:", error);

      if (error?.status === 429) {
        setError(
          "Terlalu banyak percobaan login. Silakan coba lagi beberapa saat."
        );
      } else if (error?.status === 401) {
        setError(
          "Email/NISN atau password yang Anda masukkan salah."
        );
      } else if (
        error?.code === "INVALID_CREDENTIALS"
      ) {
        setError(
          "Email/NISN atau password yang Anda masukkan salah."
        );
      } else {
        setError(
          error?.message ||
            "Login gagal. Silakan coba lagi."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);

    setError("");
    setPassword("");

    if (type === "admin") {
      setNisn("");
    } else {
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue-light via-white to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* LOGO / BRAND */}

        <div className="text-center mb-7">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center mx-auto p-2">
            <img
              src="/logo.jpg"
              alt="Logo ABSENKU"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mt-5">
            ABSENKU
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Sistem Absensi PKL
          </p>
        </div>

        {/* LOGIN CARD */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 sm:p-7">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Selamat Datang
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Silakan masuk ke akun Anda.
            </p>
          </div>

          {/* LOGIN TYPE */}

          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-6">

            <button
              type="button"
              onClick={() =>
                handleLoginTypeChange("student")
              }
              className={`h-11 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${
                loginType === "student"
                  ? "bg-white text-brand-blue shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <UserRound size={17} />
              Siswa
            </button>

            <button
              type="button"
              onClick={() =>
                handleLoginTypeChange("admin")
              }
              className={`h-11 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${
                loginType === "admin"
                  ? "bg-white text-brand-blue shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Lock size={17} />
              Admin
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* STUDENT */}

            {loginType === "student" && (
              <div>
                <label
                  htmlFor="nisn"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  NISN
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="nisn"
                    type="text"
                    value={nisn}
                    onChange={(event) =>
                      setNisn(event.target.value)
                    }
                    placeholder="Masukkan NISN"
                    autoComplete="username"
                    disabled={isLoading}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:opacity-60 transition"
                  />
                </div>
              </div>
            )}

            {/* ADMIN */}

            {loginType === "admin" && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Admin
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Masukkan email admin"
                    autoComplete="username"
                    disabled={isLoading}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:opacity-60 transition"
                  />
                </div>
              </div>
            )}

            {/* PASSWORD */}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full h-12 pl-11 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:opacity-60 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={isLoading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition"
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              {isLoading
                ? "Memproses..."
                : loginType === "admin"
                ? "Masuk sebagai Admin"
                : "Masuk sebagai Siswa"}
            </button>

          </form>

          {/* INFO */}

          <div className="mt-5 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              Gunakan akun yang sudah terdaftar
              pada sistem. Data login akan
              diverifikasi langsung oleh backend.
            </p>
          </div>

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ABSENKU • Sistem Absensi PKL
        </p>

      </div>
    </div>
  );
}