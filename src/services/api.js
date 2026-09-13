/* =========================================================
   API CONFIG
   ========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://presensi-be.vercel.app"
).replace(/\/+$/, "");


/* =========================================================
   STORAGE KEYS
   ========================================================= */

export const AUTH_STORAGE_KEY = "pkl_auth";
export const TOKEN_STORAGE_KEY = "token";
export const USER_STORAGE_KEY = "user";


/* =========================================================
   REQUEST HELPER
   ========================================================= */

async function request(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request gagal (${response.status})`;

    const error = new Error(message);

    error.status = response.status;
    error.code =
      data?.code ||
      data?.error_code ||
      null;
    error.response = data;

    throw error;
  }

  return data;
}


/* =========================================================
   AUTH
   ========================================================= */

/*
  Login menggunakan Email atau NISN.

  Tidak ada pilihan Admin / Siswa.
  Role ditentukan oleh backend.
*/

export async function login(
  identifier,
  password
) {
  return request(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        identifier,
        password,
      }),
    }
  );
}


/*
  Ambil user yang sedang login.
*/

export async function getMe() {
  return request(
    "/api/auth/me",
    {
      method: "GET",
    }
  );
}


/*
  Ambil profile user.
*/

export async function getProfile() {
  return request(
    "/api/auth/profile",
    {
      method: "GET",
    }
  );
}


/*
  Update profile user.
*/

export async function updateProfile(
  data = {}
) {
  return request(
    "/api/auth/profile",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}


/*
  Alias untuk halaman Admin Profile.
*/

export async function updateAdminProfile(
  data = {}
) {
  return updateProfile(data);
}


/* =========================================================
   ATTENDANCE - STUDENT
   ========================================================= */

export async function getTodayAttendance() {
  return request(
    "/api/attendance/today",
    {
      method: "GET",
    }
  );
}


export async function checkIn(
  data = {}
) {
  return request(
    "/api/attendance/check-in",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


export async function checkOut(
  data = {}
) {
  return request(
    "/api/attendance/check-out",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


export async function getAttendanceHistory(
  params = {}
) {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(key, value);
      }
    }
  );

  const queryString =
    query.toString();

  return request(
    `/api/attendance/history${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    {
      method: "GET",
    }
  );
}


/* =========================================================
   IZIN - STUDENT
   ========================================================= */

export async function getIzin() {
  return request(
    "/api/izin",
    {
      method: "GET",
    }
  );
}


/*
  Digunakan oleh AttendanceHistory.jsx.
*/

export async function getMyIzin() {
  return request(
    "/api/izin",
    {
      method: "GET",
    }
  );
}


/*
  Membuat pengajuan izin.
*/

export async function createIzin(
  data = {}
) {
  return request(
    "/api/izin",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


/*
  Alias yang digunakan oleh Izin.jsx.
*/

export async function submitIzin(
  data = {}
) {
  return createIzin(data);
}


/*
  Upload lampiran izin.
*/

export async function uploadIzinAttachment(
  id,
  file
) {
  if (!id) {
    throw new Error(
      "ID izin tidak ditemukan."
    );
  }

  if (!file) {
    throw new Error(
      "File lampiran tidak ditemukan."
    );
  }

  const token =
    localStorage.getItem(
      TOKEN_STORAGE_KEY
    );

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await fetch(
      `${API_BASE_URL}/api/izin/${id}/attachment`,
      {
        method: "POST",
        headers: {
          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },
        body: formData,
      }
    );

  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
          data?.error ||
          `Upload gagal (${response.status})`
      );

    error.status =
      response.status;

    error.code =
      data?.code ||
      data?.error_code ||
      null;

    error.response = data;

    throw error;
  }

  return data;
}


/* =========================================================
   ADMIN - ATTENDANCE
   ========================================================= */

export async function getAdminAttendanceToday() {
  return request(
    "/api/admin/attendance/today",
    {
      method: "GET",
    }
  );
}


/*
  Alias untuk Dashboard.jsx.

  Kedua nama ini menggunakan endpoint
  admin attendance hari ini yang sama.
*/

export async function getAdminTodayAttendance() {
  return getAdminAttendanceToday();
}


export async function getAdminAttendanceHistory(
  params = {}
) {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(
          key,
          value
        );
      }
    }
  );

  const queryString =
    query.toString();

  return request(
    `/api/admin/attendance/history${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    {
      method: "GET",
    }
  );
}


/* =========================================================
   ADMIN - STUDENTS
   ========================================================= */

export async function getAdminStudents() {
  return request(
    `/api/admin/students?_=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
}


export async function createAdminStudent(
  data = {}
) {
  return request(
    "/api/admin/students",
    {
      method: "POST",
      body: JSON.stringify({
        email:
          data?.email || "",

        password:
          data?.password || "",

        full_name:
          data?.full_name ||
          data?.name ||
          "",

        nisn:
          data?.nisn || "",

        school:
          data?.school || "",

        major:
          data?.major || "",

        phone:
          data?.phone || "",

        gender:
          data?.gender || "",

        class_name:
          data?.class_name ||
          data?.className ||
          "",
      }),
    }
  );
}


/* =========================================================
   ADMIN - IZIN
   ========================================================= */

export async function getAdminIzin() {
  return request(
    "/api/admin/izin",
    {
      method: "GET",
    }
  );
}


export async function updateAdminIzinStatus(
  id,
  status
) {
  return request(
    `/api/admin/izin/${id}/status`,
    {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
    }
  );
}


