import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Users,
  FileText,
  Stethoscope,
  Home,
  School,
  UserRound,
  Eye,
  X,
  Filter,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import {
  getAdminIzin,
  getAdminStudents,
} from "../../services/api";

/* =====================================================
   CONFIG
===================================================== */

const ITEMS_PER_PAGE = 8;

/* =====================================================
   BASIC HELPERS
===================================================== */

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function normalizeId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
}

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
}

/* =====================================================
   RESPONSE ARRAY
===================================================== */

function extractArray(value, depth = 0) {
  if (
    value === null ||
    value === undefined ||
    depth > 8
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (!isObject(value)) {
    return [];
  }

  const priorityKeys = [
    "pengajuan_izin",
    "pengajuanIzin",
    "izin",
    "izins",
    "permissions",
    "permission",
    "items",
    "rows",
    "records",
    "results",
    "students",
    "student",
    "users",
    "user",
    "attendance",
    "attendances",
    "data",
    "result",
    "response",
  ];

  for (const key of priorityKeys) {
    if (
      value[key] !== undefined &&
      value[key] !== null
    ) {
      const result = extractArray(
        value[key],
        depth + 1
      );

      if (result.length > 0) {
        return result;
      }
    }
  }

  return [];
}

/* =====================================================
   NESTED STUDENT
===================================================== */

function getStudentObject(item) {
  if (!isObject(item)) {
    return {};
  }

  return (
    item?.student ||
    item?.siswa ||
    item?.user ||
    item?.profile ||
    item?.user_data ||
    item?.userData ||
    item?.student_data ||
    item?.studentData ||
    {}
  );
}

/* =====================================================
   STUDENT IDS
===================================================== */

function getStudentId(item) {
  const student =
    getStudentObject(item);

  return firstValue(
    item?.student_id,
    item?.studentId,
    item?.siswa_id,
    item?.siswaId,

    student?.student_id,
    student?.studentId,
    student?.siswa_id,
    student?.siswaId,

    item?.id_student,
    item?.idStudent,

    student?.id_student,
    student?.idStudent,

    item?.id,
    item?.uuid,

    student?.id,
    student?.uuid
  );
}

function getUserId(item) {
  const student =
    getStudentObject(item);

  return firstValue(
    item?.user_id,
    item?.userId,
    item?.id_user,
    item?.idUser,

    student?.user_id,
    student?.userId,
    student?.id_user,
    student?.idUser
  );
}

/* =====================================================
   STUDENT NAME
===================================================== */

function getName(item) {
  const student =
    getStudentObject(item);

  return normalizeText(
    firstValue(
      item?.full_name,
      item?.fullName,
      item?.name,
      item?.nama,

      item?.student_name,
      item?.studentName,

      item?.nama_siswa,
      item?.namaSiswa,

      student?.full_name,
      student?.fullName,
      student?.name,
      student?.nama,

      student?.student_name,
      student?.studentName,

      student?.nama_siswa,
      student?.namaSiswa
    )
  );
}

/* =====================================================
   NISN
===================================================== */

function getNisn(item) {
  const student =
    getStudentObject(item);

  return normalizeText(
    firstValue(
      item?.nisn,
      item?.NISN,
      item?.nisn_number,
      item?.nisnNumber,

      item?.student_nisn,
      item?.studentNisn,

      item?.nomor_nisn,

      student?.nisn,
      student?.NISN,
      student?.nisn_number,
      student?.nisnNumber,

      student?.student_nisn,
      student?.studentNisn,

      student?.nomor_nisn
    )
  );
}

/* =====================================================
   CLASS
===================================================== */

function getClassName(item) {
  const student =
    getStudentObject(item);

  return normalizeText(
    firstValue(
      item?.class,
      item?.class_name,
      item?.className,
      item?.kelas,

      item?.kelas_name,
      item?.kelasName,

      item?.student_class,

      student?.class,
      student?.class_name,
      student?.className,
      student?.kelas,

      student?.kelas_name,
      student?.kelasName,

      student?.student_class
    )
  );
}

/* =====================================================
   SCHOOL
===================================================== */

function getSchool(item) {
  const student =
    getStudentObject(item);

  return normalizeText(
    firstValue(
      item?.school,
      item?.school_name,
      item?.schoolName,

      item?.sekolah,
      item?.nama_sekolah,

      student?.school,
      student?.school_name,
      student?.schoolName,

      student?.sekolah,
      student?.nama_sekolah
    )
  );
}

/* =====================================================
   MAJOR
===================================================== */

function getMajor(item) {
  const student =
    getStudentObject(item);

  return normalizeText(
    firstValue(
      item?.major,
      item?.major_name,
      item?.majorName,

      item?.jurusan,
      item?.jurusan_name,
      item?.jurusanName,

      student?.major,
      student?.major_name,
      student?.majorName,

      student?.jurusan,
      student?.jurusan_name,
      student?.jurusanName
    )
  );
}

/* =====================================================
   EMAIL
===================================================== */

function getEmail(item) {
  const student =
    getStudentObject(item);

  return normalizeText(
    firstValue(
      item?.email,
      item?.email_address,

      student?.email,
      student?.email_address
    )
  );
}

/* =====================================================
   BUILD STUDENT MAP
===================================================== */

function buildStudentMap(students) {
  const map = new Map();

  students.forEach((student) => {
    const studentId =
      getStudentId(student);

    const userId =
      getUserId(student);

    const rawId =
      student?.id;

    const uuid =
      student?.uuid;

    const nisn =
      getNisn(student);

    const email =
      getEmail(student);

    const ids = [
      studentId,
      userId,
      rawId,
      uuid,
    ];

    ids.forEach((id) => {
      const key =
        normalizeId(id);

      if (key) {
        map.set(
          `id:${key}`,
          student
        );
      }
    });

    if (nisn) {
      map.set(
        `nisn:${normalizeId(nisn)}`,
        student
      );
    }

    if (email) {
      map.set(
        `email:${normalizeId(email)}`,
        student
      );
    }
  });

  return map;
}

/* =====================================================
   FIND STUDENT
===================================================== */

function findStudentForIzin(
  izin,
  studentMap,
  students
) {
  const possibleIds = [
    izin?.user_id,
    izin?.userId,

    izin?.student_id,
    izin?.studentId,

    izin?.siswa_id,
    izin?.siswaId,

    izin?.id_user,
    izin?.idUser,

    izin?.student?.user_id,
    izin?.student?.id,

    izin?.siswa?.user_id,
    izin?.siswa?.id,

    izin?.user?.id,
    izin?.user?.user_id,
  ];

  for (const id of possibleIds) {
    const key =
      normalizeId(id);

    if (!key) {
      continue;
    }

    const student =
      studentMap.get(
        `id:${key}`
      );

    if (student) {
      return student;
    }
  }

  const nisn =
    getNisn(izin);

  if (nisn) {
    const student =
      studentMap.get(
        `nisn:${normalizeId(nisn)}`
      );

    if (student) {
      return student;
    }
  }

  const email =
    getEmail(izin);

  if (email) {
    const student =
      studentMap.get(
        `email:${normalizeId(email)}`
      );

    if (student) {
      return student;
    }
  }

  const izinName =
    getName(izin)
      .toLowerCase();

  if (izinName) {
    const student =
      students.find(
        (item) =>
          getName(item)
            .toLowerCase() ===
          izinName
      );

    if (student) {
      return student;
    }
  }

  return null;
}

/* =====================================================
   IZIN ID
===================================================== */

function getIzinId(item) {
  return firstValue(
    item?.id,
    item?.izin_id,
    item?.izinId,
    item?.permission_id,
    item?.permissionId,
    item?.uuid
  );
}

/* =====================================================
   IZIN DATE
===================================================== */

function getIzinStartDate(item) {
  return normalizeText(
    firstValue(
      item?.tanggal_mulai,
      item?.tanggalMulai,

      item?.start_date,
      item?.startDate,

      item?.tanggal_izin,
      item?.tanggalIzin,

      item?.date,

      item?.izin_date,
      item?.izinDate
    )
  );
}

function getIzinEndDate(item) {
  return normalizeText(
    firstValue(
      item?.tanggal_selesai,
      item?.tanggalSelesai,

      item?.end_date,
      item?.endDate,

      item?.tanggal_izin_selesai,
      item?.tanggalIzinSelesai,

      getIzinStartDate(item)
    )
  );
}

/* =====================================================
   IZIN TYPE
===================================================== */

function getIzinType(item) {
  return normalizeText(
    firstValue(
      item?.jenis,
      item?.jenis_izin,
      item?.jenisIzin,

      item?.type,
      item?.izin_type,
      item?.izinType,

      item?.category,

      "Lainnya"
    )
  );
}

/* =====================================================
   REASON
===================================================== */

function getIzinReason(item) {
  return normalizeText(
    firstValue(
      item?.alasan,
      item?.reason,
      item?.description,
      item?.keterangan,
      item?.catatan,
      item?.message,

      "-"
    )
  );
}

/* =====================================================
   STATUS
===================================================== */

function getStatus() {
  return "Tercatat";
}

/* =====================================================
   CREATED AT
===================================================== */

function getCreatedAt(item) {
  return firstValue(
    item?.created_at,
    item?.createdAt,

    item?.submitted_at,
    item?.submittedAt,

    item?.uploaded_at,
    item?.uploadedAt,

    item?.updated_at,
    item?.updatedAt,

    getIzinStartDate(item)
  );
}

/* =====================================================
   ATTACHMENT
===================================================== */

function getAttachment(item) {
  return firstValue(
    item?.attachment_path,
    item?.attachmentPath,

    item?.attachment_url,
    item?.attachmentUrl,

    item?.attachment,
    item?.file_path,
    item?.filePath,

    item?.file_url,
    item?.fileUrl,

    item?.bukti,
    item?.bukti_url,
    item?.buktiUrl
  );
}

/* =====================================================
   NORMALIZE TYPE
===================================================== */

function normalizeType(type) {
  const value =
    normalizeText(type)
      .toLowerCase();

  if (
    value.includes("sakit")
  ) {
    return "Sakit";
  }

  if (
    value.includes("keluarga")
  ) {
    return "Keperluan Keluarga";
  }

  if (
    value.includes("pribadi")
  ) {
    return "Keperluan Pribadi";
  }

  if (
    value.includes("sekolah")
  ) {
    return "Keperluan Sekolah";
  }

  return type || "Lainnya";
}

/* =====================================================
   TYPE ICON
===================================================== */

function getTypeIcon(type) {
  const normalized =
    normalizeType(type);

  if (
    normalized === "Sakit"
  ) {
    return Stethoscope;
  }

  if (
    normalized ===
    "Keperluan Keluarga"
  ) {
    return Home;
  }

  if (
    normalized ===
    "Keperluan Sekolah"
  ) {
    return School;
  }

  if (
    normalized ===
    "Keperluan Pribadi"
  ) {
    return UserRound;
  }

  return FileText;
}

/* =====================================================
   TYPE CLASS
===================================================== */

function getTypeClass(type) {
  const normalized =
    normalizeType(type);

  if (
    normalized === "Sakit"
  ) {
    return "bg-red-50 text-red-600 border-red-100";
  }

  if (
    normalized ===
    "Keperluan Keluarga"
  ) {
    return "bg-orange-50 text-orange-600 border-orange-100";
  }

  if (
    normalized ===
    "Keperluan Sekolah"
  ) {
    return "bg-blue-50 text-blue-600 border-blue-100";
  }

  if (
    normalized ===
    "Keperluan Pribadi"
  ) {
    return "bg-purple-50 text-purple-600 border-purple-100";
  }

  return "bg-gray-100 text-gray-600 border-gray-200";
}

/* =====================================================
   NORMALIZE IZIN
===================================================== */

function normalizeIzin(
  item,
  student
) {
  const studentData =
    student ||
    getStudentObject(item);

  const name =
    getName(item) ||
    getName(studentData) ||
    "Nama tidak tersedia";

  const nisn =
    getNisn(item) ||
    getNisn(studentData) ||
    "-";

  const className =
    getClassName(item) ||
    getClassName(studentData) ||
    "-";

  const school =
    getSchool(item) ||
    getSchool(studentData) ||
    "-";

  const major =
    getMajor(item) ||
    getMajor(studentData) ||
    "-";

  const email =
    getEmail(item) ||
    getEmail(studentData) ||
    "-";

  return {
    id:
      getIzinId(item) ||
      `${getUserId(item) || "user"}-${getIzinStartDate(item)}-${Math.random()}`,

    name,
    nisn,
    className,
    school,
    major,
    email,

    startDate:
      getIzinStartDate(item),

    endDate:
      getIzinEndDate(item),

    date:
      getIzinStartDate(item),

    type:
      normalizeType(
        getIzinType(item)
      ),

    reason:
      getIzinReason(item),

    status:
      getStatus(),

    createdAt:
      getCreatedAt(item),

    attachment:
      getAttachment(item),

    studentId:
      getStudentId(item) ||
      getStudentId(studentData),

    userId:
      getUserId(item) ||
      getUserId(studentData),

    raw: item,

    student: studentData,
  };
}

/* =====================================================
   DATE FORMAT
===================================================== */

function parseDateOnly(
  dateString
) {
  if (!dateString) {
    return null;
  }

  const clean =
    String(dateString)
      .slice(0, 10);

  const date =
    new Date(
      `${clean}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function formatDate(
  dateString
) {
  const date =
    parseDateOnly(
      dateString
    );

  if (!date) {
    return "-";
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatDateShort(
  dateString
) {
  const date =
    parseDateOnly(
      dateString
    );

  if (!date) {
    return "-";
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =====================================================
   TIME FORMAT
===================================================== */

function formatTime(
  dateString
) {
  if (!dateString) {
    return "-";
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/* =====================================================
   MONTH FORMAT
===================================================== */

function formatMonth(
  monthString
) {
  if (!monthString) {
    return "Semua Bulan";
  }

  const date =
    new Date(
      `${monthString}-01T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return monthString;
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      month: "long",
      year: "numeric",
    }
  );
}

