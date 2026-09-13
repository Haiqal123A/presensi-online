import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Clock3,
  FileText,
  Home,
  Loader2,
  LogIn,
  LogOut,
  Printer,
  RefreshCw,
} from "lucide-react";

import {
  getAttendanceHistory,
  getMyIzin,
} from "../../services/api";

const MAX_IZIN_PER_MONTH = 4;
const ATTENDANCE_PAGE_LIMIT = 10;

function getJakartaDateParts(
  date = new Date()
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(date);

  const result = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  });

  return result;
}

function getMonthKey(
  date = new Date(),
  offset = 0
) {
  const jakarta =
    getJakartaDateParts(date);

  const result = new Date(
    Number(jakarta.year),
    Number(jakarta.month) -
      1 -
      offset,
    1
  );

  const year =
    result.getFullYear();

  const month = String(
    result.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
}

function getMonthLabel(monthKey) {
  if (!monthKey) {
    return "-";
  }

  const [year, month] =
    String(monthKey).split("-");

  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "-";
  }

  return parsed.toLocaleDateString(
    "id-ID",
    {
      month: "long",
      year: "numeric",
    }
  );
}

function normalizeDateOnly(value) {
  if (!value) {
    return null;
  }

  const stringValue =
    String(value).trim();

  if (
    /^\d{4}-\d{2}-\d{2}/.test(
      stringValue
    )
  ) {
    return stringValue.slice(
      0,
      10
    );
  }

  const dmy =
    stringValue.match(
      /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/
    );

  if (dmy) {
    const day = String(
      dmy[1]
    ).padStart(2, "0");

    const month = String(
      dmy[2]
    ).padStart(2, "0");

    return `${dmy[3]}-${month}-${day}`;
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  const jakarta =
    getJakartaDateParts(
      parsed
    );

  return `${jakarta.year}-${jakarta.month}-${jakarta.day}`;
}

function formatDate(date) {
  const normalized =
    normalizeDateOnly(date);

  if (!normalized) {
    return "-";
  }

  const parsed = new Date(
    `${normalized}T00:00:00`
  );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "-";
  }

  return parsed.toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "-";
  }

  return parsed.toLocaleString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone:
        "Asia/Jakarta",
    }
  );
}

function formatTime(value) {
  if (!value) {
    return "--:--";
  }

  if (
    typeof value === "string" &&
    /^\d{1,2}:\d{2}/.test(
      value
    )
  ) {
    return value.slice(0, 5);
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "--:--";
  }

  return parsed.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone:
        "Asia/Jakarta",
    }
  );
}

function getArrayFromResponse(
  response,
  preferredKeys = []
) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    !response ||
    typeof response !==
      "object"
  ) {
    return [];
  }

  const visited = new Set();
  const queue = [response];

  while (queue.length) {
    const current =
      queue.shift();

    if (
      !current ||
      typeof current !==
        "object" ||
      visited.has(current)
    ) {
      continue;
    }

    visited.add(current);

    for (const key of preferredKeys) {
      const value =
        current?.[key];

      if (Array.isArray(value)) {
        return value;
      }
    }

    for (const value of Object.values(
      current
    )) {
      if (Array.isArray(value)) {
        if (
          value.length === 0 ||
          value.some(
            (item) =>
              item &&
              typeof item ===
                "object"
          )
        ) {
          return value;
        }
      } else if (
        value &&
        typeof value ===
          "object"
      ) {
        queue.push(value);
      }
    }
  }

  return [];
}

