import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  Search,
  UserCheck,
} from "lucide-react";

import {
  getAdminAttendanceHistory,
  getAdminStudents,
} from "../../services/api";

const WIB = "Asia/Jakarta";

/* =========================================================
   RESPONSE HELPER
========================================================= */

function unwrapResponse(response) {
  if (!response) return null;

  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
}

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return null;
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

  const nested = [
    data?.data,
    data?.items,
    data?.records,
    data?.results,
    data?.rows,

    data?.data?.data,
    data?.data?.items,
    data?.data?.records,
    data?.data?.results,
    data?.data?.rows,

    data?.attendance,
    data?.attendances,
    data?.data?.attendance,
    data?.data?.attendances,
  ];

  for (const value of nested) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

/* =========================================================
   DATE
========================================================= */

function normalizeDate(value) {
  if (!value) return "";

  const text = String(value).trim();

  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoDate) {
    return `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`;
  }

  const dmy = text.match(/^(\d{2})-(\d{2})-(\d{4})/);

  if (dmy) {
    return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  }

  const slash = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);

  if (slash) {
    return `${slash[3]}-${slash[2]}-${slash[1]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDate(value) {
  const date = normalizeDate(value);

  if (!date) {
    return "-";
  }

  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatMonth(value) {
  if (!value) return "-";

  const [year, month] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

/* =========================================================
   TIME
========================================================= */

function formatTime(value) {
  if (!value) {
    return "-";
  }

  const text = String(value).trim();

  const isDateTime =
    /^\d{4}-\d{2}-\d{2}T/.test(text) ||
    /Z$/i.test(text) ||
    /[+-]\d{2}:\d{2}$/.test(text);

  if (isDateTime) {
    const date = new Date(text);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: WIB,
      }).format(date);
    }
  }

  const timeOnly = text.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
  );

  if (timeOnly) {
    return `${String(timeOnly[1]).padStart(2, "0")}:${timeOnly[2]}`;
  }

  const fallbackTime = text.match(
    /(\d{1,2}):(\d{2})(?::(\d{2}))?/
  );

  if (fallbackTime) {
    return `${String(fallbackTime[1]).padStart(2, "0")}:${fallbackTime[2]}`;
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: WIB,
    }).format(date);
  }

  return "-";
}

/* =========================================================
   STUDENT
========================================================= */

function getStudentObject(item) {
  return (
    item?.student ||
    item?.siswa ||
    item?.user ||
    item?.student_data ||
    item?.studentData ||
    item?.user_data ||
    item?.userData ||
    item?.profile ||
    {}
  );
}

function getName(item) {
  const nested = getStudentObject(item);

  return String(
    firstValue(
      item?.full_name,
      item?.fullName,
      item?.name,
      item?.nama,

      item?.student_name,
      item?.studentName,

      item?.nama_siswa,
      item?.namaSiswa,

      item?.siswa_nama,
      item?.siswaNama,

      nested?.full_name,
      nested?.fullName,
      nested?.name,
      nested?.nama,

      nested?.student_name,
      nested?.studentName,

      nested?.nama_siswa,
      nested?.namaSiswa,

      nested?.siswa_nama,
      nested?.siswaNama,

      "Siswa"
    )
  );
}

function getNisn(item) {
  const nested = getStudentObject(item);

  return String(
    firstValue(
      item?.nisn,
      item?.NISN,

      item?.student_nisn,
      item?.studentNisn,

      item?.siswa_nisn,
      item?.siswaNisn,

      nested?.nisn,
      nested?.NISN,

      nested?.student_nisn,
      nested?.studentNisn,

      nested?.siswa_nisn,
      nested?.siswaNisn,

      "-"
    )
  );
}

function getStudentId(item) {
  return firstValue(
    item?.student_id,
    item?.studentId,

    item?.user_id,
    item?.userId,

    item?.siswa_id,
    item?.siswaId,

    item?.student?.id,
    item?.student?.user_id,
    item?.student?.userId,

    item?.user?.id,
    item?.user?.user_id,
    item?.user?.userId,

    item?.siswa?.id,
    item?.siswa?.user_id,
    item?.siswa?.userId,

    item?.id
  );
}

function buildStudentMap(students) {
  const map = new Map();

  students.forEach((student) => {
    const ids = [
      student?.id,

      student?.user_id,
      student?.userId,

      student?.student_id,
      student?.studentId,

      student?.siswa_id,
      student?.siswaId,

      student?.nisn,

      student?.user?.id,
      student?.user?.user_id,
      student?.user?.userId,
      student?.user?.nisn,

      student?.student?.id,
      student?.student?.user_id,
      student?.student?.userId,
      student?.student?.nisn,

      student?.siswa?.id,
      student?.siswa?.user_id,
      student?.siswa?.userId,
      student?.siswa?.nisn,
    ];

    ids.forEach((id) => {
      if (
        id !== undefined &&
        id !== null &&
        String(id).trim()
      ) {
        map.set(
          String(id).trim().toLowerCase(),
          student
        );
      }
    });
  });

  return map;
}

function findStudent(item, map) {
  const ids = [
    item?.student_id,
    item?.studentId,

    item?.user_id,
    item?.userId,

    item?.siswa_id,
    item?.siswaId,

    item?.student?.id,
    item?.student?.user_id,
    item?.student?.userId,
    item?.student?.nisn,

    item?.user?.id,
    item?.user?.user_id,
    item?.user?.userId,
    item?.user?.nisn,

    item?.siswa?.id,
    item?.siswa?.user_id,
    item?.siswa?.userId,
    item?.siswa?.nisn,

    item?.nisn,
  ];

  for (const id of ids) {
    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {
      continue;
    }

    const student = map.get(
      String(id).trim().toLowerCase()
    );

    if (student) {
      return student;
    }
  }

  return null;
}

/* =========================================================
   ATTENDANCE
========================================================= */

function getAttendanceDate(item) {
  return firstValue(
    item?.date,

    item?.attendance_date,
    item?.attendanceDate,

    item?.tanggal,

    item?.tanggal_absensi,
    item?.tanggalAbsensi,

    item?.check_in_date,
    item?.checkInDate,

    item?.created_at,
    item?.createdAt
  );
}

function getCheckIn(item) {
  return firstValue(
    item?.check_in,
    item?.checkIn,

    item?.check_in_time,
    item?.checkInTime,

    item?.check_in_at,
    item?.checkInAt,

    item?.time_in,
    item?.timeIn,

    item?.jam_masuk,
    item?.jamMasuk,

    item?.waktu_masuk,
    item?.waktuMasuk,

    item?.masuk
  );
}

function getCheckOut(item) {
  return firstValue(
    item?.check_out,
    item?.checkOut,

    item?.check_out_time,
    item?.checkOutTime,

    item?.check_out_at,
    item?.checkOutAt,

    item?.time_out,
    item?.timeOut,

    item?.jam_pulang,
    item?.jamPulang,

    item?.waktu_pulang,
    item?.waktuPulang,

    item?.pulang
  );
}

function getAttendanceStatus(item) {
  return firstValue(
    item?.status,

    item?.attendance_status,
    item?.attendanceStatus,

    item?.kehadiran,

    item?.status_absensi,
    item?.statusAbsensi,

    item?.jenis,

    item?.type,
    item?.tipe
  );
}

function normalizeStatus(value, checkIn, checkOut) {
  if (!value) {
    return checkIn || checkOut ? "Hadir" : "-";
  }

  const text = String(value).trim().toLowerCase();

  if (
    text.includes("terlambat") ||
    text.includes("late")
  ) {
    return "Terlambat";
  }

  if (
    text.includes("hadir") ||
    text.includes("present") ||
    text.includes("checked")
  ) {
    return "Hadir";
  }

  if (text.includes("izin")) {
    return "Izin";
  }

  if (
    text.includes("sakit") ||
    text.includes("sick")
  ) {
    return "Sakit";
  }

  if (
    text.includes("alpha") ||
    text.includes("alpa") ||
    text.includes("absent")
  ) {
    return "Alpha";
  }

  return String(value);
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const value = String(status || "-");
  const lower = value.toLowerCase();

  if (lower === "hadir") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={13} strokeWidth={2.5} />
        Hadir
      </span>
    );
  }

  if (lower === "terlambat") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
        <Clock3 size={13} strokeWidth={2.5} />
        Terlambat
      </span>
    );
  }

  if (lower === "izin") {
    return (
      <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
        Izin
      </span>
    );
  }

  if (lower === "sakit") {
    return (
      <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
        Sakit
      </span>
    );
  }

  if (lower === "alpha") {
    return (
      <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
        Alpha
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600">
      {value}
    </span>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function History() {
  const now = new Date();

  const defaultMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] =
    useState(defaultMonth);

  const [attendanceRows, setAttendanceRows] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD HISTORY
  ===================================================== */

  const loadHistory = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [year, month] =
          selectedMonth
            .split("-")
            .map(Number);

        const startDate =
          `${selectedMonth}-01`;

        const lastDay = new Date(
          year,
          month,
          0
        ).getDate();

        const endDate =
          `${selectedMonth}-${String(
            lastDay
          ).padStart(2, "0")}`;

        const [
          attendanceResponse,
          studentsResponse,
        ] = await Promise.all([
          getAdminAttendanceHistory({
            startDate,
            endDate,
          }),

          getAdminStudents(),
        ]);

        console.log(
          "RIWAYAT ABSEN RESPONSE:",
          attendanceResponse
        );

        console.log(
          "RIWAYAT STUDENTS RESPONSE:",
          studentsResponse
        );

        const attendance =
          getArray(
            unwrapResponse(
              attendanceResponse
            ),
            [
              "attendance",
              "attendances",
              "records",
              "items",
              "results",
              "rows",
            ]
          );

        const studentList =
          getArray(
            unwrapResponse(
              studentsResponse
            ),
            [
              "students",
              "student",
              "users",
              "records",
              "items",
              "results",
              "rows",
            ]
          );

        setAttendanceRows(
          attendance
        );

        setStudents(
          studentList
        );
      } catch (err) {
        console.error(
          "Gagal mengambil riwayat absensi:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data riwayat absensi."
        );

        setAttendanceRows([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedMonth]
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /* =====================================================
     STUDENT MAP
  ===================================================== */

  const studentMap = useMemo(
    () =>
      buildStudentMap(
        students
      ),
    [students]
  );

  /* =====================================================
     ATTENDANCE
  ===================================================== */

  const attendance = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return attendanceRows
      .map((item, index) => {
        const student =
          findStudent(
            item,
            studentMap
          );

        const rawDate =
          getAttendanceDate(item);

        const date =
          normalizeDate(
            rawDate
          );

        const checkIn =
          getCheckIn(item);

        const checkOut =
          getCheckOut(item);

        const itemName =
          getName(item);

        const itemNisn =
          getNisn(item);

        const status =
          normalizeStatus(
            getAttendanceStatus(item),
            checkIn,
            checkOut
          );

        return {
          id:
            item?.id ||
            item?.attendance_id ||
            `${getStudentId(item) || "row"}-${date}-${index}`,

          name:
            itemName !== "Siswa"
              ? itemName
              : getName(
                  student || {}
                ),

          nisn:
            itemNisn !== "-"
              ? itemNisn
              : getNisn(
                  student || {}
                ),

          date,

          checkIn:
            formatTime(checkIn),

          checkOut:
            formatTime(checkOut),

          status,
        };
      })

      .filter(
        (row) =>
          row.date &&
          row.date.startsWith(
            selectedMonth
          )
      )

      .filter((row) => {
        if (!keyword) {
          return true;
        }

        return `${row.name} ${row.nisn} ${row.status}`
          .toLowerCase()
          .includes(keyword);
      })

      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(
            a.date
          );
        }

        return a.name.localeCompare(
          b.name
        );
      });
  }, [
    attendanceRows,
    selectedMonth,
    search,
    studentMap,
  ]);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const summary = useMemo(() => {
    const hadir =
      attendance.filter(
        (row) =>
          row.status === "Hadir"
      ).length;

    const terlambat =
      attendance.filter(
        (row) =>
          row.status === "Terlambat"
      ).length;

    return {
      total:
        attendance.length,

      hadir,

      terlambat,
    };
  }, [attendance]);

  /* =====================================================
     PDF
  ===================================================== */

  const handlePrintPdf = () => {
    window.print();
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f6f8fc]">

      <style>{`
        @media print {

          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-page {
            min-height: auto !important;
            background: white !important;
            max-width: none !important;
            width: 100% !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #dbe2ea !important;
            break-inside: avoid;
          }

          .print-table {
            font-size: 9px !important;
          }

          .print-table th,
          .print-table td {
            padding: 5px 6px !important;
          }

          .print-section {
            break-inside: avoid;
          }
        }
      `}</style>

      <main className="print-page mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="no-print mb-7">

          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

            <div>

              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-blue">
                <CalendarDays size={14} />
                Admin Panel
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Riwayat Absensi
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Pantau dan kelola rekap kehadiran siswa
                berdasarkan periode yang dipilih.
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* BULAN */}

              <label className="group flex h-11 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 shadow-sm transition hover:border-blue-200 hover:shadow-md">

                <CalendarDays
                  size={17}
                  className="text-brand-blue"
                />

                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(
                      e.target.value
                    )
                  }
                  className="bg-transparent text-sm font-semibold text-gray-700 outline-none"
                />

              </label>

              {/* SEARCH */}

              <div className="relative">

                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Cari siswa..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-blue-200 focus:border-brand-blue focus:ring-4 focus:ring-blue-50 sm:w-56"
                />

              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={() =>
                  loadHistory({
                    silent: true,
                  })
                }
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
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

              {/* PDF */}

              <button
                type="button"
                onClick={
                  handlePrintPdf
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md"
              >

                <Download size={17} />

                Simpan PDF

              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            PRINT HEADER
        ================================================= */}

        <div className="mb-6 hidden print:block">

          <h1 className="text-2xl font-extrabold text-gray-900">
            Laporan Riwayat Absensi
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Periode:{" "}
            {formatMonth(
              selectedMonth
            )}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            ABSENKU • Sistem Presensi Peserta PKL
          </p>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="no-print mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">

          <SummaryCard
            label="Total Absen"
            value={
              loading
                ? "—"
                : summary.total
            }
            description="Seluruh data absensi"
            className="bg-blue-50 text-brand-blue"
          />

          <SummaryCard
            label="Hadir"
            value={
              loading
                ? "—"
                : summary.hadir
            }
            description="Kehadiran tepat waktu"
            className="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            label="Terlambat"
            value={
              loading
                ? "—"
                : summary.terlambat
            }
            description="Kehadiran terlambat"
            className="bg-amber-50 text-amber-600"
          />

        </div>

        {/* =================================================
            RIWAYAT ABSEN
        ================================================= */}

        <section className="print-section print-card overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">

          {/* TITLE */}

          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-base font-extrabold text-gray-900 sm:text-lg">
                  Riwayat Absen
                </h2>

                {!loading && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">
                    {attendance.length} data
                  </span>
                )}

              </div>

              <p className="mt-1 text-sm text-gray-500">
                Rekap absensi untuk periode{" "}
                <span className="font-semibold text-gray-700">
                  {formatMonth(
                    selectedMonth
                  )}
                </span>
              </p>

            </div>

            <div className="no-print inline-flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold text-brand-blue">

              <UserCheck size={16} />

              Data Kehadiran

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="print-table w-full min-w-[850px] text-sm">

              <thead className="border-b border-blue-100 bg-blue-50/70 text-left text-[11px] font-extrabold uppercase tracking-wider text-brand-blue">

                <tr>

                  <th className="px-5 py-4">
                    No
                  </th>

                  <th className="px-5 py-4">
                    Tanggal
                  </th>

                  <th className="px-5 py-4">
                    Nama Siswa
                  </th>

                  <th className="px-5 py-4">
                    NISN
                  </th>

                  <th className="px-5 py-4">
                    Jam Masuk
                  </th>

                  <th className="px-5 py-4">
                    Jam Pulang
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-5 py-14 text-center"
                    >

                      <div className="flex flex-col items-center justify-center">

                        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-blue" />

                        <p className="text-sm font-semibold text-gray-500">
                          Memuat riwayat absensi...
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Mohon tunggu sebentar
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : attendance.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-5 py-14 text-center"
                    >

                      <div className="mx-auto flex max-w-sm flex-col items-center">

                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                          <Search size={21} />
                        </div>

                        <p className="text-sm font-bold text-gray-700">
                          Tidak ada data absensi
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-400">
                          Belum terdapat data absensi
                          pada periode atau pencarian
                          yang dipilih.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  attendance.map(
                    (row, index) => (

                      <tr
                        key={row.id}
                        className="group transition hover:bg-blue-50/40"
                      >

                        <td className="px-5 py-4 text-xs font-semibold text-gray-400">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">

                          <span className="font-semibold text-gray-700">
                            {formatDate(
                              row.date
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="font-bold text-gray-900">
                            {row.name}
                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-lg bg-gray-50 px-2.5 py-1 font-mono text-xs font-medium text-gray-500">
                            {row.nisn}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span className="font-semibold text-gray-700">
                            {row.checkIn}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span className="font-semibold text-gray-700">
                            {row.checkOut}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <StatusBadge
                            status={
                              row.status
                            }
                          />

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* TABLE FOOTER */}

          {!loading &&
            attendance.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3.5 sm:px-6">

                <p className="text-xs font-medium text-gray-400">

                  Menampilkan{" "}
                  <span className="font-bold text-gray-600">
                    {attendance.length}
                  </span>{" "}
                  data absensi pada{" "}
                  <span className="font-bold text-gray-600">
                    {formatMonth(
                      selectedMonth
                    )}
                  </span>

                </p>

              </div>
            )}

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="mt-6 flex flex-col items-center justify-between gap-1 text-center text-xs text-gray-400 sm:flex-row sm:text-left print:mt-4">

          <span>
            ABSENKU • Sistem Presensi Peserta PKL
          </span>

          <span>
            Periode{" "}
            {formatMonth(
              selectedMonth
            )}
          </span>

        </footer>

      </main>

    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  description,
  className,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]">

      <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-gray-50 opacity-60 transition group-hover:scale-110" />

      <div className="relative">

        <div className="mb-3 flex items-center justify-between">

          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {label}
          </p>

          <div
            className={`h-2.5 w-2.5 rounded-full ${className}`}
          />

        </div>

        <p className="text-3xl font-extrabold tracking-tight text-gray-900">
          {value}
        </p>

        <p className="mt-1.5 text-xs font-medium text-gray-400">
          {description}
        </p>

      </div>

    </div>
  );
}