/* =====================================================
   MAIN
===================================================== */

export default function Izin() {
  const [izin, setIzin] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [monthFilter, setMonthFilter] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("Semua Jenis");

  const [selectedIzin, setSelectedIzin] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  /* ===================================================
     LOAD DATA
  =================================================== */

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const [
          izinResponse,
          studentsResponse,
        ] = await Promise.all([
          getAdminIzin(),
          getAdminStudents(),
        ]);

        console.log(
          "ADMIN IZIN RESPONSE:",
          izinResponse
        );

        console.log(
          "ADMIN STUDENTS RESPONSE:",
          studentsResponse
        );

        const izinData =
          extractArray(
            izinResponse
          );

        const studentData =
          extractArray(
            studentsResponse
          );

        console.log(
          "ADMIN IZIN ARRAY:",
          izinData
        );

        console.log(
          "ADMIN STUDENTS ARRAY:",
          studentData
        );

        setStudents(
          studentData
        );

        const studentMap =
          buildStudentMap(
            studentData
          );

        const normalizedData =
          izinData.map(
            (item) => {
              const student =
                findStudentForIzin(
                  item,
                  studentMap,
                  studentData
                );

              return normalizeIzin(
                item,
                student
              );
            }
          );

        normalizedData.sort(
          (a, b) => {
            const timeA =
              new Date(
                a.createdAt ||
                  a.startDate ||
                  0
              ).getTime();

            const timeB =
              new Date(
                b.createdAt ||
                  b.startDate ||
                  0
              ).getTime();

            return (
              timeB - timeA
            );
          }
        );

        setIzin(
          normalizedData
        );

        if (
          normalizedData.length >
          0
        ) {
          const latestMonth =
            normalizedData
              .map((item) =>
                item.startDate
                  ? item.startDate.slice(
                      0,
                      7
                    )
                  : ""
              )
              .filter(Boolean)
              .sort()
              .reverse()[0];

          setMonthFilter(
            latestMonth || ""
          );
        } else {
          setMonthFilter("");
        }

        setCurrentPage(1);
      } catch (err) {
        console.error(
          "GET ADMIN IZIN ERROR:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Gagal mengambil data izin dari server."
        );

        setIzin([]);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ===================================================
     MONTHS
  =================================================== */

  const availableMonths =
    useMemo(() => {
      return [
        ...new Set(
          izin
            .map((item) =>
              item.startDate
                ? item.startDate.slice(
                    0,
                    7
                  )
                : ""
            )
            .filter(Boolean)
        ),
      ]
        .sort()
        .reverse();
    }, [izin]);

  /* ===================================================
     FILTER
  =================================================== */

  const filteredIzin =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return izin.filter(
        (item) => {
          const name =
            item.name
              ?.toLowerCase() ||
            "";

          const nisn =
            item.nisn
              ?.toLowerCase() ||
            "";

          const className =
            item.className
              ?.toLowerCase() ||
            "";

          const school =
            item.school
              ?.toLowerCase() ||
            "";

          const reason =
            item.reason
              ?.toLowerCase() ||
            "";

          const type =
            item.type
              ?.toLowerCase() ||
            "";

          const matchesSearch =
            !keyword ||
            name.includes(
              keyword
            ) ||
            nisn.includes(
              keyword
            ) ||
            className.includes(
              keyword
            ) ||
            school.includes(
              keyword
            ) ||
            reason.includes(
              keyword
            ) ||
            type.includes(
              keyword
            );

          const matchesMonth =
            !monthFilter ||
            item.startDate?.startsWith(
              monthFilter
            );

          const matchesType =
            typeFilter ===
              "Semua Jenis" ||
            normalizeType(
              item.type
            ) ===
              typeFilter;

          return (
            matchesSearch &&
            matchesMonth &&
            matchesType
          );
        }
      );
    }, [
      izin,
      search,
      monthFilter,
      typeFilter,
    ]);

  /* ===================================================
     PAGINATION
  =================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredIzin.length /
          ITEMS_PER_PAGE
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedIzin =
    filteredIzin.slice(
      (safeCurrentPage - 1) *
        ITEMS_PER_PAGE,
      safeCurrentPage *
        ITEMS_PER_PAGE
    );

  /* ===================================================
     STATISTICS
  =================================================== */

  const uniqueStudents =
    new Set(
      filteredIzin
        .map(
          (item) =>
            item.userId ||
            item.studentId ||
            item.nisn ||
            item.name
        )
        .filter(Boolean)
    ).size;

  const sickCount =
    filteredIzin.filter(
      (item) =>
        normalizeType(
          item.type
        ) === "Sakit"
    ).length;

  const familyCount =
    filteredIzin.filter(
      (item) =>
        normalizeType(
          item.type
        ) ===
        "Keperluan Keluarga"
    ).length;

  const schoolCount =
    filteredIzin.filter(
      (item) =>
        normalizeType(
          item.type
        ) ===
        "Keperluan Sekolah"
    ).length;

  /* ===================================================
     HANDLERS
  =================================================== */

  const handleSearchChange =
    (value) => {
      setSearch(value);
      setCurrentPage(1);
    };

  const handleMonthChange =
    (value) => {
      setMonthFilter(value);
      setCurrentPage(1);
    };

  const handleTypeChange =
    (value) => {
      setTypeFilter(value);
      setCurrentPage(1);
    };

  const resetFilters = () => {
    setSearch("");

    setMonthFilter(
      availableMonths[0] ||
        ""
    );

    setTypeFilter(
      "Semua Jenis"
    );

    setCurrentPage(1);
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-[#f6f8fc]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="relative overflow-hidden rounded-[28px] bg-white border border-slate-200/80 shadow-sm mb-6">

          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="absolute right-20 bottom-0 w-40 h-40 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">

                  Data Izin

                </h1>

                <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">

                  Kelola dan pantau data izin siswa
                  yang tercatat di dalam sistem.

                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200">

                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center">

                    <CalendarDays
                      size={17}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Periode
                    </p>

                    <p className="text-sm font-bold text-slate-700">
                      {monthFilter
                        ? formatMonth(
                            monthFilter
                          )
                        : "Semua Bulan"}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
                  title="Refresh data"
                >

                  <RefreshCw
                    size={18}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* ============================================
            ERROR
        ============================================ */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">

                <AlertCircle
                  size={18}
                  className="text-red-500"
                />

              </div>

              <div className="flex-1">

                <p className="text-sm font-bold text-red-700">
                  Gagal mengambil data izin
                </p>

                <p className="text-sm text-red-600 mt-1">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={loadData}
                className="px-3 py-2 rounded-xl bg-white border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition"
              >
                Coba Lagi
              </button>

            </div>

          </div>
        )}

        {/* ============================================
            STATS
        ============================================ */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          <StatCard
            label="Total Izin"
            value={
              loading
                ? "..."
                : filteredIzin.length
            }
            description="Data sesuai filter"
            valueClass="text-slate-900"
            accent="blue"
          />

          <StatCard
            label="Siswa Berizin"
            value={
              loading
                ? "..."
                : uniqueStudents
            }
            description="Siswa yang tercatat"
            valueClass="text-indigo-600"
            accent="indigo"
          />

          <StatCard
            label="Izin Sakit"
            value={
              loading
                ? "..."
                : sickCount
            }
            description="Tidak masuk karena sakit"
            valueClass="text-red-600"
            accent="red"
          />

          <StatCard
            label="Keperluan"
            value={
              loading
                ? "..."
                : familyCount +
                  schoolCount
            }
            description="Keluarga & sekolah"
            valueClass="text-orange-600"
            accent="orange"
          />

        </div>

        {/* ============================================
            MAIN CONTENT
        ============================================ */}

        <div className="bg-white rounded-[26px] border border-slate-200/80 shadow-sm overflow-hidden">

          {/* FILTER HEADER */}

          <div className="p-5 sm:p-6 lg:p-7 border-b border-slate-100">

            <div className="flex flex-col xl:flex-row gap-4">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    handleSearchChange(
                      event.target.value
                    )
                  }
                  placeholder="Cari nama, NISN, kelas, sekolah..."
                  className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />

              </div>

              {/* SELECTS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <FilterSelect
                  icon={CalendarDays}
                  value={monthFilter}
                  onChange={
                    handleMonthChange
                  }
                  width="sm:w-[190px]"
                >

                  <option value="">
                    Semua Bulan
                  </option>

                  {availableMonths.map(
                    (month) => (
                      <option
                        key={month}
                        value={month}
                      >
                        {formatMonth(
                          month
                        )}
                      </option>
                    )
                  )}

                </FilterSelect>

                <FilterSelect
                  icon={Filter}
                  value={typeFilter}
                  onChange={
                    handleTypeChange
                  }
                  width="sm:w-[220px]"
                >

                  <option value="Semua Jenis">
                    Semua Jenis
                  </option>

                  <option value="Sakit">
                    Sakit
                  </option>

                  <option value="Keperluan Keluarga">
                    Keperluan Keluarga
                  </option>

                  <option value="Keperluan Pribadi">
                    Keperluan Pribadi
                  </option>

                  <option value="Keperluan Sekolah">
                    Keperluan Sekolah
                  </option>

                  <option value="Lainnya">
                    Lainnya
                  </option>

                </FilterSelect>

              </div>

            </div>

            {/* FILTER INFO */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">

              <div className="flex flex-wrap items-center gap-2">

                <span className="text-sm text-slate-500">

                  Menampilkan{" "}

                  <span className="font-black text-slate-800">

                    {loading
                      ? "..."
                      : filteredIzin.length}

                  </span>{" "}

                  data izin

                </span>

                <span className="hidden sm:block text-slate-300">
                  •
                </span>

                <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold">
                  Sakit {sickCount}
                </span>

                <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold">
                  Keperluan{" "}
                  {familyCount +
                    schoolCount}
                </span>

              </div>

              {(search ||
                monthFilter ||
                typeFilter !==
                  "Semua Jenis") && (
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
                >



                </button>
              )}

            </div>

          </div>

          {/* ==========================================
              CONTENT
          ========================================== */}

          {loading ? (
            <LoadingState />
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden lg:block overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="bg-slate-50/80 border-b border-slate-100">

                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">
                        Siswa
                      </th>

                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">
                        Tanggal
                      </th>

                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">
                        Jenis
                      </th>

                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">
                        Alasan
                      </th>

                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">
                        Waktu
                      </th>

                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">
                        Status
                      </th>

                      <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {paginatedIzin.length >
                    0 ? (
                      paginatedIzin.map(
                        (item) => (
                          <IzinRow
                            key={
                              item.id
                            }
                            item={
                              item
                            }
                            onView={() =>
                              setSelectedIzin(
                                item
                              )
                            }
                          />
                        )
                      )
                    ) : (
                      <EmptyTableRow />
                    )}

                  </tbody>

                </table>

              </div>

              {/* MOBILE */}

              <div className="lg:hidden divide-y divide-slate-100">

                {paginatedIzin.length >
                0 ? (
                  paginatedIzin.map(
                    (item) => (
                      <IzinMobileCard
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                        onView={() =>
                          setSelectedIzin(
                            item
                          )
                        }
                      />
                    )
                  )
                ) : (
                  <EmptyMobileState />
                )}

              </div>

              {/* PAGINATION */}

              {filteredIzin.length >
                0 && (
                <Pagination
                  currentPage={
                    safeCurrentPage
                  }
                  totalPages={
                    totalPages
                  }
                  setCurrentPage={
                    setCurrentPage
                  }
                />
              )}

            </>
          )}

        </div>

        {/* ==========================================
            INFORMATION
        ========================================== */}

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">

          <div className="flex items-start gap-3">

            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">

              <CheckCircle2
                size={17}
                className="text-blue-600"
              />

            </div>

            <div>

              <p className="text-sm font-bold text-blue-800">
                Informasi Data
              </p>

              <p className="text-sm text-blue-700/80 leading-relaxed mt-1">
                Data izin diambil langsung
                dari backend dan dicocokkan
                dengan data siswa berdasarkan
                user ID, student ID, NISN,
                email, atau nama.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ============================================
          MODAL
      ============================================ */}

      {selectedIzin && (
        <IzinDetailModal
          item={
            selectedIzin
          }
          onClose={() =>
            setSelectedIzin(
              null
            )
          }
        />
      )}

    </div>
  );
}