/* =========================================================
   DOWNLOAD FILE
   ========================================================= */

async function downloadFile(
  endpoint,
  filename
) {
  const token =
    localStorage.getItem(
      TOKEN_STORAGE_KEY
    );

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "GET",
        headers: {
          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

  if (!response.ok) {
    let message =
      `Download gagal (${response.status})`;

    try {
      const data =
        await response.json();

      message =
        data?.message ||
        data?.error ||
        message;
    } catch {
      // Response bukan JSON
    }

    const error =
      new Error(message);

    error.status =
      response.status;

    throw error;
  }

  const blob =
    await response.blob();

  const url =
    window.URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;
  link.download = filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    url
  );

  return true;
}


/* =========================================================
   EXPORT ADMIN ATTENDANCE - EXCEL
   ========================================================= */

export async function downloadAdminAttendanceExcel(
  params = {}
) {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(
          key,
          value
        );
      }
    }
  );

  const queryString =
    query.toString();

  return downloadFile(
    `/api/admin/attendance/export/excel${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    "attendance.xlsx"
  );
}


/* =========================================================
   EXPORT ADMIN ATTENDANCE - PDF
   ========================================================= */

export async function downloadAdminAttendancePdf(
  params = {}
) {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(
          key,
          value
        );
      }
    }
  );

  const queryString =
    query.toString();

  return downloadFile(
    `/api/admin/attendance/export/pdf${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    "attendance.pdf"
  );
}


/* =========================================================
   TOKEN HELPERS
   ========================================================= */

export function saveToken(
  token
) {
  if (token) {
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      token
    );
  }
}


export function getToken() {
  return localStorage.getItem(
    TOKEN_STORAGE_KEY
  );
}


export function removeToken() {
  localStorage.removeItem(
    TOKEN_STORAGE_KEY
  );
}


/* =========================================================
   USER HELPERS
   ========================================================= */

export function saveUser(
  user
) {
  if (user) {
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(user)
    );
  }
}


export function getUser() {
  const user =
    localStorage.getItem(
      USER_STORAGE_KEY
    );

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(
      user
    );
  } catch {
    localStorage.removeItem(
      USER_STORAGE_KEY
    );

    return null;
  }
}


export function removeUser() {
  localStorage.removeItem(
    USER_STORAGE_KEY
  );
}


/* =========================================================
   AUTH SESSION
   ========================================================= */

export function saveAuthSession(
  authData
) {
  if (!authData) {
    return;
  }

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

  if (authData?.user) {
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(
        authData.user
      )
    );
  }
}


export function getAuthSession() {
  const savedData =
    localStorage.getItem(
      AUTH_STORAGE_KEY
    );

  if (!savedData) {
    return null;
  }

  try {
    const parsedData =
      JSON.parse(
        savedData
      );

    if (
      parsedData?.isLoggedIn !==
      true
    ) {
      return null;
    }

    return parsedData;
  } catch {
    localStorage.removeItem(
      AUTH_STORAGE_KEY
    );

    return null;
  }
}


/*
  Memperbarui data user yang
  tersimpan di browser.

  Dipakai oleh Profile.jsx.
*/

export function updateStoredUser(
  data = {}
) {
  const currentUser =
    getUser() || {};

  const updatedUser = {
    ...currentUser,
    ...data,
  };

  /*
    Simpan ke localStorage "user".
  */
  saveUser(
    updatedUser
  );

  /*
    Update juga session "pkl_auth".
  */
  const currentSession =
    getAuthSession();

  if (currentSession) {
    const updatedSession = {
      ...currentSession,
      user: updatedUser,
    };

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(
        updatedSession
      )
    );
  }

  return updatedUser;
}


export function clearAuthSession() {
  localStorage.removeItem(
    AUTH_STORAGE_KEY
  );

  localStorage.removeItem(
    TOKEN_STORAGE_KEY
  );

  localStorage.removeItem(
    USER_STORAGE_KEY
  );
}


/* =========================================================
   LOGOUT
   ========================================================= */

export function logout() {
  clearAuthSession();
}


/* =========================================================
   DEFAULT API OBJECT
   ========================================================= */

const api = {
  /* AUTH */
  login,
  getMe,
  getProfile,
  updateProfile,
  updateAdminProfile,

  /* ATTENDANCE */
  getTodayAttendance,
  checkIn,
  checkOut,
  getAttendanceHistory,

  /* IZIN */
  getIzin,
  getMyIzin,
  createIzin,
  submitIzin,
  uploadIzinAttachment,

  /* ADMIN ATTENDANCE */
  getAdminAttendanceToday,
  getAdminTodayAttendance,
  getAdminAttendanceHistory,

  /* ADMIN STUDENTS */
  getAdminStudents,
  createAdminStudent,

  /* ADMIN IZIN */
  getAdminIzin,
  updateAdminIzinStatus,

  /* EXPORT */
  downloadAdminAttendanceExcel,
  downloadAdminAttendancePdf,

  /* TOKEN */
  saveToken,
  getToken,
  removeToken,

  /* USER */
  saveUser,
  getUser,
  removeUser,
  updateStoredUser,

  /* SESSION */
  saveAuthSession,
  getAuthSession,
  clearAuthSession,

  /* LOGOUT */
  logout,
};


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

export default api;


/* =========================================================
   API BASE URL EXPORT
   ========================================================= */

export {
  API_BASE_URL,
};