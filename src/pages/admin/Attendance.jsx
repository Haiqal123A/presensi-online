import { useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Users,
  UserCheck,
  Building2,
  Home,
  LogIn,
  LogOut,
  Eye,
  X,
  MapPin,
  Clock3,
  Camera,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/*
 * DATA DUMMY
 *
 * Nanti data ini diganti dengan response dari backend/API.
 */
const initialAttendance = [
  {
    id: 1,
    name: "Andi Setiawan",
    nisn: "1234567890",
    className: "XII RPL 1",
    date: "2026-09-10",
    time: "07:42",
    type: "Absen Masuk",
    location: "WFO",
    photo: null,
  },
  {
    id: 2,
    name: "Siti Rahma",
    nisn: "1234567891",
    className: "XII RPL 1",
    date: "2026-09-10",
    time: "07:48",
    type: "Absen Masuk",
    location: "WFO",
    photo: null,
  },
  {
    id: 3,
    name: "Budi Santoso",
    nisn: "1234567892",
    className: "XII TKJ 1",
    date: "2026-09-10",
    time: "08:03",
    type: "Absen Masuk",
    location: "WFH",
    photo: null,
  },
  {
    id: 4,
    name: "Dina Permata",
    nisn: "1234567893",
    className: "XII RPL 2",
    date: "2026-09-10",
    time: "08:11",
    type: "Absen Masuk",
    location: "WFO",
    photo: null,
  },
  {
    id: 5,
    name: "Rizky Maulana",
    nisn: "1234567894",
    className: "XII TJKT 1",
    date: "2026-09-10",
    time: "16:02",
    type: "Absen Pulang",
    location: "WFO",
    photo: null,
  },
  {
    id: 6,
    name: "Fajar Ramadhan",
    nisn: "1234567895",
    className: "XII RPL 2",
    date: "2026-09-10",
    time: "07:55",
    type: "Absen Masuk",
    location: "WFO",
    photo: null,
  },
  {
    id: 7,
    name: "Nabila Putri",
    nisn: "1234567896",
    className: "XII AKL 1",
    date: "2026-09-10",
    time: "08:17",
    type: "Absen Masuk",
    location: "WFH",
    photo: null,
  },
  {
    id: 8,
    name: "Dimas Saputra",
    nisn: "1234567897",
    className: "XI RPL 1",
    date: "2026-09-10",
    time: "07:51",
    type: "Absen Masuk",
    location: "WFO",
    photo: null,
  },
  {
    id: 9,
    name: "Putri Amelia",
    nisn: "1234567898",
    className: "XII AKL 1",
    date: "2026-09-10",
    time: "08:06",
    type: "Absen Masuk",
    location: "WFO",
    photo: null,
  },
  {
    id: 10,
    name: "Yoga Pratama",
    nisn: "1234567899",
    className: "XI TKJ 1",
    date: "2026-09-10",
    time: "07:59",
    type: "Absen Masuk",
    location: "WFH",
    photo: null,
  },
  {
    id: 11,
    name: "Aulia Safitri",
    nisn: "1234567800",
    className: "XII RPL 1",
    date: "2026-09-10",
    time: "07:45",
    type: "Absen Masuk",
    location: "WFO",
    photo: null,
  },
  {
    id: 12,
    name: "Galang Prakoso",
    nisn: "1234567801",
    className: "XII TJKT 1",
    date: "2026-09-10",
    time: "08:21",
    type: "Absen Masuk",
    location: "WFO",
    photo: null,
  },
  {
    id: 13,
    name: "Andi Setiawan",
    nisn: "1234567890",
    className: "XII RPL 1",
    date: "2026-09-10",
    time: "16:04",
    type: "Absen Pulang",
    location: "WFO",
    photo: null,
  },
  {
    id: 14,
    name: "Siti Rahma",
    nisn: "1234567891",
    className: "XII RPL 1",
    date: "2026-09-10",
    time: "16:08",
    type: "Absen Pulang",
    location: "WFO",
    photo: null,
  },
  {
    id: 15,
    name: "Budi Santoso",
    nisn: "1234567892",
    className: "XII TKJ 1",
    date: "2026-09-10",
    time: "16:15",
    type: "Absen Pulang",
    location: "WFH",
    photo: null,
  },
];

const ITEMS_PER_PAGE = 8;

function formatDate(dateString) {
  return new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


export default function Attendance() {
  const [attendance] = useState(
    initialAttendance
  );

  const [search, setSearch] = useState("");

  const [dateFilter, setDateFilter] =
    useState("2026-09-10");

  const [typeFilter, setTypeFilter] =
    useState("Semua Jenis");

  const [locationFilter, setLocationFilter] =
    useState("Semua Lokasi");

  const [selectedAttendance, setSelectedAttendance] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const filteredAttendance = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return attendance.filter((item) => {
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

      const matchesDate =
        !dateFilter ||
        item.date === dateFilter;

      const matchesType =
        typeFilter === "Semua Jenis" ||
        item.type === typeFilter;

      const matchesLocation =
        locationFilter === "Semua Lokasi" ||
        item.location === locationFilter;

      return (
        matchesSearch &&
        matchesDate &&
        matchesType &&
        matchesLocation
      );
    });
  }, [
    attendance,
    search,
    dateFilter,
    typeFilter,
    locationFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAttendance.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedAttendance =
    filteredAttendance.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const totalAttendance =
    filteredAttendance.length;

  const uniqueStudents = new Set(
    filteredAttendance.map(
      (item) => item.nisn
    )
  ).size;

  const masukCount =
    filteredAttendance.filter(
      (item) =>
        item.type === "Absen Masuk"
    ).length;

  const pulangCount =
    filteredAttendance.filter(
      (item) =>
        item.type === "Absen Pulang"
    ).length;

  const wfoCount =
    filteredAttendance.filter(
      (item) => item.location === "WFO"
    ).length;

  const wfhCount =
    filteredAttendance.filter(
      (item) => item.location === "WFH"
    ).length;

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDateChange = (value) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleLocationChange = (value) => {
    setLocationFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setDateFilter("2026-09-10");
    setTypeFilter("Semua Jenis");
    setLocationFilter("Semua Lokasi");
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
                <Clock3 size={19} />

                <span className="text-sm font-semibold">
                  Manajemen Absensi
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Data Absensi
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Pantau seluruh aktivitas absensi
                siswa PKL.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm">
              <CalendarDays
                size={18}
                className="text-brand-blue"
              />

              <span className="text-sm font-semibold text-gray-700">
                {formatDate(dateFilter)}
              </span>
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Absensi"
            value={totalAttendance}
            description="Data sesuai filter"
            icon={Users}
            iconClass="bg-brand-blue-light text-brand-blue"
            valueClass="text-gray-900"
          />

          <StatCard
            label="Absen Masuk"
            value={masukCount}
            description={`${uniqueStudents} siswa`}
            icon={LogIn}
            iconClass="bg-green-50 text-green-600"
            valueClass="text-green-600"
          />

          <StatCard
            label="Absen Pulang"
            value={pulangCount}
            description={`${uniqueStudents} siswa`}
            icon={LogOut}
            iconClass="bg-orange-50 text-orange-600"
            valueClass="text-orange-600"
          />

          <StatCard
            label="WFO"
            value={wfoCount}
            description={`${wfhCount} siswa WFH`}
            icon={Building2}
            iconClass="bg-purple-50 text-purple-600"
            valueClass="text-purple-600"
          />
        </div>

        {/* FILTER + TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* FILTER HEADER */}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* DATE */}
                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(event) =>
                      handleDateChange(
                        event.target.value
                      )
                    }
                    className="w-full h-12 pl-10 pr-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                  />
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
                    className="w-full h-12 appearance-none pl-10 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                  >
                    <option value="Semua Jenis">
                      Semua Jenis
                    </option>

                    <option value="Absen Masuk">
                      Absen Masuk
                    </option>

                    <option value="Absen Pulang">
                      Absen Pulang
                    </option>
                  </select>

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▾
                  </span>
                </div>

                {/* LOCATION */}
                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    value={locationFilter}
                    onChange={(event) =>
                      handleLocationChange(
                        event.target.value
                      )
                    }
                    className="w-full h-12 appearance-none pl-10 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                  >
                    <option value="Semua Lokasi">
                      Semua Lokasi
                    </option>

                    <option value="WFO">
                      WFO
                    </option>

                    <option value="WFH">
                      WFH
                    </option>
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
                    {filteredAttendance.length}
                  </span>{" "}
                  data
                </span>

                <span className="hidden sm:block text-gray-300">
                  •
                </span>

                <span className="text-xs font-semibold text-brand-blue">
                  WFO {wfoCount}
                </span>

                <span className="text-gray-300">
                  •
                </span>

                <span className="text-xs font-semibold text-orange-600">
                  WFH {wfhCount}
                </span>
              </div>

              {(search ||
                dateFilter !==
                  "2026-09-10" ||
                typeFilter !==
                  "Semua Jenis" ||
                locationFilter !==
                  "Semua Lokasi") && (
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
                    Waktu
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Jenis
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Lokasi
                  </th>


                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedAttendance.length >
                0 ? (
                  paginatedAttendance.map(
                    (item) => (
                      <AttendanceRow
                        key={item.id}
                        item={item}
                        onView={() =>
                          setSelectedAttendance(
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
            {paginatedAttendance.length >
            0 ? (
              paginatedAttendance.map(
                (item) => (
                  <AttendanceMobileCard
                    key={item.id}
                    item={item}
                    onView={() =>
                      setSelectedAttendance(
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
          {filteredAttendance.length > 0 && (
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
          <MapPin
            size={19}
            className="text-brand-blue shrink-0 mt-0.5"
          />

          <p className="text-sm text-brand-blue leading-relaxed">
            Data absensi saat ini masih menggunakan
            data dummy untuk frontend. Data foto, WFO/WFH, serta waktu absensi nantinya
            akan diambil langsung dari backend. Koordinat
            dan jarak perangkat tidak ditampilkan di panel admin.
          </p>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedAttendance && (
        <AttendanceDetailModal
          item={selectedAttendance}
          onClose={() =>
            setSelectedAttendance(null)
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

function AttendanceRow({
  item,
  onView,
}) {
  const isMasuk =
    item.type === "Absen Masuk";

  return (
    <tr className="hover:bg-gray-50/70 transition">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={item.name} />

          <div className="min-w-0">
            <p className="font-bold text-sm text-gray-900 truncate max-w-[190px]">
              {item.name}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {item.nisn} • {item.className}
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
        <span className="text-sm font-bold text-brand-blue">
          {item.time}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
            isMasuk
              ? "bg-green-50 text-green-700"
              : "bg-orange-50 text-orange-700"
          }`}
        >
          {isMasuk ? (
            <LogIn size={12} />
          ) : (
            <LogOut size={12} />
          )}

          {item.type}
        </span>
      </td>

      <td className="px-6 py-4">
        <LocationBadge
          location={item.location}
        />
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

function AttendanceMobileCard({
  item,
  onView,
}) {
  const isMasuk =
    item.type === "Absen Masuk";

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

            <LocationBadge
              location={item.location}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                isMasuk
                  ? "bg-green-50 text-green-700"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              {isMasuk ? (
                <LogIn size={12} />
              ) : (
                <LogOut size={12} />
              )}

              {item.type}
            </span>

            <span className="text-xs text-gray-400">
              •
            </span>

            <span className="text-xs font-bold text-brand-blue">
              {item.time}
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
   LOCATION BADGE
===================================================== */

function LocationBadge({
  location,
}) {
  const isWFO = location === "WFO";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
        isWFO
          ? "bg-blue-50 text-brand-blue"
          : "bg-orange-50 text-orange-700"
      }`}
    >
      {isWFO ? (
        <Building2 size={12} />
      ) : (
        <Home size={12} />
      )}

      {location}
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
        <Clock3 size={25} />
      </div>

      <h3 className="font-bold text-gray-800 mt-4">
        Data absensi tidak ditemukan
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

function AttendanceDetailModal({
  item,
  onClose,
}) {
  const isMasuk =
    item.type === "Absen Masuk";

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
                {isMasuk ? (
                  <LogIn size={22} />
                ) : (
                  <LogOut size={22} />
                )}
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  Detail Absensi
                </h2>

                <p className="text-white/65 text-xs mt-1">
                  Informasi aktivitas absensi siswa
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

            <LocationBadge
              location={item.location}
            />
          </div>

          {/* TYPE + TIME */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <DetailBox
              icon={
                isMasuk ? LogIn : LogOut
              }
              label="Jenis Absensi"
              value={item.type}
            />

            <DetailBox
              icon={Clock3}
              label="Waktu"
              value={item.time}
            />
          </div>

          {/* DATE */}
          <div className="grid grid-cols-1 gap-3">
            <DetailBox
              icon={CalendarDays}
              label="Tanggal"
              value={formatDate(
                item.date
              )}
            />
          </div>

          {/* PHOTO */}
          <div className="mt-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 text-brand-blue">
              <Camera size={17} />

              <span className="text-xs font-bold uppercase tracking-wide">
                Foto Bukti Absensi
              </span>
            </div>

            {item.photo ? (
              <img
                src={item.photo}
                alt={`Bukti absensi ${item.name}`}
                className="w-full h-56 object-cover rounded-xl mt-3"
              />
            ) : (
              <div className="h-40 rounded-xl bg-white border border-dashed border-gray-200 flex flex-col items-center justify-center mt-3">
                <Camera
                  size={25}
                  className="text-gray-300"
                />

                <p className="text-xs text-gray-400 mt-2">
                  Foto dummy belum tersedia
                </p>
              </div>
            )}
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