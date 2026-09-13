import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminAttendanceHistory,
  getAdminStudents,
  getAdminTodayAttendance,
} from "../../services/api";

const getToday = () => {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
};

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
};

const unwrapArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  const candidates = [
    response?.data,
    response?.data?.data,
    response?.data?.items,
    response?.data?.rows,
    response?.data?.records,
    response?.data?.students,
    response?.data?.attendance,
    response?.data?.attendances,
    response?.students,
    response?.attendance,
    response?.attendances,
    response?.items,
    response?.rows,
    response?.records,
    response?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const getStudentObject = (item) => {
  return (
    item?.student ||
    item?.siswa ||
    item?.user ||
    item?.user_data ||
    item?.student_data ||
    item?.profile ||
    {}
  );
};

const getStudentId = (item) => {
  const student = getStudentObject(item);

  return firstValue(
    item?.student_id,
    item?.studentId,
    item?.siswa_id,
    item?.siswaId,
    item?.user_id,
    item?.userId,
    item?.id,

    student?.student_id,
    student?.studentId,
    student?.siswa_id,
    student?.siswaId,
    student?.user_id,
    student?.userId,
    student?.id
  );
};

const getUserId = (item) => {
  const student = getStudentObject(item);

  return firstValue(
    item?.user_id,
    item?.userId,
    item?.student_id,
    item?.studentId,

    student?.user_id,
    student?.userId,
    student?.id
  );
};

const normalizeId = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  return String(value).trim().toLowerCase();
};

const getStudentName = (student) => {
  const nested = getStudentObject(student);

  return firstValue(
    student?.full_name,
    student?.fullName,
    student?.name,
    student?.nama,
    student?.student_name,
    student?.studentName,
    student?.nama_siswa,
    student?.namaSiswa,

    nested?.full_name,
    nested?.fullName,
    nested?.name,
    nested?.nama,
    nested?.student_name,
    nested?.studentName,
    nested?.nama_siswa,
    nested?.namaSiswa,

    "-"
  );
};

const getStudentNisn = (student) => {
  const nested = getStudentObject(student);

  return firstValue(
    student?.nisn,
    student?.NISN,
    student?.student_nisn,
    student?.studentNisn,
    student?.nisn_siswa,
    student?.nisnSiswa,

    nested?.nisn,
    nested?.NISN,
    nested?.student_nisn,
    nested?.studentNisn,

    "-"
  );
};

const getStudentSchool = (student) => {
  const nested = getStudentObject(student);

  return firstValue(
    student?.school,
    student?.school_name,
    student?.schoolName,
    student?.sekolah,
    student?.nama_sekolah,
    student?.namaSekolah,

    nested?.school,
    nested?.school_name,
    nested?.schoolName,
    nested?.sekolah,
    nested?.nama_sekolah,
    nested?.namaSekolah,

    "-"
  );
};

const getStudentMajor = (student) => {
  const nested = getStudentObject(student);

  return firstValue(
    student?.major,
    student?.major_name,
    student?.majorName,
    student?.jurusan,
    student?.nama_jurusan,
    student?.namaJurusan,

    nested?.major,
    nested?.major_name,
    nested?.majorName,
    nested?.jurusan,
    nested?.nama_jurusan,
    nested?.namaJurusan,

    "-"
  );
};

const getStudentEmail = (student) => {
  const nested = getStudentObject(student);

  return firstValue(
    student?.email,
    nested?.email,
    "-"
  );
};

const getAttendanceDate = (item) => {
  return firstValue(
    item?.date,
    item?.attendance_date,
    item?.attendanceDate,
    item?.tanggal,
    item?.tanggal_absensi,
    item?.tanggalAbsensi,
    item?.created_at,
    item?.createdAt,
    item?.check_in_date,
    item?.checkInDate
  );
};

const getCheckIn = (item) => {
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
};

const getCheckOut = (item) => {
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
};

const getWorkMode = (item) => {
  return firstValue(
    item?.work_mode,
    item?.workMode,
    item?.mode_kerja,
    item?.modeKerja,
    item?.mode,
    item?.location_type,
    item?.locationType,
    item?.tipe_lokasi,
    item?.tipeLokasi
  );
};

const getStatus = (item) => {
  return firstValue(
    item?.status,
    item?.attendance_status,
    item?.attendanceStatus,
    item?.kehadiran,
    item?.status_absensi,
    item?.statusAbsensi
  );
};