/* =====================================================
   STAT CARD
   TANPA ICON
===================================================== */

function StatCard({
  label,
  value,
  description,
  valueClass,
  accent,
}) {
  const accentClass = {
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="group relative bg-white rounded-[22px] border border-slate-200/80 shadow-sm p-5 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">

      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          accentClass[accent] ||
          "bg-blue-500"
        }`}
      />

      <div className="pl-1">

        <p className="text-xs sm:text-sm font-bold text-slate-500">
          {label}
        </p>

        <p
          className={`text-3xl font-black tracking-tight mt-2 ${valueClass}`}
        >
          {value}
        </p>

        <p className="text-xs text-slate-400 mt-2">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   FILTER SELECT
===================================================== */

function FilterSelect({
  icon: Icon,
  value,
  onChange,
  width,
  children,
}) {
  return (
    <div className="relative">

      <Icon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
      />

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={`w-full ${width} h-12 appearance-none pl-10 pr-9 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition`}
      >
        {children}
      </select>

      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">
        ▾
      </span>

    </div>
  );
}

/* =====================================================
   AVATAR
===================================================== */

function Avatar({
  name,
}) {
  const safeName =
    name || "Siswa";

  const initials =
    safeName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (item) =>
          item.charAt(0)
      )
      .join("")
      .toUpperCase() ||
    "S";

  return (
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
      {initials}
    </div>
  );
}

/* =====================================================
   STATUS
===================================================== */

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black whitespace-nowrap">
      <CheckCircle2 size={12} />
      Tercatat
    </span>
  );
}

/* =====================================================
   DESKTOP ROW
===================================================== */

function IzinRow({
  item,
  onView,
}) {
  const Icon =
    getTypeIcon(item.type);

  return (
    <tr className="group hover:bg-slate-50/80 transition-colors">

      {/* SISWA */}

      <td className="px-6 py-4">

        <div className="flex items-center gap-3">

          <Avatar
            name={
              item.name
            }
          />

          <div className="min-w-0">

            <p className="font-bold text-sm text-slate-900 truncate max-w-[180px]">
              {item.name}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              NISN {item.nisn}
            </p>

            <p className="text-xs text-slate-400 mt-0.5">
              {item.className}
            </p>

          </div>

        </div>

      </td>

      {/* TANGGAL */}

      <td className="px-6 py-4">

        <p className="text-sm font-bold text-slate-700">
          {formatDateShort(
            item.startDate
          )}
        </p>

        {item.endDate &&
          item.endDate !==
            item.startDate && (
            <p className="text-xs text-slate-400 mt-1">
              s/d{" "}
              {formatDateShort(
                item.endDate
              )}
            </p>
          )}

      </td>

      {/* TYPE */}

      <td className="px-6 py-4">

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-black whitespace-nowrap ${getTypeClass(
            item.type
          )}`}
        >

          <Icon size={12} />

          {normalizeType(
            item.type
          )}

        </span>

      </td>

      {/* REASON */}

      <td className="px-6 py-4">

        <p className="text-sm text-slate-600 max-w-[220px] truncate">
          {item.reason}
        </p>

      </td>

      {/* TIME */}

      <td className="px-6 py-4">

        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">

          <Clock3
            size={14}
            className="text-slate-400"
          />

          {formatTime(
            item.createdAt
          )}

        </div>

      </td>

      {/* STATUS */}

      <td className="px-6 py-4">

        <StatusBadge />

      </td>

      {/* ACTION */}

      <td className="px-6 py-4">

        <div className="flex justify-end">

          <button
            type="button"
            onClick={onView}
            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white flex items-center justify-center transition-all duration-200"
            title="Lihat detail"
          >

            <Eye size={16} />

          </button>

        </div>

      </td>

    </tr>
  );
}

