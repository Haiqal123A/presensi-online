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
} from "lucide-react";

import {
  getAdminStudents,
  createAdminStudent,
} from "../../services/api";

function getResponseData(response) {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.students)) {
    return response.students;
  }

  if (Array.isArray(response.users)) {
    return response.users;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.records)) {
    return response.records;
  }

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    if (Array.isArray(response.data.students)) {
      return response.data.students;
    }

    if (Array.isArray(response.data.users)) {
      return response.data.users;
    }

    if (Array.isArray(response.data.items)) {
      return response.data.items;
    }

    if (Array.isArray(response.data.records)) {
      return response.data.records;
    }
  }

  return [];
}

function normalizeStudent(student, index) {
  const raw = student || {};

  return {
    id:
      raw.id ??
      raw.user_id ??
      raw.student_id ??
      raw.uuid ??
      `student-${index}`,

    name:
      raw.full_name ??
      raw.name ??
      raw.nama ??
      "-",

    email:
      raw.email ??
      "-",

    nisn:
      raw.nisn ??
      raw.NISN ??
      "-",

    school:
      raw.school ??
      raw.sekolah ??
      "-",

    major:
      raw.major ??
      raw.jurusan ??
      "-",

    phone:
      raw.phone ??
      raw.phone_number ??
      raw.no_hp ??
      raw.nomor_telepon ??
      raw.telephone ??
      "-",

    className:
      raw.class_name ??
      raw.className ??
      raw.class ??
      raw.kelas ??
      "-",

    gender:
      raw.gender ??
      raw.jenis_kelamin ??
      raw.jenisKelamin ??
      raw.sex ??
      "-",

    status:
      raw.status ??
      raw.account_status ??
      "-",

    role:
      raw.role ??
      "-",

    createdAt:
      raw.created_at ??
      raw.createdAt ??
      null,

    raw,
  };
}

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

  return `${words[0][0]}${words[1][0]}`
    .toUpperCase();
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

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

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
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
        {Icon && (
          <Icon
            size={15}
            className="text-gray-400"
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
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
      />
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
        <Icon size={14} />

        {label}
      </div>

      <p className="mt-1.5 break-words text-sm font-semibold text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
}

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

        const data =
          getResponseData(response);

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
      ]
        .map((value) =>
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
      safeCurrentPage *
        itemsPerPage
    );

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

    const hasStatus =
      students.some(
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

  const handleAddStudent = async (
    event
  ) => {
    event.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      /*
       * api.js saat ini hanya mengirim:
       * email, password, full_name,
       * nisn, school, major
       *
       * Jadi field tambahan phone,
       * gender, dan class_name tetap
       * disiapkan di form dan bisa
       * dibaca dari response backend.
       *
       * Jangan membuat data lokal/dummy.
       */
      const response =
        await createAdminStudent({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          nisn: form.nisn,
          school: form.school,
          major: form.major,

          /*
           * Field tambahan ini disertakan
           * sebagai informasi form.
           *
           * Jika backend create sudah
           * mendukungnya, api.js perlu
           * meneruskannya ke request.
           */
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Data Siswa
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Kelola data peserta PKL
              yang tersimpan di
              database.
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-blue-dark"
            >
              <Plus size={18} />

              Tambah Siswa
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Terjadi kesalahan
              </p>

              <p className="mt-0.5">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Berhasil
              </p>

              <p className="mt-0.5">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="rounded-lg p-1 hover:bg-green-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Siswa"
            value={
              loading
                ? "..."
                : stats.total
            }
            icon={Users}
            description="Data dari database"
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
            icon={UserCheck}
            description={
              stats.active === null
                ? "Status belum tersedia"
                : "Status aktif"
            }
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
            icon={UserX}
            description={
              stats.inactive === null
                ? "Status belum tersedia"
                : "Status nonaktif"
            }
          />
        </div>

        {/* FILTER */}
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
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
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
              />
            </div>

            <select
              value={majorFilter}
              onChange={(event) =>
                setMajorFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-700 outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
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
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-700 outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="mt-3 flex justify-between text-xs text-gray-500">
            <span>
              Menampilkan{" "}
              <strong className="text-gray-700">
                {filteredStudents.length}
              </strong>{" "}
              siswa
            </span>

            <span>
              Halaman{" "}
              <strong className="text-gray-700">
                {safeCurrentPage}
              </strong>{" "}
              /{" "}
              <strong className="text-gray-700">
                {totalPages}
              </strong>
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-brand-blue"
              />

              <p className="mt-4 text-sm font-semibold text-gray-700">
                Mengambil data siswa...
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Menghubungkan ke backend.
              </p>
            </div>
          ) : paginatedStudents.length ===
            0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Users size={30} />
              </div>

              <h3 className="mt-4 text-base font-bold text-gray-900">
                Tidak ada data siswa
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Tidak ada data yang
                sesuai dengan
                pencarian atau filter.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Siswa
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        NISN
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Sekolah
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Jurusan
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Kelas
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                        Detail
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {paginatedStudents.map(
                      (student) => (
                        <tr
                          key={String(
                            student.id
                          )}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-xs font-bold text-white">
                                {getInitials(
                                  student.name
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {
                                    student.name
                                  }
                                </p>

                                <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500">
                                  {
                                    student.email
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {student.nisn}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {student.school}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {student.major}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {student.className}
                          </td>

                          <td className="px-5 py-4">
                            {isActiveStatus(
                              student.status
                            ) ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Aktif
                              </span>
                            ) : isInactiveStatus(
                                student.status
                              ) ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                Nonaktif
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                Tidak tersedia
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:border-brand-blue hover:text-brand-blue"
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
              <div className="divide-y divide-gray-100 md:hidden">
                {paginatedStudents.map(
                  (student) => (
                    <div
                      key={String(
                        student.id
                      )}
                      className="p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-xs font-bold text-white">
                          {getInitials(
                            student.name
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {
                              student.name
                            }
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {
                              student.email
                            }
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400">
                                NISN
                              </span>

                              <p className="mt-0.5 font-semibold text-gray-700">
                                {
                                  student.nisn
                                }
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-400">
                                Kelas
                              </span>

                              <p className="mt-0.5 font-semibold text-gray-700">
                                {
                                  student.className
                                }
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-400">
                                Jurusan
                              </span>

                              <p className="mt-0.5 font-semibold text-gray-700">
                                {
                                  student.major
                                }
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-400">
                                Jenis Kelamin
                              </span>

                              <p className="mt-0.5 font-semibold text-gray-700">
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
                            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:border-brand-blue hover:text-brand-blue"
                          >
                            <Eye size={15} />

                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {/* PAGINATION */}
          {!loading &&
            filteredStudents.length >
              0 && (
              <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-gray-500">
                  Menampilkan{" "}
                  <strong className="text-gray-700">
                    {(safeCurrentPage - 1) *
                      itemsPerPage +
                      1}
                  </strong>{" "}
                  -{" "}
                  <strong className="text-gray-700">
                    {Math.min(
                      safeCurrentPage *
                        itemsPerPage,
                      filteredStudents.length
                    )}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-gray-700">
                    {filteredStudents.length}
                  </strong>
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
                    className="h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>

                  <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand-blue px-3 text-xs font-bold text-white">
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
                    className="h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* INFO */}
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <p className="text-xs leading-relaxed text-yellow-800">
            <strong>Catatan:</strong>{" "}
            data siswa pada halaman ini
            berasal dari backend. Tidak ada
            data siswa dummy/local.
          </p>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0"
            onClick={
              handleCloseAddModal
            }
          />

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Tambah Siswa
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Lengkapi data siswa.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseAddModal
                }
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddStudent}
              className="p-5"
            >
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
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <UserRound
                      size={15}
                      className="text-gray-400"
                    />

                    Jenis Kelamin
                  </label>

                  <select
                    value={form.gender}
                    onChange={handleFormChange(
                      "gender"
                    )}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
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

              <div className="mt-5 rounded-xl border border-blue-100 bg-brand-blue-light px-4 py-3">
                <p className="text-xs leading-relaxed text-brand-blue-dark">
                  Data yang sudah tersedia
                  dari backend akan
                  ditampilkan secara
                  otomatis pada halaman
                  detail siswa.
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    handleCloseAddModal
                  }
                  disabled={submitting}
                  className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-60"
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

      {/* DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0"
            onClick={() =>
              setSelectedStudent(
                null
              )
            }
          />

          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Detail Siswa
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Informasi dari database
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-4 rounded-2xl bg-brand-blue-light p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-blue text-sm font-bold text-white">
                  {getInitials(
                    selectedStudent.name
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-gray-900">
                    {
                      selectedStudent.name
                    }
                  </h3>

                  <p className="mt-0.5 truncate text-sm text-gray-600">
                    {
                      selectedStudent.email
                    }
                  </p>

                  <div className="mt-2">
                    {isActiveStatus(
                      selectedStudent.status
                    ) ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">
                        Aktif
                      </span>
                    ) : isInactiveStatus(
                        selectedStudent.status
                      ) ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
                        Nonaktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                        Status tidak tersedia
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
                className="mt-6 h-11 w-full rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200"
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