const getPhoto = (item) => {
  return firstValue(
    item?.photo,
    item?.photo_url,
    item?.photoUrl,
    item?.foto,
    item?.foto_absensi,
    item?.fotoAbsensi,
    item?.foto_masuk,
    item?.fotoMasuk,
    item?.image,
    item?.image_url,
    item?.imageUrl
  );
};

const normalizeDate = (value) => {
  if (!value) return null;

  const text = String(value);

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatDate = (value) => {
  const date = normalizeDate(value);

  if (!date) return "-";

  const match = date.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) return date;

  return `${match[3]}/${match[2]}/${match[1]}`;
};

const formatTime = (value) => {
  if (!value) return "-";

  const text = String(value);

  const match = text.match(
    /(\d{1,2}):(\d{2})(?::(\d{2}))?/
  );

  if (match) {
    return `${String(match[1]).padStart(
      2,
      "0"
    )}:${match[2]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return `${String(
    date.getHours()
  ).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

const normalizeMode = (value) => {
  if (!value) return "-";

  const text = String(value)
    .trim()
    .toLowerCase();

  if (
    text === "wfo" ||
    text.includes("office") ||
    text.includes("kantor")
  ) {
    return "WFO";
  }

  if (
    text === "wfh" ||
    text.includes("home") ||
    text.includes("rumah")
  ) {
    return "WFH";
  }

  return String(value);
};

const normalizeStatus = (
  value,
  checkIn,
  checkOut
) => {
  if (!value) {
    if (checkIn) return "Hadir";
    return "-";
  }

  const text = String(value)
    .trim()
    .toLowerCase();

  if (
    text === "checked_in" ||
    text === "checked-in"
  ) {
    return "Hadir";
  }

  if (
    text === "checked_out" ||
    text === "checked-out"
  ) {
    return "Hadir";
  }

  if (text.includes("terlambat")) {
    return "Terlambat";
  }

  if (
    text.includes("hadir") ||
    text.includes("present")
  ) {
    return "Hadir";
  }

  if (text.includes("izin")) {
    return "Izin";
  }

  if (text.includes("sakit")) {
    return "Sakit";
  }

  if (
    text.includes("alpha") ||
    text.includes("alpa")
  ) {
    return "Alpha";
  }

  return String(value);
};

/*
|--------------------------------------------------------------------------
| BUILD STUDENT MAP
|--------------------------------------------------------------------------
|
| Attendance endpoint ternyata bisa hanya mengirim:
|
| {
|   user_id: "...",
|   status: "CHECKED_IN",
|   work_mode: "WFH",
|   ...
| }
|
| Sedangkan nama/NISN ada di endpoint students.
|
| Karena itu kita buat beberapa key ID sekaligus supaya join
| tetap berhasil walaupun backend memakai student_id/user_id/id.
|
*/

const buildStudentMap = (students) => {
  const map = new Map();

  students.forEach((student) => {
    const possibleIds = [
      student?.id,
      student?.user_id,
      student?.userId,
      student?.student_id,
      student?.studentId,
      student?.siswa_id,
      student?.siswaId,
      student?.uuid,
      student?.user?.id,
      student?.user?.user_id,
      student?.student?.id,
      student?.student?.user_id,
    ];

    possibleIds.forEach((id) => {
      const normalized = normalizeId(id);

      if (normalized) {
        map.set(normalized, student);
      }
    });

    const email = firstValue(
      student?.email,
      student?.user?.email
    );

    if (email) {
      map.set(
        `email:${String(email).toLowerCase()}`,
        student
      );
    }

    const nisn = getStudentNisn(student);

    if (nisn && nisn !== "-") {
      map.set(
        `nisn:${String(nisn).toLowerCase()}`,
        student
      );
    }
  });

  return map;
};

const findStudentForAttendance = (
  attendance,
  studentMap,
  students
) => {
  const possibleIds = [
    attendance?.student_id,
    attendance?.studentId,
    attendance?.siswa_id,
    attendance?.siswaId,
    attendance?.user_id,
    attendance?.userId,
    attendance?.student?.id,
    attendance?.student?.user_id,
    attendance?.user?.id,
    attendance?.user?.user_id,
  ];

  for (const id of possibleIds) {
    const normalized = normalizeId(id);

    if (!normalized) continue;

    const student = studentMap.get(normalized);

    if (student) {
      return student;
    }
  }

  const email = firstValue(
    attendance?.email,
    attendance?.student?.email,
    attendance?.user?.email
  );

  if (email) {
    const student = studentMap.get(
      `email:${String(email).toLowerCase()}`
    );

    if (student) {
      return student;
    }
  }

  const nisn = firstValue(
    attendance?.nisn,
    attendance?.student?.nisn,
    attendance?.user?.nisn
  );

  if (nisn) {
    const student = studentMap.get(
      `nisn:${String(nisn).toLowerCase()}`
    );

    if (student) {
      return student;
    }
  }

  /*
   * Kalau attendance sudah membawa object student/user,
   * gunakan object tersebut sebagai fallback.
   */
  if (
    attendance?.student ||
    attendance?.siswa ||
    attendance?.user
  ) {
    return getStudentObject(attendance);
  }

  /*
   * Last fallback:
   * kalau hanya ada SATU siswa, gunakan siswa tersebut.
   * Ini mencegah tampilan kosong pada database kecil.
   */
  if (students.length === 1) {
    return students[0];
  }

  return null;
};

const mergeAttendanceWithStudents = (
  attendance,
  students
) => {
  const studentMap = buildStudentMap(students);

  return attendance.map(
    (item, index) => {
      const student =
        findStudentForAttendance(
          item,
          studentMap,
          students
        );

      const nestedStudent =
        getStudentObject(item);

      const name = firstValue(
        getStudentName(item),
        student
          ? getStudentName(student)
          : null,
        nestedStudent
          ? getStudentName(nestedStudent)
          : null,
        "-"
      );

      const nisn = firstValue(
        getStudentNisn(item),
        student
          ? getStudentNisn(student)
          : null,
        nestedStudent
          ? getStudentNisn(nestedStudent)
          : null,
        "-"
      );

      const school = firstValue(
        getStudentSchool(item),
        student
          ? getStudentSchool(student)
          : null,
        nestedStudent
          ? getStudentSchool(nestedStudent)
          : null,
        "-"
      );

      const major = firstValue(
        getStudentMajor(item),
        student
          ? getStudentMajor(student)
          : null,
        nestedStudent
          ? getStudentMajor(nestedStudent)
          : null,
        "-"
      );

      const checkIn =
        getCheckIn(item);

      const checkOut =
        getCheckOut(item);

      return {
        id:
          firstValue(
            item?.id,
            item?.attendance_id,
            item?.attendanceId,
            `${getStudentId(item) || "attendance"}-${index}`
          ),

        studentId:
          firstValue(
            getStudentId(item),
            getStudentId(student || {}),
            "-"
          ),

        userId:
          firstValue(
            getUserId(item),
            getUserId(student || {}),
            "-"
          ),

        name: String(name),
        nisn: String(nisn),
        school: String(school),
        major: String(major),

        email: firstValue(
          getStudentEmail(item),
          student
            ? getStudentEmail(student)
            : null,
          "-"
        ),

        date: normalizeDate(
          getAttendanceDate(item)
        ),

        checkIn: formatTime(checkIn),
        checkOut: formatTime(checkOut),

        workMode: normalizeMode(
          getWorkMode(item)
        ),

        status: normalizeStatus(
          getStatus(item),
          checkIn,
          checkOut
        ),

        photo: getPhoto(item),

        raw: item,
        student,
      };
    }
  );
};

function Badge({
  children,
  type = "default",
}) {
  const styles = {
    default:
      "bg-slate-100 text-slate-600 border-slate-200",
    green:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow:
      "bg-amber-50 text-amber-700 border-amber-200",
    blue:
      "bg-blue-50 text-blue-700 border-blue-200",
    red:
      "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[type] || styles.default
      }`}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const value = String(
    status || ""
  ).toLowerCase();

  if (value === "hadir") {
    return (
      <Badge type="green">
        Hadir
      </Badge>
    );
  }

  if (value === "terlambat") {
    return (
      <Badge type="yellow">
        Terlambat
      </Badge>
    );
  }

  if (value === "izin") {
    return (
      <Badge type="blue">
        Izin
      </Badge>
    );
  }

  if (value === "sakit") {
    return (
      <Badge type="blue">
        Sakit
      </Badge>
    );
  }

  if (value === "alpha") {
    return (
      <Badge type="red">
        Alpha
      </Badge>
    );
  }

  return (
    <Badge>
      {status || "-"}
    </Badge>
  );
}

function ModeBadge({ mode }) {
  if (mode === "WFO") {
    return (
      <Badge type="blue">
        WFO
      </Badge>
    );
  }

  if (mode === "WFH") {
    return (
      <Badge type="yellow">
        WFH
      </Badge>
    );
  }

  return (
    <Badge>
      {mode || "-"}
    </Badge>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailModal({
  row,
  onClose,
}) {
  if (!row) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Detail Absensi
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Informasi absensi siswa
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-blue text-lg font-bold text-white">
              {row.name &&
              row.name !== "-"
                ? row.name
                    .split(" ")
                    .slice(0, 2)
                    .map(
                      (part) =>
                        part[0]
                    )
                    .join("")
                    .toUpperCase()
                : "?"}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900">
                {row.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                NISN: {row.nisn}
              </p>
            </div>

            <div className="sm:ml-auto">
              <StatusBadge
                status={row.status}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Tanggal
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {formatDate(row.date)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Mode
              </p>

              <div className="mt-2">
                <ModeBadge
                  mode={row.workMode}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Absen Masuk
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {row.checkIn}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Absen Pulang
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {row.checkOut}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                NISN
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {row.nisn}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-2 break-all font-semibold text-slate-900">
                {row.email}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Sekolah
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {row.school}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Jurusan
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {row.major}
              </p>
            </div>
          </div>

          {row.photo && (
            <div>
              <p className="mb-3 text-sm font-bold text-slate-900">
                Foto Absensi
              </p>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={row.photo}
                  alt={`Foto absensi ${row.name}`}
                  className="max-h-[420px] w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    const parent =
                      event.currentTarget.parentElement;

                    if (parent) {
                      const message =
                        document.createElement(
                          "div"
                        );

                      message.className =
                        "p-8 text-center text-sm text-slate-400";

                      message.textContent =
                        "Foto tidak dapat ditampilkan.";

                      parent.appendChild(
                        message
                      );
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue-dark"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Attendance() {
  const today = useMemo(
    () => getToday(),
    []
  );

  const [date, setDate] =
    useState(today);

  const [search, setSearch] =
    useState("");

  const [mode, setMode] =
    useState("Semua");

  const [rows, setRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selected, setSelected] =
    useState(null);

  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        setError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        /*
         * Ambil data attendance DAN students
         * secara bersamaan.
         */
        const [
          attendanceResponse,
          studentsResponse,
        ] = await Promise.all([
          date === today
            ? getAdminTodayAttendance()
            : getAdminAttendanceHistory({
                startDate: date,
                endDate: date,
              }),

          getAdminStudents(),
        ]);

        console.log(
          "ADMIN ATTENDANCE:",
          attendanceResponse
        );

        console.log(
          "ADMIN STUDENTS:",
          studentsResponse
        );

        const attendanceData =
          unwrapArray(
            attendanceResponse
          );

        const studentsData =
          unwrapArray(
            studentsResponse
          );

        console.log(
          "ATTENDANCE DATA:",
          attendanceData
        );

        console.log(
          "STUDENTS DATA:",
          studentsData
        );

        /*
         * Gabungkan attendance dengan
         * data siswa berdasarkan ID.
         */
        const merged =
          mergeAttendanceWithStudents(
            attendanceData,
            studentsData
          );

        console.log(
          "MERGED ATTENDANCE:",
          merged
        );

        setRows(merged);
      } catch (err) {
        console.error(
          "Gagal mengambil data absensi admin:",
          err
        );

        setRows([]);

        setError(
          err?.message ||
            "Gagal mengambil data absensi dari server."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [date, today]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRows =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return rows.filter((row) => {
        const matchesSearch =
          !keyword ||
          row.name
            .toLowerCase()
            .includes(keyword) ||
          row.nisn
            .toLowerCase()
            .includes(keyword) ||
          row.school
            .toLowerCase()
            .includes(keyword) ||
          row.major
            .toLowerCase()
            .includes(keyword);

        const matchesMode =
          mode === "Semua" ||
          row.workMode === mode;

        return (
          matchesSearch &&
          matchesMode
        );
      });
    }, [rows, search, mode]);

  const stats =
    useMemo(() => {
      return {
        total: rows.length,

        hadir: rows.filter(
          (row) =>
            row.status === "Hadir"
        ).length,

        terlambat:
          rows.filter(
            (row) =>
              row.status ===
              "Terlambat"
          ).length,

        wfo: rows.filter(
          (row) =>
            row.workMode === "WFO"
        ).length,

        wfh: rows.filter(
          (row) =>
            row.workMode === "WFH"
        ).length,

        pulang: rows.filter(
          (row) =>
            row.checkOut &&
            row.checkOut !== "-"
        ).length,
      };
    }, [rows]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-blue">
              Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Absensi
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Pantau absensi siswa secara langsung dari sistem.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadData(true)
            }
            disabled={
              loading ||
              refreshing
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 11a8 8 0 0 0-15.5-2M4 5v4h4M4 13a8 8 0 0 0 15.5 2M20 19v-4h-4" />
            </svg>

            {refreshing
              ? "Memuat..."
              : "Refresh"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-800">
              Gagal memuat data
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadData(true)
              }
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total"
            value={stats.total}
            subtitle="Siswa yang absen"
            icon="📋"
          />

          <StatCard
            title="Hadir"
            value={stats.hadir}
            subtitle="Sudah absen masuk"
            icon="✓"
          />

          <StatCard
            title="Terlambat"
            value={stats.terlambat}
            subtitle="Masuk terlambat"
            icon="⏰"
          />

          <StatCard
            title="WFO"
            value={stats.wfo}
            subtitle="Dari kantor"
            icon="🏢"
          />

          <StatCard
            title="Sudah Pulang"
            value={stats.pulang}
            subtitle="Absen pulang"
            icon="→"
          />
        </div>

        {/* FILTER */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[180px_1fr_180px]">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Tanggal
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Cari siswa
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Nama, NISN, sekolah, atau jurusan..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Mode
              </label>

              <select
                value={mode}
                onChange={(event) =>
                  setMode(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
              >
                <option value="Semua">
                  Semua
                </option>

                <option value="WFO">
                  WFO
                </option>

                <option value="WFH">
                  WFH
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Daftar Absensi
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatDate(date)}
            </p>
          </div>

          {/* DESKTOP */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Siswa
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    NISN
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Masuk
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Pulang
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Mode
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-sm text-slate-400"
                    >
                      Memuat data absensi...
                    </td>
                  </tr>
                ) : filteredRows.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto max-w-md">
                        <div className="text-4xl">
                          📋
                        </div>

                        <p className="mt-3 font-semibold text-slate-700">
                          Tidak ada data absensi
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Belum ada siswa yang melakukan absensi pada tanggal ini.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map(
                    (row) => (
                      <tr
                        key={row.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-xs font-bold text-brand-blue">
                              {row.name &&
                              row.name !==
                                "-"
                                ? row.name
                                    .split(
                                      " "
                                    )
                                    .slice(
                                      0,
                                      2
                                    )
                                    .map(
                                      (
                                        part
                                      ) =>
                                        part[0]
                                    )
                                    .join(
                                      ""
                                    )
                                    .toUpperCase()
                                : "?"}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate font-semibold text-slate-800">
                                {row.name}
                              </p>

                              <p className="max-w-[240px] truncate text-xs text-slate-400">
                                {row.school}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {row.nisn}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                          {row.checkIn}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                          {row.checkOut}
                        </td>

                        <td className="px-5 py-4">
                          <ModeBadge
                            mode={
                              row.workMode
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              row.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelected(
                                row
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue-light"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="divide-y divide-slate-100 md:hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Memuat data absensi...
              </div>
            ) : filteredRows.length ===
              0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl">
                  📋
                </div>

                <p className="mt-3 font-semibold text-slate-700">
                  Tidak ada data absensi
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Belum ada data pada tanggal ini.
                </p>
              </div>
            ) : (
              filteredRows.map(
                (row) => (
                  <div
                    key={row.id}
                    className="p-4"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-xs font-bold text-brand-blue">
                        {row.name &&
                        row.name !==
                          "-"
                          ? row.name
                              .split(
                                " "
                              )
                              .slice(
                                0,
                                2
                              )
                              .map(
                                (
                                  part
                                ) =>
                                  part[0]
                              )
                              .join(
                                ""
                              )
                              .toUpperCase()
                          : "?"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {row.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              NISN:{" "}
                              {
                                row.nisn
                              }
                            </p>
                          </div>

                          <StatusBadge
                            status={
                              row.status
                            }
                          />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Masuk
                            </p>

                            <p className="mt-1 font-bold text-slate-700">
                              {
                                row.checkIn
                              }
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Pulang
                            </p>

                            <p className="mt-1 font-bold text-slate-700">
                              {
                                row.checkOut
                              }
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <ModeBadge
                            mode={
                              row.workMode
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setSelected(
                                row
                              )
                            }
                            className="text-sm font-semibold text-brand-blue"
                          >
                            Detail →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>

      <DetailModal
        row={selected}
        onClose={() =>
          setSelected(null)
        }
      />
    </div>
  );
}