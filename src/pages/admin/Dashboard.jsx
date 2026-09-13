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
  RefreshCw,
  ClipboardList,
  LogIn,
  LogOut,
  Sparkles,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getAdminTodayAttendance,
  getAdminStudents,
  getAdminIzin,
} from "../../services/api";

/* =========================================================
   RESPONSE HELPER
========================================================= */

function unwrapResponse(response) {
  if (!response) return null;

  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
}

function getArray(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

function findArrayDeep(data, keys = [], depth = 0) {
  if (depth > 8 || data == null) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data !== "object") {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  for (const value of Object.values(data)) {
    if (value && typeof value === "object") {
      const result = findArrayDeep(
        value,
        keys,
        depth + 1
      );

      if (result.length > 0) {
        return result;
      }
    }
  }

  return [];
}

/* =========================================================
   GENERIC VALUE HELPER
========================================================= */

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return null;
}

/* =========================================================
   STUDENT
========================================================= */

function getName(item) {
  return (
    firstValue(
      item?.full_name,
      item?.fullName,
      item?.nama_lengkap,
      item?.namaLengkap,
      item?.nama,
      item?.name,

      item?.student_name,
      item?.studentName,

      item?.user?.full_name,
      item?.user?.fullName,
      item?.user?.nama_lengkap,
      item?.user?.namaLengkap,
      item?.user?.nama,
      item?.user?.name,

      item?.student?.full_name,
      item?.student?.fullName,
      item?.student?.nama_lengkap,
      item?.student?.namaLengkap,
      item?.student?.nama,
      item?.student?.name,

      item?.student_data?.full_name,
      item?.student_data?.fullName,
      item?.student_data?.nama_lengkap,
      item?.student_data?.nama,
      item?.student_data?.name,

      item?.studentData?.full_name,
      item?.studentData?.fullName,
      item?.studentData?.nama_lengkap,
      item?.studentData?.nama,
      item?.studentData?.name,

      item?.user_data?.full_name,
      item?.user_data?.fullName,
      item?.user_data?.nama_lengkap,
      item?.user_data?.nama,
      item?.user_data?.name,

      item?.userData?.full_name,
      item?.userData?.fullName,
      item?.userData?.nama_lengkap,
      item?.userData?.nama,
      item?.userData?.name
    ) || "Siswa"
  );
}

function getNisn(item) {
  return (
    firstValue(
      item?.nisn,
      item?.NISN,

      item?.student_nisn,
      item?.studentNisn,

      item?.nomor_induk,
      item?.nomorInduk,

      item?.user?.nisn,
      item?.user?.NISN,
      item?.user?.student_nisn,
      item?.user?.studentNisn,

      item?.student?.nisn,
      item?.student?.NISN,
      item?.student?.student_nisn,
      item?.student?.studentNisn,

      item?.student_data?.nisn,
      item?.student_data?.NISN,

      item?.studentData?.nisn,
      item?.studentData?.NISN,

      item?.user_data?.nisn,
      item?.user_data?.NISN,

      item?.userData?.nisn,
      item?.userData?.NISN
    ) || "-"
  );
}

/* =========================================================
   ID STUDENT
========================================================= */

function getStudentId(item) {
  return firstValue(
    item?.student_id,
    item?.studentId,

    item?.user_id,
    item?.userId,

    item?.id_user,
    item?.idUser,

    item?.user?.id,
    item?.user?.user_id,
    item?.user?.userId,

    item?.student?.id,
    item?.student?.student_id,
    item?.student?.studentId,

    item?.student_data?.id,
    item?.studentData?.id,

    item?.user_data?.id,
    item?.userData?.id,

    item?.id
  );
}

/* =========================================================
   STUDENT INDEX
========================================================= */

function buildStudentIndex(students) {
  const index = new Map();

  students.forEach((student) => {
    if (!student) return;

    const id = getStudentId(student);
    const nisn = getNisn(student);
    const name = getName(student);

    const email = firstValue(
      student?.email,
      student?.user?.email,
      student?.user_data?.email,
      student?.userData?.email
    );

    if (
      id !== null &&
      id !== undefined
    ) {
      index.set(
        `id:${String(id)
          .trim()
          .toLowerCase()}`,
        student
      );
    }

    if (
      nisn &&
      nisn !== "-" &&
      String(nisn).trim() !== ""
    ) {
      index.set(
        `nisn:${String(nisn)
          .trim()
          .toLowerCase()}`,
        student
      );
    }

    if (email) {
      index.set(
        `email:${String(email)
          .trim()
          .toLowerCase()}`,
        student
      );
    }

    if (
      name &&
      name !== "Siswa"
    ) {
      index.set(
        `name:${String(name)
          .trim()
          .toLowerCase()}`,
        student
      );
    }
  });

  return index;
}

