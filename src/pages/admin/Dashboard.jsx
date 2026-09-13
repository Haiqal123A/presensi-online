import {
  Users,
  UserCheck,
  UserX,
  FileText,
  Building2,
  Home,
  Clock3,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  LogIn,
  LogOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAdminTodayAttendance,
  getAdminStudents,
  getAdminIzin,
} from "../../services/api";

function unwrapResponse(response) {
  if (!response) return null;

  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
}

function getArray(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

function getFirstArray(data, keys = []) {
  const direct = getArray(data, keys);

  if (direct.length > 0) {
    return direct;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getName(item) {
  return (
    item?.full_name ||
    item?.fullName ||
    item?.name ||
    item?.student_name ||
    item?.studentName ||
    item?.user?.full_name ||
    item?.user?.fullName ||
    item?.user?.name ||
    "Siswa"
  );
}

function getNisn(item) {
  return (
    item?.nisn ||
    item?.student_nisn ||
    item?.studentNisn ||
    item?.user?.nisn ||
    "-"
  );
}

function normalizeWorkMode(value) {
  const mode = String(value || "").trim().toUpperCase();

  if (mode === "WFO") return "WFO";
  if (mode === "WFH") return "WFH";

  return null;
}

function getWorkMode(item, fallback = null) {
  return (
    normalizeWorkMode(item?.work_mode) ||
    normalizeWorkMode(item?.workMode) ||
    normalizeWorkMode(item?.location_type) ||
    normalizeWorkMode(item?.locationType) ||
    normalizeWorkMode(item?.check_in?.work_mode) ||
    normalizeWorkMode(item?.checkIn?.work_mode) ||
    normalizeWorkMode(item?.check_in?.workMode) ||
    normalizeWorkMode(item?.checkIn?.workMode) ||
    normalizeWorkMode(item?.check_out?.work_mode) ||
    normalizeWorkMode(item?.checkOut?.work_mode) ||
    normalizeWorkMode(item?.check_out?.workMode) ||
    normalizeWorkMode(item?.checkOut?.workMode) ||
    fallback
  );
}

function getTimestamp(item, type = "in") {
  if (!item) return null;

  if (type === "in") {
    return (
      item?.check_in_time ||
      item?.checkInTime ||
      item?.check_in_at ||
      item?.checkInAt ||
      item?.check_in?.time ||
      item?.check_in?.timestamp ||
      item?.check_in?.created_at ||
      item?.checkIn?.time ||
      item?.checkIn?.timestamp ||
      item?.checkIn?.created_at ||
      null
    );
  }

  return (
    item?.check_out_time ||
    item?.checkOutTime ||
    item?.check_out_at ||
    item?.checkOutAt ||
    item?.check_out?.time ||
    item?.check_out?.timestamp ||
    item?.check_out?.created_at ||
    item?.checkOut?.time ||
    item?.checkOut?.timestamp ||
    item?.checkOut?.created_at ||
    null
  );
}

function getAttendanceDate(item) {
  return (
    item?.date ||
    item?.attendance_date ||
    item?.attendanceDate ||
    item?.tanggal ||
    item?.created_at ||
    item?.createdAt ||
    null
  );
}

function formatTime(value) {
  if (!value) return "--:--";

  if (
    typeof value === "string" &&
    /^\d{1,2}:\d{2}/.test(value)
  ) {
    return value.slice(0, 5);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 5);
  }

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatDate(value) {
  if (!value) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date());
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function getAttendanceRecords(data) {
  const records = getFirstArray(data, [
    "attendance",
    "attendances",
    "records",
    "items",
    "results",
  ]);

  if (records.length > 0) {
    return records;
  }

  if (
    data &&
    !Array.isArray(data) &&
    typeof data === "object"
  ) {
    const nested =
      data?.attendance ||
      data?.attendances ||
      data?.records ||
      data?.items;

    if (Array.isArray(nested)) {
      return nested;
    }
  }

  return [];
}

function getIzinRecords(data) {
  return getFirstArray(data, [
    "izin",
    "izins",
    "permissions",
    "records",
    "items",
    "results",
  ]);
}

function getStudentRecords(data) {
  return getFirstArray(data, [
    "students",
    "student",
    "users",
    "records",
    "items",
    "results",
  ]);
}

function isToday(value) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();

  const jakartaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const todayJakarta = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return jakartaDate === todayJakarta;
}

function getStudentId(item) {
  return (
    item?.id ||
    item?.user_id ||
    item?.userId ||
    item?.student_id ||
    item?.studentId ||
    item?.nisn ||
    null
  );
}

function getAttendanceStudent(item) {
  return (
    item?.student ||
    item?.user ||
    item?.student_data ||
    item?.studentData ||
    null
  );
}

function getAttendanceStudentName(item) {
  const student = getAttendanceStudent(item);

  return (
    getName(item) !== "Siswa"
      ? getName(item)
      : getName(student)
  );
}

function getAttendanceStudentNisn(item) {
  const student = getAttendanceStudent(item);

  return (
    getNisn(item) !== "-"
      ? getNisn(item)
      : getNisn(student)
  );
}

function makeRecentAttendance(records) {
  const items = [];

  records.forEach((record, index) => {
    if (!record) return;

    const studentId =
      getStudentId(record) || index;

    const checkIn = getTimestamp(record, "in");
    const checkOut = getTimestamp(record, "out");

    const checkInMode =
      getWorkMode(
        record?.check_in || record?.checkIn || record
      );

    const checkOutMode =
      getWorkMode(
        record?.check_out || record?.checkOut || record
      );

    if (checkIn) {
      items.push({
        id: `${studentId}-masuk`,
        name: getAttendanceStudentName(record),
        nisn: getAttendanceStudentNisn(record),
        type: "Absen Masuk",
        time: formatTime(checkIn),
        timestamp: checkIn,
        location: checkInMode || "-",
      });
    }

    if (checkOut) {
      items.push({
        id: `${studentId}-pulang`,
        name: getAttendanceStudentName(record),
        nisn: getAttendanceStudentNisn(record),
        type: "Absen Pulang",
        time: formatTime(checkOut),
        timestamp: checkOut,
        location: checkOutMode || "-",
      });
    }

    /*
     * Fallback jika backend mengembalikan
     * absensi sebagai item terpisah.
     */
    if (!checkIn && !checkOut) {
      const timestamp =
        record?.timestamp ||
        record?.time ||
        record?.created_at ||
        record?.createdAt ||
        null;

      if (!timestamp) return;

      const typeValue = String(
        record?.type ||
          record?.attendance_type ||
          record?.attendanceType ||
          record?.status ||
          ""
      ).toLowerCase();

      const isCheckout =
        typeValue.includes("out") ||
        typeValue.includes("pulang") ||
        typeValue.includes("checkout");

      items.push({
        id: record?.id || `${studentId}-${index}`,
        name: getAttendanceStudentName(record),
        nisn: getAttendanceStudentNisn(record),
        type: isCheckout
          ? "Absen Pulang"
          : "Absen Masuk",
        time: formatTime(timestamp),
        timestamp,
        location: getWorkMode(record) || "-",
      });
    }
  });

  items.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();

    return timeB - timeA;
  });

  return items.slice(0, 5);
}