/* =====================================================
   MOBILE CARD
===================================================== */

function IzinMobileCard({
  item,
  onView,
}) {
  const Icon =
    getTypeIcon(item.type);

  return (
    <div className="p-5">

      <div className="flex items-start gap-3">

        <Avatar
          name={
            item.name
          }
        />

        <div className="flex-1 min-w-0">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="font-black text-sm text-slate-900 truncate">
                {item.name}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                NISN {item.nisn}
              </p>

            </div>

            <StatusBadge />

          </div>

          <div className="mt-3">

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-black ${getTypeClass(
                item.type
              )}`}
            >

              <Icon size={12} />

              {normalizeType(
                item.type
              )}

            </span>

          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">

            <MobileInfo
              label="Mulai"
              value={formatDateShort(
                item.startDate
              )}
            />

            <MobileInfo
              label="Selesai"
              value={formatDateShort(
                item.endDate
              )}
            />

          </div>

          <MobileInfo
            label="Kelas"
            value={
              item.className
            }
          />

          <MobileInfo
            label="Sekolah"
            value={
              item.school
            }
          />

          <div className="mt-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">

            <p className="text-[10px] uppercase font-black tracking-wide text-slate-400">
              Alasan
            </p>

            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {item.reason}
            </p>

          </div>

          <button
            type="button"
            onClick={onView}
            className="w-full mt-3 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black inline-flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
          >

            <Eye size={15} />

            Lihat Detail

          </button>

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   MOBILE INFO
===================================================== */

function MobileInfo({
  label,
  value,
}) {
  return (
    <div className="mt-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">

      <p className="text-[10px] uppercase font-black tracking-wide text-slate-400">
        {label}
      </p>

      <p className="text-xs font-bold text-slate-700 mt-1">
        {value || "-"}
      </p>

    </div>
  );
}

/* =====================================================
   PAGINATION
===================================================== */

function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  return (
    <div className="px-5 sm:px-6 lg:px-7 py-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

      <p className="text-xs sm:text-sm text-slate-500">

        Halaman{" "}

        <span className="font-black text-slate-800">
          {currentPage}
        </span>{" "}

        dari{" "}

        <span className="font-black text-slate-800">
          {totalPages}
        </span>

      </p>

      <div className="flex items-center gap-2">

        <button
          type="button"
          disabled={
            currentPage === 1
          }
          onClick={() =>
            setCurrentPage(
              (page) =>
                Math.max(
                  1,
                  page - 1
                )
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >

          <ChevronLeft
            size={16}
          />

          <span className="hidden sm:inline">
            Sebelumnya
          </span>

        </button>

        <div className="hidden sm:flex items-center gap-1">

          {Array.from(
            {
              length:
                totalPages,
            },
            (_, index) =>
              index + 1
          ).map(
            (page) => (
              <button
                key={
                  page
                }
                type="button"
                onClick={() =>
                  setCurrentPage(
                    page
                  )
                }
                className={`w-9 h-9 rounded-xl text-xs font-black transition ${
                  currentPage ===
                  page
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            )
          )}

        </div>

        <button
          type="button"
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            setCurrentPage(
              (page) =>
                Math.min(
                  totalPages,
                  page + 1
                )
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >

          <span className="hidden sm:inline">
            Berikutnya
          </span>

          <ChevronRight
            size={16}
          />

        </button>

      </div>

    </div>
  );
}