function getPaginationData(
  response,
  fallbackPage = 1
) {
  const candidates = [
    response?.pagination,
    response?.meta,
    response?.data?.pagination,
    response?.data?.meta,
    response?.data?.data?.pagination,
    response?.data?.data?.meta,
  ];

  const pagination =
    candidates.find(
      (item) =>
        item &&
        typeof item ===
          "object" &&
        !Array.isArray(item)
    ) || {};

  const pageValue =
    pagination?.page ??
    pagination?.current_page ??
    pagination?.currentPage ??
    response?.page ??
    response?.data?.page ??
    fallbackPage;

  const limitValue =
    pagination?.limit ??
    pagination?.per_page ??
    pagination?.perPage ??
    response?.limit ??
    response?.data?.limit ??
    ATTENDANCE_PAGE_LIMIT;

  const totalValue =
    pagination?.total ??
    pagination?.total_count ??
    pagination?.totalCount ??
    response?.total ??
    response?.data?.total ??
    0;

  const totalPagesValue =
    pagination?.total_pages ??
    pagination?.totalPages ??
    pagination?.pages ??
    response?.total_pages ??
    response?.data?.total_pages;

  const page = Math.max(
    1,
    Number(pageValue) ||
      fallbackPage
  );

  const limit = Math.max(
    1,
    Number(limitValue) ||
      ATTENDANCE_PAGE_LIMIT
  );

  const total = Math.max(
    0,
    Number(totalValue) || 0
  );

  const calculatedTotalPages =
    Math.max(
      1,
      Math.ceil(
        total / limit
      )
    );

  const totalPages =
    Number(totalPagesValue) >
    0
      ? Number(
          totalPagesValue
        )
      : calculatedTotalPages;

  return {
    page,
    limit,
    total,
    totalPages: Math.max(
      1,
      totalPages
    ),
  };
}

/* =========================================================
   ATTENDANCE
========================================================= */

function normalizeWorkMode(
  value
) {
  if (!value) {
    return "";
  }

  const normalized =
    String(value)
      .trim()
      .toUpperCase();

  if (
    normalized === "WFO" ||
    normalized.includes(
      "OFFICE"
    )
  ) {
    return "WFO";
  }

  if (
    normalized === "WFH" ||
    normalized.includes("HOME")
  ) {
    return "WFH";
  }

  return normalized;
}

function getAttendanceDate(
  item
) {
  return normalizeDateOnly(
    item?.attendance_date ||
      item?.attendanceDate ||
      item?.date ||
      item?.tanggal ||
      item?.tanggal_absensi ||
      item?.attendance
        ?.attendance_date ||
      item?.attendance
        ?.attendanceDate
  );
}

function getCheckInTime(
  item
) {
  return (
    item?.check_in_time ||
    item?.checkInTime ||
    item?.check_in_at ||
    item?.checkInAt ||
    item?.check_in?.time ||
    item?.check_in
      ?.timestamp ||
    item?.checkIn?.time ||
    item?.checkIn
      ?.timestamp ||
    null
  );
}

function getCheckOutTime(
  item
) {
  return (
    item?.check_out_time ||
    item?.checkOutTime ||
    item?.check_out_at ||
    item?.checkOutAt ||
    item?.check_out?.time ||
    item?.check_out
      ?.timestamp ||
    item?.checkOut?.time ||
    item?.checkOut
      ?.timestamp ||
    null
  );
}

function getCheckInWorkMode(
  item
) {
  return (
    normalizeWorkMode(
      item?.check_in_work_mode
    ) ||
    normalizeWorkMode(
      item?.checkInWorkMode
    ) ||
    normalizeWorkMode(
      item?.check_in?.work_mode
    ) ||
    normalizeWorkMode(
      item?.check_in?.workMode
    ) ||
    normalizeWorkMode(
      item?.checkIn?.work_mode
    ) ||
    normalizeWorkMode(
      item?.checkIn?.workMode
    ) ||
    normalizeWorkMode(
      item?.work_mode
    ) ||
    normalizeWorkMode(
      item?.workMode
    )
  );
}

function getCheckOutWorkMode(
  item
) {
  return (
    normalizeWorkMode(
      item?.check_out_work_mode
    ) ||
    normalizeWorkMode(
      item?.checkOutWorkMode
    ) ||
    normalizeWorkMode(
      item?.check_out?.work_mode
    ) ||
    normalizeWorkMode(
      item?.check_out?.workMode
    ) ||
    normalizeWorkMode(
      item?.checkOut?.work_mode
    ) ||
    normalizeWorkMode(
      item?.checkOut?.workMode
    ) ||
    normalizeWorkMode(
      item?.work_mode
    ) ||
    normalizeWorkMode(
      item?.workMode
    )
  );
}

