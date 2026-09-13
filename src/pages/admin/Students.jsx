import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  Plus,
  Search,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  X,
  Mail,
  School,
  BookOpen,
  Hash,
  Phone,
  UserRound,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import {
  getAdminStudents,
  createAdminStudent,
} from "../../services/api";

/* =========================================================
   RESPONSE PARSER
========================================================= */

function getResponseData(response) {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  const priorityKeys = [
    "students",
    "student",
    "users",
    "data",
    "items",
    "records",
    "results",
    "rows",
    "list",
    "payload",
  ];

  function looksLikeStudent(value) {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      return false;
    }

    const keys = Object.keys(value).map((key) =>
      key.toLowerCase()
    );

    return [
      "name",
      "full_name",
      "fullname",
      "nama",
      "email",
      "nisn",
      "student_id",
      "school",
      "sekolah",
      "major",
      "jurusan",
      "class",
      "class_name",
      "kelas",
    ].some((key) => keys.includes(key));
  }

  function objectMapToArray(value) {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      return [];
    }

    const values = Object.values(value);

    if (
      values.length > 0 &&
      values.every(
        (item) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item)
      )
    ) {
      const studentValues =
        values.filter(looksLikeStudent);

      if (studentValues.length > 0) {
        return studentValues;
      }
    }

    return [];
  }

  function findArrayDeep(
    value,
    depth = 0,
    seen = new Set()
  ) {
    if (value == null || depth > 12) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value !== "object") {
      return [];
    }

    if (seen.has(value)) {
      return [];
    }

    seen.add(value);

    for (const key of priorityKeys) {
      const child = value?.[key];

      if (Array.isArray(child)) {
        return child;
      }

      if (
        child &&
        typeof child === "object"
      ) {
        const nestedArray = findArrayDeep(
          child,
          depth + 1,
          seen
        );

        if (nestedArray.length > 0) {
          return nestedArray;
        }

        const mapped =
          objectMapToArray(child);

        if (mapped.length > 0) {
          return mapped;
        }
      }
    }

    if (looksLikeStudent(value)) {
      return [value];
    }

    const mapped = objectMapToArray(value);

    if (mapped.length > 0) {
      return mapped;
    }

    for (const child of Object.values(value)) {
      if (
        child &&
        typeof child === "object"
      ) {
        const result = findArrayDeep(
          child,
          depth + 1,
          seen
        );

        if (result.length > 0) {
          return result;
        }
      }
    }

    return [];
  }

  return findArrayDeep(response);
}

/* =========================================================
   VALUE HELPERS
========================================================= */

function getScalarValue(
  value,
  depth = 0,
  seen = new Set()
) {
  if (value === undefined || value === null) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const text = String(value).trim();

    return text === "" ? null : value;
  }

  if (
    typeof value !== "object" ||
    depth > 5
  ) {
    return null;
  }

  if (seen.has(value)) {
    return null;
  }

  seen.add(value);

  const preferredKeys = [
    "value",
    "label",
    "name",
    "number",
    "phone",
    "phone_number",
    "phoneNumber",
    "no_hp",
    "noHp",
    "nomor_hp",
    "nomorHp",
    "nomor_telepon",
    "nomorTelepon",
    "jenis_kelamin",
    "jenisKelamin",
    "gender",
    "text",
    "display_name",
    "displayName",
  ];

  for (const key of preferredKeys) {
    if (
      Object.prototype.hasOwnProperty.call(
        value,
        key
      )
    ) {
      const resolved = getScalarValue(
        value[key],
        depth + 1,
        seen
      );

      if (resolved !== null) {
        return resolved;
      }
    }
  }

  return null;
}

function firstValue(...values) {
  for (const value of values) {
    const resolved = getScalarValue(value);

    if (resolved !== null) {
      return resolved;
    }
  }

  return null;
}

/* =========================================================
   NORMALIZE STUDENT
========================================================= */