/* =========================================================
   FIND STUDENT
========================================================= */

function findStudentForRecord(
  item,
  studentIndex
) {
  if (!item || !studentIndex) {
    return null;
  }

  const possibleIds = [
    item?.student_id,
    item?.studentId,

    item?.user_id,
    item?.userId,

    item?.id_user,
    item?.idUser,

    item?.user?.id,
    item?.user?.user_id,
    item?.user?.userId,

    item?.student?.id,
    item?.student?.student_id,
    item?.student?.studentId,

    item?.student_data?.id,
    item?.studentData?.id,

    item?.user_data?.id,
    item?.userData?.id,
  ];

  for (const id of possibleIds) {
    if (
      id !== undefined &&
      id !== null &&
      String(id).trim() !== ""
    ) {
      const student =
        studentIndex.get(
          `id:${String(id)
            .trim()
            .toLowerCase()}`
        );

      if (student) {
        return student;
      }
    }
  }

  const possibleNisn = [
    item?.nisn,
    item?.NISN,
    item?.student_nisn,
    item?.studentNisn,
    item?.user?.nisn,
    item?.student?.nisn,
  ];

  for (const nisn of possibleNisn) {
    if (
      nisn !== undefined &&
      nisn !== null &&
      String(nisn).trim() !== "" &&
      String(nisn) !== "-"
    ) {
      const student =
        studentIndex.get(
          `nisn:${String(nisn)
            .trim()
            .toLowerCase()}`
        );

      if (student) {
        return student;
      }
    }
  }

  const email = firstValue(
    item?.email,
    item?.user?.email,
    item?.student?.email
  );

  if (email) {
    const student =
      studentIndex.get(
        `email:${String(email)
          .trim()
          .toLowerCase()}`
      );

    if (student) {
      return student;
    }
  }

  return null;
}

/* =========================================================
   RESOLVE STUDENT DATA
========================================================= */

function resolveStudentData(
  item,
  studentIndex
) {
  const matchedStudent =
    findStudentForRecord(
      item,
      studentIndex
    );

  const recordName =
    getName(item);

  const recordNisn =
    getNisn(item);

  const studentName =
    matchedStudent
      ? getName(matchedStudent)
      : recordName;

  const studentNisn =
    matchedStudent
      ? getNisn(matchedStudent)
      : recordNisn;

  return {
    student: matchedStudent,

    name:
      studentName &&
      studentName !== "Siswa"
        ? studentName
        : "Siswa",

    nisn:
      studentNisn &&
      studentNisn !== "-"
        ? studentNisn
        : "-",
  };
}

/* =========================================================
   WORK MODE
========================================================= */

function normalizeWorkMode(value) {
  const mode = String(value || "")
    .trim()
    .toUpperCase();

  if (mode === "WFO") {
    return "WFO";
  }

  if (mode === "WFH") {
    return "WFH";
  }

  return null;
}

function getWorkMode(
  item,
  fallback = null
) {
  return (
    normalizeWorkMode(
      item?.work_mode
    ) ||
    normalizeWorkMode(
      item?.workMode
    ) ||
    normalizeWorkMode(
      item?.location_type
    ) ||
    normalizeWorkMode(
      item?.locationType
    ) ||

    normalizeWorkMode(
      item?.check_in?.work_mode
    ) ||

    normalizeWorkMode(
      item?.checkIn?.work_mode
    ) ||

    normalizeWorkMode(
      item?.check_in?.workMode
    ) ||

    normalizeWorkMode(
      item?.checkIn?.workMode
    ) ||

    normalizeWorkMode(
      item?.check_out?.work_mode
    ) ||

    normalizeWorkMode(
      item?.checkOut?.work_mode
    ) ||

    normalizeWorkMode(
      item?.check_out?.workMode
    ) ||

    normalizeWorkMode(
      item?.checkOut?.workMode
    ) ||

    fallback
  );
}

/* =========================================================
   ATTENDANCE
========================================================= */

function getTimestamp(
  item,
  type = "in"
) {
  if (!item) return null;

  if (type === "in") {
    return (
      item?.check_in_time ||
      item?.checkInTime ||

      item?.check_in_at ||
      item?.checkInAt ||

      item?.check_in?.time ||
      item?.check_in?.timestamp ||
      item?.check_in?.created_at ||

      item?.checkIn?.time ||
      item?.checkIn?.timestamp ||
      item?.checkIn?.created_at ||

      item?.clock_in ||
      item?.clockIn ||

      item?.masuk ||

      null
    );
  }

  return (
    item?.check_out_time ||
    item?.checkOutTime ||

    item?.check_out_at ||
    item?.checkOutAt ||

    item?.check_out?.time ||
    item?.check_out?.timestamp ||
    item?.check_out?.created_at ||

    item?.checkOut?.time ||
    item?.checkOut?.timestamp ||
    item?.checkOut?.created_at ||

    item?.clock_out ||
    item?.clockOut ||

    item?.pulang ||

    null
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

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value).slice(
      0,
      5
    );
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone:
        "Asia/Jakarta",
    }
  ).format(date);
}

