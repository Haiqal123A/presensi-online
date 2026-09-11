import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ClipboardList,
  CalendarDays,
  Clock3,
  Building2,
  Home,
  CheckCircle2,
  FileText,
  Clock,
  Printer,
  ChevronDown,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getAttendanceHistory,
  getMyIzin,
} from "../../services/api";

const MAX_IZIN_PER_MONTH = 4;
const ATTENDANCE_PAGE_LIMIT = 10;

const getMonthKey = (date = new Date(), offset = 0) => {
  const result = new Date(
    date.getFullYear(),
    date.getMonth() - offset,
    1
  );

  const year = result.getFullYear();
  const month = String(
    result.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
};

const getMonthLabel = (monthKey) => {
  if (!monthKey) return "-";

  const [year, month] = monthKey.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

const formatDate = (date) => {
  if (!date) return "-";

  const normalizedDate =
    typeof date === "string" && date.length >= 10
      ? date.slice(0, 10)
      : date;

  const parsedDate = new Date(
    `${normalizedDate}T00:00:00`
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return "-";

  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const formatTime = (value) => {
  if (!value) return "--:--";

  if (
    typeof value === "string" &&
    /^\d{1,2}:\d{2}/.test(value)
  ) {
    return value.slice(0, 5);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "--:--";
  }

  return parsedDate.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }
  );
};

const normalizeWorkMode = (value) => {
  if (!value) return "-";

  const normalized = String(value)
    .trim()
    .toUpperCase();

  if (normalized === "WFO") {
    return "WFO";
  }

  if (normalized === "WFH") {
    return "WFH";
  }

  return normalized;
};

const normalizeAttendanceDate = (item) => {
  return (
    item?.attendance_date ||
    item?.attendanceDate ||
    item?.date ||
    item?.tanggal ||
    item?.tanggal_absensi ||
    null
  );
};

const getCheckInValue = (item) => {
  return (
    item?.check_in ||
    item?.checkIn ||
    item?.masuk ||
    item?.jam_masuk ||
    item?.waktu_masuk ||
    null
  );
};

const getCheckOutValue = (item) => {
  return (
    item?.check_out ||
    item?.checkOut ||
    item?.pulang ||
    item?.jam_pulang ||
    item?.waktu_pulang ||
    null
  );
};

const getWorkModeValue = (item, type) => {
  if (type === "masuk") {
    return normalizeWorkMode(
      item?.check_in_work_mode ||
        item?.checkInWorkMode ||
        item?.work_mode_masuk ||
        item?.workModeMasuk ||
        item?.masuk?.work_mode ||
        item?.masuk?.workMode ||
        item?.work_mode
    );
  }

  return normalizeWorkMode(
    item?.check_out_work_mode ||
      item?.checkOutWorkMode ||
      item?.work_mode_pulang ||
      item?.workModePulang ||
      item?.pulang?.work_mode ||
      item?.pulang?.workMode ||
      item?.work_mode
  );
};

const getNestedTime = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value.time ||
      value.timestamp ||
      value.at ||
      value.created_at ||
      value.createdAt ||
      null
    );
  }

  return null;
};

const buildAttendanceItems = (records) => {
  if (!Array.isArray(records)) {
    return [];
  }

  const items = [];

  records.forEach((record, index) => {
    const date = normalizeAttendanceDate(record);

    if (!date) {
      return;
    }

    const checkInRaw =
      getCheckInValue(record);

    const checkOutRaw =
      getCheckOutValue(record);

    const checkIn =
      getNestedTime(checkInRaw);

    const checkOut =
      getNestedTime(checkOutRaw);

    if (checkIn) {
      items.push({
        id: `${date}-masuk-${
          record?.id || index
        }`,
        type: "Absen Masuk",
        date: String(date).slice(0, 10),
        time: formatTime(checkIn),
        timestamp:
          typeof checkIn === "string" &&
          checkIn.includes("T")
            ? checkIn
            : null,
        workLocation:
          getWorkModeValue(
            record,
            "masuk"
          ),
      });
    }

    if (checkOut) {
      items.push({
        id: `${date}-pulang-${
          record?.id || index
        }`,
        type: "Absen Pulang",
        date: String(date).slice(0, 10),
        time: formatTime(checkOut),
        timestamp:
          typeof checkOut === "string" &&
          checkOut.includes("T")
            ? checkOut
            : null,
        workLocation:
          getWorkModeValue(
            record,
            "pulang"
          ),
      });
    }
  });

  return items;
};