function normalizeStudent(student, index) {
  const raw = student || {};

  const user =
    raw.user ||
    raw.user_data ||
    raw.userData ||
    {};

  const profile =
    raw.profile ||
    user.profile ||
    {};

  const studentData =
    raw.student ||
    raw.student_data ||
    raw.studentData ||
    {};

  const sekolah =
    raw.school_data ||
    raw.schoolData ||
    user.school_data ||
    user.schoolData ||
    studentData.school_data ||
    studentData.schoolData ||
    {};

  const jurusan =
    raw.major_data ||
    raw.majorData ||
    user.major_data ||
    user.majorData ||
    studentData.major_data ||
    studentData.majorData ||
    {};

  const id = firstValue(
    raw.id,
    raw.student_id,
    raw.studentId,
    raw.user_id,
    raw.userId,
    raw.uuid,

    user.id,
    user.user_id,
    user.userId,

    studentData.id,
    studentData.student_id,
    studentData.studentId
  );

  const name = firstValue(
    raw.full_name,
    raw.fullName,
    raw.nama_lengkap,
    raw.namaLengkap,
    raw.nama,
    raw.name,
    raw.student_name,
    raw.studentName,

    user.full_name,
    user.fullName,
    user.nama_lengkap,
    user.namaLengkap,
    user.nama,
    user.name,

    profile.full_name,
    profile.fullName,
    profile.nama_lengkap,
    profile.namaLengkap,
    profile.nama,
    profile.name,

    studentData.full_name,
    studentData.fullName,
    studentData.nama_lengkap,
    studentData.namaLengkap,
    studentData.nama,
    studentData.name
  );

  const email = firstValue(
    raw.email,
    raw.email_address,
    raw.emailAddress,

    user.email,
    user.email_address,
    user.emailAddress,

    profile.email,

    studentData.email,
    studentData.email_address,
    studentData.emailAddress
  );

  const nisn = firstValue(
    raw.nisn,
    raw.NISN,
    raw.student_nisn,
    raw.studentNisn,
    raw.nis,
    raw.nomor_induk,
    raw.nomorInduk,

    user.nisn,
    user.NISN,
    user.student_nisn,
    user.studentNisn,
    user.nis,
    user.nomor_induk,
    user.nomorInduk,

    profile.nisn,
    profile.NISN,
    profile.nis,

    studentData.nisn,
    studentData.NISN,
    studentData.student_nisn,
    studentData.studentNisn,
    studentData.nis,
    studentData.nomor_induk,
    studentData.nomorInduk
  );

  const school = firstValue(
    raw.school,
    raw.sekolah,
    raw.school_name,
    raw.schoolName,
    raw.nama_sekolah,
    raw.namaSekolah,

    sekolah.name,
    sekolah.nama,
    sekolah.school,
    sekolah.school_name,
    sekolah.nama_sekolah,

    user.school,
    user.sekolah,
    user.school_name,
    user.schoolName,
    user.nama_sekolah,
    user.namaSekolah,

    profile.school,
    profile.sekolah,
    profile.school_name,
    profile.schoolName,

    studentData.school,
    studentData.sekolah,
    studentData.school_name,
    studentData.schoolName,
    studentData.nama_sekolah,
    studentData.namaSekolah
  );

  const major = firstValue(
    raw.major,
    raw.jurusan,
    raw.major_name,
    raw.majorName,
    raw.nama_jurusan,
    raw.namaJurusan,

    jurusan.name,
    jurusan.nama,
    jurusan.major,
    jurusan.major_name,
    jurusan.nama_jurusan,

    user.major,
    user.jurusan,
    user.major_name,
    user.majorName,
    user.nama_jurusan,
    user.namaJurusan,

    profile.major,
    profile.jurusan,
    profile.major_name,
    profile.majorName,

    studentData.major,
    studentData.jurusan,
    studentData.major_name,
    studentData.majorName,
    studentData.nama_jurusan,
    studentData.namaJurusan
  );

  const phone = firstValue(
    raw.phone,
    raw.phone_number,
    raw.phoneNumber,
    raw.no_hp,
    raw.noHp,
    raw.nomor_hp,
    raw.nomorHp,
    raw.nomor_telepon,
    raw.nomorTelepon,
    raw.no_telp,
    raw.noTelp,
    raw.no_telepon,
    raw.noTelepon,
    raw.telephone,
    raw.telephone_number,
    raw.telephoneNumber,
    raw.telp,
    raw.tel,

    user.phone,
    user.phone_number,
    user.phoneNumber,
    user.no_hp,
    user.noHp,
    user.nomor_hp,
    user.nomorHp,
    user.nomor_telepon,
    user.nomorTelepon,
    user.no_telp,
    user.noTelp,
    user.no_telepon,
    user.noTelepon,
    user.telephone,
    user.telephone_number,
    user.telephoneNumber,
    user.telp,
    user.tel,

    profile.phone,
    profile.phone_number,
    profile.phoneNumber,
    profile.no_hp,
    profile.noHp,
    profile.nomor_hp,
    profile.nomorHp,
    profile.nomor_telepon,
    profile.nomorTelepon,
    profile.no_telp,
    profile.noTelp,
    profile.no_telepon,
    profile.noTelepon,
    profile.telephone,
    profile.telephone_number,
    profile.telephoneNumber,
    profile.telp,

    studentData.phone,
    studentData.phone_number,
    studentData.phoneNumber,
    studentData.no_hp,
    studentData.noHp,
    studentData.nomor_hp,
    studentData.nomorHp,
    studentData.nomor_telepon,
    studentData.nomorTelepon,
    studentData.no_telp,
    studentData.noTelp,
    studentData.no_telepon,
    studentData.noTelepon,
    studentData.telephone,
    studentData.telephone_number,
    studentData.telephoneNumber,
    studentData.telp
  );

  const className = firstValue(
    raw.class_name,
    raw.className,
    raw.class,
    raw.kelas,

    user.class_name,
    user.className,
    user.class,
    user.kelas,

    profile.class_name,
    profile.className,
    profile.class,
    profile.kelas,

    studentData.class_name,
    studentData.className,
    studentData.class,
    studentData.kelas
  );

  const gender = firstValue(
    raw.gender,
    raw.jenis_kelamin,
    raw.jenisKelamin,
    raw.jenis_kelamin_siswa,
    raw.jenisKelaminSiswa,
    raw.sex,
    raw.gender_name,
    raw.genderName,

    user.gender,
    user.jenis_kelamin,
    user.jenisKelamin,
    user.jenis_kelamin_siswa,
    user.jenisKelaminSiswa,
    user.sex,
    user.gender_name,
    user.genderName,

    profile.gender,
    profile.jenis_kelamin,
    profile.jenisKelamin,
    profile.jenis_kelamin_siswa,
    profile.jenisKelaminSiswa,
    profile.sex,
    profile.gender_name,
    profile.genderName,

    studentData.gender,
    studentData.jenis_kelamin,
    studentData.jenisKelamin,
    studentData.jenis_kelamin_siswa,
    studentData.jenisKelaminSiswa,
    studentData.sex,
    studentData.gender_name,
    studentData.genderName
  );

  const status = firstValue(
    raw.status,
    raw.account_status,
    raw.accountStatus,
    raw.status_akun,
    raw.statusAkun,

    user.status,
    user.account_status,
    user.accountStatus,
    user.status_akun,
    user.statusAkun,

    profile.status,
    profile.account_status,
    profile.accountStatus,

    studentData.status,
    studentData.account_status,
    studentData.accountStatus
  );

  const role = firstValue(
    raw.role,
    user.role,
    profile.role,
    studentData.role
  );

  const createdAt = firstValue(
    raw.created_at,
    raw.createdAt,
    raw.tanggal_daftar,
    raw.tanggalDaftar,

    user.created_at,
    user.createdAt,
    user.tanggal_daftar,
    user.tanggalDaftar,

    studentData.created_at,
    studentData.createdAt,
    studentData.tanggal_daftar,
    studentData.tanggalDaftar
  );

  return {
    id: id ?? `student-${index}`,
    name: name || "-",
    email: email || "-",
    nisn: nisn || "-",
    school: school || "-",
    major: major || "-",
    phone: phone || "-",
    className: className || "-",
    gender: gender || "-",
    status: status || "-",
    role: role || "-",
    createdAt: createdAt || null,
    raw,
  };
}