function countAttendance(records) {
  const studentIds = new Set();
  let checkInCount = 0;
  let wfoCount = 0;
  let wfhCount = 0;

  records.forEach((record, index) => {
    if (!record) return;

    const studentId =
      getStudentId(record) ||
      getAttendanceStudentNisn(record) ||
      `record-${index}`;

    const checkIn = getTimestamp(record, "in");
    const checkOut = getTimestamp(record, "out");

    const hasCheckedIn =
      Boolean(checkIn) ||
      record?.has_checked_in === true ||
      record?.hasCheckedIn === true ||
      record?.checked_in === true ||
      record?.checkedIn === true;

    const hasCheckedOut =
      Boolean(checkOut) ||
      record?.has_checked_out === true ||
      record?.hasCheckedOut === true ||
      record?.checked_out === true ||
      record?.checkedOut === true;

    if (hasCheckedIn || hasCheckedOut) {
      studentIds.add(String(studentId));
    }

    if (hasCheckedIn) {
      checkInCount += 1;
    }

    const inMode = getWorkMode(
      record?.check_in || record?.checkIn || record
    );

    const outMode = getWorkMode(
      record?.check_out || record?.checkOut || record
    );

    const mode = inMode || outMode;

    if (mode === "WFO") {
      wfoCount += 1;
    }

    if (mode === "WFH") {
      wfhCount += 1;
    }
  });

  return {
    attendedStudents: studentIds.size,
    checkInCount,
    wfoCount,
    wfhCount,
  };
}

