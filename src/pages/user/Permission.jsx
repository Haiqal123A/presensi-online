import { useEffect, useState } from "react";
import {
  ClipboardPen,
  CalendarDays,
  FileText,
  Upload,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

const STORAGE_KEY = "pkl_permissions";

const getTodayKey = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};

const getPermissions = () => {
  const savedData =
    localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);

    return Array.isArray(parsedData)
      ? parsedData
      : [];
  } catch (error) {
    console.error(
      "Gagal membaca data izin:",
      error
    );

    return [];
  }
};

export default function Permission() {
  const [permissions, setPermissions] =
    useState(getPermissions());

  const [form, setForm] = useState({
    type: "Izin",
    startDate: getTodayKey(),
    endDate: getTodayKey(),
    reason: "",
    fileName: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setPermissions(getPermissions());
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      fileName: file.name,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!form.startDate || !form.endDate) {
      setError(
        "Tanggal mulai dan tanggal selesai wajib diisi."
      );
      return;
    }

    if (form.endDate < form.startDate) {
      setError(
        "Tanggal selesai tidak boleh sebelum tanggal mulai."
      );
      return;
    }

    if (!form.reason.trim()) {
      setError("Alasan izin wajib diisi.");
      return;
    }

    setLoading(true);

    const now = new Date();

    const newPermission = {
      id: Date.now(),
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason.trim(),
      fileName: form.fileName || null,
      status: "Menunggu",
      createdAt: now.getTime(),
      createdDate: now.toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ),
      createdTime: now.toLocaleTimeString(
        "id-ID",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };

    const updatedPermissions = [
      newPermission,
      ...permissions,
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedPermissions)
    );

    setPermissions(updatedPermissions);

    setForm({
      type: "Izin",
      startDate: getTodayKey(),
      endDate: getTodayKey(),
      reason: "",
      fileName: "",
    });

    setLoading(false);
    setSuccess(true);
  };

  const getStatusStyle = (status) => {
    if (status === "Disetujui") {
      return {
        wrapper:
          "bg-green-100 text-green-700",
        icon: (
          <CheckCircle2 size={15} />
        ),
      };
    }

    if (status === "Ditolak") {
      return {
        wrapper:
          "bg-red-100 text-red-700",
        icon: (
          <XCircle size={15} />
        ),
      };
    }

    return {
      wrapper:
        "bg-yellow-100 text-yellow-700",
      icon: (
        <Clock3 size={15} />
      ),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue">
              <ClipboardPen size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Pengajuan Izin
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Ajukan izin atau sakit selama kegiatan PKL.
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Buat Pengajuan
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Isi data berikut dengan benar.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <XCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Pengajuan berhasil dibuat.
                </p>

                <p className="mt-1">
                  Pengajuan kamu saat ini menunggu persetujuan.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* JENIS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Jenis Izin
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                >
                  <option value="Izin">
                    Izin
                  </option>

                  <option value="Sakit">
                    Sakit
                  </option>

                  <option value="Keperluan Pribadi">
                    Keperluan Pribadi
                  </option>
                </select>
              </div>

              {/* TANGGAL MULAI */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tanggal Mulai
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                  />
                </div>
              </div>

              {/* TANGGAL SELESAI */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tanggal Selesai
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    min={form.startDate}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                  />
                </div>
              </div>

              {/* FILE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bukti Pendukung
                  <span className="ml-1 font-normal text-gray-400">
                    (Opsional)
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 px-4 py-3 transition hover:border-brand-blue hover:bg-brand-blue-light/40">
                  <Upload
                    size={18}
                    className="text-brand-blue"
                  />

                  <span className="truncate text-sm text-gray-500">
                    {form.fileName ||
                      "Pilih file bukti"}
                  </span>

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* ALASAN */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Alasan
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Jelaskan alasan pengajuan izin..."
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                />
              </div>
            </div>

            {/* INFO */}
            <div className="mt-5 flex gap-3 rounded-xl bg-brand-blue-light p-4">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-brand-blue"
              />

              <p className="text-sm text-brand-blue-dark">
                Pengajuan izin akan berstatus{" "}
                <strong>Menunggu</strong> sampai
                admin memberikan keputusan.
              </p>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3.5 font-semibold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ClipboardPen size={19} />

              {loading
                ? "Mengirim..."
                : "Ajukan Izin"}
            </button>
          </form>
        </div>

        {/* RIWAYAT */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Riwayat Pengajuan
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Daftar pengajuan izin kamu.
            </p>
          </div>

          {permissions.length === 0 ? (
            <div className="rounded-xl bg-gray-50 px-5 py-10 text-center">
              <ClipboardPen
                size={35}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-semibold text-gray-600">
                Belum ada pengajuan izin
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Pengajuan yang kamu buat akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {permissions.map((item) => {
                const statusStyle =
                  getStatusStyle(item.status);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {item.type}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.wrapper}`}
                          >
                            {statusStyle.icon}
                            {item.status}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays size={16} />

                          <span>
                            {formatDate(item.startDate)}
                            {" - "}
                            {formatDate(item.endDate)}
                          </span>
                        </div>
                      </div>

                      <div className="text-left text-xs text-gray-400 sm:text-right">
                        <p>
                          Diajukan
                        </p>

                        <p className="mt-1">
                          {item.createdDate}
                        </p>

                        <p>
                          {item.createdTime}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-semibold text-gray-500">
                        Alasan
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {item.reason}
                      </p>
                    </div>

                    {item.fileName && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <Upload size={14} />

                        <span>
                          Bukti: {item.fileName}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}