const normalizeIzinItem = (item, index) => {
  const startDate =
    item?.tanggal_mulai ||
    item?.tanggalMulai ||
    item?.start_date ||
    item?.startDate ||
    item?.date ||
    item?.tanggal ||
    null;

  const endDate =
    item?.tanggal_selesai ||
    item?.tanggalSelesai ||
    item?.end_date ||
    item?.endDate ||
    startDate;

  const createdAt =
    item?.created_at ||
    item?.createdAt ||
    item?.submitted_at ||
    item?.submittedAt ||
    null;

  const tipeIzin =
    item?.tipe_izin ||
    item?.tipeIzin ||
    item?.type ||
    item?.jenis ||
    "-";

  const alasan =
    item?.alasan ||
    item?.reason ||
    item?.keterangan ||
    "-";

  const status =
    item?.status ||
    item?.approval_status ||
    item?.approvalStatus ||
    "MENUNGGU";

  return {
    id:
      item?.id ||
      item?._id ||
      `izin-${index}`,
    type:
      String(tipeIzin).toLowerCase() ===
      "sakit"
        ? "Sakit"
        : String(tipeIzin).toLowerCase() ===
          "izin"
        ? "Izin"
        : tipeIzin,
    date: startDate
      ? String(startDate).slice(0, 10)
      : null,
    endDate: endDate
      ? String(endDate).slice(0, 10)
      : null,
    reason: alasan,
    status: String(status).toUpperCase(),
    createdAt,
  };
};

const getStatusStyle = (status) => {
  switch (status) {
    case "DITERIMA":
      return {
        className:
          "bg-green-50 text-green-700",
        label: "Diterima",
      };

    case "DITOLAK":
      return {
        className:
          "bg-red-50 text-red-700",
        label: "Ditolak",
      };

    default:
      return {
        className:
          "bg-yellow-50 text-yellow-700",
        label: "Menunggu",
      };
  }
};

