const API_BASE_URL = "https://presensi-be.vercel.app";

export const AUTH_STORAGE_KEY = "pkl_auth";
export const TOKEN_STORAGE_KEY = "token";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok || result?.success === false) {
    const message =
      result?.message ||
      `Terjadi kesalahan pada server (${response.status}).`;

    const error = new Error(message);
    error.status = response.status;
    error.code = result?.code || result?.error?.code || null;
    error.response = result;

    throw error;
  }

  return result;
}

// =========================
// AUTH
// =========================

export async function login(identifier, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
    }),
  });
}

export async function getMe() {
  return request("/api/auth/me", {
    method: "GET",
  });
}

export async function updateProfile(data) {
  return request("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// =========================
// ATTENDANCE
// =========================

export async function getTodayAttendance() {
  return request("/api/attendance/today", {
    method: "GET",
  });
}

export async function checkIn(data) {
  return request("/api/attendance/check-in", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkOut(data) {
  return request("/api/attendance/check-out", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAttendanceHistory({
  page = 1,
  limit = 10,
  month,
  year,
} = {}) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (month !== undefined && month !== null && month !== "") {
    params.set("month", month);
  }

  if (year !== undefined && year !== null && year !== "") {
    params.set("year", year);
  }

  return request(`/api/attendance/history?${params.toString()}`, {
    method: "GET",
  });
}

// =========================
// IZIN
// =========================

export async function submitIzin({
  tipeIzin,
  tanggalMulai,
  tanggalSelesai,
  alasan,
  lampiran,
}) {
  const formData = new FormData();

  formData.append("tipe_izin", tipeIzin);
  formData.append("tanggal_mulai", tanggalMulai);
  formData.append("tanggal_selesai", tanggalSelesai);
  formData.append("alasan", alasan);

  if (lampiran) {
    formData.append("lampiran", lampiran);
  }

  return request("/api/izin", {
    method: "POST",
    body: formData,
  });
}

export async function getMyIzin(status = "") {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  const query = params.toString();

  return request(`/api/izin${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function getIzinAttachment(id) {
  return request(`/api/izin/${id}/attachment`, {
    method: "GET",
  });
}

// =========================
// ADMIN
// =========================

export async function getAdminTodayAttendance() {
  return request("/api/admin/attendance/today", {
    method: "GET",
  });
}

export async function getAdminAttendanceHistory({
  startDate,
  endDate,
  search,
} = {}) {
  const params = new URLSearchParams();

  if (startDate) {
    params.set("start_date", startDate);
  }

  if (endDate) {
    params.set("end_date", endDate);
  }

  if (search) {
    params.set("search", search);
  }

  const query = params.toString();

  return request(
    `/api/admin/attendance/history${query ? `?${query}` : ""}`,
    {
      method: "GET",
    }
  );
}

export async function getAdminStudents() {
  return request("/api/admin/students", {
    method: "GET",
  });
}

export async function createAdminStudent(data) {
  return request("/api/admin/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAdminIzin() {
  return request("/api/admin/izin", {
    method: "GET",
  });
}

export async function updateAdminIzinStatus(id, data) {
  return request(`/api/admin/izin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function downloadAdminAttendanceExcel() {
  return request("/api/admin/attendance/export", {
    method: "GET",
  });
}

export async function downloadAdminAttendancePdf() {
  return request("/api/admin/attendance/export/pdf", {
    method: "GET",
  });
}

// =========================
// SESSION
// =========================

export function saveAuthSession(authData) {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(authData)
  );

  if (authData?.token) {
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      authData.token
    );
  }
}

export function getAuthSession() {
  const savedData = localStorage.getItem(
    AUTH_STORAGE_KEY
  );

  if (!savedData) {
    return null;
  }

  try {
    const parsedData = JSON.parse(savedData);

    if (parsedData?.isLoggedIn !== true) {
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error(
      "Gagal membaca session login:",
      error
    );

    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export { API_BASE_URL };