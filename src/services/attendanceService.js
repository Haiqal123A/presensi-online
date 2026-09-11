const STORAGE_KEY = "pkl_attendance";

// ============================================================
// DATE
// ============================================================

export const getTodayKey = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ============================================================
// EMPTY DATA
// ============================================================

export const createEmptyAttendance = () => ({
  date: getTodayKey(),
  masuk: null,
  pulang: null,
});

// ============================================================
// GET ATTENDANCE
// ============================================================

export const getAttendance = () => {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return createEmptyAttendance();
  }

  try {
    const parsedData = JSON.parse(savedData);

    // Data hari sebelumnya tidak digunakan
    // untuk status hari ini.
    if (parsedData.date !== getTodayKey()) {
      return createEmptyAttendance();
    }

    return parsedData;
  } catch (error) {
    console.error(
      "Gagal membaca data attendance:",
      error
    );

    return createEmptyAttendance();
  }
};

// ============================================================
// SAVE ATTENDANCE
// ============================================================

export const saveAttendance = (attendance) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(attendance)
  );

  return attendance;
};

// ============================================================
// SAVE ATTENDANCE RECORD
// ============================================================

export const saveAttendanceRecord = (record) => {
  const currentAttendance = getAttendance();

  const updatedAttendance = {
    ...currentAttendance,
    date: getTodayKey(),
  };

  if (record.type === "masuk") {
    updatedAttendance.masuk = record;
  }

  if (record.type === "pulang") {
    updatedAttendance.pulang = record;
  }

  return saveAttendance(updatedAttendance);
};

// ============================================================
// CHECK STATUS
// ============================================================

export const hasAttendance = (type) => {
  const attendance = getAttendance();

  if (type === "masuk") {
    return Boolean(attendance.masuk);
  }

  if (type === "pulang") {
    return Boolean(attendance.pulang);
  }

  return false;
};

export const isAttendanceComplete = () => {
  const attendance = getAttendance();

  return Boolean(
    attendance.masuk && attendance.pulang
  );
};

// ============================================================
// CLEAR ATTENDANCE
// ============================================================
// Hanya untuk development/testing.
// Jangan digunakan di production.

export const clearAttendance = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// ============================================================
// ATTENDANCE TYPE
// ============================================================

export const getAttendanceType = (
  date = new Date()
) => {
  const hour = date.getHours();

  return hour < 12 ? "masuk" : "pulang";
};

// ============================================================
// FORMAT TIME
// ============================================================

export const formatTime = (
  date = new Date()
) => {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// ============================================================
// FORMAT DATE
// ============================================================

export const formatDate = (
  date = new Date()
) => {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};