function buildAttendanceItems(
  records
) {
  if (!Array.isArray(records)) {
    return [];
  }

  const items = [];

  records.forEach(
    (record, index) => {
      if (!record) {
        return;
      }

      const date =
        getAttendanceDate(
          record
        );

      if (!date) {
        return;
      }

      const checkInTime =
        getCheckInTime(
          record
        );

      const checkOutTime =
        getCheckOutTime(
          record
        );

      const recordId =
        record?.id ||
        record?._id ||
        `${date}-${index}`;

      if (checkInTime) {
        items.push({
          id: `${recordId}-masuk`,
          type: "Absen Masuk",
          date,
          timestamp:
            checkInTime,
          time: formatTime(
            checkInTime
          ),
          workLocation:
            getCheckInWorkMode(
              record
            ),
        });
      }

      if (checkOutTime) {
        items.push({
          id: `${recordId}-pulang`,
          type: "Absen Pulang",
          date,
          timestamp:
            checkOutTime,
          time: formatTime(
            checkOutTime
          ),
          workLocation:
            getCheckOutWorkMode(
              record
            ),
        });
      }

      if (
        !checkInTime &&
        !checkOutTime
      ) {
        const type =
          String(
            record?.type ||
              record?.attendance_type ||
              record?.attendanceType ||
              ""
          ).toLowerCase();

        const timestamp =
          record?.timestamp ||
          record?.time ||
          record?.created_at ||
          record?.createdAt ||
          null;

        if (timestamp) {
          const isCheckout =
            type.includes("out") ||
            type.includes("pulang") ||
            type.includes(
              "checkout"
            );

          items.push({
            id: recordId,
            type: isCheckout
              ? "Absen Pulang"
              : "Absen Masuk",
            date,
            timestamp,
            time: formatTime(
              timestamp
            ),
            workLocation:
              normalizeWorkMode(
                record?.work_mode
              ) ||
              normalizeWorkMode(
                record?.workMode
              ) ||
              normalizeWorkMode(
                record?.location_type
              ),
          });
        }
      }
    }
  );

  items.sort((a, b) => {
    const timeA = a.timestamp
      ? new Date(
          a.timestamp
        ).getTime()
      : new Date(
          `${a.date}T00:00:00`
        ).getTime();

    const timeB = b.timestamp
      ? new Date(
          b.timestamp
        ).getTime()
      : new Date(
          `${b.date}T00:00:00`
        ).getTime();

    return timeB - timeA;
  });

  return items;
}

/* =========================================================
   IZIN
========================================================= */

function getIzinDate(item) {
  return normalizeDateOnly(
    item?.tanggal_mulai ||
      item?.tanggalMulai ||
      item?.start_date ||
      item?.startDate ||
      item?.date ||
      item?.tanggal ||
      item?.attendance_date ||
      item?.created_at ||
      item?.createdAt ||
      item?.submitted_at ||
      item?.submittedAt
  );
}

function getIzinEndDate(item) {
  return normalizeDateOnly(
    item?.tanggal_selesai ||
      item?.tanggalSelesai ||
      item?.end_date ||
      item?.endDate ||
      getIzinDate(item)
  );
}

function getIzinMonth(item) {
  const date =
    getIzinDate(item);

  if (!date) {
    return null;
  }

  return date.slice(0, 7);
}

function getIzinType(item) {
  const raw =
    item?.tipe_izin ||
    item?.tipeIzin ||
    item?.type ||
    item?.jenis ||
    "Izin";

  const normalized =
    String(raw)
      .trim()
      .toLowerCase();

  if (
    normalized === "sakit"
  ) {
    return "Sakit";
  }

  if (
    normalized === "izin"
  ) {
    return "Izin";
  }

  return String(raw);
}

function getIzinReason(item) {
  return (
    item?.alasan ||
    item?.reason ||
    item?.keterangan ||
    "-"
  );
}

function getIzinCreatedAt(item) {
  return (
    item?.created_at ||
    item?.createdAt ||
    item?.submitted_at ||
    item?.submittedAt ||
    null
  );
}

function normalizeIzinItem(
  item,
  index
) {
  return {
    ...item,

    id:
      item?.id ||
      item?._id ||
      `izin-${index}`,

    type: getIzinType(item),

    date: getIzinDate(item),

    endDate:
      getIzinEndDate(item),

    reason:
      getIzinReason(item),

    createdAt:
      getIzinCreatedAt(item),
  };
}

