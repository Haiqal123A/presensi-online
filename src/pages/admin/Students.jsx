import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  Phone,
  School,
  Hash,
  BookOpen,
  Filter,
} from "lucide-react";

/*
 * DATA DUMMY
 *
 * Nanti data ini diganti dengan response dari backend/API.
 */
const initialStudents = [
  {
    id: 1,
    name: "Andi Setiawan",
    nisn: "1234567890",
    major: "Rekayasa Perangkat Lunak",
    className: "XII RPL 1",
    school: "SMK Negeri 1 Jakarta",
    phone: "081234567890",
    gender: "Laki-laki",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Siti Rahma",
    nisn: "1234567891",
    major: "Rekayasa Perangkat Lunak",
    className: "XII RPL 1",
    school: "SMK Negeri 1 Jakarta",
    phone: "081234567891",
    gender: "Perempuan",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Budi Santoso",
    nisn: "1234567892",
    major: "Teknik Komputer dan Jaringan",
    className: "XII TKJ 1",
    school: "SMK Negeri 1 Jakarta",
    phone: "081234567892",
    gender: "Laki-laki",
    status: "Aktif",
  },
  {
    id: 4,
    name: "Dina Permata",
    nisn: "1234567893",
    major: "Rekayasa Perangkat Lunak",
    className: "XII RPL 2",
    school: "SMK Negeri 1 Jakarta",
    phone: "081234567893",
    gender: "Perempuan",
    status: "Aktif",
  },
  {
    id: 5,
    name: "Rizky Maulana",
    nisn: "1234567894",
    major: "Teknik Jaringan Komputer dan Telekomunikasi",
    className: "XII TJKT 1",
    school: "SMK Negeri 2 Jakarta",
    phone: "081234567894",
    gender: "Laki-laki",
    status: "Aktif",
  },
  {
    id: 6,
    name: "Fajar Ramadhan",
    nisn: "1234567895",
    major: "Rekayasa Perangkat Lunak",
    className: "XII RPL 2",
    school: "SMK Negeri 1 Jakarta",
    phone: "081234567895",
    gender: "Laki-laki",
    status: "Aktif",
  },
  {
    id: 7,
    name: "Nabila Putri",
    nisn: "1234567896",
    major: "Akuntansi",
    className: "XII AKL 1",
    school: "SMK Negeri 2 Jakarta",
    phone: "081234567896",
    gender: "Perempuan",
    status: "Aktif",
  },
  {
    id: 8,
    name: "Dimas Saputra",
    nisn: "1234567897",
    major: "Rekayasa Perangkat Lunak",
    className: "XI RPL 1",
    school: "SMK Negeri 1 Jakarta",
    phone: "081234567897",
    gender: "Laki-laki",
    status: "Nonaktif",
  },
  {
    id: 9,
    name: "Putri Amelia",
    nisn: "1234567898",
    major: "Akuntansi",
    className: "XII AKL 1",
    school: "SMK Negeri 2 Jakarta",
    phone: "081234567898",
    gender: "Perempuan",
    status: "Aktif",
  },
  {
    id: 10,
    name: "Yoga Pratama",
    nisn: "1234567899",
    major: "Teknik Komputer dan Jaringan",
    className: "XI TKJ 1",
    school: "SMK Negeri 1 Jakarta",
    phone: "081234567899",
    gender: "Laki-laki",
    status: "Aktif",
  },
  {
    id: 11,
    name: "Aulia Safitri",
    nisn: "1234567800",
    major: "Rekayasa Perangkat Lunak",
    className: "XII RPL 1",
    school: "SMK Negeri 1 Jakarta",
    phone: "081234567800",
    gender: "Perempuan",
    status: "Aktif",
  },
  {
    id: 12,
    name: "Galang Prakoso",
    nisn: "1234567801",
    major: "Teknik Jaringan Komputer dan Telekomunikasi",
    className: "XII TJKT 1",
    school: "SMK Negeri 2 Jakarta",
    phone: "081234567801",
    gender: "Laki-laki",
    status: "Aktif",
  },
];

const ITEMS_PER_PAGE = 8;

