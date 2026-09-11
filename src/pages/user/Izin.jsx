import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  CalendarDays,
  Send,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

const IZIN_STORAGE_KEY = "pkl_izin";
const MAX_IZIN_PER_MONTH = 4;

const getTodayKey = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentMonthKey = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const getIzinData = () => {
  const savedData = localStorage.getItem(IZIN_STORAGE_KEY);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);

    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error("Gagal membaca data izin:", error);

    return [];
  }
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};

export default function Izin() {
  const navigate = useNavigate();

  const [tanggal, setTanggal] = useState(getTodayKey());
  const [jenis, setJenis] = useState("Sakit");
  const [alasan, setAlasan] = useState("");

  const [izinData, setIzinData] = useState(
    getIzinData()
  );

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const currentMonth = getCurrentMonthKey();

  const totalIzinBulanIni = useMemo(() => {
    return izinData.filter(
      (item) => item.month === currentMonth
    ).length;
  }, [izinData, currentMonth]);

  const sisaIzin = Math.max(
    0,
    MAX_IZIN_PER_MONTH - totalIzinBulanIni
  );

  const isLimitReached =
    totalIzinBulanIni >= MAX_IZIN_PER_MONTH;

  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const latestData = getIzinData();

    const latestTotalThisMonth = latestData.filter(
      (item) => item.month === currentMonth
    ).length;

    if (latestTotalThisMonth >= MAX_IZIN_PER_MONTH) {
      setErrorMessage(
        "Kuota izin bulan ini sudah habis. Maksimal izin adalah 4 kali dalam satu bulan."
      );

      setIzinData(latestData);

      return;
    }

    if (!tanggal) {
      setErrorMessage(
        "Silakan pilih tanggal izin."
      );

      return;
    }

    if (!alasan.trim()) {
      setErrorMessage(
        "Silakan masukkan alasan izin."
      );

      return;
    }

    const now = new Date();

    const newIzin = {
      id: Date.now(),
      date: tanggal,
      month: tanggal.slice(0, 7),
      type: jenis,
      reason: alasan.trim(),
      createdAt: now.toISOString(),
    };

    const updatedData = [
      newIzin,
      ...latestData,
    ];

    localStorage.setItem(
      IZIN_STORAGE_KEY,
      JSON.stringify(updatedData)
    );

    setIzinData(updatedData);

    setTanggal(getTodayKey());
    setJenis("Sakit");
    setAlasan("");

    setSuccessMessage(
      "Izin berhasil dicatat dan masuk ke riwayat."
    );

    setTimeout(() => {
      navigate(
        "/user/attendance-history?tab=izin"
      );
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-brand-blue mb-2">
              <FileText size={20} />

              <span className="text-sm font-semibold">
                Izin
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Izin Tidak Masuk PKL
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Gunakan izin apabila kamu tidak dapat
              hadir ke tempat PKL.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/user/attendance-history?tab=izin"
              )
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={17} />
            Riwayat Izin
          </button>
        </div>

        {/* Kuota */}
        <div className="bg-brand-blue rounded-2xl p-5 text-white shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p className="text-white/70 text-sm">
                Penggunaan izin bulan ini
              </p>

              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-bold">
                  {totalIzinBulanIni}
                </span>

                <span className="text-white/70 text-sm mb-1">
                  / {MAX_IZIN_PER_MONTH} kali
                </span>
              </div>

              <p className="text-white/70 text-xs mt-2">
                Setiap siswa memiliki maksimal 4 kali
                izin dalam satu bulan.
              </p>
            </div>

            <div
              className={`px-5 py-3 rounded-xl ${
                isLimitReached
                  ? "bg-red-500/20"
                  : "bg-white/10"
              }`}
            >
              <p className="text-xs text-white/70">
                Sisa kuota
              </p>

              <p className="text-2xl font-bold mt-1">
                {sisaIzin}
              </p>
            </div>
          </div>
        </div>

        {/* Limit */}
        {isLimitReached && (
          <div className="mb-6 flex gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700">
            <AlertCircle
              size={21}
              className="shrink-0 mt-0.5"
            />

            <div>
              <p className="font-bold text-sm">
                Kuota izin sudah habis
              </p>

              <p className="text-sm mt-1 text-red-600">
                Kamu sudah menggunakan 4 kali izin pada
                bulan ini. Izin berikutnya dapat digunakan
                pada bulan berikutnya.
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-6 flex gap-3 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700">
            <CheckCircle2
              size={21}
              className="shrink-0"
            />

            <div>
              <p className="font-bold text-sm">
                Izin berhasil dicatat
              </p>

              <p className="text-sm mt-1 text-green-600">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 flex gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700">
            <AlertCircle
              size={21}
              className="shrink-0"
            />

            <div>
              <p className="font-bold text-sm">
                Izin tidak dapat dicatat
              </p>

              <p className="text-sm mt-1 text-red-600">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
              <FileText size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Form Izin
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Isi data izin dengan benar.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Tanggal */}
            <div>
              <label
                htmlFor="tanggal"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Tanggal Izin
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />

                <input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(event) =>
                    setTanggal(event.target.value)
                  }
                  disabled={isLimitReached}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            {/* Jenis */}
            <div>
              <label
                htmlFor="jenis"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Jenis Izin
              </label>

              <select
                id="jenis"
                value={jenis}
                onChange={(event) =>
                  setJenis(event.target.value)
                }
                disabled={isLimitReached}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:bg-gray-100 disabled:text-gray-400"
              >
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
              </select>
            </div>

            {/* Alasan */}
            <div>
              <label
                htmlFor="alasan"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Alasan Izin
              </label>

              <textarea
                id="alasan"
                value={alasan}
                onChange={(event) =>
                  setAlasan(event.target.value)
                }
                disabled={isLimitReached}
                rows={5}
                placeholder="Jelaskan alasan izin kamu..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 outline-none resize-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            {/* Info */}
            <div className="flex gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-100">
              <AlertCircle
                size={19}
                className="text-yellow-600 shrink-0 mt-0.5"
              />

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Informasi izin
                </p>

                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Izin akan langsung tercatat setelah
                  kamu mengirimkan form. Setiap siswa
                  mendapatkan maksimal 4 kali izin dalam
                  satu bulan.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLimitReached}
              className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition ${
                isLimitReached
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark"
              }`}
            >
              <Send size={18} />

              {isLimitReached
                ? "Kuota Izin Habis"
                : "Kirim Izin"}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Digunakan
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {totalIzinBulanIni}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Izin bulan ini
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Sisa
            </p>

            <p className="text-2xl font-bold text-brand-blue mt-2">
              {sisaIzin}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Izin tersedia
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Maksimal
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {MAX_IZIN_PER_MONTH}x
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Setiap bulan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}