export default function AttendanceHistory() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    searchParams.get("tab") ===
      "izin"
      ? "izin"
      : "absen"
  );

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    getMonthKey()
  );

  const [
    attendanceItems,
    setAttendanceItems,
  ] = useState([]);

  const [
    izinData,
    setIzinData,
  ] = useState([]);

  const [
    attendancePage,
    setAttendancePage,
  ] = useState(1);

  const [
    attendancePagination,
    setAttendancePagination,
  ] = useState({
    page: 1,
    limit:
      ATTENDANCE_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [
    attendanceLoading,
    setAttendanceLoading,
  ] = useState(true);

  const [
    izinLoading,
    setIzinLoading,
  ] = useState(true);

  const [
    attendanceRefreshing,
    setAttendanceRefreshing,
  ] = useState(false);

  const [
    izinRefreshing,
    setIzinRefreshing,
  ] = useState(false);

  const [
    attendanceError,
    setAttendanceError,
  ] = useState("");

  const [
    izinError,
    setIzinError,
  ] = useState("");

  useEffect(() => {
    const tab =
      searchParams.get(
        "tab"
      ) === "izin"
        ? "izin"
        : "absen";

    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange =
    (tab) => {
      setActiveTab(tab);

      setSearchParams({
        tab,
      });
    };

  const loadAttendance =
    useCallback(
      async ({
        page = attendancePage,
        silent = false,
      } = {}) => {
        try {
          if (silent) {
            setAttendanceRefreshing(
              true
            );
          } else {
            setAttendanceLoading(
              true
            );
          }

          setAttendanceError("");

          const [
            year,
            month,
          ] =
            selectedMonth.split(
              "-"
            );

          const response =
            await getAttendanceHistory(
              {
                page,
                limit:
                  ATTENDANCE_PAGE_LIMIT,
                month: Number(
                  month
                ),
                year: Number(
                  year
                ),
              }
            );

          const records =
            getArrayFromResponse(
              response,
              [
                "attendance",
                "attendances",
                "records",
                "items",
                "results",
                "data",
              ]
            );

          const pagination =
            getPaginationData(
              response,
              page
            );

          const items =
            buildAttendanceItems(
              records
            );

          setAttendanceItems(
            items
          );

          setAttendancePagination(
            {
              ...pagination,
              page,
            }
          );
        } catch (error) {
          console.error(
            "Gagal mengambil riwayat absensi:",
            error
          );

          setAttendanceError(
            error?.message ||
              "Gagal mengambil riwayat absensi."
          );

          setAttendanceItems(
            []
          );
        } finally {
          if (silent) {
            setAttendanceRefreshing(
              false
            );
          } else {
            setAttendanceLoading(
              false
            );
          }
        }
      },
      [
        attendancePage,
        selectedMonth,
      ]
    );

  const loadIzin =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (silent) {
            setIzinRefreshing(
              true
            );
          } else {
            setIzinLoading(
              true
            );
          }

          setIzinError("");

          const response =
            await getMyIzin();

          const records =
            getArrayFromResponse(
              response,
              [
                "izin",
                "izins",
                "records",
                "items",
                "results",
                "data",
              ]
            );

          const normalized =
            Array.isArray(
              records
            )
              ? records.map(
                  normalizeIzinItem
                )
              : [];

          setIzinData(
            normalized
          );
        } catch (error) {
          console.error(
            "Gagal mengambil riwayat izin:",
            error
          );

          setIzinError(
            error?.message ||
              "Gagal mengambil riwayat izin."
          );

          setIzinData([]);
        } finally {
          if (silent) {
            setIzinRefreshing(
              false
            );
          } else {
            setIzinLoading(
              false
            );
          }
        }
      },
      []
    );

  useEffect(() => {
    loadAttendance({
      page: attendancePage,
    });
  }, [
    selectedMonth,
    attendancePage,
    loadAttendance,
  ]);

  useEffect(() => {
    loadIzin();
  }, [loadIzin]);

  const monthOptions =
    useMemo(() => {
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

  const handleMonthChange =
    (value) => {
      setSelectedMonth(
        value
      );

      setAttendancePage(1);

      setAttendanceItems([]);
    };

  const filteredIzinData =
    useMemo(() => {
      return [...izinData]
        .filter((item) => {
          const month =
            getIzinMonth(item);

          return (
            month ===
            selectedMonth
          );
        })
        .sort((a, b) => {
          const createdA =
            getIzinCreatedAt(
              a
            );

          const createdB =
            getIzinCreatedAt(
              b
            );

          const dateA =
            createdA
              ? new Date(
                  createdA
                ).getTime()
              : getIzinDate(a)
              ? new Date(
                  `${getIzinDate(
                    a
                  )}T00:00:00`
                ).getTime()
              : 0;

          const dateB =
            createdB
              ? new Date(
                  createdB
                ).getTime()
              : getIzinDate(b)
              ? new Date(
                  `${getIzinDate(
                    b
                  )}T00:00:00`
                ).getTime()
              : 0;

          return dateB - dateA;
        });
    }, [
      izinData,
      selectedMonth,
    ]);

  const absenMasukCount =
    attendanceItems.filter(
      (item) =>
        item.type ===
        "Absen Masuk"
    ).length;

  const absenPulangCount =
    attendanceItems.filter(
      (item) =>
        item.type ===
        "Absen Pulang"
    ).length;

  const totalIzinBulanIni =
    filteredIzinData.length;

  const sisaIzinBulanIni =
    Math.max(
      0,
      MAX_IZIN_PER_MONTH -
        totalIzinBulanIni
    );

  const handleRefresh =
    async () => {
      await Promise.allSettled([
        loadAttendance({
          page:
            attendancePage,
          silent: true,
        }),
        loadIzin({
          silent: true,
        }),
      ]);
    };

  const canGoPrevious =
    attendancePage > 1;

  const canGoNext =
    attendancePage <
    attendancePagination.totalPages;

  const handlePrevious =
    () => {
      if (
        !canGoPrevious
      ) {
        return;
      }

      setAttendancePage(
        (current) =>
          Math.max(
            1,
            current - 1
          )
      );
    };

  const handleNext = () => {
    if (!canGoNext) {
      return;
    }

    setAttendancePage(
      (current) =>
        Math.min(
          attendancePagination.totalPages,
          current + 1
        )
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const isRefreshing =
    attendanceRefreshing ||
    izinRefreshing;

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
              break-inside: avoid;
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
                  <ClipboardList
                    size={20}
                  />

                  <span className="text-sm font-semibold">
                    Riwayat
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                  Riwayat Kehadiran
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Lihat riwayat absensi dan izin berdasarkan periode.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    handleRefresh
                  }
                  disabled={
                    isRefreshing
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition disabled:opacity-60"
                >
                  {isRefreshing ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw
                      size={18}
                    />
                  )}

                  Refresh
                </button>

                <button
                  type="button"
                  onClick={
                    handlePrint
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition"
                >
                  <Printer
                    size={18}
                  />

                  Cetak / Simpan PDF
                </button>
              </div>
            </div>
          </div>

          {/* FILTER */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarDays
                  size={19}
                />

                <span className="text-sm font-bold">
                  Periode
                </span>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <select
                  value={
                    selectedMonth
                  }
                  onChange={(event) =>
                    handleMonthChange(
                      event.target.value
                    )
                  }
                  className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm font-semibold text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                >
                  {monthOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
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

              <span className="sm:ml-auto inline-flex items-center px-3 py-2 rounded-lg bg-brand-blue-light text-brand-blue text-xs font-bold">
                {getMonthLabel(
                  selectedMonth
                )}
              </span>
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
                  activeTab ===
                  "absen"
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ClipboardList
                  size={18}
                />

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
                  activeTab ===
                  "izin"
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FileText
                  size={18}
                />

                Riwayat Izin
              </button>
            </div>
          </div>

          {/* =====================================================
              ABSEN
          ===================================================== */}
          {activeTab ===
            "absen" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Total Hari Absen
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center">
                      <ClipboardList
                        size={17}
                      />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 mt-3">
                    {
                      attendancePagination.total
                    }
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Record dari server
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Absen Masuk
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
                      <LogIn
                        size={17}
                      />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-brand-blue mt-3">
                    {absenMasukCount}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Pada halaman aktif
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Absen Pulang
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <LogOut
                        size={17}
                      />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-green-600 mt-3">
                    {absenPulangCount}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Pada halaman aktif
                  </p>
                </div>
              </div>

              {attendanceLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                  <Loader2
                    size={30}
                    className="animate-spin text-brand-blue mx-auto"
                  />

                  <p className="font-bold text-gray-900 mt-4">
                    Memuat riwayat absensi...
                  </p>
                </div>
              ) : attendanceError ? (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                    <AlertCircle
                      size={26}
                    />
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
                      loadAttendance({
                        page:
                          attendancePage,
                      })
                    }
                    className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold"
                  >
                    <RefreshCw
                      size={16}
                    />

                    Coba lagi
                  </button>
                </div>
              ) : attendanceItems.length ===
                0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <ClipboardList
                      size={26}
                    />
                  </div>

                  <h2 className="font-bold text-gray-900 mt-4">
                    Belum ada riwayat absen
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    Tidak ada data absensi pada{" "}
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
                          key={
                            item.id
                          }
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
                                  {
                                    item.type
                                  }
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
                                {
                                  item.time
                                }
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

                  {attendancePagination.totalPages >
                    1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 no-print">
                      <p className="text-sm text-gray-500">
                        Halaman{" "}
                        <span className="font-bold text-gray-700">
                          {
                            attendancePage
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
                            handlePrevious
                          }
                          disabled={
                            !canGoPrevious ||
                            attendanceLoading ||
                            attendanceRefreshing
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold disabled:opacity-40"
                        >
                          <ChevronLeft
                            size={17}
                          />

                          Sebelumnya
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleNext
                          }
                          disabled={
                            !canGoNext ||
                            attendanceLoading ||
                            attendanceRefreshing
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold disabled:opacity-40"
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
            </div>
          )}

          {/* =====================================================
              IZIN
          ===================================================== */}
          {activeTab ===
            "izin" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Total Izin
                    </p>

                    <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center">
                      <FileText
                        size={17}
                      />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 mt-3">
                    {
                      totalIzinBulanIni
                    }
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
                      <ClipboardList
                        size={17}
                      />
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-brand-blue mt-3">
                    {
                      totalIzinBulanIni
                    }{" "}
                    /{" "}
                    {
                      MAX_IZIN_PER_MONTH
                    }
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Sudah digunakan
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Sisa Kuota
                    </p>

                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        sisaIzinBulanIni ===
                        0
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      <CheckCircle2
                        size={17}
                      />
                    </div>
                  </div>

                  <p
                    className={`text-2xl font-bold mt-3 ${
                      sisaIzinBulanIni ===
                      0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {
                      sisaIzinBulanIni
                    }
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Izin tersedia
                  </p>
                </div>
              </div>

              {izinLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                  <Loader2
                    size={30}
                    className="animate-spin text-brand-blue mx-auto"
                  />

                  <p className="font-bold text-gray-900 mt-4">
                    Memuat riwayat izin...
                  </p>
                </div>
              ) : izinError ? (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                    <AlertCircle
                      size={26}
                    />
                  </div>

                  <h2 className="font-bold text-gray-900 mt-4">
                    Gagal memuat riwayat izin
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    {izinError}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      loadIzin()
                    }
                    className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold"
                  >
                    <RefreshCw
                      size={16}
                    />

                    Coba lagi
                  </button>
                </div>
              ) : filteredIzinData.length ===
                0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <FileText
                      size={26}
                    />
                  </div>

                  <h2 className="font-bold text-gray-900 mt-4">
                    Belum ada riwayat izin
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    Tidak ada izin pada{" "}
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
                      const hasDateRange =
                        item.date &&
                        item.endDate &&
                        item.date !==
                          item.endDate;

                      return (
                        <div
                          key={
                            item.id
                          }
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
                                  {
                                    item.type
                                  }
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

                                    {hasDateRange &&
                                      ` — ${formatDate(
                                        item.endDate
                                      )}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* TANPA APPROVAL */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 self-start">
                              <CheckCircle2
                                size={14}
                              />

                              Tercatat
                            </span>
                          </div>

                          <div className="mt-5 bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                              Alasan
                            </p>

                            <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                              {
                                item.reason
                              }
                            </p>
                          </div>

                          <div className="border-t border-gray-100 mt-4 pt-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock
                                size={14}
                              />

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
            </div>
          )}
        </div>
      </div>
    </>
  );
}