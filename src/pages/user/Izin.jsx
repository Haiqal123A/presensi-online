import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

import {
  getMyIzin,
  submitIzin,
} from "../../services/api";

const MAX_IZIN_PER_MONTH = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function getJakartaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const result = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  });

  return result;
}

function getTodayJakarta() {
  const parts = getJakartaDateParts();

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getCurrentMonthKey() {
  const parts = getJakartaDateParts();

  return `${parts.year}-${parts.month}`;
}

function normalizeDateOnly(value) {
  if (!value) return null;

  const stringValue = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    return stringValue.slice(0, 10);
  }

  const dmy = stringValue.match(
    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/
  );

  if (dmy) {
    const day = String(dmy[1]).padStart(2, "0");
    const month = String(dmy[2]).padStart(2, "0");

    return `${dmy[3]}-${month}-${day}`;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const jakarta = getJakartaDateParts(parsed);

  return `${jakarta.year}-${jakarta.month}-${jakarta.day}`;
}

function formatDate(value) {
  const normalized = normalizeDateOnly(value);

  if (!normalized) {
    return "-";
  }

  const parsed = new Date(`${normalized}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function getArrayFromResponse(
  response,
  preferredKeys = []
) {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const visited = new Set();
  const queue = [response];

  while (queue.length > 0) {
    const current = queue.shift();

    if (
      !current ||
      typeof current !== "object" ||
      visited.has(current)
    ) {
      continue;
    }

    visited.add(current);

    for (const key of preferredKeys) {
      const value = current?.[key];

      if (Array.isArray(value)) {
        return value;
      }
    }

    for (const value of Object.values(current)) {
      if (Array.isArray(value)) {
        if (
          value.length === 0 ||
          value.some(
            (item) =>
              item &&
              typeof item === "object"
          )
        ) {
          return value;
        }
      } else if (
        value &&
        typeof value === "object"
      ) {
        queue.push(value);
      }
    }
  }

  return [];
}

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

function getIzinType(item) {
  const raw =
    item?.tipe_izin ||
    item?.tipeIzin ||
    item?.type ||
    item?.jenis ||
    "Izin";

  const normalized = String(raw)
    .trim()
    .toLowerCase();

  if (normalized === "sakit") {
    return "Sakit";
  }

  if (normalized === "izin") {
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

function getIzinAttachment(item) {
  return (
    item?.lampiran ||
    item?.attachment ||
    item?.attachment_url ||
    item?.attachmentUrl ||
    null
  );
}

function normalizeIzinItem(item, index) {
  return {
    ...item,

    id:
      item?.id ||
      item?._id ||
      `izin-${index}`,

    type: getIzinType(item),

    date: getIzinDate(item),

    endDate: getIzinEndDate(item),

    reason: getIzinReason(item),

    createdAt: getIzinCreatedAt(item),

    attachment: getIzinAttachment(item),
  };
}

function isSameOrAfter(dateA, dateB) {
  if (!dateA || !dateB) {
    return false;
  }

  return dateA >= dateB;
}

function isValidDateString(value) {
  if (!value) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default function Izin() {
  const today = getTodayJakarta();
  const currentMonth = getCurrentMonthKey();

  const fileInputRef = useRef(null);

  const [izinType, setIzinType] =
    useState("izin");

  const [tanggalMulai, setTanggalMulai] =
    useState(today);

  const [tanggalSelesai, setTanggalSelesai] =
    useState(today);

  const [alasan, setAlasan] =
    useState("");

  const [lampiran, setLampiran] =
    useState(null);

  const [izinData, setIzinData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [validationError, setValidationError] =
    useState("");

  const loadIzin = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getMyIzin();

        const records =
          getArrayFromResponse(response, [
            "izin",
            "izins",
            "records",
            "items",
            "results",
            "data",
          ]);

        const normalized = Array.isArray(
          records
        )
          ? records.map(normalizeIzinItem)
          : [];

        setIzinData(normalized);
      } catch (err) {
        console.error(
          "Gagal mengambil data izin:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data izin."
        );

        setIzinData([]);
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadIzin();
  }, [loadIzin]);

  const izinBulanIni = useMemo(() => {
    return izinData.filter((item) => {
      const date = getIzinDate(item);

      return (
        date &&
        date.slice(0, 7) ===
          currentMonth
      );
    });
  }, [izinData, currentMonth]);

  const totalIzinBulanIni =
    izinBulanIni.length;

  const sisaKuota =
    Math.max(
      0,
      MAX_IZIN_PER_MONTH -
        totalIzinBulanIni
    );

  const kuotaHabis =
    sisaKuota <= 0;

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0] || null;

    setValidationError("");
    setSuccessMessage("");

    if (!file) {
      setLampiran(null);
      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setLampiran(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      setValidationError(
        "Ukuran lampiran maksimal 5 MB."
      );

      return;
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type
      )
    ) {
      setLampiran(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      setValidationError(
        "Format lampiran harus PDF, JPG/JPEG, atau PNG."
      );

      return;
    }

    setLampiran(file);
  };

  const removeFile = () => {
    setLampiran(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  const resetForm = () => {
    setIzinType("izin");
    setTanggalMulai(today);
    setTanggalSelesai(today);
    setAlasan("");
    setLampiran(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setValidationError("");
    setSuccessMessage("");
    setError("");

    if (kuotaHabis) {
      setValidationError(
        "Kuota izin bulan ini sudah habis. Maksimal 4 izin per bulan."
      );
      return;
    }

    if (
      !isValidDateString(
        tanggalMulai
      ) ||
      !isValidDateString(
        tanggalSelesai
      )
    ) {
      setValidationError(
        "Tanggal izin belum lengkap."
      );
      return;
    }

    if (
      !isSameOrAfter(
        tanggalSelesai,
        tanggalMulai
      )
    ) {
      setValidationError(
        "Tanggal selesai tidak boleh sebelum tanggal mulai."
      );
      return;
    }

    if (
      !alasan.trim() ||
      alasan.trim().length < 5
    ) {
      setValidationError(
        "Alasan minimal 5 karakter."
      );
      return;
    }

    if (lampiran) {
      if (
        lampiran.size >
        MAX_FILE_SIZE
      ) {
        setValidationError(
          "Ukuran lampiran maksimal 5 MB."
        );
        return;
      }

      if (
        !ALLOWED_FILE_TYPES.includes(
          lampiran.type
        )
      ) {
        setValidationError(
          "Format lampiran tidak didukung."
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      await submitIzin({
        tipeIzin: izinType,
        tanggalMulai,
        tanggalSelesai,
        alasan: alasan.trim(),
        lampiran,
      });

      /*
       * Setelah submit berhasil, langsung ambil
       * ulang data dari backend.
       *
       * Jadi riwayat bukan dummy/localStorage.
       */
      await loadIzin({
        silent: true,
      });

      setSuccessMessage(
        "Izin berhasil dicatat dan langsung masuk ke riwayat."
      );

      resetForm();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Gagal mengirim izin:",
        err
      );

      setError(
        err?.message ||
          "Izin gagal dicatat. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (
    bytes
  ) => {
    if (!bytes) return "0 KB";

    if (bytes < 1024 * 1024) {
      return `${Math.ceil(
        bytes / 1024
      )} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-brand-blue mb-2">
                <FileText size={20} />

                <span className="text-sm font-semibold">
                  Perizinan
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Pengajuan Izin
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Ajukan izin sakit atau izin keperluan.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadIzin({
                  silent: true,
                })
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={17} />
              )}

              Refresh
            </button>
          </div>
        </div>

        {/* SUCCESS */}
        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={21}
                className="text-green-600 mt-0.5 shrink-0"
              />

              <div>
                <p className="font-bold text-green-800">
                  Berhasil
                </p>

                <p className="text-sm text-green-700 mt-1">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={21}
                className="text-red-600 mt-0.5 shrink-0"
              />

              <div>
                <p className="font-bold text-red-800">
                  Terjadi kesalahan
                </p>

                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* QUOTA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Izin Bulan Ini
              </p>

              <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                <FileText size={19} />
              </div>
            </div>

            <p className="text-3xl font-bold text-brand-blue mt-3">
              {totalIzinBulanIni}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Pengajuan tercatat
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Batas Bulanan
              </p>

              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <CalendarDays size={19} />
              </div>
            </div>

            <p className="text-3xl font-bold text-gray-900 mt-3">
              {MAX_IZIN_PER_MONTH}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Maksimal izin per bulan
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Sisa Kuota
              </p>

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  kuotaHabis
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                <CheckCircle2 size={19} />
              </div>
            </div>

            <p
              className={`text-3xl font-bold mt-3 ${
                kuotaHabis
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {sisaKuota}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Izin masih tersedia
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Form Pengajuan
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Izin yang dikirim akan langsung tercatat tanpa proses persetujuan.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6"
          >
            {validationError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={19}
                    className="text-red-600 mt-0.5 shrink-0"
                  />

                  <p className="text-sm font-semibold text-red-700">
                    {validationError}
                  </p>
                </div>
              </div>
            )}

            {/* TYPE */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Jenis Izin
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setIzinType("izin")
                  }
                  disabled={
                    submitting ||
                    kuotaHabis
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    izinType === "izin"
                      ? "border-brand-blue bg-brand-blue-light ring-2 ring-brand-blue/10"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  } disabled:opacity-60`}
                >
                  <p
                    className={`font-bold ${
                      izinType === "izin"
                        ? "text-brand-blue"
                        : "text-gray-800"
                    }`}
                  >
                    Izin
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Keperluan pribadi
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIzinType("sakit")
                  }
                  disabled={
                    submitting ||
                    kuotaHabis
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    izinType === "sakit"
                      ? "border-brand-blue bg-brand-blue-light ring-2 ring-brand-blue/10"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  } disabled:opacity-60`}
                >
                  <p
                    className={`font-bold ${
                      izinType === "sakit"
                        ? "text-brand-blue"
                        : "text-gray-800"
                    }`}
                  >
                    Sakit
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Tidak dapat mengikuti PKL
                  </p>
                </button>
              </div>
            </div>

            {/* DATE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label
                  htmlFor="tanggalMulai"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Tanggal Mulai
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    id="tanggalMulai"
                    type="date"
                    value={tanggalMulai}
                    onChange={(event) =>
                      setTanggalMulai(
                        event.target.value
                      )
                    }
                    disabled={
                      submitting ||
                      kuotaHabis
                    }
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-medium text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="tanggalSelesai"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Tanggal Selesai
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    id="tanggalSelesai"
                    type="date"
                    value={tanggalSelesai}
                    onChange={(event) =>
                      setTanggalSelesai(
                        event.target.value
                      )
                    }
                    disabled={
                      submitting ||
                      kuotaHabis
                    }
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-medium text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* REASON */}
            <div className="mb-6">
              <label
                htmlFor="alasan"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Alasan
              </label>

              <textarea
                id="alasan"
                value={alasan}
                onChange={(event) =>
                  setAlasan(
                    event.target.value
                  )
                }
                disabled={
                  submitting ||
                  kuotaHabis
                }
                rows={5}
                maxLength={1000}
                placeholder="Tuliskan alasan izin..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none resize-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:bg-gray-50"
              />

              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-400">
                  {alasan.length}/1000
                </span>
              </div>
            </div>

            {/* ATTACHMENT */}
            <div className="mb-7">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Lampiran{" "}
                <span className="font-normal text-gray-400">
                  (opsional)
                </span>
              </label>

              {!lampiran ? (
                <label
                  className={`flex flex-col items-center justify-center min-h-32 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition ${
                    submitting ||
                    kuotaHabis
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:border-brand-blue hover:bg-brand-blue-light/30"
                  }`}
                >
                  <Upload
                    size={24}
                    className="text-gray-400 mb-2"
                  />

                  <p className="text-sm font-semibold text-gray-700">
                    Pilih lampiran
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    PDF, JPG/JPEG, PNG — maksimal 5 MB
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={
                      handleFileChange
                    }
                    disabled={
                      submitting ||
                      kuotaHabis
                    }
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                        <FileText size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {lampiran.name}
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatFileSize(
                            lampiran.size
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        removeFile
                      }
                      disabled={
                        submitting
                      }
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                      aria-label="Hapus lampiran"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={
                submitting ||
                kuotaHabis
              }
              className="w-full h-12 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Mencatat izin...
                </>
              ) : kuotaHabis ? (
                "Kuota Izin Bulan Ini Habis"
              ) : (
                <>
                  <CheckCircle2 size={19} />

                  Catat Izin
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Sisa kuota bulan ini:{" "}
              <span className="font-bold text-gray-600">
                {sisaKuota}
              </span>{" "}
              dari{" "}
              {MAX_IZIN_PER_MONTH}
            </p>
          </form>
        </div>

        {/* RIWAYAT TERBARU */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Riwayat Izin Bulan Ini
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Semua izin yang sudah dicatat langsung tampil di sini.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-lg bg-brand-blue-light text-brand-blue text-xs font-bold">
                {totalIzinBulanIni}/
                {MAX_IZIN_PER_MONTH}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="py-10 text-center">
                <Loader2
                  size={28}
                  className="animate-spin text-brand-blue mx-auto"
                />

                <p className="text-sm font-semibold text-gray-700 mt-3">
                  Memuat riwayat...
                </p>
              </div>
            ) : izinBulanIni.length ===
              0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <FileText size={25} />
                </div>

                <p className="font-bold text-gray-800 mt-4">
                  Belum ada izin
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Belum ada izin yang tercatat bulan ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {izinBulanIni.map(
                  (item) => {
                    const hasRange =
                      item.date &&
                      item.endDate &&
                      item.date !==
                        item.endDate;

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
                            <FileText size={18} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <p className="font-bold text-gray-900">
                                  {item.type}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(
                                    item.date
                                  )}

                                  {hasRange &&
                                    ` — ${formatDate(
                                      item.endDate
                                    )}`}
                                </p>
                              </div>

                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold self-start">
                                <CheckCircle2
                                  size={13}
                                />

                                Tercatat
                              </span>
                            </div>

                            <div className="mt-3 rounded-lg bg-white border border-gray-100 p-3">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                Alasan
                              </p>

                              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                {item.reason}
                              </p>
                            </div>

                            <p className="text-xs text-gray-400 mt-3">
                              Dicatat{" "}
                              {formatDateTime(
                                item.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}