export default function Students() {
  const [students, setStudents] =
    useState(initialStudents);

  const [search, setSearch] = useState("");
  const [majorFilter, setMajorFilter] =
    useState("Semua Jurusan");
  const [statusFilter, setStatusFilter] =
    useState("Semua Status");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const majors = useMemo(() => {
    return [
      "Semua Jurusan",
      ...new Set(students.map((student) => student.major)),
    ];
  }, [students]);

  const filteredStudents = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !keyword ||
        student.name
          .toLowerCase()
          .includes(keyword) ||
        student.nisn
          .toLowerCase()
          .includes(keyword) ||
        student.className
          .toLowerCase()
          .includes(keyword);

      const matchesMajor =
        majorFilter === "Semua Jurusan" ||
        student.major === majorFilter;

      const matchesStatus =
        statusFilter === "Semua Status" ||
        student.status === statusFilter;

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
      filteredStudents.length / ITEMS_PER_PAGE
    )
  );

  const paginatedStudents =
    filteredStudents.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.status === "Aktif"
  ).length;

  const inactiveStudents =
    students.filter(
      (student) => student.status === "Nonaktif"
    ).length;

  const femaleStudents =
    students.filter(
      (student) => student.gender === "Perempuan"
    ).length;

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleMajorChange = (value) => {
    setMajorFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(null);
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteStudent = (student) => {
    const confirmed = window.confirm(
      `Hapus data siswa "${student.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setStudents((current) =>
      current.filter(
        (item) => item.id !== student.id
      )
    );

    setSelectedStudent(null);

    if (
      currentPage > 1 &&
      paginatedStudents.length === 1
    ) {
      setCurrentPage((page) =>
        Math.max(1, page - 1)
      );
    }
  };

  const handleSubmitStudent = (formData) => {
    if (editingStudent) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingStudent.id
            ? {
                ...student,
                ...formData,
              }
            : student
        )
      );
    } else {
      const newStudent = {
        id: Date.now(),
        ...formData,
      };

      setStudents((current) => [
        newStudent,
        ...current,
      ]);

      setCurrentPage(1);
    }

    setShowForm(false);
    setEditingStudent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-brand-blue mb-2">
                <Users size={19} />

                <span className="text-sm font-semibold">
                  Manajemen Siswa
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Data Siswa
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Kelola data siswa yang mengikuti
                program PKL.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddStudent}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold shadow-sm hover:bg-brand-blue-dark transition"
            >
              <Plus size={18} />
              Tambah Siswa
            </button>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Siswa"
            value={totalStudents}
            description="Siswa terdaftar"
            icon={Users}
            iconClass="bg-brand-blue-light text-brand-blue"
            valueClass="text-gray-900"
          />

          <StatCard
            label="Siswa Aktif"
            value={activeStudents}
            description="Sedang mengikuti PKL"
            icon={UserCheck}
            iconClass="bg-green-50 text-green-600"
            valueClass="text-green-600"
          />

          <StatCard
            label="Siswa Nonaktif"
            value={inactiveStudents}
            description="Tidak aktif"
            icon={UserX}
            iconClass="bg-red-50 text-red-600"
            valueClass="text-red-600"
          />

          <StatCard
            label="Siswa Perempuan"
            value={femaleStudents}
            description="Dari seluruh siswa"
            icon={GraduationCap}
            iconClass="bg-purple-50 text-purple-600"
            valueClass="text-purple-600"
          />
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* FILTER BAR */}
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col xl:flex-row xl:items-center gap-4">
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    handleSearchChange(
                      event.target.value
                    )
                  }
                  placeholder="Cari nama, NISN, atau kelas..."
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* MAJOR */}
                <div className="relative">
                  <BookOpen
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    value={majorFilter}
                    onChange={(event) =>
                      handleMajorChange(
                        event.target.value
                      )
                    }
                    className="h-12 w-full sm:w-[230px] appearance-none pl-10 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                  >
                    {majors.map((major) => (
                      <option
                        key={major}
                        value={major}
                      >
                        {major}
                      </option>
                    ))}
                  </select>

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▾
                  </span>
                </div>

                {/* STATUS */}
                <div className="relative">
                  <Filter
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      handleStatusChange(
                        event.target.value
                      )
                    }
                    className="h-12 w-full sm:w-[170px] appearance-none pl-10 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                  >
                    <option value="Semua Status">
                      Semua Status
                    </option>

                    <option value="Aktif">
                      Aktif
                    </option>

                    <option value="Nonaktif">
                      Nonaktif
                    </option>
                  </select>

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▾
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
              <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-bold text-gray-700">
                  {filteredStudents.length}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-gray-700">
                  {students.length}
                </span>{" "}
                siswa
              </p>

              {(search ||
                majorFilter !==
                  "Semua Jurusan" ||
                statusFilter !==
                  "Semua Status") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setMajorFilter(
                      "Semua Jurusan"
                    );
                    setStatusFilter(
                      "Semua Status"
                    );
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark transition self-start sm:self-auto"
                >
                  <X size={15} />
                  Reset filter
                </button>
              )}
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Siswa
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    NISN
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Jurusan
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Kelas
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    No. Telepon
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map(
                    (student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        onView={() =>
                          setSelectedStudent(
                            student
                          )
                        }
                        onEdit={() =>
                          handleEditStudent(
                            student
                          )
                        }
                        onDelete={() =>
                          handleDeleteStudent(
                            student
                          )
                        }
                      />
                    )
                  )
                ) : (
                  <EmptyState />
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE / TABLET CARDS */}
          <div className="lg:hidden divide-y divide-gray-100">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map(
                (student) => (
                  <StudentMobileCard
                    key={student.id}
                    student={student}
                    onView={() =>
                      setSelectedStudent(
                        student
                      )
                    }
                    onEdit={() =>
                      handleEditStudent(
                        student
                      )
                    }
                    onDelete={() =>
                      handleDeleteStudent(
                        student
                      )
                    }
                  />
                )
              )
            ) : (
              <EmptyState />
            )}
          </div>

          {/* PAGINATION */}
          {filteredStudents.length > 0 && (
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-500">
                Halaman{" "}
                <span className="font-bold text-gray-700">
                  {currentPage}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-gray-700">
                  {totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(1, page - 1)
                    )
                  }
                  className="px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Sebelumnya
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                        currentPage === page
                          ? "bg-brand-blue text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages
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
                  className="px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="mt-6 flex gap-3 p-4 rounded-2xl bg-brand-blue-light border border-brand-blue/10">
          <Users
            size={19}
            className="text-brand-blue shrink-0 mt-0.5"
          />

          <p className="text-sm text-brand-blue leading-relaxed">
            Data siswa saat ini masih menggunakan
            data dummy untuk frontend. Setelah backend
            tersedia, data akan diambil dan dikelola
            langsung melalui database.
          </p>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() =>
            setSelectedStudent(null)
          }
          onEdit={() =>
            handleEditStudent(
              selectedStudent
            )
          }
        />
      )}

      {/* FORM MODAL */}
      {showForm && (
        <StudentFormModal
          student={editingStudent}
          onClose={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
          onSubmit={handleSubmitStudent}
        />
      )}
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  valueClass,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p
            className={`text-3xl font-bold mt-2 ${valueClass}`}
          >
            {value}
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

/* =====================================================
   DESKTOP ROW
===================================================== */

function StudentRow({
  student,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <tr className="hover:bg-gray-50/70 transition">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <StudentAvatar
            name={student.name}
          />

          <div className="min-w-0">
            <p className="font-bold text-sm text-gray-900 truncate max-w-[210px]">
              {student.name}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {student.gender}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-gray-700">
          {student.nisn}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">
          {student.major}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-blue-light text-brand-blue text-xs font-bold">
          {student.className}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">
          {student.phone}
        </span>
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={student.status} />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1">
          <ActionButton
            icon={Eye}
            label="Lihat detail"
            onClick={onView}
          />

          <ActionButton
            icon={Pencil}
            label="Edit siswa"
            onClick={onEdit}
          />

          <ActionButton
            icon={Trash2}
            label="Hapus siswa"
            danger
            onClick={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

/* =====================================================
   MOBILE CARD
===================================================== */

function StudentMobileCard({
  student,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="p-5">
      <div className="flex items-start gap-3">
        <StudentAvatar
          name={student.name}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate">
                {student.name}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                NISN {student.nisn}
              </p>
            </div>

            <StatusBadge status={student.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <InfoItem
              icon={BookOpen}
              label="Jurusan"
              value={student.major}
            />

            <InfoItem
              icon={GraduationCap}
              label="Kelas"
              value={student.className}
            />

            <InfoItem
              icon={Phone}
              label="Telepon"
              value={student.phone}
            />

            <InfoItem
              icon={School}
              label="Sekolah"
              value={student.school}
            />
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onView}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-blue-light text-brand-blue text-xs font-bold hover:bg-brand-blue/10 transition"
            >
              <Eye size={15} />
              Detail
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition"
            >
              <Pencil size={15} />
              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="w-11 h-10 inline-flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
              aria-label="Hapus siswa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   AVATAR
===================================================== */

function StudentAvatar({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((item) => item.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="w-11 h-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center font-extrabold text-sm shrink-0">
      {initials}
    </div>
  );
}

/* =====================================================
   STATUS
===================================================== */

function StatusBadge({ status }) {
  const isActive = status === "Aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
        isActive
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive
            ? "bg-green-500"
            : "bg-gray-400"
        }`}
      />

      {status}
    </span>
  );
}