export default function AttendanceHistory() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const initialTab =
    searchParams.get("tab") === "izin"
      ? "izin"
      : "absen";

  const [activeTab, setActiveTab] =
    useState(initialTab);

  const [selectedMonth, setSelectedMonth] =
    useState(getMonthKey());

  const [attendanceItems, setAttendanceItems] =
    useState([]);

  const [izinData, setIzinData] =
    useState([]);

  const [attendancePage, setAttendancePage] =
    useState(1);

  const [
    attendancePagination,
    setAttendancePagination,
  ] = useState({
    page: 1,
    limit: ATTENDANCE_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [attendanceLoading, setAttendanceLoading] =
    useState(true);

  const [izinLoading, setIzinLoading] =
    useState(true);

  const [attendanceError, setAttendanceError] =
    useState("");

  const [izinError, setIzinError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  useEffect(() => {
    const tab =
      searchParams.get("tab") === "izin"
        ? "izin"
        : "absen";

    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    setAttendancePage(1);
  }, [selectedMonth]);

  useEffect(() => {
    let cancelled = false;

    const loadAttendance = async () => {
      setAttendanceLoading(true);
      setAttendanceError("");

      try {
        const [year, month] =
          selectedMonth.split("-");

        const response =
          await getAttendanceHistory({
            page: attendancePage,
            limit: ATTENDANCE_PAGE_LIMIT,
            month: Number(month),
            year: Number(year),
          });

        if (cancelled) return;

        const responseData =
          response?.data;

        let records = [];

        if (
          Array.isArray(responseData)
        ) {
          records = responseData;
        } else if (
          Array.isArray(
            responseData?.data
          )
        ) {
          records =
            responseData.data;
        } else if (
          Array.isArray(
            responseData?.items
          )
        ) {
          records =
            responseData.items;
        } else if (
          Array.isArray(
            responseData?.records
          )
        ) {
          records =
            responseData.records;
        } else if (
          Array.isArray(
            response?.items
          )
        ) {
          records =
            response.items;
        } else if (
          Array.isArray(
            response?.records
          )
        ) {
          records =
            response.records;
        }

        setAttendanceItems(
          buildAttendanceItems(records)
        );

        const paginationSource =
          responseData?.pagination ||
          responseData?.meta ||
          response?.pagination ||
          response?.meta ||
          {};

        const currentPage =
          Number(
            paginationSource?.page ||
              paginationSource?.current_page ||
              paginationSource?.currentPage ||
              attendancePage
          );

        const limit =
          Number(
            paginationSource?.limit ||
              paginationSource?.per_page ||
              paginationSource?.perPage ||
              ATTENDANCE_PAGE_LIMIT
          );

        const total =
          Number(
            paginationSource?.total ||
              paginationSource?.total_count ||
              paginationSource?.totalCount ||
              records.length
          );

        const totalPages =
          Number(
            paginationSource?.total_pages ||
              paginationSource?.totalPages ||
              Math.max(
                1,
                Math.ceil(
                  total / limit
                )
              )
          );

        setAttendancePagination({
          page: currentPage,
          limit,
          total,
          totalPages:
            Math.max(1, totalPages),
        });
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Gagal mengambil riwayat absensi:",
          error
        );

        setAttendanceItems([]);
        setAttendancePagination({
          page: attendancePage,
          limit: ATTENDANCE_PAGE_LIMIT,
          total: 0,
          totalPages: 1,
        });

        setAttendanceError(
          error?.message ||
            "Gagal mengambil riwayat absensi."
        );
      } finally {
        if (!cancelled) {
          setAttendanceLoading(false);
        }
      }
    };

    loadAttendance();

    return () => {
      cancelled = true;
    };
  }, [selectedMonth, attendancePage]);

  useEffect(() => {
    let cancelled = false;

    const loadIzin = async () => {
      setIzinLoading(true);
      setIzinError("");

      try {
        const response =
          await getMyIzin();

        if (cancelled) return;

        let records = [];

        if (
          Array.isArray(response?.data)
        ) {
          records = response.data;
        } else if (
          Array.isArray(
            response?.data?.data
          )
        ) {
          records =
            response.data.data;
        } else if (
          Array.isArray(
            response?.data?.items
          )
        ) {
          records =
            response.data.items;
        } else if (
          Array.isArray(
            response?.data?.records
          )
        ) {
          records =
            response.data.records;
        } else if (
          Array.isArray(response?.items)
        ) {
          records =
            response.items;
        } else if (
          Array.isArray(response?.records)
        ) {
          records =
            response.records;
        }

        setIzinData(
          records.map(
            normalizeIzinItem
          )
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Gagal mengambil riwayat izin:",
          error
        );

        setIzinData([]);
        setIzinError(
          error?.message ||
            "Gagal mengambil riwayat izin."
        );
      } finally {
        if (!cancelled) {
          setIzinLoading(false);
        }
      }
    };

    loadIzin();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setSearchParams({
      tab,
    });
  };

  const monthOptions = useMemo(() => {
    return [
      {
        value: getMonthKey(
          new Date(),
          0
        ),
        label: "Bulan ini",
      },
      {
        value: getMonthKey(
          new Date(),
          1
        ),
        label: "Bulan lalu",
      },
      {
        value: getMonthKey(
          new Date(),
          2
        ),
        label: "2 bulan lalu",
      },
      {
        value: getMonthKey(
          new Date(),
          3
        ),
        label: "3 bulan lalu",
      },
    ];
  }, []);

  const filteredIzinData = useMemo(() => {
    return izinData
      .filter((item) => {
        if (!item.date) return false;

        return item.date.startsWith(
          selectedMonth
        );
      })
      .sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(
              a.createdAt
            ).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(
              b.createdAt
            ).getTime()
          : 0;

        return dateB - dateA;
      });
  }, [izinData, selectedMonth]);

  const absenMasukCount =
    attendanceItems.filter(
      (item) =>
        item.type === "Absen Masuk"
    ).length;

  const absenPulangCount =
    attendanceItems.filter(
      (item) =>
        item.type === "Absen Pulang"
    ).length;

  const totalIzinBulanIni =
    filteredIzinData.length;

  const sisaIzinBulanIni = Math.max(
    0,
    MAX_IZIN_PER_MONTH -
      totalIzinBulanIni
  );

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      const [year, month] =
        selectedMonth.split("-");

      const [
        attendanceResponse,
        izinResponse,
      ] = await Promise.all([
        getAttendanceHistory({
          page: attendancePage,
          limit: ATTENDANCE_PAGE_LIMIT,
          month: Number(month),
          year: Number(year),
        }),
        getMyIzin(),
      ]);

      let attendanceRecords = [];

      const attendanceData =
        attendanceResponse?.data;

      if (
        Array.isArray(attendanceData)
      ) {
        attendanceRecords =
          attendanceData;
      } else if (
        Array.isArray(
          attendanceData?.data
        )
      ) {
        attendanceRecords =
          attendanceData.data;
      } else if (
        Array.isArray(
          attendanceData?.items
        )
      ) {
        attendanceRecords =
          attendanceData.items;
      } else if (
        Array.isArray(
          attendanceData?.records
        )
      ) {
        attendanceRecords =
          attendanceData.records;
      }

      setAttendanceItems(
        buildAttendanceItems(
          attendanceRecords
        )
      );

      const izinRecords =
        Array.isArray(
          izinResponse?.data
        )
          ? izinResponse.data
          : Array.isArray(
              izinResponse?.data?.data
            )
          ? izinResponse.data.data
          : Array.isArray(
              izinResponse?.data?.items
            )
          ? izinResponse.data.items
          : Array.isArray(
              izinResponse?.data?.records
            )
          ? izinResponse.data.records
          : [];

      setIzinData(
        izinRecords.map(
          normalizeIzinItem
        )
      );

      setAttendanceError("");
      setIzinError("");
    } catch (error) {
      console.error(
        "Gagal refresh riwayat:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  };

  const goToPreviousPage = () => {
    setAttendancePage((page) =>
      Math.max(1, page - 1)
    );
  };

  const goToNextPage = () => {
    setAttendancePage((page) =>
      Math.min(
        attendancePagination.totalPages,
        page + 1
      )
    );
  };

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 16mm;
            }

            body {
              background: white !important;
            }

            body * {
              visibility: hidden;
            }

            .print-area,
            .print-area * {
              visibility: visible;
            }

            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
            }

            .no-print {
              display: none !important;
            }

            .print-card {
              box-shadow: none !important;
              border: 1px solid #e5e7eb !important;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-50 print-area">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* HEADER */}
          <div className="mb-6 no-print">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-brand-blue mb-2">
                  <ClipboardList size={20} />

                  <span className="text-sm font-semibold">
                    Riwayat
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                  Riwayat Kehadiran
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Lihat riwayat absensi dan
                  izin berdasarkan periode.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition disabled:opacity-60"
                >
                  {refreshing ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw size={18} />
                  )}

                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition"
                >
                  <Printer size={18} />
                  Cetak / Simpan PDF
                </button>
              </div>
            </div>
          </div>

          {/* PRINT HEADER */}
          <div className="hidden print:block mb-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-5">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">
                  ABSENKU
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Laporan Riwayat Kehadiran PKL
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">
                  Periode
                </p>

                <p className="font-bold text-gray-900">
                  {getMonthLabel(
                    selectedMonth
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* FILTER */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarDays size={19} />

                <span className="text-sm font-bold">
                  Periode
                </span>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(
                      event.target.value
                    )
                  }
                  className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm font-semibold text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                >
                  {monthOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={
                          option.value
                        }
                      >
                        {option.label} —{" "}
                        {getMonthLabel(
                          option.value
                        )}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              <div className="sm:ml-auto">
                <span className="inline-flex items-center px-3 py-2 rounded-lg bg-brand-blue-light text-brand-blue text-xs font-bold">
                  {getMonthLabel(
                    selectedMonth
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* PRINT PERIOD */}
          <div className="hidden print:flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Periode laporan
              </p>

              <p className="text-lg font-bold text-gray-900 mt-1">
                {getMonthLabel(
                  selectedMonth
                )}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">
                Dicetak
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-1">
                {new Date().toLocaleString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            </div>
          </div>

          {/* TABS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 mb-6 no-print">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleTabChange(
                    "absen"
                  )
                }
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition ${
                  activeTab === "absen"
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ClipboardList size={18} />
                Riwayat Absen
              </button>

              <button
                type="button"
                onClick={() =>
                  handleTabChange(
                    "izin"
                  )
                }
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition ${
                  activeTab === "izin"
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FileText size={18} />
                Riwayat Izin
              </button>
            </div>
          </div>

          {/* PRINT TAB TITLE */}
          <div className="hidden print:block mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {activeTab === "absen"
                ? "Riwayat Absensi"
                : "Riwayat Izin"}
            </h2>
          </div>

          {/* ========================= */}
          {/* RIWAYAT ABSEN */}
          {/* ========================= */}

          {activeTab === "absen" && (
            <div>
              {/* STATISTIC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Total Absen
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center">
                      <ClipboardList size={17} />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 mt-3">
                    {attendancePagination.total ||
                      attendanceItems.length}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Aktivitas absensi
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Absen Masuk
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
                      <LogIn size={17} />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-brand-blue mt-3">
                    {absenMasukCount}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Pada halaman ini
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Absen Pulang
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <LogOut size={17} />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-green-600 mt-3">
                    {absenPulangCount}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Pada halaman ini
                  </p>
                </div>
              </div>

              {attendanceLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center print-card">
                  <Loader2
                    size={30}
                    className="animate-spin text-brand-blue mx-auto"
                  />

                  <h2 className="font-bold text-gray-900 mt-4">
                    Memuat riwayat absensi...
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    Mengambil data terbaru dari
                    server.
                  </p>
                </div>
              ) : attendanceError ? (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center print-card">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                    <AlertCircle size={26} />
                  </div>

                  <h2 className="font-bold text-gray-900 mt-4">
                    Gagal memuat riwayat
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    {attendanceError}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setAttendancePage(
                        (page) => page
                      )
                    }
                    className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition"
                  >
                    <RefreshCw size={16} />
                    Coba lagi
                  </button>
                </div>
              ) : attendanceItems.length ===
                0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center print-card">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <ClipboardList size={26} />
                  </div>

                  <h2 className="font-bold text-gray-900 mt-4">
                    Belum ada riwayat absen
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    Tidak ada data absensi pada
                    periode{" "}
                    {getMonthLabel(
                      selectedMonth
                    )}
                    .
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {attendanceItems.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-11 h-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                                {item.type ===
                                "Absen Masuk" ? (
                                  <Clock3
                                    size={21}
                                  />
                                ) : (
                                  <CheckCircle2
                                    size={21}
                                  />
                                )}
                              </div>

                              <div>
                                <h2 className="font-bold text-gray-900">
                                  {item.type}
                                </h2>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <CalendarDays
                                    size={15}
                                  />

                                  <span>
                                    {formatDate(
                                      item.date
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-2xl font-bold text-brand-blue">
                                {item.time ||
                                  "--:--"}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                Waktu absensi
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 mt-5 pt-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                item.workLocation ===
                                "WFO"
                                  ? "bg-blue-50 text-brand-blue"
                                  : item.workLocation ===
                                    "WFH"
                                  ? "bg-orange-50 text-orange-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.workLocation ===
                              "WFO" ? (
                                <Building2
                                  size={14}
                                />
                              ) : (
                                <Home
                                  size={14}
                                />
                              )}

                              {item.workLocation ||
                                "-"}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* PAGINATION */}
                  {attendancePagination.totalPages >
                    1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 no-print">
                      <p className="text-sm text-gray-500">
                        Halaman{" "}
                        <span className="font-bold text-gray-700">
                          {
                            attendancePagination.page
                          }
                        </span>{" "}
                        dari{" "}
                        <span className="font-bold text-gray-700">
                          {
                            attendancePagination.totalPages
                          }
                        </span>
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={
                            goToPreviousPage
                          }
                          disabled={
                            attendancePage <=
                            1
                          }
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft
                            size={17}
                          />
                          Sebelumnya
                        </button>

                        <button
                          type="button"
                          onClick={
                            goToNextPage
                          }
                          disabled={
                            attendancePage >=
                            attendancePagination.totalPages
                          }
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Berikutnya
                          <ChevronRight
                            size={17}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* PRINT FOOTER */}
              <div className="hidden print:block mt-8 pt-5 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>
                    ABSENKU — Sistem Absensi PKL
                  </span>

                  <span>
                    Periode{" "}
                    {getMonthLabel(
                      selectedMonth
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================= */}
          {/* RIWAYAT IZIN */}
          {/* ========================= */}

          {activeTab === "izin" && (
            <div>
              {/* STATISTIC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Total Izin
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center">
                      <FileText size={17} />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 mt-3">
                    {totalIzinBulanIni}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Periode terpilih
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Kuota Izin
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
                      <ClipboardList size={17} />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-brand-blue mt-3">
                    {totalIzinBulanIni} /{" "}
                    {MAX_IZIN_PER_MONTH}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Digunakan pada periode
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Sisa Kuota
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <CheckCircle2 size={17} />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-green-600 mt-3">
                    {sisaIzinBulanIni}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Izin tersedia
                  </p>
                </div>
              </div>

              {izinLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center print-card">
                  <Loader2
                    size={30}
                    className="animate-spin text-brand-blue mx-auto"
                  />

                  <h2 className="font-bold text-gray-900 mt-4">
                    Memuat riwayat izin...
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    Mengambil data terbaru dari
                    server.
                  </p>
                </div>
              ) : izinError ? (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center print-card">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                    <AlertCircle size={26} />
                  </div>

                  <h2 className="font-bold text-gray-900 mt-4">
                    Gagal memuat riwayat izin
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    {izinError}
                  </p>
                </div>
              ) : filteredIzinData.length ===
                0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center print-card">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <FileText size={26} />
                  </div>

                  <h2 className="font-bold text-gray-900 mt-4">
                    Belum ada riwayat izin
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    Tidak ada data izin pada
                    periode{" "}
                    {getMonthLabel(
                      selectedMonth
                    )}
                    .
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIzinData.map(
                    (item) => {
                      const statusStyle =
                        getStatusStyle(
                          item.status
                        );

                      const hasDateRange =
                        item.endDate &&
                        item.date &&
                        item.endDate !==
                          item.date;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-11 h-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                                <FileText
                                  size={21}
                                />
                              </div>

                              <div>
                                <h2 className="font-bold text-gray-900">
                                  {item.type}
                                </h2>

                                <div className="flex items-start gap-2 text-sm text-gray-500 mt-1">
                                  <CalendarDays
                                    size={15}
                                    className="mt-0.5 shrink-0"
                                  />

                                  <span>
                                    {formatDate(
                                      item.date
                                    )}

                                    {hasDateRange && (
                                      <>
                                        {" "}
                                        —{" "}
                                        {formatDate(
                                          item.endDate
                                        )}
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold self-start ${statusStyle.className}`}
                            >
                              {item.status ===
                              "DITERIMA" ? (
                                <CheckCircle2
                                  size={14}
                                />
                              ) : (
                                <Clock3
                                  size={14}
                                />
                              )}

                              {
                                statusStyle.label
                              }
                            </div>
                          </div>

                          <div className="mt-5 bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                              Alasan
                            </p>

                            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                              {item.reason ||
                                "-"}
                            </p>
                          </div>

                          <div className="border-t border-gray-100 mt-4 pt-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock size={14} />

                              <span>
                                Dicatat pada{" "}
                                {formatDateTime(
                                  item.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              {/* PRINT FOOTER */}
              <div className="hidden print:block mt-8 pt-5 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>
                    ABSENKU — Sistem Absensi PKL
                  </span>

                  <span>
                    Periode{" "}
                    {getMonthLabel(
                      selectedMonth
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}