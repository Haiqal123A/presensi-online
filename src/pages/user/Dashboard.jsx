import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Clock3,
  MapPin,
  ClipboardList,
  ClipboardPen,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Home,
  RefreshCw,
} from "lucide-react";

import { getTodayAttendance } from "../../services/api";

const formatDate = () => {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
};

const formatTime = () => {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  });
};

const formatAttendanceTime = (value) => {
  if (!value) return null;

  try {
    return new Date(value).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    });
  } catch {
    return null;
  }
};

const normalizeWorkMode = (value) => {
  if (!value) return null;

  const normalized = String(value).toUpperCase();

  if (normalized === "WFO") {
    return "WFO";
  }

  if (normalized === "WFH") {
    return "WFH";
  }

  return null;
};

const getAttendanceRecord = (data, type) => {
  if (!data) return null;

  const attendance = data?.attendance || data;

  if (type === "in") {
    return (
      attendance?.check_in ||
      attendance?.checkIn ||
      attendance?.check_in_attendance ||
      null
    );
  }

  return (
    attendance?.check_out ||
    attendance?.checkOut ||
    attendance?.check_out_attendance ||
    null
  );
};

const getAttendanceTimeValue = (record, data, type) => {
  if (record) {
    return (
      record?.time ||
      record?.check_in_time ||
      record?.checkInTime ||
      record?.check_out_time ||
      record?.checkOutTime ||
      record?.timestamp ||
      record?.created_at ||
      null
    );
  }

  const attendance = data?.attendance || data;

  if (type === "in") {
    return (
      attendance?.check_in_time ||
      attendance?.checkInTime ||
      null
    );
  }

  return (
    attendance?.check_out_time ||
    attendance?.checkOutTime ||
    null
  );
};