function getAttendanceRecords(data) {
  return findArrayDeep(
    data,
    [
      "attendance",
      "attendances",
      "records",
      "items",
      "results",
      "rows",
      "data",
    ]
  );
}

/* =========================================================
   IZIN
========================================================= */

function getIzinRecords(data) {
  return findArrayDeep(
    data,
    [
      "izin",
      "izins",
      "permissions",
      "permission",
      "requests",
      "leave_requests",
      "leaveRequests",
      "records",
      "items",
      "results",
      "rows",
      "data",
    ]
  );
}

function getIzinDate(item) {
  return firstValue(
    item?.tanggal_mulai,
    item?.tanggalMulai,

    item?.start_date,
    item?.startDate,

    item?.tanggal,
    item?.date,

    item?.izin_date,
    item?.izinDate,

    item?.tanggal_izin,
    item?.tanggalIzin,

    item?.izin?.tanggal_mulai,
    item?.izin?.tanggalMulai,
    item?.izin?.start_date,
    item?.izin?.startDate,
    item?.izin?.tanggal,
    item?.izin?.date,

    item?.permission?.tanggal_mulai,
    item?.permission?.start_date,

    item?.created_at,
    item?.createdAt,

    null
  );
}

function getIzinEndDate(item) {
  return (
    firstValue(
      item?.tanggal_selesai,
      item?.tanggalSelesai,

      item?.end_date,
      item?.endDate,

      item?.tanggal_akhir,
      item?.tanggalAkhir,

      item?.izin?.tanggal_selesai,
      item?.izin?.tanggalSelesai,
      item?.izin?.end_date,
      item?.izin?.endDate,

      item?.permission?.tanggal_selesai,
      item?.permission?.end_date
    ) ||
    getIzinDate(item)
  );
}

function getIzinType(item) {
  return (
    firstValue(
      item?.tipe_izin,
      item?.tipeIzin,

      item?.izin_type,
      item?.izinType,

      item?.type,

      item?.jenis_izin,
      item?.jenisIzin,

      item?.permission_type,
      item?.permissionType,

      item?.izin?.tipe_izin,
      item?.izin?.tipeIzin,
      item?.izin?.jenis_izin,
      item?.izin?.jenisIzin,
      item?.izin?.type,

      item?.permission?.type,
      item?.permission?.permission_type,

      "Izin"
    ) || "Izin"
  );
}

function getIzinReason(item) {
  return (
    firstValue(
      item?.alasan,
      item?.reason,
      item?.keterangan,
      item?.description,
      item?.catatan,
      item?.note,

      item?.alasan_izin,
      item?.alasanIzin,

      item?.izin?.alasan,
      item?.izin?.reason,
      item?.izin?.keterangan,
      item?.izin?.description,
      item?.izin?.catatan,
      item?.izin?.note,

      item?.permission?.reason,
      item?.permission?.description,

      "-"
    ) || "-"
  );
}

function getIzinStatus() {
  return "tercatat";
}

/* =========================================================
   JAKARTA DATE
========================================================= */

function getJakartaDateString(value) {
  if (!value) return null;

  if (
    typeof value === "string"
  ) {
    const match =
      value.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );

    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }

    const indonesiaMatch =
      value.match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
      );

    if (indonesiaMatch) {
      return `${indonesiaMatch[3]}-${String(
        indonesiaMatch[2]
      ).padStart(2, "0")}-${String(
        indonesiaMatch[1]
      ).padStart(2, "0")}`;
    }
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(date);

  const year =
    parts.find(
      (item) =>
        item.type === "year"
    )?.value;

  const month =
    parts.find(
      (item) =>
        item.type === "month"
    )?.value;

  const day =
    parts.find(
      (item) =>
        item.type === "day"
    )?.value;

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

function getTodayJakartaString() {
  const now = new Date();

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(now);

  const year =
    parts.find(
      (item) =>
        item.type === "year"
    )?.value;

  const month =
    parts.find(
      (item) =>
        item.type === "month"
    )?.value;

  const day =
    parts.find(
      (item) =>
        item.type === "day"
    )?.value;

  return `${year}-${month}-${day}`;
}

function isIzinToday(item) {
  const start =
    getJakartaDateString(
      getIzinDate(item)
    );

  const end =
    getJakartaDateString(
      getIzinEndDate(item)
    );

  const today =
    getTodayJakartaString();

  if (!start && !end) {
    return false;
  }

  const startDate =
    start || end;

  const endDate =
    end || start;

  return (
    today >= startDate &&
    today <= endDate
  );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone:
        "Asia/Jakarta",
    }
  ).format(date);
}

