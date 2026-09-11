import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  getTodayAttendance,
  checkIn,
  checkOut,
} from "../../services/api";

const OFFICE_LATITUDE = -6.2377905;
const OFFICE_LONGITUDE = 106.8009185;
const OFFICE_RADIUS = 100;

const CHECK_IN_LIMIT_HOUR = 12;

const CHECK_OUT_HOUR_MONDAY_THURSDAY = 16;
const CHECK_OUT_MINUTE_MONDAY_THURSDAY = 30;

const CHECK_OUT_HOUR_FRIDAY = 16;
const CHECK_OUT_MINUTE_FRIDAY = 0;

function calculateDistance(latitude, longitude) {
  const earthRadius = 6371000;

  const lat1 = (latitude * Math.PI) / 180;
  const lat2 = (OFFICE_LATITUDE * Math.PI) / 180;

  const deltaLat =
    ((OFFICE_LATITUDE - latitude) * Math.PI) / 180;

  const deltaLon =
    ((OFFICE_LONGITUDE - longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
}

function formatDistance(distance) {
  if (!Number.isFinite(distance)) {
    return "-";
  }

  if (distance < 1000) {
    return `${Math.round(distance)} meter`;
  }

  return `${(distance / 1000).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} km`;
}

function getAttendanceType() {
  const now = new Date();
  const hour = now.getHours();

  return hour < CHECK_IN_LIMIT_HOUR
    ? "masuk"
    : "pulang";
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAttendanceTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getBackendErrorMessage(error) {
  const code = error?.code;

  if (code === "SUSPECTED_FAKE_GPS") {
    return "Lokasi tidak dapat diverifikasi. Pastikan GPS perangkat aktif dan coba lagi.";
  }

  if (code === "ALREADY_CHECKED_IN") {
    return "Absen Masuk hari ini sudah tercatat.";
  }

  if (code === "ALREADY_CHECKED_OUT") {
    return "Absen Pulang hari ini sudah tercatat.";
  }

  if (error?.status === 401) {
    return "Sesi login sudah tidak berlaku. Silakan login kembali.";
  }

  if (error?.status === 403) {
    return "Anda tidak memiliki izin untuk melakukan absensi.";
  }

  if (error?.status === 429) {
    return "Terlalu banyak percobaan. Silakan tunggu beberapa saat lalu coba lagi.";
  }

  return (
    error?.message ||
    "Absensi gagal. Silakan coba lagi."
  );
}

export default function Attendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [attendance, setAttendance] = useState(null);

  const [isLoadingAttendance, setIsLoadingAttendance] =
    useState(true);

  const [location, setLocation] = useState(null);

  const [workLocation, setWorkLocation] =
    useState("");

  const [distance, setDistance] = useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [cameraReady, setCameraReady] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [photo, setPhoto] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [showEarlyCheckout, setShowEarlyCheckout] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const attendanceType = getAttendanceType();

  const hasCheckedIn =
    Boolean(attendance?.check_in_time) ||
    Boolean(attendance?.has_checked_in);

  const hasCheckedOut =
    Boolean(attendance?.check_out_time) ||
    Boolean(attendance?.has_checked_out);

  const isComplete =
    hasCheckedIn && hasCheckedOut;

  const currentAction = hasCheckedIn
    ? "pulang"
    : "masuk";

  const loadTodayAttendance =
    useCallback(async () => {
      setIsLoadingAttendance(true);
      setError("");

      try {
        const response =
          await getTodayAttendance();

        const data =
          response?.data || {};

        setAttendance({
          ...data?.attendance,
          has_checked_in:
            data?.has_checked_in === true,
          has_checked_out:
            data?.has_checked_out === true,
        });
      } catch (err) {
        console.error(
          "Gagal mengambil status attendance:",
          err
        );

        setError(
          getBackendErrorMessage(err)
        );
      } finally {
        setIsLoadingAttendance(false);
      }
    }, []);

  useEffect(() => {
    loadTodayAttendance();
  }, [loadTodayAttendance]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Browser Anda tidak mendukung akses kamera."
      );
      return;
    }

    try {
      stopCamera();

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();
      }

      setCameraReady(true);
    } catch (err) {
      console.error(
        "Gagal membuka kamera:",
        err
      );

      setCameraReady(false);

      if (
        err?.name ===
        "NotAllowedError"
      ) {
        setCameraError(
          "Akses kamera ditolak. Izinkan kamera pada browser lalu coba lagi."
        );
      } else if (
        err?.name ===
        "NotFoundError"
      ) {
        setCameraError(
          "Kamera tidak ditemukan pada perangkat ini."
        );
      } else {
        setCameraError(
          "Kamera tidak dapat digunakan. Silakan coba lagi."
        );
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(
        "Browser Anda tidak mendukung GPS."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          !Number.isFinite(accuracy)
        ) {
          setLocationError(
            "Data lokasi perangkat tidak valid."
          );

          setLocationLoading(false);
          return;
        }

        if (accuracy <= 0) {
          setLocationError(
            "Akurasi GPS tidak valid. Pastikan GPS perangkat aktif lalu coba lagi."
          );

          setLocation(null);
          setWorkLocation("");
          setDistance(null);
          setLocationLoading(false);
          return;
        }

        const calculatedDistance =
          calculateDistance(
            latitude,
            longitude
          );

        const detectedWorkLocation =
          calculatedDistance <=
          OFFICE_RADIUS
            ? "WFO"
            : "WFH";

        setLocation({
          latitude,
          longitude,
          accuracy,
        });

        setDistance(calculatedDistance);

        setWorkLocation(
          detectedWorkLocation
        );

        setLocationLoading(false);
      },
      (err) => {
        console.error(
          "Gagal mengambil lokasi:",
          err
        );

        setLocation(null);
        setWorkLocation("");
        setDistance(null);
        setLocationLoading(false);

        if (
          err?.code ===
          err.PERMISSION_DENIED
        ) {
          setLocationError(
            "Akses lokasi ditolak. Izinkan lokasi pada browser lalu coba lagi."
          );
        } else if (
          err?.code ===
          err.POSITION_UNAVAILABLE
        ) {
          setLocationError(
            "Lokasi tidak tersedia. Pastikan GPS/perizinan lokasi aktif."
          );
        } else if (
          err?.code ===
          err.TIMEOUT
        ) {
          setLocationError(
            "Pengambilan lokasi terlalu lama. Silakan coba lagi."
          );
        } else {
          setLocationError(
            "Lokasi tidak dapat diambil. Silakan coba lagi."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const capturePhoto = () => {
    setError("");
    setSuccessMessage("");

    if (!videoRef.current) {
      setError("Kamera belum siap.");
      return;
    }

    if (!cameraReady) {
      setError(
        "Kamera belum siap. Silakan tunggu sebentar."
      );
      return;
    }

    const video = videoRef.current;

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setError(
        "Kamera belum memiliki gambar yang dapat diambil."
      );
      return;
    }

    const canvas =
      canvasRef.current ||
      document.createElement("canvas");

    const width =
      video.videoWidth || 640;

    const height =
      video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setError(
        "Gagal memproses foto."
      );
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.85
      );

    setPhoto(image);
    setError("");
  };

  const clearPhoto = () => {
    setPhoto("");
    setSuccessMessage("");
    setError("");
  };

  const canSubmit =
    !isLoadingAttendance &&
    !isSubmitting &&
    !isComplete &&
    currentAction === attendanceType &&
    Boolean(location) &&
    Boolean(workLocation) &&
    Number.isFinite(distance) &&
    Boolean(photo) &&
    cameraReady &&
    !locationLoading;

  const isCheckout =
    currentAction === "pulang";

  const isEarlyCheckout = () => {
    if (!isCheckout) {
      return false;
    }

    const now = new Date();

    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();

    if (day >= 1 && day <= 4) {
      return (
        hour <
          CHECK_OUT_HOUR_MONDAY_THURSDAY ||
        (
          hour ===
            CHECK_OUT_HOUR_MONDAY_THURSDAY &&
          minute <
            CHECK_OUT_MINUTE_MONDAY_THURSDAY
        )
      );
    }

    if (day === 5) {
      return (
        hour <
          CHECK_OUT_HOUR_FRIDAY ||
        (
          hour ===
            CHECK_OUT_HOUR_FRIDAY &&
          minute <
            CHECK_OUT_MINUTE_FRIDAY
        )
      );
    }

    return false;
  };

  const handleSubmit = () => {
    setError("");
    setSuccessMessage("");

    if (isComplete) {
      setError(
        "Absensi hari ini sudah selesai."
      );
      return;
    }

    if (!location) {
      setError(
        "Lokasi belum tersedia."
      );
      return;
    }

    if (!workLocation) {
      setError(
        "Status lokasi belum tersedia."
      );
      return;
    }

    if (!Number.isFinite(distance)) {
      setError(
        "Jarak dari kantor belum tersedia."
      );
      return;
    }

    if (!photo) {
      setError(
        "Silakan ambil foto terlebih dahulu."
      );
      return;
    }

    if (!cameraReady) {
      setError(
        "Kamera belum siap."
      );
      return;
    }

    if (
      currentAction !== attendanceType
    ) {
      setError(
        attendanceType === "masuk"
          ? "Saat ini hanya dapat melakukan Absen Masuk."
          : "Saat ini hanya dapat melakukan Absen Pulang."
      );
      return;
    }

    if (isEarlyCheckout()) {
      setShowEarlyCheckout(true);
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmAttendance =
    async () => {
      setShowConfirm(false);
      setShowEarlyCheckout(false);

      setError("");
      setSuccessMessage("");
      setIsSubmitting(true);

      try {
        if (!location) {
          throw new Error(
            "Lokasi tidak tersedia."
          );
        }

        if (!Number.isFinite(distance)) {
          throw new Error(
            "Jarak dari kantor tidak tersedia."
          );
        }

        if (!photo) {
          throw new Error(
            "Foto belum tersedia."
          );
        }

        const payload = {
          work_mode: workLocation,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          photo,
        };

        let response;

        if (
          currentAction === "masuk"
        ) {
          response =
            await checkIn(payload);
        } else {
          response =
            await checkOut(payload);
        }

        console.log(
          "Attendance response:",
          response
        );

        setPhoto("");

        setSuccessMessage(
          currentAction === "masuk"
            ? "Absen Masuk berhasil dicatat."
            : "Absen Pulang berhasil dicatat."
        );

        await loadTodayAttendance();
      } catch (err) {
        console.error(
          "Gagal mengirim attendance:",
          err
        );

        setError(
          getBackendErrorMessage(err)
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  const retryAll = () => {
    setError("");
    setSuccessMessage("");

    getLocation();
    startCamera();
    loadTodayAttendance();
  };

  const displayAction =
    currentAction === "masuk"
      ? "Absen Masuk"
      : "Absen Pulang";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-blue">
                ABSENKU
              </p>

              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Absensi
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {formatDate(currentTime)}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Clock3
                size={18}
                className="text-brand-blue"
              />

              <span className="text-sm font-bold text-slate-800">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>

        {/* GLOBAL ERROR */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-bold text-red-800">
                Absensi gagal
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-green-600"
            />

            <div>
              <p className="text-sm font-bold text-green-800">
                Berhasil
              </p>

              <p className="mt-1 text-sm text-green-700">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* TODAY STATUS */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Status Hari Ini
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                {isLoadingAttendance
                  ? "Memuat..."
                  : isComplete
                  ? "Absensi Selesai"
                  : hasCheckedIn
                  ? "Sudah Absen Masuk"
                  : "Belum Absen Masuk"}
              </h2>
            </div>

            <button
              type="button"
              onClick={loadTodayAttendance}
              disabled={
                isLoadingAttendance ||
                isSubmitting
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  isLoadingAttendance
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div
              className={`rounded-xl border p-4 ${
                hasCheckedIn
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Absen Masuk
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-slate-900">
                    {hasCheckedIn
                      ? formatAttendanceTime(
                          attendance?.check_in_time
                        )
                      : "Belum"}
                  </p>
                </div>

                {hasCheckedIn ? (
                  <CheckCircle2
                    size={24}
                    className="text-green-600"
                  />
                ) : (
                  <Clock3
                    size={24}
                    className="text-slate-400"
                  />
                )}
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                hasCheckedOut
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Absen Pulang
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-slate-900">
                    {hasCheckedOut
                      ? formatAttendanceTime(
                          attendance?.check_out_time
                        )
                      : "Belum"}
                  </p>
                </div>

                {hasCheckedOut ? (
                  <CheckCircle2
                    size={24}
                    className="text-green-600"
                  />
                ) : (
                  <Clock3
                    size={24}
                    className="text-slate-400"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

          {/* CAMERA */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue">
                  <Camera size={20} />
                </div>

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Foto Kehadiran
                  </h2>

                  <p className="text-sm text-slate-500">
                    Ambil foto wajah untuk presensi.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">

              <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950">
                {photo ? (
                  <img
                    src={photo}
                    alt="Foto presensi"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                )}

                {!cameraReady &&
                  !photo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 px-6 text-center">
                      <div>
                        <Camera
                          size={36}
                          className="mx-auto text-white/70"
                        />

                        <p className="mt-3 text-sm font-semibold text-white">
                          Kamera sedang disiapkan...
                        </p>
                      </div>
                    </div>
                  )}

                {photo && (
                  <div className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1.5 text-xs font-bold text-white">
                    Foto siap
                  </div>
                )}
              </div>

              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {cameraError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">
                    {cameraError}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                {!photo ? (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={
                      !cameraReady ||
                      isSubmitting ||
                      isComplete
                    }
                    className="flex-1 rounded-xl bg-brand-blue px-4 py-3 font-bold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Ambil Foto
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={clearPhoto}
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Ambil Ulang
                    </button>

                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={isSubmitting}
                      className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      aria-label="Aktifkan kamera"
                    >
                      <Camera size={19} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ATTENDANCE ACTION */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow-light text-slate-800">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Status Lokasi
                  </h2>

                  <p className="text-sm text-slate-500">
                    Lokasi digunakan untuk menentukan WFO/WFH.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">

              {/* LOCATION */}

              <div className="rounded-xl bg-slate-50 p-4">
                {locationLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-blue" />

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Mengambil lokasi...
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Mohon tunggu sebentar.
                      </p>
                    </div>
                  </div>
                ) : location ? (
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                            workLocation === "WFO"
                              ? "bg-brand-blue-light text-brand-blue"
                              : "bg-brand-yellow-light text-slate-700"
                          }`}
                        >
                          <MapPin size={21} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Mode Kerja
                          </p>

                          <p className="mt-0.5 text-xl font-extrabold text-slate-900">
                            {workLocation}
                          </p>
                        </div>
                      </div>

                      <CheckCircle2
                        size={23}
                        className="text-green-600"
                      />
                    </div>

                    {/* DISTANCE */}

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Jarak dari kantor
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-slate-900">
                            {formatDistance(distance)}
                          </p>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
                            workLocation === "WFO"
                              ? "bg-green-100 text-green-700"
                              : "bg-brand-yellow-light text-slate-800"
                          }`}
                        >
                          {workLocation === "WFO"
                            ? "DALAM RADIUS"
                            : "DI LUAR RADIUS"}
                        </div>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            workLocation === "WFO"
                              ? "bg-brand-blue"
                              : "bg-brand-yellow"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                5,
                                ((OFFICE_RADIUS -
                                  Math.min(
                                    distance,
                                    OFFICE_RADIUS
                                  )) /
                                  OFFICE_RADIUS) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Batas WFO adalah{" "}
                        <strong>
                          {OFFICE_RADIUS} meter
                        </strong>{" "}
                        dari lokasi kantor.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Lokasi belum tersedia.
                    </p>

                    {locationError && (
                      <p className="mt-1 text-xs leading-relaxed text-red-600">
                        {locationError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={getLocation}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white hover:bg-brand-blue-dark"
                    >
                      <RefreshCw size={15} />
                      Coba Lagi
                    </button>
                  </div>
                )}
              </div>

              {/* PRIVACY */}

              <div className="mt-4 flex gap-3 rounded-xl border border-slate-200 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-brand-blue"
                />

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Lokasi terlindungi
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Sistem menggunakan GPS untuk
                    menentukan status WFO/WFH dan
                    menghitung jarak Anda dari kantor.
                    Koordinat GPS tidak ditampilkan.
                  </p>
                </div>
              </div>

              {/* ACTION */}

              <div className="mt-6">

                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">
                    Aksi berikutnya
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      isComplete
                        ? "bg-green-100 text-green-700"
                        : currentAction === "masuk"
                        ? "bg-brand-blue-light text-brand-blue-dark"
                        : "bg-brand-yellow-light text-slate-800"
                    }`}
                  >
                    {isComplete
                      ? "SELESAI"
                      : displayAction.toUpperCase()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full rounded-xl bg-brand-blue px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Mengirim..."
                    : isComplete
                    ? "Absensi Hari Ini Selesai"
                    : currentAction === "masuk"
                    ? "Absen Masuk"
                    : "Absen Pulang"}
                </button>

                {!photo && !isComplete && (
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Ambil foto terlebih dahulu untuk melanjutkan.
                  </p>
                )}

                {photo &&
                  !location &&
                  !isComplete && (
                    <p className="mt-3 text-center text-xs text-slate-400">
                      Menunggu lokasi perangkat.
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* RULES */}

        <div className="mt-6 rounded-2xl border border-brand-blue-light bg-white p-5 shadow-sm">
          <h3 className="font-extrabold text-slate-900">
            Informasi Absensi
          </h3>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-brand-blue"
              />

              <p>
                Sebelum pukul{" "}
                <strong>12:00</strong> → Absen Masuk.
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-brand-blue"
              />

              <p>
                Pukul <strong>12:00</strong> atau
                setelahnya → Absen Pulang.
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-brand-blue"
              />

              <p>
                Dalam radius{" "}
                <strong>{OFFICE_RADIUS} meter</strong>{" "}
                → <strong>WFO</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-brand-blue"
              />

              <p>
                Di luar radius{" "}
                <strong>{OFFICE_RADIUS} meter</strong>{" "}
                → <strong>WFH</strong>.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* CONFIRM MODAL */}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
              <ShieldCheck size={24} />
            </div>

            <h2 className="mt-4 text-xl font-extrabold text-slate-900">
              Konfirmasi Absensi
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Pastikan foto, status lokasi, dan jarak
              sudah benar sebelum dikirim ke sistem.
            </p>

            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Jenis
                </span>

                <span className="text-sm font-extrabold text-slate-900">
                  {displayAction}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Waktu
                </span>

                <span className="text-sm font-extrabold text-slate-900">
                  {formatTime()}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Status lokasi
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                    workLocation === "WFO"
                      ? "bg-brand-blue-light text-brand-blue-dark"
                      : "bg-brand-yellow-light text-slate-800"
                  }`}
                >
                  {workLocation}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Jarak dari kantor
                </span>

                <span className="text-sm font-extrabold text-slate-900">
                  {formatDistance(distance)}
                </span>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowConfirm(false)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmAttendance
                }
                className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white hover:bg-brand-blue-dark"
              >
                Konfirmasi
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EARLY CHECKOUT MODAL */}

      {showEarlyCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow-light text-slate-800">
              <Clock3 size={24} />
            </div>

            <h2 className="mt-4 text-xl font-extrabold text-slate-900">
              Absen Pulang Lebih Awal?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Kamu melakukan Absen Pulang sebelum
              jam pulang resmi. Apakah kamu yakin
              ingin melanjutkan?
            </p>

            <div className="mt-5 rounded-xl border border-brand-yellow bg-brand-yellow-light p-4">
              <p className="text-sm font-semibold text-slate-800">
                Jam pulang resmi:
              </p>

              <p className="mt-1 text-lg font-extrabold text-slate-900">
                Senin–Kamis 16:30
                <br />
                Jumat 16:00
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowEarlyCheckout(false)
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEarlyCheckout(false);
                  setShowConfirm(true);
                }}
                className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white hover:bg-brand-blue-dark"
              >
                Tetap Absen
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}