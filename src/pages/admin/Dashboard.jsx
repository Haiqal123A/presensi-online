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
} from "lucide-react";

const adminStats = [
  {
    label: "Total Siswa",
    value: "120",
    description: "Siswa PKL terdaftar",
    icon: Users,
    iconClass:
      "bg-blue-50 text-brand-blue",
  },
  {
    label: "Hadir Hari Ini",
    value: "96",
    description: "Sudah melakukan absensi",
    icon: UserCheck,
    iconClass:
      "bg-green-50 text-green-600",
  },
  {
    label: "Belum Absen",
    value: "18",
    description: "Belum melakukan absensi",
    icon: UserX,
    iconClass:
      "bg-orange-50 text-orange-600",
  },
  {
    label: "Izin Hari Ini",
    value: "6",
    description: "Izin tercatat hari ini",
    icon: FileText,
    iconClass:
      "bg-purple-50 text-purple-600",
  },
];

const recentAttendance = [
  {
    id: 1,
    name: "Andi Setiawan",
    nisn: "1234567890",
    type: "Absen Masuk",
    time: "07:42",
    location: "WFO",
  },
  {
    id: 2,
    name: "Siti Rahma",
    nisn: "1234567891",
    type: "Absen Masuk",
    time: "07:48",
    location: "WFO",
  },
  {
    id: 3,
    name: "Budi Santoso",
    nisn: "1234567892",
    type: "Absen Masuk",
    time: "08:03",
    location: "WFH",
  },
  {
    id: 4,
    name: "Dina Permata",
    nisn: "1234567893",
    type: "Absen Masuk",
    time: "08:11",
    location: "WFO",
  },
  {
    id: 5,
    name: "Rizky Maulana",
    nisn: "1234567894",
    type: "Absen Pulang",
    time: "16:02",
    location: "WFO",
  },
];

const recentIzin = [
  {
    id: 1,
    name: "Fajar Ramadhan",
    type: "Sakit",
    date: "10 September 2026",
    reason: "Demam dan perlu beristirahat.",
  },
  {
    id: 2,
    name: "Nabila Putri",
    type: "Keperluan Keluarga",
    date: "10 September 2026",
    reason: "Ada keperluan keluarga.",
  },
  {
    id: 3,
    name: "Dimas Saputra",
    type: "Keperluan Sekolah",
    date: "10 September 2026",
    reason: "Mengikuti kegiatan sekolah.",
  },
];

export default function Dashboard() {
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

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm">
              <CalendarDays
                size={17}
                className="text-brand-blue"
              />

              <span className="text-sm font-semibold text-gray-700">
                10 September 2026
              </span>
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {adminStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {stat.label}
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.iconClass}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
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
                  96
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  80% dari total siswa
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
                  18
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  15% dari total siswa
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
                  6
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  5% dari total siswa
                </p>
              </div>
            </div>
          </div>

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
                    82 siswa
                  </span>
                </div>

                <div className="h-2 bg-white/15 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-brand-yellow rounded-full"
                    style={{ width: "85%" }}
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
                    14 siswa
                  </span>
                </div>

                <div className="h-2 bg-white/15 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: "15%" }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 mt-7 pt-5">
              <p className="text-xs text-white/60">
                Berdasarkan siswa yang sudah
                melakukan absensi hari ini.
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

                <ClipboardIcon />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {recentAttendance.map(
                (item) => (
                  <div
                    key={item.id}
                    className="p-5 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                      {item.type ===
                      "Absen Masuk" ? (
                        <LogInIcon />
                      ) : (
                        <LogOutIcon />
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
                              : "text-orange-600"
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
                )
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                type="button"
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
              {recentIzin.map((item) => (
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

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold self-start">
                          <CheckCircle2
                            size={12}
                          />
                          Tercatat
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
              ))}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                type="button"
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
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
              <AlertCircle size={19} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Dashboard Admin
              </h3>

              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Data pada dashboard ini sementara
                menggunakan data dummy frontend.
                Setelah backend siap, seluruh statistik,
                aktivitas absensi, dan data izin akan
                diambil secara langsung dari database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ICON HELPERS */

function ClipboardIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
      <ClipboardListIcon />
    </div>
  );
}

function ClipboardListIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        width="8"
        height="4"
        x="8"
        y="2"
        rx="1"
      />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 14h6" />
      <path d="M9 18h6" />
      <path d="M9 10h6" />
    </svg>
  );
}

function LogInIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line
        x1="15"
        x2="3"
        y1="12"
        y2="12"
      />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line
        x1="21"
        x2="9"
        y1="12"
        y2="12"
      />
    </svg>
  );
}