/* =========================================================
   RECENT IZIN
========================================================= */

function makeRecentIzin(
  records,
  studentIndex
) {
  return records
    .filter(isIzinToday)
    .sort((a, b) => {
      const dateA =
        new Date(
          getIzinDate(a) || 0
        ).getTime();

      const dateB =
        new Date(
          getIzinDate(b) || 0
        ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5)
    .map((item, index) => {
      const studentData =
        resolveStudentData(
          item,
          studentIndex
        );

      return {
        id:
          item?.id ||
          item?.izin_id ||
          item?.izinId ||
          `izin-${index}`,

        name:
          studentData.name,

        nisn:
          studentData.nisn,

        type:
          getIzinType(item),

        date:
          formatDate(
            getIzinDate(item)
          ),

        reason:
          getIzinReason(item),

        status:
          getIzinStatus(item),

        raw: item,
      };
    });
}

/* =========================================================
   STUDENTS
========================================================= */

function getStudentRecords(data) {
  return findArrayDeep(
    data,
    [
      "students",
      "student",
      "users",
      "records",
      "items",
      "results",
      "rows",
      "data",
    ]
  );
}

/* =========================================================
   ATTENDANCE STUDENT
========================================================= */

function getAttendanceStudent(
  item
) {
  return (
    item?.student ||
    item?.user ||
    item?.student_data ||
    item?.studentData ||
    item?.user_data ||
    item?.userData ||
    null
  );
}

function getAttendanceStudentName(
  item,
  studentIndex
) {
  const resolved =
    resolveStudentData(
      item,
      studentIndex
    );

  if (
    resolved.name &&
    resolved.name !== "Siswa"
  ) {
    return resolved.name;
  }

  return getName(
    getAttendanceStudent(item)
  );
}

function getAttendanceStudentNisn(
  item,
  studentIndex
) {
  const resolved =
    resolveStudentData(
      item,
      studentIndex
    );

  if (
    resolved.nisn &&
    resolved.nisn !== "-"
  ) {
    return resolved.nisn;
  }

  return getNisn(
    getAttendanceStudent(item)
  );
}

/* =========================================================
   RECENT ATTENDANCE
========================================================= */

function makeRecentAttendance(
  records,
  studentIndex
) {
  const items = [];

  records.forEach(
    (record, index) => {
      if (!record) return;

      const studentId =
        getStudentId(record) ||
        index;

      const checkIn =
        getTimestamp(
          record,
          "in"
        );

      const checkOut =
        getTimestamp(
          record,
          "out"
        );

      const checkInMode =
        getWorkMode(
          record?.check_in ||
            record?.checkIn ||
            record
        );

      const checkOutMode =
        getWorkMode(
          record?.check_out ||
            record?.checkOut ||
            record
        );

      if (checkIn) {
        items.push({
          id: `${studentId}-masuk`,

          name:
            getAttendanceStudentName(
              record,
              studentIndex
            ),

          nisn:
            getAttendanceStudentNisn(
              record,
              studentIndex
            ),

          type: "Absen Masuk",

          time:
            formatTime(
              checkIn
            ),

          timestamp:
            checkIn,

          location:
            checkInMode || "-",
        });
      }

      if (checkOut) {
        items.push({
          id: `${studentId}-pulang`,

          name:
            getAttendanceStudentName(
              record,
              studentIndex
            ),

          nisn:
            getAttendanceStudentNisn(
              record,
              studentIndex
            ),

          type: "Absen Pulang",

          time:
            formatTime(
              checkOut
            ),

          timestamp:
            checkOut,

          location:
            checkOutMode || "-",
        });
      }

      if (
        !checkIn &&
        !checkOut
      ) {
        const timestamp =
          record?.timestamp ||
          record?.time ||
          record?.created_at ||
          record?.createdAt ||
          null;

        if (!timestamp) {
          return;
        }

        const typeValue =
          String(
            record?.type ||
              record?.attendance_type ||
              record?.attendanceType ||
              record?.status ||
              ""
          ).toLowerCase();

        const isCheckout =
          typeValue.includes(
            "out"
          ) ||
          typeValue.includes(
            "pulang"
          ) ||
          typeValue.includes(
            "checkout"
          );

        items.push({
          id:
            record?.id ||
            `${studentId}-${index}`,

          name:
            getAttendanceStudentName(
              record,
              studentIndex
            ),

          nisn:
            getAttendanceStudentNisn(
              record,
              studentIndex
            ),

          type: isCheckout
            ? "Absen Pulang"
            : "Absen Masuk",

          time:
            formatTime(
              timestamp
            ),

          timestamp,

          location:
            getWorkMode(
              record
            ) || "-",
        });
      }
    }
  );

  items.sort((a, b) => {
    const timeA =
      new Date(
        a.timestamp
      ).getTime();

    const timeB =
      new Date(
        b.timestamp
      ).getTime();

    return timeB - timeA;
  });

  return items.slice(
    0,
    5
  );
}

/* =========================================================
   ATTENDANCE COUNT
========================================================= */

function countAttendance(
  records
) {
  const studentIds =
    new Set();

  let checkInCount = 0;
  let wfoCount = 0;
  let wfhCount = 0;

  records.forEach(
    (record, index) => {
      if (!record) return;

      const studentId =
        getStudentId(
          record
        ) ||
        getNisn(record) ||
        `record-${index}`;

      const checkIn =
        getTimestamp(
          record,
          "in"
        );

      const checkOut =
        getTimestamp(
          record,
          "out"
        );

      const hasCheckedIn =
        Boolean(checkIn) ||
        record?.has_checked_in ===
          true ||
        record?.hasCheckedIn ===
          true ||
        record?.checked_in ===
          true ||
        record?.checkedIn ===
          true;

      const hasCheckedOut =
        Boolean(checkOut) ||
        record?.has_checked_out ===
          true ||
        record?.hasCheckedOut ===
          true ||
        record?.checked_out ===
          true ||
        record?.checkedOut ===
          true;

      if (
        hasCheckedIn ||
        hasCheckedOut
      ) {
        studentIds.add(
          String(studentId)
        );
      }

      if (hasCheckedIn) {
        checkInCount += 1;
      }

      const inMode =
        getWorkMode(
          record?.check_in ||
            record?.checkIn ||
            record
        );

      const outMode =
        getWorkMode(
          record?.check_out ||
            record?.checkOut ||
            record
        );

      const mode =
        inMode || outMode;

      if (mode === "WFO") {
        wfoCount += 1;
      }

      if (mode === "WFH") {
        wfhCount += 1;
      }
    }
  );

  return {
    attendedStudents:
      studentIds.size,

    checkInCount,

    wfoCount,

    wfhCount,
  };
}

/* =========================================================
   TOTAL STUDENT
========================================================= */

function getTotalStudentCount(
  data,
  records
) {
  const directCount =
    data?.total ??
    data?.total_students ??
    data?.totalStudents ??
    data?.count ??
    data?.pagination?.total ??
    data?.meta?.total ??
    null;

  if (
    directCount !== null &&
    directCount !== undefined &&
    !Number.isNaN(
      Number(directCount)
    )
  ) {
    return Number(
      directCount
    );
  }

  return records.length;
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  loading,
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
      
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-50 transition duration-300 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
            {loading ? (
              <span className="inline-block h-8 w-14 animate-pulse rounded-lg bg-gray-100" />
            ) : (
              value
            )}
          </p>

          <p className="mt-2 text-xs leading-relaxed text-gray-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate =
    useNavigate();

  const [
    studentsData,
    setStudentsData,
  ] = useState(null);

  const [
    attendanceData,
    setAttendanceData,
  ] = useState(null);

  const [
    izinData,
    setIzinData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentDate,
    setCurrentDate,
  ] = useState(
    new Date()
  );

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const loadDashboard =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (silent) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const [
            studentsResponse,
            attendanceResponse,
            izinResponse,
          ] =
            await Promise.all([
              getAdminStudents(),
              getAdminTodayAttendance(),
              getAdminIzin(),
            ]);

          const studentsResult =
            unwrapResponse(
              studentsResponse
            );

          const attendanceResult =
            unwrapResponse(
              attendanceResponse
            );

          const izinResult =
            unwrapResponse(
              izinResponse
            );

          setStudentsData(
            studentsResult
          );

          setAttendanceData(
            attendanceResult
          );

          setIzinData(
            izinResult
          );

          console.log(
            "ADMIN STUDENTS DATA:",
            studentsResult
          );

          console.log(
            "ADMIN ATTENDANCE DATA:",
            attendanceResult
          );

          console.log(
            "ADMIN IZIN DATA:",
            izinResult
          );
        } catch (err) {
          console.error(
            "Gagal mengambil data dashboard admin:",
            err
          );

          setError(
            err?.message ||
              "Gagal mengambil data dashboard admin."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =====================================================
     CLOCK
  ===================================================== */

  useEffect(() => {
    const timer =
      setInterval(() => {
        setCurrentDate(
          new Date()
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, []);

  /* =====================================================
     AUTO REFRESH
  ===================================================== */

  useEffect(() => {
    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          loadDashboard({
            silent: true,
          });
        }
      };

    window.addEventListener(
      "focus",
      handleVisibility
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleVisibility
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [loadDashboard]);

  /* =====================================================
     DATA
  ===================================================== */

  const students =
    useMemo(
      () =>
        getStudentRecords(
          studentsData
        ),
      [studentsData]
    );

  const studentIndex =
    useMemo(
      () =>
        buildStudentIndex(
          students
        ),
      [students]
    );

  const attendanceRecords =
    useMemo(
      () =>
        getAttendanceRecords(
          attendanceData
        ),
      [attendanceData]
    );

  const izinRecords =
    useMemo(
      () =>
        getIzinRecords(
          izinData
        ),
      [izinData]
    );

  /* =====================================================
     SUMMARY
  ===================================================== */

  const attendanceSummary =
    useMemo(
      () =>
        countAttendance(
          attendanceRecords
        ),
      [attendanceRecords]
    );

  const totalStudents =
    useMemo(
      () =>
        getTotalStudentCount(
          studentsData,
          students
        ),
      [
        studentsData,
        students,
      ]
    );

  const todayIzinCount =
    useMemo(
      () =>
        izinRecords.filter(
          isIzinToday
        ).length,
      [izinRecords]
    );

  const attendedCount =
    attendanceSummary.attendedStudents ||
    attendanceSummary.checkInCount ||
    0;

  const belumAbsen =
    Math.max(
      totalStudents -
        attendedCount,
      0
    );

  const recentAttendance =
    useMemo(
      () =>
        makeRecentAttendance(
          attendanceRecords,
          studentIndex
        ),
      [
        attendanceRecords,
        studentIndex,
      ]
    );

  const recentIzin =
    useMemo(
      () =>
        makeRecentIzin(
          izinRecords,
          studentIndex
        ),
      [
        izinRecords,
        studentIndex,
      ]
    );

  const wfoCount =
    attendanceSummary.wfoCount;

  const wfhCount =
    attendanceSummary.wfhCount;

  const locationTotal =
    wfoCount + wfhCount;

  const wfoPercentage =
    locationTotal > 0
      ? Math.round(
          (wfoCount /
            locationTotal) *
            100
        )
      : 0;

  const wfhPercentage =
    locationTotal > 0
      ? Math.round(
          (wfhCount /
            locationTotal) *
            100
        )
      : 0;

  const attendancePercentage =
    totalStudents > 0
      ? Math.round(
          (attendedCount /
            totalStudents) *
            100
        )
      : 0;

  const belumAbsenPercentage =
    totalStudents > 0
      ? Math.round(
          (belumAbsen /
            totalStudents) *
            100
        )
      : 0;

  const izinPercentage =
    totalStudents > 0
      ? Math.round(
          (todayIzinCount /
            totalStudents) *
            100
        )
      : 0;

  const formattedDate =
    new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone:
          "Asia/Jakarta",
      }
    ).format(
      currentDate
    );

  const formattedTime =
    new Intl.DateTimeFormat(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone:
          "Asia/Jakarta",
      }
    ).format(
      currentDate
    );

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            HERO HEADER
        ================================================= */}

        <section className="relative mb-6 overflow-hidden rounded-[28px] bg-brand-blue px-6 py-7 text-white shadow-[0_15px_45px_rgba(30,64,175,0.18)] sm:px-8">
          
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute -left-20 bottom-[-100px] h-52 w-52 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Selamat Datang, Administrator
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                Pantau aktivitas absensi siswa PKL,
                kehadiran, izin, serta lokasi kerja
                dalam satu dashboard.
              </p>

            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">

              <button
                type="button"
                onClick={() =>
                  loadDashboard({
                    silent: true,
                  })
                }
                disabled={
                  refreshing
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-blue shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh Data
              </button>

              <div className="text-left sm:text-right lg:text-right">

                <p className="text-xs font-medium text-white/60">
                  {formattedDate}
                </p>

                <p className="mt-1 text-lg font-extrabold tracking-wide">
                  {formattedTime}
                </p>

              </div>

            </div>

          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm">
            
            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertCircle
                  size={18}
                />
              </div>

              <div className="min-w-0">

                <p className="text-sm font-extrabold text-red-800">
                  Gagal memuat dashboard
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadDashboard()
                  }
                  className="mt-3 text-sm font-bold text-red-800 underline"
                >
                  Coba lagi
                </button>

              </div>

            </div>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Siswa"
            value={
              totalStudents
            }
            description="Siswa PKL terdaftar"
            icon={Users}
            iconClass="bg-blue-50 text-brand-blue"
            loading={loading}
          />

          <StatCard
            label="Hadir Hari Ini"
            value={
              attendedCount
            }
            description="Siswa sudah melakukan absensi"
            icon={UserCheck}
            iconClass="bg-emerald-50 text-emerald-600"
            loading={loading}
          />

          <StatCard
            label="Belum Absen"
            value={
              belumAbsen
            }
            description="Siswa belum melakukan absensi"
            icon={UserX}
            iconClass="bg-orange-50 text-orange-600"
            loading={loading}
          />

          <StatCard
            label="Izin Hari Ini"
            value={
              todayIzinCount
            }
            description="Izin tercatat hari ini"
            icon={FileText}
            iconClass="bg-purple-50 text-purple-600"
            loading={loading}
          />

        </div>

        {/* =================================================
            MAIN ANALYTICS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* KEHADIRAN */}

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:col-span-2">

            <div className="flex items-start justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                    <UserCheck
                      size={19}
                    />
                  </div>

                  <div>

                    <h2 className="font-extrabold text-gray-900">
                      Ringkasan Kehadiran
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Kondisi absensi siswa hari ini
                    </p>

                  </div>

                </div>

              </div>

              <span className="hidden rounded-full bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500 sm:inline-flex">
                Hari ini
              </span>

            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

              {/* HADIR */}

              <div className="group rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 transition hover:-translate-y-0.5">

                <div className="flex items-center justify-between">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2
                      size={18}
                    />
                  </div>

                  <span className="text-xs font-bold text-emerald-600">
                    {loading
                      ? "—"
                      : `${attendancePercentage}%`}
                  </span>

                </div>

                <p className="mt-5 text-xs font-semibold text-gray-500">
                  Hadir
                </p>

                <p className="mt-1 text-3xl font-extrabold text-gray-900">
                  {loading
                    ? "—"
                    : attendedCount}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  siswa sudah absen
                </p>

              </div>

              {/* BELUM ABSEN */}

              <div className="group rounded-2xl border border-orange-100 bg-orange-50/60 p-5 transition hover:-translate-y-0.5">

                <div className="flex items-center justify-between">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                    <Clock3
                      size={18}
                    />
                  </div>

                  <span className="text-xs font-bold text-orange-600">
                    {loading
                      ? "—"
                      : `${belumAbsenPercentage}%`}
                  </span>

                </div>

                <p className="mt-5 text-xs font-semibold text-gray-500">
                  Belum Absen
                </p>

                <p className="mt-1 text-3xl font-extrabold text-gray-900">
                  {loading
                    ? "—"
                    : belumAbsen}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  belum melakukan absensi
                </p>

              </div>

              {/* IZIN */}

              <div className="group rounded-2xl border border-purple-100 bg-purple-50/60 p-5 transition hover:-translate-y-0.5">

                <div className="flex items-center justify-between">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm">
                    <FileText
                      size={18}
                    />
                  </div>

                  <span className="text-xs font-bold text-purple-600">
                    {loading
                      ? "—"
                      : `${izinPercentage}%`}
                  </span>

                </div>

                <p className="mt-5 text-xs font-semibold text-gray-500">
                  Izin
                </p>

                <p className="mt-1 text-3xl font-extrabold text-gray-900">
                  {loading
                    ? "—"
                    : todayIzinCount}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  izin tercatat hari ini
                </p>

              </div>

            </div>

          </section>

          {/* WFO WFH */}

          <section className="relative overflow-hidden rounded-3xl bg-brand-blue p-6 text-white shadow-[0_15px_40px_rgba(30,64,175,0.18)]">

            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-medium text-white/60">
                    Statistik lokasi
                  </p>

                  <h2 className="mt-1 text-lg font-extrabold">
                    WFO vs WFH
                  </h2>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Building2
                    size={20}
                  />
                </div>

              </div>

              <div className="mt-8 space-y-6">

                {/* WFO */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <span className="flex items-center gap-2 text-sm font-semibold">

                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                        <Building2
                          size={14}
                        />
                      </span>

                      WFO

                    </span>

                    <span className="text-sm font-extrabold">
                      {loading
                        ? "—"
                        : `${wfoCount} siswa`}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full rounded-full bg-brand-yellow transition-all duration-700"
                      style={{
                        width: `${wfoPercentage}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-right text-[11px] text-white/50">
                    {loading
                      ? "—"
                      : `${wfoPercentage}%`}
                  </p>

                </div>

                {/* WFH */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <span className="flex items-center gap-2 text-sm font-semibold">

                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                        <Home
                          size={14}
                        />
                      </span>

                      WFH

                    </span>

                    <span className="text-sm font-extrabold">
                      {loading
                        ? "—"
                        : `${wfhCount} siswa`}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full rounded-full bg-white transition-all duration-700"
                      style={{
                        width: `${wfhPercentage}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-right text-[11px] text-white/50">
                    {loading
                      ? "—"
                      : `${wfhPercentage}%`}
                  </p>

                </div>

              </div>

              <div className="mt-7 border-t border-white/10 pt-5">

                <p className="text-xs leading-5 text-white/55">
                  Perbandingan berdasarkan siswa
                  yang sudah melakukan absensi hari ini.
                </p>

              </div>

            </div>
          </section>

        </div>

        {/* =================================================
            RECENT DATA
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* =================================================
              RECENT ATTENDANCE
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

            <div className="border-b border-gray-100 p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                      <ClipboardList
                        size={19}
                      />
                    </div>

                    <div>

                      <h2 className="font-extrabold text-gray-900">
                        Aktivitas Absensi
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Aktivitas terbaru hari ini
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <div className="divide-y divide-gray-100">

              {loading ? (
                Array.from({
                  length: 3,
                }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-5"
                    >

                      <div className="h-11 w-11 animate-pulse rounded-2xl bg-gray-100" />

                      <div className="min-w-0 flex-1">

                        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />

                        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />

                      </div>

                      <div className="h-4 w-14 animate-pulse rounded bg-gray-100" />

                    </div>
                  )
                )
              ) : recentAttendance.length >
                0 ? (
                recentAttendance.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 p-5 transition hover:bg-gray-50"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue transition group-hover:scale-105">

                        {item.type ===
                        "Absen Masuk" ? (
                          <LogIn
                            size={19}
                          />
                        ) : (
                          <LogOut
                            size={19}
                          />
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-extrabold text-gray-900">
                          {item.name}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">

                          <span className="text-[11px] text-gray-400">
                            NISN:{" "}
                            {item.nisn}
                          </span>

                          <span className="text-gray-200">
                            •
                          </span>

                          <span
                            className={`text-[11px] font-bold ${
                              item.location ===
                              "WFO"
                                ? "text-brand-blue"
                                : item.location ===
                                  "WFH"
                                ? "text-orange-600"
                                : "text-gray-400"
                            }`}
                          >
                            {item.location}
                          </span>

                        </div>

                      </div>

                      <div className="shrink-0 text-right">

                        <p className="text-sm font-extrabold text-brand-blue">
                          {item.time}
                        </p>

                        <p className="mt-1 text-[11px] text-gray-400">
                          {item.type}
                        </p>

                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="p-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                    <ClipboardList
                      size={24}
                    />
                  </div>

                  <p className="mt-3 text-sm font-bold text-gray-500">
                    Belum ada aktivitas absensi
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Data absensi hari ini akan muncul di sini.
                  </p>

                </div>
              )}

            </div>

            <div className="border-t border-gray-100 p-4">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/attendance"
                  )
                }
                className="group flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-extrabold text-brand-blue transition hover:bg-blue-50"
              >
                Lihat Semua Absensi

                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </button>

            </div>

          </section>

          {/* =================================================
              IZIN
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

            <div className="border-b border-gray-100 p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <FileText
                        size={19}
                      />
                    </div>

                    <div>

                      <h2 className="font-extrabold text-gray-900">
                        Izin Terbaru
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Izin yang tercatat hari ini
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <div className="divide-y divide-gray-100">

              {loading ? (
                Array.from({
                  length: 3,
                }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-5"
                    >

                      <div className="h-11 w-11 animate-pulse rounded-2xl bg-gray-100" />

                      <div className="flex-1">

                        <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />

                        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />

                        <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-100" />

                      </div>

                    </div>
                  )
                )
              ) : recentIzin.length >
                0 ? (
                recentIzin.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="group p-5 transition hover:bg-gray-50"
                    >

                      <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition group-hover:scale-105">
                          <FileText
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                            <div>

                              <p className="text-sm font-extrabold text-gray-900">
                                {item.name}
                              </p>

                              <p className="mt-1 text-[11px] text-gray-400">
                                NISN:{" "}
                                {item.nisn}
                              </p>

                              <p className="mt-1 text-xs font-bold text-purple-600">
                                {item.type}
                              </p>

                            </div>

                            <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-extrabold text-green-700">

                              <CheckCircle2
                                size={12}
                              />

                              Tercatat

                            </span>

                          </div>

                          <p className="mt-2 text-[11px] text-gray-400">
                            {item.date}
                          </p>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                            {item.reason}
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="p-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                    <FileText
                      size={24}
                    />
                  </div>

                  <p className="mt-3 text-sm font-bold text-gray-500">
                    Belum ada izin hari ini
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Izin siswa yang tercatat akan muncul di sini.
                  </p>

                </div>
              )}

            </div>

            <div className="border-t border-gray-100 p-4">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/izin"
                  )
                }
                className="group flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-extrabold text-brand-blue transition hover:bg-blue-50"
              >
                Lihat Semua Izin

                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </button>

            </div>

          </section>

        </div>

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
              <CalendarDays
                size={15}
              />
            </div>

            <p className="text-xs font-medium text-gray-500">
              Data dashboard diperbarui otomatis saat halaman aktif.
            </p>

          </div>

          <p className="text-xs text-gray-400">
            ABSENKU • Sistem Presensi Peserta PKL
          </p>

        </div>

      </div>
    </div>
  );
}