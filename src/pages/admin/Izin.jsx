import { useMemo, useState } from "react";
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
} from "lucide-react";

/*
 * DATA DUMMY
 *
 * Nanti data ini diganti dengan response dari backend/API.
 */
const initialIzin = [
  {
    id: 1,
    name: "Fajar Ramadhan",
    nisn: "1234567895",
    className: "XII RPL 2",
    school: "SMK Negeri 1 Jakarta",
    date: "2026-09-10",
    type: "Sakit",
    reason: "Demam dan perlu beristirahat.",
    createdAt: "2026-09-10T07:20:00",
  },
  {
    id: 2,
    name: "Nabila Putri",
    nisn: "1234567896",
    className: "XII AKL 1",
    school: "SMK Negeri 2 Jakarta",
    date: "2026-09-10",
    type: "Keperluan Keluarga",
    reason: "Ada keperluan keluarga yang tidak dapat ditinggalkan.",
    createdAt: "2026-09-10T07:35:00",
  },
  {
    id: 3,
    name: "Dimas Saputra",
    nisn: "1234567897",
    className: "XI RPL 1",
    school: "SMK Negeri 1 Jakarta",
    date: "2026-09-10",
    type: "Keperluan Sekolah",
    reason: "Mengikuti kegiatan sekolah.",
    createdAt: "2026-09-10T07:45:00",
  },
  {
    id: 4,
    name: "Putri Amelia",
    nisn: "1234567898",
    className: "XII AKL 1",
    school: "SMK Negeri 2 Jakarta",
    date: "2026-09-09",
    type: "Keperluan Pribadi",
    reason: "Ada keperluan pribadi.",
    createdAt: "2026-09-09T07:10:00",
  },
  {
    id: 5,
    name: "Yoga Pratama",
    nisn: "1234567899",
    className: "XI TKJ 1",
    school: "SMK Negeri 1 Jakarta",
    date: "2026-09-09",
    type: "Sakit",
    reason: "Kurang sehat dan membutuhkan waktu untuk beristirahat.",
    createdAt: "2026-09-09T07:25:00",
  },
  {
    id: 6,
    name: "Aulia Safitri",
    nisn: "1234567800",
    className: "XII RPL 1",
    school: "SMK Negeri 1 Jakarta",
    date: "2026-09-08",
    type: "Lainnya",
    reason: "Ada keperluan yang mendesak.",
    createdAt: "2026-09-08T07:40:00",
  },
  {
    id: 7,
    name: "Galang Prakoso",
    nisn: "1234567801",
    className: "XII TJKT 1",
    school: "SMK Negeri 2 Jakarta",
    date: "2026-09-08",
    type: "Keperluan Keluarga",
    reason: "Mengantar anggota keluarga.",
    createdAt: "2026-09-08T07:50:00",
  },
  {
    id: 8,
    name: "Andi Setiawan",
    nisn: "1234567890",
    className: "XII RPL 1",
    school: "SMK Negeri 1 Jakarta",
    date: "2026-09-05",
    type: "Sakit",
    reason: "Mengalami kondisi kurang sehat.",
    createdAt: "2026-09-05T07:15:00",
  },
  {
    id: 9,
    name: "Siti Rahma",
    nisn: "1234567891",
    className: "XII RPL 1",
    school: "SMK Negeri 1 Jakarta",
    date: "2026-09-04",
    type: "Keperluan Sekolah",
    reason: "Mengikuti kegiatan sekolah di luar.",
    createdAt: "2026-09-04T07:30:00",
  },
  {
    id: 10,
    name: "Budi Santoso",
    nisn: "1234567892",
    className: "XII TKJ 1",
    school: "SMK Negeri 1 Jakarta",
    date: "2026-09-03",
    type: "Keperluan Pribadi",
    reason: "Ada keperluan pribadi.",
    createdAt: "2026-09-03T07:05:00",
  },
  {
    id: 11,
    name: "Dina Permata",
    nisn: "1234567893",
    className: "XII RPL 2",
    school: "SMK Negeri 1 Jakarta",
    date: "2026-09-02",
    type: "Sakit",
    reason: "Sakit dan perlu beristirahat di rumah.",
    createdAt: "2026-09-02T07:55:00",
  },
  {
    id: 12,
    name: "Rizky Maulana",
    nisn: "1234567894",
    className: "XII TJKT 1",
    school: "SMK Negeri 2 Jakarta",
    date: "2026-09-01",
    type: "Lainnya",
    reason: "Ada keperluan mendesak.",
    createdAt: "2026-09-01T07:35:00",
  },
];