/* =========================================================
   STATUS
========================================================= */

function isActiveStatus(status) {
  const value = String(status || "").toLowerCase();

  return (
    value === "active" ||
    value === "aktif" ||
    value === "1"
  );
}

function isInactiveStatus(status) {
  const value = String(status || "").toLowerCase();

  return (
    value === "inactive" ||
    value === "nonaktif" ||
    value === "non-active" ||
    value === "0"
  );
}

function formatStatus(status) {
  if (!status || status === "-") {
    return "Tidak tersedia";
  }

  if (isActiveStatus(status)) {
    return "Aktif";
  }

  if (isInactiveStatus(status)) {
    return "Nonaktif";
  }

  return String(status);
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  if (!name || name === "-") {
    return "?";
  }

  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  accent = "blue",
}) {
  const accentStyles = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    red: "bg-red-500",
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(15,23,42,0.08)]">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          accentStyles[accent]
        }`}
      />

      <div className="pl-1">
        <p className="text-[13px] font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-1.5 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-700">
        {Icon && (
          <Icon
            size={14}
            className="text-slate-400"
          />
        )}

        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
      />
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200 hover:bg-white">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        <Icon size={14} />

        {label}
      </div>

      <p className="mt-2 break-words text-sm font-bold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Students() {
  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [majorFilter, setMajorFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    nisn: "",
    school: "",
    major: "",
    phone: "",
    gender: "",
    class_name: "",
  });

  const itemsPerPage = 8;

  /* =====================================================
     LOAD STUDENTS
  ===================================================== */

  const loadStudents = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminStudents();

        console.log(
          "[ADMIN STUDENTS] Response backend:",
          response
        );

        const data =
          getResponseData(response);

        console.log(
          "[ADMIN STUDENTS] Data siswa setelah parsing:",
          data
        );

        const normalized =
          data.map(normalizeStudent);

        setStudents(normalized);
      } catch (err) {
        console.error(
          "Gagal mengambil data siswa:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data siswa dari server."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    majorFilter,
    statusFilter,
  ]);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  /* =====================================================
     FILTER OPTIONS
  ===================================================== */

  const majors = useMemo(() => {
    const values = students
      .map((student) => student.major)
      .filter(
        (value) =>
          value &&
          value !== "-" &&
          String(value).trim() !== ""
      );

    return [...new Set(values)].sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          "id"
        )
    );
  }, [students]);

  const availableStatuses = useMemo(() => {
    const values = students
      .map((student) => {
        if (
          isActiveStatus(student.status)
        ) {
          return "active";
        }

        if (
          isInactiveStatus(student.status)
        ) {
          return "inactive";
        }

        return null;
      })
      .filter(Boolean);

    return [...new Set(values)];
  }, [students]);

  /* =====================================================
     FILTERED STUDENTS
  ===================================================== */

  const filteredStudents = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return students.filter((student) => {
      const searchable = [
        student.name,
        student.email,
        student.nisn,
        student.school,
        student.major,
        student.phone,
        student.className,
        student.gender,
      ].map((value) =>
        String(value || "").toLowerCase()
      );

      const matchesSearch =
        !keyword ||
        searchable.some((value) =>
          value.includes(keyword)
        );

      const matchesMajor =
        majorFilter === "all" ||
        student.major === majorFilter;

      let matchesStatus = true;

      if (statusFilter === "active") {
        matchesStatus =
          isActiveStatus(
            student.status
          );
      }

      if (statusFilter === "inactive") {
        matchesStatus =
          isInactiveStatus(
            student.status
          );
      }

      return (
        matchesSearch &&
        matchesMajor &&
        matchesStatus
      );
    });
  }, [
    students,
    search,
    majorFilter,
    statusFilter,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredStudents.length /
        itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedStudents =
    filteredStudents.slice(
      (safeCurrentPage - 1) *
        itemsPerPage,
      safeCurrentPage * itemsPerPage
    );

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    const total = students.length;

    const active =
      students.filter((student) =>
        isActiveStatus(student.status)
      ).length;

    const inactive =
      students.filter((student) =>
        isInactiveStatus(
          student.status
        )
      ).length;

    const hasStatus = students.some(
      (student) =>
        isActiveStatus(
          student.status
        ) ||
        isInactiveStatus(
          student.status
        )
    );

    return {
      total,
      active: hasStatus ? active : null,
      inactive: hasStatus
        ? inactive
        : null,
    };
  }, [students]);

  /* =====================================================
     FORM
  ===================================================== */

  const handleFormChange =
    (field) => (event) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      password: "",
      nisn: "",
      school: "",
      major: "",
      phone: "",
      gender: "",
      class_name: "",
    });
  };

  const handleCloseAddModal = () => {
    if (submitting) return;

    setShowAddModal(false);
    resetForm();
  };

  /* =====================================================
     ADD STUDENT
  ===================================================== */

  const handleAddStudent = async (
    event
  ) => {
    event.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response =
        await createAdminStudent({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          nisn: form.nisn,
          school: form.school,
          major: form.major,
          phone: form.phone,
          gender: form.gender,
          class_name: form.class_name,
        });

      if (
        response?.success === false
      ) {
        throw new Error(
          response?.message ||
            "Gagal menambahkan siswa."
        );
      }

      await loadStudents(true);

      setShowAddModal(false);
      resetForm();

      setSuccess(
        "Siswa berhasil ditambahkan."
      );

      setCurrentPage(1);
    } catch (err) {
      console.error(
        "Gagal menambahkan siswa:",
        err
      );

      setError(
        err?.message ||
          "Gagal menambahkan siswa."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="relative mb-7 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_10px_40px_rgba(15,23,42,0.05)] sm:px-7">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-blue/5 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Data Siswa
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
                Kelola dan pantau data peserta PKL
                yang tersimpan.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  loadStudents(true)
                }
                disabled={
                  loading || refreshing
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(true)
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 transition hover:-translate-y-0.5 hover:bg-brand-blue-dark hover:shadow-xl hover:shadow-brand-blue/25"
              >
                <Plus size={18} />

                Tambah Siswa
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            ALERT ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-bold">
                Terjadi kesalahan
              </p>

              <p className="mt-0.5 text-xs leading-relaxed">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1.5 transition hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700 shadow-sm">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-bold">
                Berhasil
              </p>

              <p className="mt-0.5 text-xs leading-relaxed">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="rounded-lg p-1.5 transition hover:bg-emerald-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Total Siswa"
            value={
              loading
                ? "..."
                : stats.total
            }
            description="Semua Data"
            accent="blue"
          />

          <StatCard
            title="Siswa Aktif"
            value={
              loading
                ? "..."
                : stats.active === null
                ? "—"
                : stats.active
            }
            description={
              stats.active === null
                ? "Status belum tersedia"
                : "Status aktif"
            }
            accent="green"
          />

          <StatCard
            title="Siswa Nonaktif"
            value={
              loading
                ? "..."
                : stats.inactive === null
                ? "—"
                : stats.inactive
            }
            description={
              stats.inactive === null
                ? "Status belum tersedia"
                : "Status nonaktif"
            }
            accent="red"
          />
        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="mb-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-extrabold text-slate-900">
                Daftar Siswa
              </h2>

              <p className="text-xs text-slate-400">
                Gunakan pencarian dan filter untuk
                menemukan data dengan cepat.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px]">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Cari nama, email, NISN, sekolah, jurusan..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
                />
              </div>

              <select
                value={majorFilter}
                onChange={(event) =>
                  setMajorFilter(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
              >
                <option value="all">
                  Semua Jurusan
                </option>

                {majors.map((major) => (
                  <option
                    key={String(major)}
                    value={major}
                  >
                    {major}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                disabled={
                  availableStatuses.length ===
                  0
                }
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="all">
                  Semua Status
                </option>

                {availableStatuses.includes(
                  "active"
                ) && (
                  <option value="active">
                    Aktif
                  </option>
                )}

                {availableStatuses.includes(
                  "inactive"
                ) && (
                  <option value="inactive">
                    Nonaktif
                  </option>
                )}
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Menampilkan{" "}
                <strong className="text-slate-700">
                  {filteredStudents.length}
                </strong>{" "}
                siswa
              </span>

              <span>
                Halaman{" "}
                <strong className="text-slate-700">
                  {safeCurrentPage}
                </strong>{" "}
                /{" "}
                <strong className="text-slate-700">
                  {totalPages}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          {loading ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Loader2
                  size={27}
                  className="animate-spin text-brand-blue"
                />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                Mengambil data siswa...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Menghubungkan ke backend.
              </p>
            </div>
          ) : paginatedStudents.length ===
            0 ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={29} />
              </div>

              <h3 className="mt-4 text-base font-extrabold text-slate-900">
                Tidak ada data siswa
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-400">
                Tidak ada data yang sesuai dengan
                pencarian atau filter yang dipilih.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        Siswa
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        NISN
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        Sekolah
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        Jurusan
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        Kelas
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        Detail
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedStudents.map(
                      (student) => (
                        <tr
                          key={String(
                            student.id
                          )}
                          className="group transition duration-200 hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 text-xs font-extrabold text-white shadow-sm shadow-brand-blue/20">
                                {getInitials(
                                  student.name
                                )}

                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-extrabold text-slate-900">
                                  {
                                    student.name
                                  }
                                </p>

                                <p className="mt-0.5 max-w-[230px] truncate text-xs text-slate-400">
                                  {
                                    student.email
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-bold text-slate-600">
                              {student.nisn}
                            </span>
                          </td>

                          <td className="max-w-[190px] px-5 py-4">
                            <p className="truncate text-sm font-medium text-slate-600">
                              {student.school}
                            </p>
                          </td>

                          <td className="max-w-[190px] px-5 py-4">
                            <p className="truncate text-sm font-medium text-slate-600">
                              {student.major}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
                              {student.className}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {isActiveStatus(
                              student.status
                            ) ? (
                              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Aktif
                              </span>
                            ) : isInactiveStatus(
                                student.status
                              ) ? (
                              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                Nonaktif
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                                Tidak tersedia
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue"
                            >
                              <Eye size={15} />

                              Detail
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="divide-y divide-slate-100 md:hidden">
                {paginatedStudents.map(
                  (student) => (
                    <div
                      key={String(
                        student.id
                      )}
                      className="p-4"
                    >
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 text-xs font-extrabold text-white">
                            {getInitials(
                              student.name
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-slate-900">
                                  {
                                    student.name
                                  }
                                </p>

                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                  {
                                    student.email
                                  }
                                </p>
                              </div>

                              {isActiveStatus(
                                student.status
                              ) ? (
                                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                  Aktif
                                </span>
                              ) : isInactiveStatus(
                                  student.status
                                ) ? (
                                <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">
                                  Nonaktif
                                </span>
                              ) : (
                                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                                  —
                                </span>
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                  NISN
                                </p>

                                <p className="mt-1 truncate text-xs font-bold text-slate-700">
                                  {
                                    student.nisn
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                  Kelas
                                </p>

                                <p className="mt-1 truncate text-xs font-bold text-slate-700">
                                  {
                                    student.className
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                  Jurusan
                                </p>

                                <p className="mt-1 truncate text-xs font-bold text-slate-700">
                                  {
                                    student.major
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                  Jenis Kelamin
                                </p>

                                <p className="mt-1 truncate text-xs font-bold text-slate-700">
                                  {
                                    student.gender
                                  }
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }
                              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm transition hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue"
                            >
                              <Eye size={15} />

                              Lihat Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            filteredStudents.length >
              0 && (
              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Menampilkan{" "}
                  <strong className="text-slate-700">
                    {(safeCurrentPage - 1) *
                      itemsPerPage +
                      1}
                  </strong>{" "}
                  -{" "}
                  <strong className="text-slate-700">
                    {Math.min(
                      safeCurrentPage *
                        itemsPerPage,
                      filteredStudents.length
                    )}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-slate-700">
                    {filteredStudents.length}
                  </strong>{" "}
                  siswa
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      safeCurrentPage <= 1
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
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={15}
                    />

                    Sebelumnya
                  </button>

                  <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-brand-blue px-3 text-xs font-extrabold text-white shadow-sm shadow-brand-blue/20">
                    {safeCurrentPage}
                  </div>

                  <button
                    type="button"
                    disabled={
                      safeCurrentPage >=
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
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya

                    <ChevronRight
                      size={15}
                    />
                  </button>
                </div>
              </div>
            )}
        </div>

        
      </div>

      {/* =====================================================
          ADD STUDENT MODAL
      ===================================================== */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={
              handleCloseAddModal
            }
          />

          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 overflow-hidden border-b border-slate-100 bg-white/95 px-5 py-5 backdrop-blur sm:px-6">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-50 blur-2xl" />

              <div className="relative flex items-center justify-between gap-4">
                <div>
                  

                  <h2 className="text-xl font-extrabold text-slate-900">
                    Tambah Siswa
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Lengkapi informasi siswa di bawah ini.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseAddModal
                  }
                  disabled={submitting}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleAddStudent}
              className="p-5 sm:p-6"
            >
              <div className="mb-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-slate-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm">
                    <GraduationCap
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Informasi akun siswa
                    </p>

                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      Data yang diisi, akan digunakan untuk akun
                      siswa.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    label="Nama Lengkap"
                    icon={UserRound}
                    value={
                      form.full_name
                    }
                    onChange={handleFormChange(
                      "full_name"
                    )}
                    placeholder="Masukkan nama lengkap"
                    required
                    autoComplete="name"
                  />
                </div>

                <Field
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={form.email}
                  onChange={handleFormChange(
                    "email"
                  )}
                  placeholder="contoh@email.com"
                  required
                  autoComplete="email"
                />

                <Field
                  label="Password"
                  icon={Lock}
                  type="password"
                  value={
                    form.password
                  }
                  onChange={handleFormChange(
                    "password"
                  )}
                  placeholder="Password akun siswa"
                  required
                  autoComplete="new-password"
                />

                <Field
                  label="NISN"
                  icon={Hash}
                  value={form.nisn}
                  onChange={handleFormChange(
                    "nisn"
                  )}
                  placeholder="Masukkan NISN"
                  required
                />

                <Field
                  label="No. Telepon"
                  icon={Phone}
                  value={form.phone}
                  onChange={handleFormChange(
                    "phone"
                  )}
                  placeholder="08xxxxxxxxxx"
                />

                <Field
                  label="Sekolah"
                  icon={School}
                  value={
                    form.school
                  }
                  onChange={handleFormChange(
                    "school"
                  )}
                  placeholder="Nama sekolah"
                  required
                />

                <Field
                  label="Kelas"
                  icon={GraduationCap}
                  value={
                    form.class_name
                  }
                  onChange={handleFormChange(
                    "class_name"
                  )}
                  placeholder="Contoh: XII RPL 1"
                />

                <div>
                  <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-700">
                    <UserRound
                      size={14}
                      className="text-slate-400"
                    />

                    Jenis Kelamin
                  </label>

                  <select
                    value={form.gender}
                    onChange={handleFormChange(
                      "gender"
                    )}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
                  >
                    <option value="">
                      Pilih jenis kelamin
                    </option>

                    <option value="Laki-laki">
                      Laki-laki
                    </option>

                    <option value="Perempuan">
                      Perempuan
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Jurusan"
                    icon={BookOpen}
                    value={
                      form.major
                    }
                    onChange={handleFormChange(
                      "major"
                    )}
                    placeholder="Contoh: Rekayasa Perangkat Lunak"
                    required
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-xs leading-relaxed text-amber-800">
                  Pastikan data yang dimasukkan
                  sudah benar. Data akan disimpan
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    handleCloseAddModal
                  }
                  disabled={submitting}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      Simpan Siswa
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() =>
              setSelectedStudent(null)
            }
          />

          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            {/* DETAIL HEADER */}

            <div className="relative overflow-hidden border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-blue-50 blur-3xl" />

              <div className="relative flex items-center justify-between gap-4">
                <div>

                  <h2 className="text-xl font-extrabold text-slate-900">
                    Detail Siswa
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Informasi siswa yang tersimpan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedStudent(
                      null
                    )
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* PROFILE */}

              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/60 blur-2xl" />

                <div className="relative flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 text-base font-extrabold text-white shadow-lg shadow-brand-blue/20">
                    {getInitials(
                      selectedStudent.name
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-extrabold text-slate-900">
                      {
                        selectedStudent.name
                      }
                    </h3>

                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {
                        selectedStudent.email
                      }
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {isActiveStatus(
                        selectedStudent.status
                      ) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      ) : isInactiveStatus(
                          selectedStudent.status
                        ) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Nonaktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500">
                          Status tidak tersedia
                        </span>
                      )}

                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
                        {selectedStudent.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILS */}

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Informasi Siswa
                  </h3>

                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Database
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={Hash}
                    label="NISN"
                    value={
                      selectedStudent.nisn
                    }
                  />

                  <DetailItem
                    icon={Mail}
                    label="Email"
                    value={
                      selectedStudent.email
                    }
                  />

                  <DetailItem
                    icon={School}
                    label="Sekolah"
                    value={
                      selectedStudent.school
                    }
                  />

                  <DetailItem
                    icon={BookOpen}
                    label="Jurusan"
                    value={
                      selectedStudent.major
                    }
                  />

                  <DetailItem
                    icon={Phone}
                    label="No. Telepon"
                    value={
                      selectedStudent.phone
                    }
                  />

                  <DetailItem
                    icon={UserRound}
                    label="Jenis Kelamin"
                    value={
                      selectedStudent.gender
                    }
                  />

                  <DetailItem
                    icon={GraduationCap}
                    label="Kelas"
                    value={
                      selectedStudent.className
                    }
                  />

                  <DetailItem
                    icon={UserCheck}
                    label="Status"
                    value={formatStatus(
                      selectedStudent.status
                    )}
                  />

                  <DetailItem
                    icon={UserRound}
                    label="Role"
                    value={
                      selectedStudent.role
                    }
                  />

                  <DetailItem
                    icon={Hash}
                    label="ID"
                    value={
                      selectedStudent.id
                    }
                  />

                  <DetailItem
                    icon={Users}
                    label="Terdaftar"
                    value={formatDate(
                      selectedStudent.createdAt
                    )}
                  />
                </div>
              </div>

              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(null)
                }
                className="mt-6 h-11 w-full rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}