/* =====================================================
   EMPTY TABLE
===================================================== */

function EmptyTableRow() {
  return (
    <tr>

      <td
        colSpan="7"
        className="py-20 px-6 text-center"
      >

        <div className="w-16 h-16 rounded-[20px] bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">

          <FileText
            size={27}
          />

        </div>

        <h3 className="font-black text-slate-800 mt-5">
          Data izin tidak ditemukan
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          Belum ada data yang sesuai
          dengan filter.
        </p>

      </td>

    </tr>
  );
}

/* =====================================================
   EMPTY MOBILE
===================================================== */

function EmptyMobileState() {
  return (
    <div className="py-20 px-6 text-center">

      <div className="w-16 h-16 rounded-[20px] bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">

        <FileText
          size={27}
        />

      </div>

      <h3 className="font-black text-slate-800 mt-5">
        Data izin tidak ditemukan
      </h3>

      <p className="text-sm text-slate-400 mt-1">
        Belum ada data yang sesuai
        dengan filter.
      </p>

    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
  return (
    <div className="p-6 sm:p-8">

      <div className="space-y-5">

        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse flex items-center gap-4"
          >

            <div className="w-11 h-11 rounded-2xl bg-slate-200" />

            <div className="flex-1 space-y-2">

              <div className="h-4 bg-slate-200 rounded-lg w-1/3" />

              <div className="h-3 bg-slate-100 rounded-lg w-1/4" />

            </div>

            <div className="hidden sm:block h-9 bg-slate-100 rounded-xl w-24" />

          </div>
        ))}

      </div>

    </div>
  );
}