/* =====================================================
   ACTION BUTTON
===================================================== */

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-500 hover:bg-brand-blue-light hover:text-brand-blue"
      }`}
    >
      <Icon size={17} />
    </button>
  );
}

/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
      <Icon
        size={15}
        className="text-brand-blue mt-0.5 shrink-0"
      />

      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">
          {label}
        </p>

        <p className="text-xs font-semibold text-gray-700 mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState() {
  return (
    <div className="py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
        <Users size={25} />
      </div>

      <h3 className="font-bold text-gray-800 mt-4">
        Data siswa tidak ditemukan
      </h3>

      <p className="text-sm text-gray-400 mt-1">
        Coba ubah kata pencarian atau filter.
      </p>
    </div>
  );
}

/* =====================================================
   DETAIL MODAL
===================================================== */

function StudentDetailModal({
  student,
  onClose,
  onEdit,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="bg-brand-blue px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white text-brand-blue flex items-center justify-center font-extrabold">
                {student.name
                  .split(" ")
                  .slice(0, 2)
                  .map((item) =>
                    item.charAt(0)
                  )
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  Detail Siswa
                </h2>

                <p className="text-white/65 text-xs mt-1">
                  Informasi lengkap siswa
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              aria-label="Tutup"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {student.name}
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  NISN {student.nisn}
                </p>
              </div>

              <StatusBadge
                status={student.status}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailItem
              icon={Hash}
              label="NISN"
              value={student.nisn}
            />

            <DetailItem
              icon={GraduationCap}
              label="Kelas"
              value={student.className}
            />

            <DetailItem
              icon={BookOpen}
              label="Jurusan"
              value={student.major}
            />

            <DetailItem
              icon={School}
              label="Sekolah"
              value={student.school}
            />

            <DetailItem
              icon={Phone}
              label="No. Telepon"
              value={student.phone}
            />

            <DetailItem
              icon={Users}
              label="Gender"
              value={student.gender}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition"
            >
              <Pencil size={16} />
              Edit Siswa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   DETAIL ITEM
===================================================== */

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70">
      <div className="flex items-center gap-2 text-brand-blue">
        <Icon size={15} />

        <span className="text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-sm font-semibold text-gray-800 mt-2 break-words">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   FORM MODAL
===================================================== */

function StudentFormModal({
  student,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(student);

  const [formData, setFormData] =
    useState({
      name: student?.name || "",
      nisn: student?.nisn || "",
      major: student?.major || "",
      className: student?.className || "",
      school: student?.school || "",
      phone: student?.phone || "",
      gender:
        student?.gender || "Laki-laki",
      status: student?.status || "Aktif",
    });

  const [error, setError] =
    useState("");

  const handleChange = (
    field,
    value
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.nisn.trim() ||
      !formData.major.trim() ||
      !formData.className.trim() ||
      !formData.school.trim() ||
      !formData.phone.trim()
    ) {
      setError(
        "Mohon lengkapi semua data siswa."
      );

      return;
    }

    setError("");

    onSubmit({
      ...formData,
      name: formData.name.trim(),
      nisn: formData.nisn.trim(),
      major: formData.major.trim(),
      className:
        formData.className.trim(),
      school: formData.school.trim(),
      phone: formData.phone.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing
                ? "Edit Data Siswa"
                : "Tambah Siswa"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {isEditing
                ? "Perbarui informasi siswa."
                : "Tambahkan siswa baru ke sistem."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Nama Lengkap"
              value={formData.name}
              onChange={(value) =>
                handleChange(
                  "name",
                  value
                )
              }
              placeholder="Masukkan nama lengkap"
              required
            />

            <FormField
              label="NISN"
              value={formData.nisn}
              onChange={(value) =>
                handleChange(
                  "nisn",
                  value
                )
              }
              placeholder="Masukkan NISN"
              required
            />

            <FormField
              label="Jurusan"
              value={formData.major}
              onChange={(value) =>
                handleChange(
                  "major",
                  value
                )
              }
              placeholder="Contoh: Rekayasa Perangkat Lunak"
              required
            />

            <FormField
              label="Kelas"
              value={formData.className}
              onChange={(value) =>
                handleChange(
                  "className",
                  value
                )
              }
              placeholder="Contoh: XII RPL 1"
              required
            />

            <FormField
              label="Sekolah"
              value={formData.school}
              onChange={(value) =>
                handleChange(
                  "school",
                  value
                )
              }
              placeholder="Nama sekolah"
              required
            />

            <FormField
              label="No. Telepon"
              value={formData.phone}
              onChange={(value) =>
                handleChange(
                  "phone",
                  value
                )
              }
              placeholder="08xxxxxxxxxx"
              required
            />

            <SelectField
              label="Gender"
              value={formData.gender}
              onChange={(value) =>
                handleChange(
                  "gender",
                  value
                )
              }
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
            />

            <SelectField
              label="Status"
              value={formData.status}
              onChange={(value) =>
                handleChange(
                  "status",
                  value
                )
              }
              options={[
                "Aktif",
                "Nonaktif",
              ]}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-7">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Batal
            </button>

            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition"
            >
              {isEditing
                ? "Simpan Perubahan"
                : "Tambah Siswa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================================
   FORM FIELD
===================================================== */

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
      />
    </label>
  );
}

/* =====================================================
   SELECT FIELD
===================================================== */

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full h-11 appearance-none px-3.5 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          ▾
        </span>
      </div>
    </label>
  );
}