const ITEMS_PER_PAGE = 8;

const izinTypes = [
  "Semua Jenis",
  "Sakit",
  "Keperluan Keluarga",
  "Keperluan Pribadi",
  "Keperluan Sekolah",
  "Lainnya",
];

function formatDate(dateString) {
  return new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatMonth(monthString) {
  return new Date(
    `${monthString}-01T00:00:00`
  ).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function getTypeIcon(type) {
  if (type === "Sakit") {
    return Stethoscope;
  }

  if (type === "Keperluan Keluarga") {
    return Home;
  }

  if (type === "Keperluan Sekolah") {
    return School;
  }

  if (type === "Keperluan Pribadi") {
    return UserRound;
  }

  return FileText;
}

function getTypeClass(type) {
  if (type === "Sakit") {
    return "bg-red-50 text-red-600";
  }

  if (type === "Keperluan Keluarga") {
    return "bg-orange-50 text-orange-600";
  }

  if (type === "Keperluan Sekolah") {
    return "bg-blue-50 text-brand-blue";
  }

  if (type === "Keperluan Pribadi") {
    return "bg-purple-50 text-purple-600";
  }

  return "bg-gray-100 text-gray-600";
}

export default function Izin() {
  const [izin] = useState(initialIzin);

  const [search, setSearch] = useState("");

  const [monthFilter, setMonthFilter] =
    useState("2026-09");

  const [typeFilter, setTypeFilter] =
    useState("Semua Jenis");

  const [selectedIzin, setSelectedIzin] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const availableMonths = useMemo(() => {
    const months = [
      ...new Set(
        izin.map((item) =>
          item.date.slice(0, 7)
        )
      ),
    ];

    return months.sort().reverse();
  }, [izin]);

  const filteredIzin = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return izin.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.name
          .toLowerCase()
          .includes(keyword) ||
        item.nisn
          .toLowerCase()
          .includes(keyword) ||
        item.className
          .toLowerCase()
          .includes(keyword);

      const matchesMonth =
        !monthFilter ||
        item.date.startsWith(
          monthFilter
        );

      const matchesType =
        typeFilter === "Semua Jenis" ||
        item.type === typeFilter;

      return (
        matchesSearch &&
        matchesMonth &&
        matchesType
      );
    });
  }, [
    izin,
    search,
    monthFilter,
    typeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredIzin.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedIzin =
    filteredIzin.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const uniqueStudents = new Set(
    filteredIzin.map(
      (item) => item.nisn
    )
  ).size;

  const sickCount =
    filteredIzin.filter(
      (item) => item.type === "Sakit"
    ).length;

  const familyCount =
    filteredIzin.filter(
      (item) =>
        item.type ===
        "Keperluan Keluarga"
    ).length;

  const schoolCount =
    filteredIzin.filter(
      (item) =>
        item.type ===
        "Keperluan Sekolah"
    ).length;

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleMonthChange = (value) => {
    setMonthFilter(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setMonthFilter("2026-09");
    setTypeFilter("Semua Jenis");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-brand-blue mb-2">
                <FileText size={19} />

                <span className="text-sm font-semibold">
                  Manajemen Izin
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Data Izin
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Pantau izin siswa yang tercatat
                dalam sistem.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm">
              <CalendarDays
                size={18}
                className="text-brand-blue"
              />

              <span className="text-sm font-semibold text-gray-700">
                {formatMonth(monthFilter)}
              </span>
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Izin"
            value={filteredIzin.length}
            description="Sesuai filter"
            icon={ClipboardList}
            iconClass="bg-brand-blue-light text-brand-blue"
            valueClass="text-gray-900"
          />

          <StatCard
            label="Siswa Berizin"
            value={uniqueStudents}
            description="Siswa unik"
            icon={Users}
            iconClass="bg-purple-50 text-purple-600"
            valueClass="text-purple-600"
          />

          <StatCard
            label="Izin Sakit"
            value={sickCount}
            description="Tidak masuk karena sakit"
            icon={Stethoscope}
            iconClass="bg-red-50 text-red-600"
            valueClass="text-red-600"
          />

          <StatCard
            label="Keperluan"
            value={
              familyCount +
              schoolCount
            }
            description="Keluarga & sekolah"
            icon={School}
            iconClass="bg-orange-50 text-orange-600"
            valueClass="text-orange-600"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* FILTER */}
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col xl:flex-row gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* MONTH */}
                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    value={monthFilter}
                    onChange={(event) =>
                      handleMonthChange(
                        event.target.value
                      )
                    }
                    className="w-full sm:w-[190px] h-12 appearance-none pl-10 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                  >
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
                  </select>

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▾
                  </span>
                </div>

                {/* TYPE */}
                <div className="relative">
                  <Filter
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    value={typeFilter}
                    onChange={(event) =>
                      handleTypeChange(
                        event.target.value
                      )
                    }
                    className="w-full sm:w-[220px] h-12 appearance-none pl-10 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                  >
                    {izinTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▾
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">
                  Menampilkan{" "}
                  <span className="font-bold text-gray-700">
                    {filteredIzin.length}
                  </span>{" "}
                  izin
                </span>

                <span className="hidden sm:block text-gray-300">
                  •
                </span>

                <span className="text-xs font-semibold text-red-600">
                  Sakit {sickCount}
                </span>

                <span className="text-gray-300">
                  •
                </span>

                <span className="text-xs font-semibold text-orange-600">
                  Keperluan{" "}
                  {familyCount +
                    schoolCount}
                </span>
              </div>

              {(search ||
                monthFilter !==
                  "2026-09" ||
                typeFilter !==
                  "Semua Jenis") && (
                <button
                  type="button"
                  onClick={resetFilters}
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
                    Tanggal
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Jenis Izin
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Alasan
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Waktu Dicatat
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
                {paginatedIzin.length >
                0 ? (
                  paginatedIzin.map(
                    (item) => (
                      <IzinRow
                        key={item.id}
                        item={item}
                        onView={() =>
                          setSelectedIzin(
                            item
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

          {/* MOBILE */}
          <div className="lg:hidden divide-y divide-gray-100">
            {paginatedIzin.length > 0 ? (
              paginatedIzin.map(
                (item) => (
                  <IzinMobileCard
                    key={item.id}
                    item={item}
                    onView={() =>
                      setSelectedIzin(
                        item
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
          {filteredIzin.length > 0 && (
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
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                      length: totalPages,
                    },
                    (_, index) =>
                      index + 1
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
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
          )}
        </div>

        {/* INFO */}
        <div className="mt-6 flex gap-3 p-4 rounded-2xl bg-brand-blue-light border border-brand-blue/10">
          <CheckCircle2
            size={19}
            className="text-brand-blue shrink-0 mt-0.5"
          />

          <p className="text-sm text-brand-blue leading-relaxed">
            Izin yang diajukan siswa langsung
            tercatat di sistem tanpa proses
            persetujuan atau penolakan. Data saat
            ini masih menggunakan dummy untuk
            frontend dan nantinya akan diambil dari
            backend.
          </p>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedIzin && (
        <IzinDetailModal
          item={selectedIzin}
          onClose={() =>
            setSelectedIzin(null)
          }
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

function IzinRow({
  item,
  onView,
}) {
  const Icon = getTypeIcon(item.type);

  return (
    <tr className="hover:bg-gray-50/70 transition">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={item.name} />

          <div className="min-w-0">
            <p className="font-bold text-sm text-gray-900 truncate max-w-[180px]">
              {item.name}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {item.nisn} •{" "}
              {item.className}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">
          {formatDate(item.date)}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${getTypeClass(
            item.type
          )}`}
        >
          <Icon size={12} />

          {item.type}
        </span>
      </td>

      <td className="px-6 py-4">
        <p className="text-sm text-gray-600 max-w-[230px] truncate">
          {item.reason}
        </p>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Clock3
            size={14}
            className="text-gray-400"
          />

          {formatTime(item.createdAt)}
        </div>
      </td>

      <td className="px-6 py-4">
        <StatusBadge />
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onView}
            className="w-9 h-9 rounded-lg text-gray-500 hover:bg-brand-blue-light hover:text-brand-blue flex items-center justify-center transition"
            title="Lihat detail"
            aria-label="Lihat detail"
          >
            <Eye size={17} />
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
  const Icon = getTypeIcon(item.type);

  return (
    <div className="p-5">
      <div className="flex items-start gap-3">
        <Avatar name={item.name} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate">
                {item.name}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {item.nisn}
              </p>
            </div>

            <StatusBadge />
          </div>

          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${getTypeClass(
                item.type
              )}`}
            >
              <Icon size={12} />

              {item.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">
                Tanggal
              </p>

              <p className="text-xs font-semibold text-gray-700 mt-1">
                {formatDate(item.date)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">
                Dicatat
              </p>

              <p className="text-xs font-semibold text-gray-700 mt-1">
                {formatTime(
                  item.createdAt
                )}
              </p>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-gray-50">
            <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">
              Alasan
            </p>

            <p className="text-xs text-gray-600 leading-relaxed mt-1">
              {item.reason}
            </p>
          </div>

          <button
            type="button"
            onClick={onView}
            className="w-full mt-3 py-2.5 rounded-xl bg-brand-blue-light text-brand-blue text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-brand-blue/10 transition"
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
   AVATAR
===================================================== */

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((item) =>
      item.charAt(0)
    )
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

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold whitespace-nowrap">
      <CheckCircle2 size={12} />
      Tercatat
    </span>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState() {
  return (
    <div className="py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
        <FileText size={25} />
      </div>

      <h3 className="font-bold text-gray-800 mt-4">
        Data izin tidak ditemukan
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

function IzinDetailModal({
  item,
  onClose,
}) {
  const Icon = getTypeIcon(item.type);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="bg-brand-blue px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white text-brand-blue flex items-center justify-center">
                <FileText size={22} />
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  Detail Izin
                </h2>

                <p className="text-white/65 text-xs mt-1">
                  Informasi izin siswa
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

        {/* CONTENT */}
        <div className="p-6">
          {/* STUDENT */}
          <div className="flex items-center gap-3 mb-6">
            <Avatar name={item.name} />

            <div className="min-w-0 flex-1">
              <p className="font-bold text-lg text-gray-900">
                {item.name}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                NISN {item.nisn} •{" "}
                {item.className}
              </p>
            </div>

            <StatusBadge />
          </div>

          {/* TYPE */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${getTypeClass(
              item.type
            )}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center">
              <Icon size={19} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                Jenis Izin
              </p>

              <p className="text-sm font-bold mt-1">
                {item.type}
              </p>
            </div>
          </div>

          {/* DATE + TIME */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <DetailBox
              icon={CalendarDays}
              label="Tanggal Izin"
              value={formatDate(
                item.date
              )}
            />

            <DetailBox
              icon={Clock3}
              label="Waktu Dicatat"
              value={formatTime(
                item.createdAt
              )}
            />
          </div>

          {/* SCHOOL */}
          <div className="mt-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 text-brand-blue">
              <School size={16} />

              <span className="text-[10px] font-bold uppercase tracking-wide">
                Sekolah
              </span>
            </div>

            <p className="text-sm font-semibold text-gray-800 mt-2">
              {item.school}
            </p>
          </div>

          {/* REASON */}
          <div className="mt-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 text-brand-blue">
              <ClipboardList size={16} />

              <span className="text-[10px] font-bold uppercase tracking-wide">
                Alasan Izin
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mt-2">
              {item.reason}
            </p>
          </div>

          {/* STATUS INFO */}
          <div className="mt-3 p-4 rounded-xl bg-green-50 border border-green-100">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="text-green-600 mt-0.5 shrink-0"
              />

              <div>
                <p className="text-sm font-bold text-green-700">
                  Izin Tercatat
                </p>

                <p className="text-xs text-green-700/70 mt-1 leading-relaxed">
                  Izin ini sudah tercatat di sistem
                  dan tidak memerlukan proses
                  persetujuan admin.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition"
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
    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
      <div className="flex items-center gap-2 text-brand-blue">
        <Icon size={16} />

        <span className="text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-sm font-semibold text-gray-800 mt-2">
        {value}
      </p>
    </div>
  );
}