const getWorkMode = (record) => {
  if (!record) return null;

  return normalizeWorkMode(
    record?.work_mode ||
      record?.workMode ||
      record?.location_type ||
      record?.locationType
  );
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] =
    useState(formatTime());

  const [attendanceData, setAttendanceData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadAttendance = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getTodayAttendance();

        setAttendanceData(
          response?.data || response || null
        );
      } catch (err) {
        console.error(
          "Gagal mengambil absensi hari ini:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data absensi hari ini."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadAttendance({ silent: true });
      }
    };

    window.addEventListener(
      "focus",
      handleVisibilityChange
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleVisibilityChange
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadAttendance]);

  const attendance =
    attendanceData?.attendance ||
    attendanceData ||
    {};

  const checkInRecord =
    getAttendanceRecord(
      attendanceData,
      "in"
    );

  const checkOutRecord =
    getAttendanceRecord(
      attendanceData,
      "out"
    );

  const hasCheckedIn =
    attendanceData?.has_checked_in === true ||
    attendanceData?.hasCheckedIn === true ||
    Boolean(
      checkInRecord ||
        attendance?.check_in_time ||
        attendance?.checkInTime
    );

  const hasCheckedOut =
    attendanceData?.has_checked_out === true ||
    attendanceData?.hasCheckedOut === true ||
    Boolean(
      checkOutRecord ||
        attendance?.check_out_time ||
        attendance?.checkOutTime
    );

  const masukTime = formatAttendanceTime(
    getAttendanceTimeValue(
      checkInRecord,
      attendanceData,
      "in"
    )
  );

  const pulangTime = formatAttendanceTime(
    getAttendanceTimeValue(
      checkOutRecord,
      attendanceData,
      "out"
    )
  );

  const masuk =
    hasCheckedIn
      ? {
          time: masukTime || "--:--",
          workLocation:
            getWorkMode(checkInRecord) ||
            normalizeWorkMode(
              attendance?.check_in_work_mode
            ) ||
            normalizeWorkMode(
              attendance?.check_in?.work_mode
            ),
        }
      : null;

  const pulang =
    hasCheckedOut
      ? {
          time: pulangTime || "--:--",
          workLocation:
            getWorkMode(checkOutRecord) ||
            normalizeWorkMode(
              attendance?.check_out_work_mode
            ) ||
            normalizeWorkMode(
              attendance?.check_out?.work_mode
            ),
        }
      : null;

  const isMasuk = hasCheckedIn;
  const isPulang = hasCheckedOut;

  const isComplete =
    isMasuk && isPulang;

  const totalAttendance =
    (isMasuk ? 1 : 0) +
    (isPulang ? 1 : 0);

  const latestLocation =
    pulang?.workLocation ||
    masuk?.workLocation ||
    null;

  const getAttendanceButton = () => {
    if (isComplete) {
      return {
        text: "Absensi Hari Ini Lengkap",
        disabled: true,
      };
    }

    if (isMasuk) {
      return {
        text: "Absen Pulang",
        disabled: false,
      };
    }

    return {
      text: "Absen Masuk",
      disabled: false,
    };
  };

  const attendanceButton =
    getAttendanceButton();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Selamat datang 👋
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                Dashboard Siswa PKL
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  Waktu sekarang
                </p>

                <p className="font-bold text-brand-blue">
                  {currentTime}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadAttendance({
                    silent: true,
                  })
                }
                disabled={refreshing}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                title="Refresh data"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Gagal memuat data absensi
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadAttendance()}
              className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* DATE CARD */}
        <div className="mb-6 rounded-3xl bg-brand-blue p-6 text-white shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-white/80">
                <CalendarCheck size={18} />

                <span className="text-sm">
                  Hari ini
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold capitalize">
                {formatDate()}
              </h2>

              <p className="mt-2 text-sm text-white/70">
                Jangan lupa melakukan absensi masuk dan pulang.
              </p>
            </div>

            <div>
              {loading ? (
                <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3">
                  <RefreshCw
                    size={19}
                    className="animate-spin"
                  />

                  <span className="font-semibold">
                    Memuat...
                  </span>
                </div>
              ) : isComplete ? (
                <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3">
                  <CheckCircle2 size={19} />

                  <span className="font-semibold">
                    Lengkap
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3">
                  <AlertCircle size={19} />

                  <span className="font-semibold">
                    Belum Lengkap
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* MASUK */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Absen Masuk
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {loading
                    ? "..."
                    : masuk?.time || "--:--"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                <Clock3 size={21} />
              </div>
            </div>

            <p
              className={`mt-3 text-xs font-medium ${
                masuk
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              {masuk
                ? "Sudah tercatat"
                : "Belum melakukan absen"}
            </p>
          </div>

          {/* PULANG */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Absen Pulang
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {loading
                    ? "..."
                    : pulang?.time || "--:--"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 size={21} />
              </div>
            </div>

            <p
              className={`mt-3 text-xs font-medium ${
                pulang
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              {pulang
                ? "Sudah tercatat"
                : "Belum melakukan absen"}
            </p>
          </div>

          {/* LOKASI */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Lokasi
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    latestLocation === "WFO"
                      ? "text-brand-blue"
                      : latestLocation === "WFH"
                      ? "text-orange-500"
                      : "text-gray-900"
                  }`}
                >
                  {loading
                    ? "..."
                    : latestLocation || "-"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <MapPin size={21} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Status lokasi terakhir
            </p>
          </div>

          {/* TOTAL */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Absensi Hari Ini
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {loading
                    ? "... / 2"
                    : `${totalAttendance} / 2`}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <ClipboardList size={21} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Masuk + Pulang
            </p>
          </div>
        </div>

        {/* MAIN SECTION */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* STATUS */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Status Kehadiran
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Ringkasan absensi kamu hari ini
                </p>
              </div>

              {isComplete && (
                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                  Lengkap
                </span>
              )}
            </div>

            <div className="space-y-6">
              {/* MASUK */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      masuk
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Clock3 size={20} />
                  </div>

                  <div className="mt-2 h-12 w-px bg-gray-200" />
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Absen Masuk
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {masuk
                          ? masuk.time
                          : "Belum dilakukan"}
                      </p>
                    </div>

                    {masuk && (
                      <span className="text-sm font-semibold text-green-600">
                        Tercatat
                      </span>
                    )}
                  </div>

                  {masuk && (
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      {masuk.workLocation && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
                            masuk.workLocation ===
                            "WFO"
                              ? "bg-blue-50 text-brand-blue"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {masuk.workLocation ===
                          "WFO" ? (
                            <Building2
                              size={14}
                            />
                          ) : (
                            <Home size={14} />
                          )}

                          {masuk.workLocation}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* PULANG */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      pulang
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Absen Pulang
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {pulang
                          ? pulang.time
                          : "Belum dilakukan"}
                      </p>
                    </div>

                    {pulang && (
                      <span className="text-sm font-semibold text-green-600">
                        Tercatat
                      </span>
                    )}
                  </div>

                  {pulang && (
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      {pulang.workLocation && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
                            pulang.workLocation ===
                            "WFO"
                              ? "bg-blue-50 text-brand-blue"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {pulang.workLocation ===
                          "WFO" ? (
                            <Building2
                              size={14}
                            />
                          ) : (
                            <Home size={14} />
                          )}

                          {pulang.workLocation}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MENU CEPAT */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Menu Cepat
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Akses fitur siswa
            </p>

            {/* ABSEN */}
            <Link
              to="/user/attendance"
              className={`mt-6 flex w-full items-center justify-between gap-3 rounded-2xl p-4 transition ${
                attendanceButton.disabled
                  ? "bg-green-50 text-green-700"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark"
              }`}
            >
              <div className="flex items-center gap-3">
                {attendanceButton.disabled ? (
                  <CheckCircle2 size={21} />
                ) : (
                  <Clock3 size={21} />
                )}

                <div className="text-left">
                  <p className="text-sm font-bold">
                    {attendanceButton.text}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      attendanceButton.disabled
                        ? "text-green-600"
                        : "text-white/70"
                    }`}
                  >
                    {attendanceButton.disabled
                      ? "Sampai jumpa besok!"
                      : "Klik untuk melakukan absensi"}
                  </p>
                </div>
              </div>

              <ArrowRight size={19} />
            </Link>

            {/* HISTORY */}
            <Link
              to="/user/attendance-history"
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl bg-gray-50 p-4 text-gray-800 transition hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <ClipboardList
                  size={21}
                  className="text-brand-blue"
                />

                <div>
                  <p className="text-sm font-bold">
                    Riwayat Absensi
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Lihat detail absensi
                  </p>
                </div>
              </div>

              <ArrowRight size={19} />
            </Link>

            {/* IZIN */}
            <Link
              to="/user/izin"
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl bg-gray-50 p-4 text-gray-800 transition hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <ClipboardPen
                  size={21}
                  className="text-brand-blue"
                />

                <div>
                  <p className="text-sm font-bold">
                    Pengajuan Izin
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Ajukan izin atau sakit
                  </p>
                </div>
              </div>

              <ArrowRight size={19} />
            </Link>

            {/* PROFILE */}
            <Link
              to="/user/profile"
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl bg-gray-50 p-4 text-gray-800 transition hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <User
                  size={21}
                  className="text-brand-blue"
                />

                <div>
                  <p className="text-sm font-bold">
                    Profile
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Kelola data diri
                  </p>
                </div>
              </div>

              <ArrowRight size={19} />
            </Link>

            {/* LOCATION */}
            {latestLocation && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2 text-gray-500">
                  {latestLocation === "WFO" ? (
                    <Building2 size={17} />
                  ) : (
                    <Home size={17} />
                  )}

                  <span className="text-sm">
                    Status lokasi terakhir
                  </span>
                </div>

                <p
                  className={`mt-2 font-bold ${
                    latestLocation === "WFO"
                      ? "text-brand-blue"
                      : "text-orange-500"
                  }`}
                >
                  {latestLocation === "WFO"
                    ? "Work From Office"
                    : "Work From Home"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* INFORMATION */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-yellow-light text-brand-yellow">
              <AlertCircle size={21} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Informasi Absensi
              </h3>

              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li>
                  • Absen sebelum pukul 12:00 tercatat sebagai Absen Masuk.
                </li>

                <li>
                  • Absen mulai pukul 12:00 tercatat sebagai Absen Pulang.
                </li>

                <li>
                  • Dalam radius kantor akan tercatat sebagai WFO.
                </li>

                <li>
                  • Di luar radius kantor akan tercatat sebagai WFH.
                </li>

                <li>
                  • Setiap jenis absensi hanya dapat dilakukan satu kali dalam satu hari.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}