function getTotalStudentCount(data, records) {
  const directCount =
    data?.total ??
    data?.total_students ??
    data?.totalStudents ??
    data?.count ??
    data?.pagination?.total ??
    data?.meta?.total ??
    null;

  if (
    directCount !== null &&
    directCount !== undefined &&
    !Number.isNaN(Number(directCount))
  ) {
    return Number(directCount);
  }

  return records.length;
}

function getIzinDate(item) {
  return (
    item?.tanggal_mulai ||
    item?.tanggalMulai ||
    item?.start_date ||
    item?.startDate ||
    item?.tanggal ||
    item?.date ||
    item?.created_at ||
    item?.createdAt ||
    null
  );
}

function getIzinType(item) {
  return (
    item?.tipe_izin ||
    item?.tipeIzin ||
    item?.type ||
    item?.izin_type ||
    item?.izinType ||
    "Izin"
  );
}

function getIzinReason(item) {
  return (
    item?.alasan ||
    item?.reason ||
    item?.keterangan ||
    item?.description ||
    "-"
  );
}

function getIzinStatus(item) {
  return String(
    item?.status ||
      item?.approval_status ||
      item?.approvalStatus ||
      ""
  ).toLowerCase();
}

function makeRecentIzin(records) {
  return records
    .filter((item) => {
      const date = getIzinDate(item);

      if (!date) return true;

      return isToday(date);
    })
    .sort((a, b) => {
      const dateA = new Date(getIzinDate(a) || 0).getTime();
      const dateB = new Date(getIzinDate(b) || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 3)
    .map((item, index) => ({
      id:
        item?.id ||
        item?.izin_id ||
        item?.izinId ||
        index,
      name: getName(item),
      type: getIzinType(item),
      date: formatDate(getIzinDate(item)),
      reason: getIzinReason(item),
      status: getIzinStatus(item),
    }));
}

function isIzinToday(item) {
  const date = getIzinDate(item);

  if (!date) return false;

  return isToday(date);
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  loading,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? (
              <span className="inline-block w-12 h-8 rounded-lg bg-gray-100 animate-pulse" />
            ) : (
              value
            )}
          </p>

          <p className="text-xs text-gray-400 mt-2">
            {description}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [studentsData, setStudentsData] =
    useState(null);

  const [attendanceData, setAttendanceData] =
    useState(null);

  const [izinData, setIzinData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [
          studentsResponse,
          attendanceResponse,
          izinResponse,
        ] = await Promise.all([
          getAdminStudents(),
          getAdminTodayAttendance(),
          getAdminIzin(),
        ]);

        setStudentsData(
          unwrapResponse(studentsResponse)
        );

        setAttendanceData(
          unwrapResponse(attendanceResponse)
        );

        setIzinData(
          unwrapResponse(izinResponse)
        );
      } catch (err) {
        console.error(
          "Gagal mengambil data dashboard admin:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data dashboard admin."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadDashboard({ silent: true });
      }
    };

    window.addEventListener(
      "focus",
      handleVisibility
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleVisibility
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [loadDashboard]);

  const students = useMemo(
    () => getStudentRecords(studentsData),
    [studentsData]
  );

  const attendanceRecords = useMemo(
    () =>
      getAttendanceRecords(
        attendanceData
      ),
    [attendanceData]
  );

  const izinRecords = useMemo(
    () => getIzinRecords(izinData),
    [izinData]
  );

  const attendanceSummary = useMemo(
    () =>
      countAttendance(
        attendanceRecords
      ),
    [attendanceRecords]
  );

  const totalStudents = useMemo(
    () =>
      getTotalStudentCount(
        studentsData,
        students
      ),
    [studentsData, students]
  );

  const todayIzinCount = useMemo(
    () =>
      izinRecords.filter(isIzinToday)
        .length,
    [izinRecords]
  );

  const attendedCount =
    attendanceSummary.attendedStudents ||
    attendanceSummary.checkInCount ||
    0;

  const belumAbsen = Math.max(
    totalStudents - attendedCount,
    0
  );

  const recentAttendance = useMemo(
    () =>
      makeRecentAttendance(
        attendanceRecords
      ),
    [attendanceRecords]
  );

  const recentIzin = useMemo(
    () => makeRecentIzin(izinRecords),
    [izinRecords]
  );

  const wfoCount =
    attendanceSummary.wfoCount;

  const wfhCount =
    attendanceSummary.wfhCount;

  const locationTotal =
    wfoCount + wfhCount;

  const wfoPercentage =
    locationTotal > 0
      ? Math.round(
          (wfoCount / locationTotal) * 100
        )
      : 0;

  const wfhPercentage =
    locationTotal > 0
      ? Math.round(
          (wfhCount / locationTotal) * 100
        )
      : 0;

  const attendancePercentage =
    totalStudents > 0
      ? Math.round(
          (attendedCount /
            totalStudents) *
            100
        )
      : 0;

  const belumAbsenPercentage =
    totalStudents > 0
      ? Math.round(
          (belumAbsen /
            totalStudents) *
            100
        )
      : 0;

  const izinPercentage =
    totalStudents > 0
      ? Math.round(
          (todayIzinCount /
            totalStudents) *
            100
        )
      : 0;

  const formattedDate =
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(currentDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-brand-blue mb-2">
                <CalendarDays size={20} />

                <span className="text-sm font-semibold">
                  Dashboard Admin
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Selamat Datang, Administrator
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Pantau aktivitas absensi siswa PKL
                hari ini.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  loadDashboard({
                    silent: true,
                  })
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm">
                <CalendarDays
                  size={17}
                  className="text-brand-blue"
                />

                <span className="text-sm font-semibold text-gray-700">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="text-red-600 shrink-0 mt-0.5"
              />

              <div className="min-w-0">
                <p className="font-bold text-sm text-red-800">
                  Gagal memuat dashboard
                </p>

                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadDashboard()
                  }
                  className="mt-3 text-sm font-bold text-red-800 underline"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Siswa"
            value={totalStudents}
            description="Siswa PKL terdaftar"
            icon={Users}
            iconClass="bg-blue-50 text-brand-blue"
            loading={loading}
          />

          <StatCard
            label="Hadir Hari Ini"
            value={attendedCount}
            description="Siswa sudah melakukan absensi"
            icon={UserCheck}
            iconClass="bg-green-50 text-green-600"
            loading={loading}
          />

          <StatCard
            label="Belum Absen"
            value={belumAbsen}
            description="Siswa belum melakukan absensi"
            icon={UserX}
            iconClass="bg-orange-50 text-orange-600"
            loading={loading}
          />

          <StatCard
            label="Izin Hari Ini"
            value={todayIzinCount}
            description="Izin tercatat hari ini"
            icon={FileText}
            iconClass="bg-purple-50 text-purple-600"
            loading={loading}
          />
        </div>

        {/* ATTENDANCE SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-bold text-gray-900">
                  Ringkasan Kehadiran
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Kondisi absensi siswa hari ini.
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                <UserCheck size={21} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={18} />

                  <span className="text-sm font-semibold">
                    Hadir
                  </span>
                </div>

                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {loading ? "—" : attendedCount}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {attendancePercentage}% dari total siswa
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5">
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock3 size={18} />

                  <span className="text-sm font-semibold">
                    Belum Absen
                  </span>
                </div>

                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {loading ? "—" : belumAbsen}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {belumAbsenPercentage}% dari total siswa
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50 border border-purple-100 p-5">
                <div className="flex items-center gap-2 text-purple-600">
                  <FileText size={18} />

                  <span className="text-sm font-semibold">
                    Izin
                  </span>
                </div>

                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {loading ? "—" : todayIzinCount}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {izinPercentage}% dari total siswa
                </p>
              </div>
            </div>
          </div>

          {/* WFO WFH */}
          <div className="bg-brand-blue rounded-2xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">
                  Lokasi Kerja
                </p>

                <h2 className="font-bold text-lg mt-1">
                  WFO vs WFH
                </h2>
              </div>

              <Building2 size={24} />
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Building2 size={16} />
                    WFO
                  </span>

                  <span className="font-bold">
                    {loading ? "—" : `${wfoCount} siswa`}
                  </span>
                </div>

                <div className="h-2 bg-white/15 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-brand-yellow rounded-full transition-all"
                    style={{
                      width: `${wfoPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Home size={16} />
                    WFH
                  </span>

                  <span className="font-bold">
                    {loading ? "—" : `${wfhCount} siswa`}
                  </span>
                </div>

                <div className="h-2 bg-white/15 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{
                      width: `${wfhPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 mt-7 pt-5">
              <p className="text-xs text-white/60">
                Berdasarkan siswa yang sudah melakukan
                absensi hari ini.
              </p>
            </div>
          </div>
        </div>

        {/* RECENT DATA */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ATTENDANCE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Aktivitas Absensi Terbaru
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Absensi siswa yang baru masuk.
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                  <ClipboardList size={21} />
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 3 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="p-5 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />

                      <div className="flex-1">
                        <div className="w-32 h-4 rounded bg-gray-100 animate-pulse" />
                        <div className="w-24 h-3 rounded bg-gray-100 animate-pulse mt-2" />
                      </div>

                      <div className="w-12 h-4 rounded bg-gray-100 animate-pulse" />
                    </div>
                  )
                )
              ) : recentAttendance.length > 0 ? (
                recentAttendance.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                      {item.type ===
                      "Absen Masuk" ? (
                        <LogIn size={19} />
                      ) : (
                        <LogOut size={19} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-gray-900 truncate">
                        {item.name}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {item.nisn}
                        </span>

                        <span className="text-gray-300">
                          •
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            item.location ===
                            "WFO"
                              ? "text-brand-blue"
                              : item.location ===
                                "WFH"
                              ? "text-orange-600"
                              : "text-gray-500"
                          }`}
                        >
                          {item.location}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-brand-blue">
                        {item.time}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {item.type}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <ClipboardList
                    size={28}
                    className="mx-auto text-gray-300"
                  />

                  <p className="text-sm font-semibold text-gray-500 mt-3">
                    Belum ada aktivitas absensi hari ini.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/attendance"
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-brand-blue hover:bg-brand-blue-light transition"
              >
                Lihat Semua Absensi
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          {/* IZIN */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Izin Terbaru
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Izin siswa yang tercatat hari ini.
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText size={21} />
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 3 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="p-5 flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />

                      <div className="flex-1">
                        <div className="w-36 h-4 rounded bg-gray-100 animate-pulse" />
                        <div className="w-20 h-3 rounded bg-gray-100 animate-pulse mt-2" />
                        <div className="w-full h-3 rounded bg-gray-100 animate-pulse mt-3" />
                      </div>
                    </div>
                  )
                )
              ) : recentIzin.length > 0 ? (
                recentIzin.map((item) => (
                  <div
                    key={item.id}
                    className="p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <p className="font-bold text-sm text-gray-900">
                              {item.name}
                            </p>

                            <p className="text-xs text-purple-600 font-semibold mt-1">
                              {item.type}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold self-start ${
                              item.status ===
                              "approved"
                                ? "bg-green-50 text-green-700"
                                : item.status ===
                                  "rejected"
                                ? "bg-red-50 text-red-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {item.status ===
                            "approved" ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <Clock3 size={12} />
                            )}

                            {item.status ===
                            "approved"
                              ? "Disetujui"
                              : item.status ===
                                "rejected"
                              ? "Ditolak"
                              : "Menunggu"}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          {item.date}
                        </p>

                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <FileText
                    size={28}
                    className="mx-auto text-gray-300"
                  />

                  <p className="text-sm font-semibold text-gray-500 mt-3">
                    Belum ada izin hari ini.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/izin")
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-brand-blue hover:bg-brand-blue-light transition"
              >
                Lihat Semua Izin
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Dashboard Terhubung Backend
              </h3>

              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Statistik siswa, absensi, WFO/WFH,
                dan izin pada halaman ini diambil
                langsung dari API Admin backend.
                Tidak ada data dummy yang digunakan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}