/* =====================================================
   DETAIL MODAL
===================================================== */

function IzinDetailModal({
  item,
  onClose,
}) {
  const Icon =
    getTypeIcon(item.type);

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onMouseDown={
        onClose
      }
    >

      <div
        className="w-full max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden my-6 border border-white/20"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* MODAL HEADER */}

        <div className="relative overflow-hidden bg-slate-900 px-6 sm:px-7 py-6 text-white">

          <div className="absolute -right-10 -top-16 w-48 h-48 rounded-full bg-blue-500/30 blur-3xl" />

          <div className="absolute right-24 bottom-0 w-32 h-32 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">

                <FileText
                  size={21}
                />

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-white/50">
                  Informasi
                </p>

                <h2 className="font-black text-xl mt-1">
                  Detail Izin
                </h2>

                <p className="text-white/50 text-xs mt-1">
                  Data izin siswa
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >

              <X size={18} />

            </button>

          </div>

        </div>

        {/* MODAL CONTENT */}

        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto">

          {/* STUDENT */}

          <div className="flex items-center gap-4 mb-6">

            <Avatar
              name={
                item.name
              }
            />

            <div className="min-w-0 flex-1">

              <p className="font-black text-lg text-slate-900">
                {item.name}
              </p>

              <p className="text-sm text-slate-400 mt-1">
                NISN {item.nisn}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {item.className}
              </p>

            </div>

            <StatusBadge />

          </div>

          {/* TYPE */}

          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border ${getTypeClass(
              item.type
            )}`}
          >

            <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center">

              <Icon size={19} />

            </div>

            <div>

              <p className="text-[10px] font-black uppercase tracking-wider opacity-60">
                Jenis Izin
              </p>

              <p className="text-sm font-black mt-1">
                {normalizeType(
                  item.type
                )}
              </p>

            </div>

          </div>

          {/* DATE */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <DetailBox
              icon={
                CalendarDays
              }
              label="Tanggal Mulai"
              value={formatDate(
                item.startDate
              )}
            />

            <DetailBox
              icon={
                CalendarDays
              }
              label="Tanggal Selesai"
              value={formatDate(
                item.endDate
              )}
            />

          </div>

          {/* NISN */}

          <DetailBox
            icon={Users}
            label="NISN"
            value={
              item.nisn
            }
          />

          {/* CLASS */}

          <DetailBox
            icon={School}
            label="Kelas"
            value={
              item.className
            }
          />

          {/* SCHOOL */}

          <DetailBox
            icon={School}
            label="Sekolah"
            value={
              item.school
            }
          />

          {/* MAJOR */}

          {item.major &&
            item.major !==
              "-" && (
              <DetailBox
                icon={
                  School
                }
                label="Jurusan"
                value={
                  item.major
                }
              />
            )}

          {/* REASON */}

          <div className="mt-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">

            <div className="flex items-center gap-2 text-blue-600">

              <ClipboardList
                size={16}
              />

              <span className="text-[10px] font-black uppercase tracking-wider">
                Alasan Izin
              </span>

            </div>

            <p className="text-sm text-slate-700 leading-relaxed mt-2">
              {item.reason}
            </p>

          </div>

          {/* CREATED */}

          <DetailBox
            icon={
              Clock3
            }
            label="Waktu Pengajuan"
            value={
              item.createdAt
                ? `${formatDate(
                    item.createdAt
                  )} ${formatTime(
                    item.createdAt
                  )}`
                : "-"
            }
          />

          {/* ATTACHMENT */}

          {item.attachment && (
            <div className="mt-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">

              <div className="flex items-center gap-2 text-blue-600">

                <FileText
                  size={16}
                />

                <span className="text-[10px] font-black uppercase tracking-wider">
                  Lampiran
                </span>

              </div>

              <p className="text-xs text-slate-600 mt-2 break-all leading-relaxed">
                {item.attachment}
              </p>

            </div>
          )}

          {/* CLOSE */}

          <button
            type="button"
            onClick={
              onClose
            }
            className="w-full mt-6 py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-blue-600 transition-all duration-200"
          >
            Tutup
          </button>

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   DETAIL BOX
===================================================== */

function DetailBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="mt-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">

      <div className="flex items-center gap-2 text-blue-600">

        <Icon size={15} />

        <span className="text-[10px] font-black uppercase tracking-wider">
          {label}
        </span>

      </div>

      <p className="text-sm font-bold text-slate-800 mt-2">
        {value || "-"}
      </p>

    </div>
  );
}