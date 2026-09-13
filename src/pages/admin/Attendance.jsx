import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminAttendanceHistory,
  getAdminStudents,
  getAdminTodayAttendance,
} from "../../services/api";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://presensi-be.vercel.app"
).replace(/\/+$/, "");

/* =========================================================
   BASIC HELPERS
========================================================= */

const getToday = () => {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
};

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
};

const normalizeId = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
};

/* =========================================================
   BASIC OBJECT CHECK
========================================================= */

const isObject = (value) => {
  return (
    value !== null &&
    typeof value === "object"
  );
};

/* =========================================================
   DEEP SEARCH
========================================================= */

const findDeepValue = (
  object,
  keys,
  maxDepth = 8,
  currentDepth = 0,
  visited = new Set()
) => {
  if (
    !isObject(object) ||
    currentDepth > maxDepth
  ) {
    return null;
  }

  if (visited.has(object)) {
    return null;
  }

  visited.add(object);

  const keySet = new Set(
    keys.map((key) =>
      String(key).toLowerCase()
    )
  );

  for (const key of Object.keys(object)) {
    if (
      keySet.has(
        String(key).toLowerCase()
      )
    ) {
      const value = object[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }
  }

  for (const key of Object.keys(object)) {
    const value = object[key];

    if (isObject(value)) {
      const found = findDeepValue(
        value,
        keys,
        maxDepth,
        currentDepth + 1,
        visited
      );

      if (
        found !== undefined &&
        found !== null &&
        found !== ""
      ) {
        return found;
      }
    }
  }

  return null;
};

/* =========================================================
   ARRAY RESPONSE
========================================================= */

const unwrapArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  const candidates = [
    response?.data,
    response?.data?.data,
    response?.data?.items,
    response?.data?.rows,
    response?.data?.records,
    response?.data?.results,
    response?.data?.students,
    response?.data?.student,
    response?.data?.attendance,
    response?.data?.attendances,
    response?.data?.presensi,
    response?.data?.presences,

    response?.students,
    response?.student,
    response?.attendance,
    response?.attendances,
    response?.presensi,
    response?.presences,
    response?.items,
    response?.rows,
    response?.records,
    response?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const searchDeep = (
    value,
    depth = 0
  ) => {
    if (
      depth > 8 ||
      value === null ||
      value === undefined
    ) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (
      typeof value !== "object"
    ) {
      return [];
    }

    const priorityKeys = [
      "students",
      "student",
      "attendance",
      "attendances",
      "presensi",
      "presences",
      "items",
      "rows",
      "records",
      "results",
      "data",
    ];

    for (const key of priorityKeys) {
      if (
        value[key] !== undefined
      ) {
        const result =
          searchDeep(
            value[key],
            depth + 1
          );

        if (
          Array.isArray(result) &&
          result.length > 0
        ) {
          return result;
        }
      }
    }

    return [];
  };

  return searchDeep(response);
};

/* =========================================================
   STUDENT OBJECT
========================================================= */

const getStudentObject = (item) => {
  if (!item) return {};

  return (
    item?.student ||
    item?.siswa ||
    item?.user ||
    item?.user_data ||
    item?.userData ||
    item?.student_data ||
    item?.studentData ||
    item?.profile ||
    item?.data_student ||
    item?.dataStudent ||
    {}
  );
};

/* =========================================================
   STUDENT ID
========================================================= */

const getStudentId = (item) => {
  if (!item) return null;

  const student =
    getStudentObject(item);

  return firstValue(
    item?.student_id,
    item?.studentId,
    item?.siswa_id,
    item?.siswaId,
    item?.user_id,
    item?.userId,
    item?.uuid,
    item?.id,

    student?.student_id,
    student?.studentId,
    student?.siswa_id,
    student?.siswaId,
    student?.user_id,
    student?.userId,
    student?.uuid,
    student?.id,

    findDeepValue(item, [
      "student_id",
      "studentId",
      "siswa_id",
      "siswaId",
      "user_id",
      "userId",
      "uuid",
      "id",
    ])
  );
};

const getUserId = (item) => {
  if (!item) return null;

  const student =
    getStudentObject(item);

  return firstValue(
    item?.user_id,
    item?.userId,
    item?.student_id,
    item?.studentId,

    student?.user_id,
    student?.userId,
    student?.student_id,
    student?.studentId,
    student?.id,

    findDeepValue(item, [
      "user_id",
      "userId",
      "student_id",
      "studentId",
    ])
  );
};

/* =========================================================
   STUDENT NAME
========================================================= */

const getStudentName = (student) => {
  if (!student) return "-";

  const nested =
    getStudentObject(student);

  return String(
    firstValue(
      student?.full_name,
      student?.fullName,
      student?.name,
      student?.nama,
      student?.student_name,
      student?.studentName,
      student?.nama_siswa,
      student?.namaSiswa,

      nested?.full_name,
      nested?.fullName,
      nested?.name,
      nested?.nama,
      nested?.student_name,
      nested?.studentName,
      nested?.nama_siswa,
      nested?.namaSiswa,

      findDeepValue(student, [
        "full_name",
        "fullName",
        "name",
        "nama",
        "student_name",
        "studentName",
        "nama_siswa",
        "namaSiswa",
      ]),

      "-"
    )
  );
};

/* =========================================================
   NISN
========================================================= */

const getStudentNisn = (student) => {
  if (!student) return "-";

  const nested =
    getStudentObject(student);

  return String(
    firstValue(
      student?.nisn,
      student?.NISN,
      student?.student_nisn,
      student?.studentNisn,
      student?.nisn_siswa,
      student?.nisnSiswa,

      nested?.nisn,
      nested?.NISN,
      nested?.student_nisn,
      nested?.studentNisn,

      findDeepValue(student, [
        "nisn",
        "NISN",
        "student_nisn",
        "studentNisn",
        "nisn_siswa",
        "nisnSiswa",
      ]),

      "-"
    )
  );
};

/* =========================================================
   SCHOOL
========================================================= */

const getStudentSchool = (student) => {
  if (!student) return "-";

  const nested =
    getStudentObject(student);

  return String(
    firstValue(
      student?.school,
      student?.school_name,
      student?.schoolName,
      student?.sekolah,
      student?.nama_sekolah,
      student?.namaSekolah,

      nested?.school,
      nested?.school_name,
      nested?.schoolName,
      nested?.sekolah,
      nested?.nama_sekolah,
      nested?.namaSekolah,

      findDeepValue(student, [
        "school",
        "school_name",
        "schoolName",
        "sekolah",
        "nama_sekolah",
        "namaSekolah",
      ]),

      "-"
    )
  );
};

/* =========================================================
   MAJOR
========================================================= */

const getStudentMajor = (student) => {
  if (!student) return "-";

  const nested =
    getStudentObject(student);

  return String(
    firstValue(
      student?.major,
      student?.major_name,
      student?.majorName,
      student?.jurusan,
      student?.nama_jurusan,
      student?.namaJurusan,

      nested?.major,
      nested?.major_name,
      nested?.majorName,
      nested?.jurusan,
      nested?.nama_jurusan,
      nested?.namaJurusan,

      findDeepValue(student, [
        "major",
        "major_name",
        "majorName",
        "jurusan",
        "nama_jurusan",
        "namaJurusan",
      ]),

      "-"
    )
  );
};

/* =========================================================
   EMAIL
========================================================= */

const getStudentEmail = (student) => {
  if (!student) return "-";

  const nested =
    getStudentObject(student);

  return String(
    firstValue(
      student?.email,
      nested?.email,

      findDeepValue(student, [
        "email",
      ]),

      "-"
    )
  );
};

/* =========================================================
   DATE
========================================================= */

const getAttendanceDate = (item) => {
  return firstValue(
    item?.date,
    item?.attendance_date,
    item?.attendanceDate,
    item?.tanggal,
    item?.tanggal_absensi,
    item?.tanggalAbsensi,

    item?.check_in_date,
    item?.checkInDate,

    findDeepValue(item, [
      "date",
      "attendance_date",
      "attendanceDate",
      "tanggal",
      "tanggal_absensi",
      "tanggalAbsensi",
    ])
  );
};

const normalizeDate = (value) => {
  if (!value) return null;

  const text = String(value);

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return text;
  }

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"
    ),
  ].join("-");
};

const formatDate = (value) => {
  const date =
    normalizeDate(value);

  if (!date) return "-";

  const match = date.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) return date;

  return `${match[3]}/${match[2]}/${match[1]}`;
};

/* =========================================================
   TIME
========================================================= */

const getCheckIn = (item) => {
  return firstValue(
    item?.check_in,
    item?.checkIn,
    item?.check_in_time,
    item?.checkInTime,
    item?.check_in_at,
    item?.checkInAt,
    item?.time_in,
    item?.timeIn,
    item?.jam_masuk,
    item?.jamMasuk,
    item?.waktu_masuk,
    item?.waktuMasuk,
    item?.masuk,

    findDeepValue(item, [
      "check_in",
      "checkIn",
      "check_in_time",
      "checkInTime",
      "check_in_at",
      "checkInAt",
      "time_in",
      "timeIn",
      "jam_masuk",
      "jamMasuk",
      "waktu_masuk",
      "waktuMasuk",
      "masuk",
    ])
  );
};

const getCheckOut = (item) => {
  return firstValue(
    item?.check_out,
    item?.checkOut,
    item?.check_out_time,
    item?.checkOutTime,
    item?.check_out_at,
    item?.checkOutAt,
    item?.time_out,
    item?.timeOut,
    item?.jam_pulang,
    item?.jamPulang,
    item?.waktu_pulang,
    item?.waktuPulang,
    item?.pulang,

    findDeepValue(item, [
      "check_out",
      "checkOut",
      "check_out_time",
      "checkOutTime",
      "check_out_at",
      "checkOutAt",
      "time_out",
      "timeOut",
      "jam_pulang",
      "jamPulang",
      "waktu_pulang",
      "waktuPulang",
      "pulang",
    ])
  );
};

const formatTime = (value) => {
  if (!value) return "-";

  if (typeof value === "object") {
    const nestedTime =
      firstValue(
        value?.time,
        value?.time_in,
        value?.timeIn,
        value?.time_out,
        value?.timeOut,
        value?.jam,
        value?.waktu,
        value?.at,
        value?.timestamp,
        value?.date
      );

    if (nestedTime) {
      return formatTime(
        nestedTime
      );
    }

    return "-";
  }

  const text = String(value).trim();

  const directTime =
    text.match(
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
    );

  if (directTime) {
    return `${String(
      directTime[1]
    ).padStart(2, "0")}:${directTime[2]}`;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    const match =
      text.match(
        /(\d{1,2}):(\d{2})(?::(\d{2}))?/
      );

    if (match) {
      return `${String(
        match[1]
      ).padStart(2, "0")}:${match[2]}`;
    }

    return text;
  }

  try {
    return new Intl.DateTimeFormat(
      "id-ID",
      {
        timeZone:
          "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    ).format(date);
  } catch {
    return `${String(
      date.getHours()
    ).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  }
};

/* =========================================================
   MODE
========================================================= */

const getWorkMode = (item) => {
  return firstValue(
    item?.work_mode,
    item?.workMode,
    item?.mode_kerja,
    item?.modeKerja,
    item?.mode,
    item?.location_type,
    item?.locationType,
    item?.tipe_lokasi,
    item?.tipeLokasi,

    findDeepValue(item, [
      "work_mode",
      "workMode",
      "mode_kerja",
      "modeKerja",
      "mode",
      "location_type",
      "locationType",
    ])
  );
};

const normalizeMode = (value) => {
  if (!value) return "-";

  const text = String(value)
    .trim()
    .toLowerCase();

  if (
    text === "wfo" ||
    text.includes("office") ||
    text.includes("kantor")
  ) {
    return "WFO";
  }

  if (
    text === "wfh" ||
    text.includes("home") ||
    text.includes("rumah")
  ) {
    return "WFH";
  }

  return String(value);
};

/* =========================================================
   STATUS
========================================================= */

const getStatus = (item) => {
  return firstValue(
    item?.status,
    item?.attendance_status,
    item?.attendanceStatus,
    item?.kehadiran,
    item?.status_absensi,
    item?.statusAbsensi,

    findDeepValue(item, [
      "status",
      "attendance_status",
      "attendanceStatus",
      "kehadiran",
      "status_absensi",
      "statusAbsensi",
    ])
  );
};

const normalizeStatus = (
  value,
  checkIn,
  checkOut
) => {
  if (!value) {
    if (checkIn) {
      return "Hadir";
    }

    return "-";
  }

  const text = String(value)
    .trim()
    .toLowerCase();

  if (
    text === "checked_in" ||
    text === "checked-in" ||
    text === "checked_out" ||
    text === "checked-out" ||
    text === "completed"
  ) {
    return "Hadir";
  }

  if (
    text.includes("terlambat")
  ) {
    return "Terlambat";
  }

  if (
    text.includes("hadir") ||
    text.includes("present")
  ) {
    return "Hadir";
  }

  if (
    text.includes("izin")
  ) {
    return "Izin";
  }

  if (
    text.includes("sakit")
  ) {
    return "Sakit";
  }

  if (
    text.includes("alpha") ||
    text.includes("alpa")
  ) {
    return "Alpha";
  }

  return String(value);
};

/* =========================================================
   PHOTO
   FOTO MASUK + FOTO PULANG
========================================================= */

const makeAbsoluteUrl = (value) => {
  if (!value) return null;

  const text = String(value).trim();

  if (!text) return null;

  if (
    text === "-" ||
    text === "null" ||
    text === "undefined"
  ) {
    return null;
  }

  if (
    text.startsWith("data:")
  ) {
    return text;
  }

  if (
    text.startsWith("blob:")
  ) {
    return text;
  }

  if (
    text.startsWith("http://") ||
    text.startsWith("https://")
  ) {
    return text;
  }

  if (
    text.startsWith("//")
  ) {
    return `https:${text}`;
  }

  if (text.startsWith("/")) {
    return `${API_BASE_URL}${text}`;
  }

  return `${API_BASE_URL}/${text}`;
};

const extractPhotoValue = (
  value,
  depth = 0,
  visited = new Set()
) => {
  if (
    value === null ||
    value === undefined ||
    depth > 8
  ) {
    return null;
  }

  if (
    typeof value === "string"
  ) {
    const text =
      value.trim();

    if (
      !text ||
      text === "-" ||
      text === "null" ||
      text === "undefined"
    ) {
      return null;
    }

    return makeAbsoluteUrl(
      text
    );
  }

  if (
    Array.isArray(value)
  ) {
    for (
      const item of value
    ) {
      const result =
        extractPhotoValue(
          item,
          depth + 1,
          visited
        );

      if (result) {
        return result;
      }
    }

    return null;
  }

  if (
    typeof value !== "object"
  ) {
    return null;
  }

  if (
    visited.has(value)
  ) {
    return null;
  }

  visited.add(value);

  const directKeys = [
    "url",
    "src",
    "href",
    "path",
    "file",
    "filename",
    "file_name",
    "fileName",

    "photo",
    "photo_url",
    "photoUrl",
    "photo_path",
    "photoPath",

    "foto",
    "foto_url",
    "fotoUrl",
    "foto_path",
    "fotoPath",

    "image",
    "image_url",
    "imageUrl",
    "image_path",
    "imagePath",

    "file_url",
    "fileUrl",
    "file_path",
    "filePath",

    "proof_photo",
    "proofPhoto",
    "proof_photo_url",
    "proofPhotoUrl",

    "bukti_foto",
    "buktiFoto",
    "bukti_foto_url",
    "buktiFotoUrl",
    "bukti_foto_path",
    "buktiFotoPath",

    "attachment",
    "attachment_url",
    "attachmentUrl",
    "attachment_path",
    "attachmentPath",
  ];

  for (
    const key of directKeys
  ) {
    if (
      value[key] !== undefined &&
      value[key] !== null &&
      value[key] !== ""
    ) {
      const result =
        extractPhotoValue(
          value[key],
          depth + 1,
          visited
        );

      if (result) {
        return result;
      }
    }
  }

  const nestedKeys = [
    "attendance",
    "presensi",
    "check_in",
    "checkIn",
    "checkin",
    "check_out",
    "checkOut",
    "checkout",
    "data",
    "result",
    "response",
    "record",
    "item",
    "proof",
    "bukti",
    "photo_data",
    "photoData",
    "image_data",
    "imageData",
    "file_data",
    "fileData",
  ];

  for (
    const key of nestedKeys
  ) {
    if (
      value[key] !== undefined &&
      value[key] !== null
    ) {
      const result =
        extractPhotoValue(
          value[key],
          depth + 1,
          visited
        );

      if (result) {
        return result;
      }
    }
  }

  for (
    const key of Object.keys(value)
  ) {
    const child =
      value[key];

    if (
      child &&
      typeof child === "object"
    ) {
      const result =
        extractPhotoValue(
          child,
          depth + 1,
          visited
        );

      if (result) {
        return result;
      }
    }
  }

  return null;
};

/* =========================================================
   FOTO MASUK
========================================================= */

const getCheckInPhoto = (item) => {
  if (!item) return null;

  const fields = [
    item?.check_in_photo,
    item?.checkInPhoto,
    item?.check_in_photo_url,
    item?.checkInPhotoUrl,
    item?.check_in_photo_path,
    item?.checkInPhotoPath,

    item?.check_in_image,
    item?.checkInImage,
    item?.check_in_image_url,
    item?.checkInImageUrl,
    item?.check_in_image_path,
    item?.checkInImagePath,

    item?.foto_masuk,
    item?.fotoMasuk,
    item?.foto_masuk_url,
    item?.fotoMasukUrl,
    item?.foto_masuk_path,
    item?.fotoMasukPath,

    item?.attendance?.check_in_photo,
    item?.attendance?.checkInPhoto,
    item?.attendance?.check_in_photo_url,
    item?.attendance?.checkInPhotoUrl,
    item?.attendance?.check_in_photo_path,
    item?.attendance?.checkInPhotoPath,

    item?.attendance?.foto_masuk,
    item?.attendance?.fotoMasuk,
    item?.attendance?.foto_masuk_url,
    item?.attendance?.fotoMasukUrl,
    item?.attendance?.foto_masuk_path,
    item?.attendance?.fotoMasukPath,

    item?.check_in?.photo,
    item?.check_in?.photo_url,
    item?.check_in?.photoUrl,
    item?.check_in?.photo_path,
    item?.check_in?.photoPath,

    item?.check_in?.foto,
    item?.check_in?.foto_url,
    item?.check_in?.fotoUrl,
    item?.check_in?.foto_path,
    item?.check_in?.fotoPath,

    item?.check_in?.image,
    item?.check_in?.image_url,
    item?.check_in?.imageUrl,
    item?.check_in?.image_path,
    item?.check_in?.imagePath,

    item?.checkIn?.photo,
    item?.checkIn?.photo_url,
    item?.checkIn?.photoUrl,
    item?.checkIn?.photo_path,
    item?.checkIn?.photoPath,

    item?.checkIn?.foto,
    item?.checkIn?.foto_url,
    item?.checkIn?.fotoUrl,
    item?.checkIn?.foto_path,
    item?.checkIn?.fotoPath,

    item?.checkIn?.image,
    item?.checkIn?.image_url,
    item?.checkIn?.imageUrl,
    item?.checkIn?.image_path,
    item?.checkIn?.imagePath,
  ];

  for (
    const value of fields
  ) {
    const result =
      extractPhotoValue(value);

    if (result) {
      return result;
    }
  }

  return null;
};

/* =========================================================
   FOTO PULANG
========================================================= */

const getCheckOutPhoto = (item) => {
  if (!item) return null;

  const fields = [
    item?.check_out_photo,
    item?.checkOutPhoto,
    item?.check_out_photo_url,
    item?.checkOutPhotoUrl,
    item?.check_out_photo_path,
    item?.checkOutPhotoPath,

    item?.check_out_image,
    item?.checkOutImage,
    item?.check_out_image_url,
    item?.checkOutImageUrl,
    item?.check_out_image_path,
    item?.checkOutImagePath,

    item?.foto_pulang,
    item?.fotoPulang,
    item?.foto_pulang_url,
    item?.fotoPulangUrl,
    item?.foto_pulang_path,
    item?.fotoPulangPath,

    item?.pulang_photo,
    item?.pulangPhoto,
    item?.pulang_photo_url,
    item?.pulangPhotoUrl,
    item?.pulang_photo_path,
    item?.pulangPhotoPath,

    item?.checkout_photo,
    item?.checkoutPhoto,
    item?.checkout_photo_url,
    item?.checkoutPhotoUrl,
    item?.checkout_photo_path,
    item?.checkoutPhotoPath,

    item?.attendance?.check_out_photo,
    item?.attendance?.checkOutPhoto,
    item?.attendance?.check_out_photo_url,
    item?.attendance?.checkOutPhotoUrl,
    item?.attendance?.check_out_photo_path,
    item?.attendance?.checkOutPhotoPath,

    item?.attendance?.foto_pulang,
    item?.attendance?.fotoPulang,
    item?.attendance?.foto_pulang_url,
    item?.attendance?.fotoPulangUrl,
    item?.attendance?.foto_pulang_path,
    item?.attendance?.fotoPulangPath,

    item?.check_out?.photo,
    item?.check_out?.photo_url,
    item?.check_out?.photoUrl,
    item?.check_out?.photo_path,
    item?.check_out?.photoPath,

    item?.check_out?.foto,
    item?.check_out?.foto_url,
    item?.check_out?.fotoUrl,
    item?.check_out?.foto_path,
    item?.check_out?.fotoPath,

    item?.check_out?.image,
    item?.check_out?.image_url,
    item?.check_out?.imageUrl,
    item?.check_out?.image_path,
    item?.check_out?.imagePath,

    item?.checkOut?.photo,
    item?.checkOut?.photo_url,
    item?.checkOut?.photoUrl,
    item?.checkOut?.photo_path,
    item?.checkOut?.photoPath,

    item?.checkOut?.foto,
    item?.checkOut?.foto_url,
    item?.checkOut?.fotoUrl,
    item?.checkOut?.foto_path,
    item?.checkOut?.fotoPath,

    item?.checkOut?.image,
    item?.checkOut?.image_url,
    item?.checkOut?.imageUrl,
    item?.checkOut?.image_path,
    item?.checkOut?.imagePath,
  ];

  for (
    const value of fields
  ) {
    const result =
      extractPhotoValue(value);

    if (result) {
      return result;
    }
  }

  return null;
};

/* =========================================================
   BUILD STUDENT MAP
========================================================= */

const buildStudentMap = (
  students
) => {
  const map = new Map();

  const addKey = (
    key,
    student
  ) => {
    const normalized =
      normalizeId(key);

    if (normalized) {
      map.set(
        normalized,
        student
      );
    }
  };

  students.forEach(
    (student) => {
      const nested =
        getStudentObject(
          student
        );

      const ids = [
        student?.id,
        student?.user_id,
        student?.userId,
        student?.student_id,
        student?.studentId,
        student?.siswa_id,
        student?.siswaId,
        student?.uuid,

        nested?.id,
        nested?.user_id,
        nested?.userId,
        nested?.student_id,
        nested?.studentId,
        nested?.siswa_id,
        nested?.siswaId,
        nested?.uuid,

        findDeepValue(
          student,
          [
            "id",
            "user_id",
            "userId",
            "student_id",
            "studentId",
            "siswa_id",
            "siswaId",
            "uuid",
          ]
        ),
      ];

      ids.forEach(
        (id) =>
          addKey(
            id,
            student
          )
      );

      const email =
        getStudentEmail(
          student
        );

      if (
        email &&
        email !== "-"
      ) {
        addKey(
          `email:${String(
            email
          ).trim().toLowerCase()}`,
          student
        );
      }

      const nisn =
        getStudentNisn(
          student
        );

      if (
        nisn &&
        nisn !== "-"
      ) {
        addKey(
          `nisn:${String(
            nisn
          ).trim().toLowerCase()}`,
          student
        );
      }
    }
  );

  return map;
};

/* =========================================================
   FIND STUDENT FOR ATTENDANCE
========================================================= */

const findStudentForAttendance = (
  attendance,
  studentMap,
  students
) => {
  if (!attendance) {
    return null;
  }

  const nested =
    getStudentObject(
      attendance
    );

  const possibleIds = [
    attendance?.student_id,
    attendance?.studentId,
    attendance?.siswa_id,
    attendance?.siswaId,
    attendance?.user_id,
    attendance?.userId,
    attendance?.uuid,

    attendance?.student?.id,
    attendance?.student?.user_id,
    attendance?.student?.student_id,

    attendance?.siswa?.id,
    attendance?.siswa?.user_id,
    attendance?.siswa?.student_id,

    attendance?.user?.id,
    attendance?.user?.user_id,
    attendance?.user?.student_id,

    nested?.id,
    nested?.user_id,
    nested?.userId,
    nested?.student_id,
    nested?.studentId,

    findDeepValue(
      attendance,
      [
        "student_id",
        "studentId",
        "siswa_id",
        "siswaId",
        "user_id",
        "userId",
        "uuid",
      ]
    ),
  ];

  for (
    const id of possibleIds
  ) {
    const normalized =
      normalizeId(id);

    if (!normalized) {
      continue;
    }

    const student =
      studentMap.get(
        normalized
      );

    if (student) {
      return student;
    }
  }

  const email =
    firstValue(
      attendance?.email,
      attendance?.student?.email,
      attendance?.siswa?.email,
      attendance?.user?.email,
      findDeepValue(
        attendance,
        ["email"]
      )
    );

  if (email) {
    const student =
      studentMap.get(
        `email:${String(
          email
        ).trim().toLowerCase()}`
      );

    if (student) {
      return student;
    }
  }

  const nisn =
    firstValue(
      attendance?.nisn,
      attendance?.student?.nisn,
      attendance?.siswa?.nisn,
      attendance?.user?.nisn,
      findDeepValue(
        attendance,
        [
          "nisn",
          "NISN",
        ]
      )
    );

  if (nisn) {
    const student =
      studentMap.get(
        `nisn:${String(
          nisn
        ).trim().toLowerCase()}`
      );

    if (student) {
      return student;
    }
  }

  if (
    attendance?.student ||
    attendance?.siswa ||
    attendance?.user ||
    attendance?.user_data ||
    attendance?.student_data
  ) {
    return nested;
  }

  if (
    students.length === 1
  ) {
    return students[0];
  }

  return null;
};

/* =========================================================
   MERGE ATTENDANCE + STUDENTS
========================================================= */

const mergeAttendanceWithStudents = (
  attendance,
  students
) => {
  const studentMap =
    buildStudentMap(
      students
    );

  return attendance.map(
    (item, index) => {
      const student =
        findStudentForAttendance(
          item,
          studentMap,
          students
        );

      const nestedStudent =
        getStudentObject(
          item
        );

      const name =
        firstValue(
          getStudentName(item),
          student
            ? getStudentName(
                student
              )
            : null,
          nestedStudent
            ? getStudentName(
                nestedStudent
              )
            : null,
          "-"
        );

      const nisn =
        firstValue(
          getStudentNisn(item),
          student
            ? getStudentNisn(
                student
              )
            : null,
          nestedStudent
            ? getStudentNisn(
                nestedStudent
              )
            : null,
          "-"
        );

      const school =
        firstValue(
          getStudentSchool(item),
          student
            ? getStudentSchool(
                student
              )
            : null,
          nestedStudent
            ? getStudentSchool(
                nestedStudent
              )
            : null,
          "-"
        );

      const major =
        firstValue(
          getStudentMajor(item),
          student
            ? getStudentMajor(
                student
              )
            : null,
          nestedStudent
            ? getStudentMajor(
                nestedStudent
              )
            : null,
          "-"
        );

      const email =
        firstValue(
          getStudentEmail(item),
          student
            ? getStudentEmail(
                student
              )
            : null,
          nestedStudent
            ? getStudentEmail(
                nestedStudent
              )
            : null,
          "-"
        );

      const rawCheckIn =
        getCheckIn(item);

      const rawCheckOut =
        getCheckOut(item);

      /* =====================================================
         FOTO MASUK DAN FOTO PULANG DIPISAH
      ===================================================== */

      const photoIn =
        getCheckInPhoto(item);

      const photoOut =
        getCheckOutPhoto(item);

      console.log(
        "PHOTO ATTENDANCE:",
        {
          attendanceId:
            item?.id,

          studentId:
            getStudentId(item),

          photoIn,
          photoOut,

          raw:
            item,
        }
      );

      return {
        id: firstValue(
          item?.id,
          item?.attendance_id,
          item?.attendanceId,
          `${getStudentId(
            item
          ) || "attendance"}-${index}`
        ),

        studentId:
          firstValue(
            getStudentId(item),
            student
              ? getStudentId(
                  student
                )
              : null,
            "-"
          ),

        userId:
          firstValue(
            getUserId(item),
            student
              ? getUserId(
                  student
                )
              : null,
            "-"
          ),

        name: String(name),

        nisn: String(nisn),

        school: String(school),

        major: String(major),

        email: String(email),

        date: normalizeDate(
          getAttendanceDate(
            item
          )
        ),

        checkIn:
          formatTime(
            rawCheckIn
          ),

        checkOut:
          formatTime(
            rawCheckOut
          ),

        workMode:
          normalizeMode(
            getWorkMode(item)
          ),

        status:
          normalizeStatus(
            getStatus(item),
            rawCheckIn,
            rawCheckOut
          ),

        photoIn,

        photoOut,

        photo: photoIn,

        raw: item,

        student:
          student || null,
      };
    }
  );
};

/* =========================================================
   BADGES
========================================================= */

function Badge({
  children,
  type = "default",
}) {
  const styles = {
    default:
      "bg-slate-100 text-slate-600 border-slate-200",

    green:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    yellow:
      "bg-amber-50 text-amber-700 border-amber-200",

    blue:
      "bg-blue-50 text-blue-700 border-blue-200",

    red:
      "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[type] ||
        styles.default
      }`}
    >
      {children}
    </span>
  );
}

function StatusBadge({
  status,
}) {
  const value = String(
    status || ""
  ).toLowerCase();

  if (value === "hadir") {
    return (
      <Badge type="green">
        Hadir
      </Badge>
    );
  }

  if (
    value === "terlambat"
  ) {
    return (
      <Badge type="yellow">
        Terlambat
      </Badge>
    );
  }

  if (value === "izin") {
    return (
      <Badge type="blue">
        Izin
      </Badge>
    );
  }

  if (value === "sakit") {
    return (
      <Badge type="blue">
        Sakit
      </Badge>
    );
  }

  if (value === "alpha") {
    return (
      <Badge type="red">
        Alpha
      </Badge>
    );
  }

  return (
    <Badge>
      {status || "-"}
    </Badge>
  );
}

function ModeBadge({
  mode,
}) {
  if (mode === "WFO") {
    return (
      <Badge type="blue">
        WFO
      </Badge>
    );
  }

  if (mode === "WFH") {
    return (
      <Badge type="yellow">
        WFH
      </Badge>
    );
  }

  return (
    <Badge>
      {mode || "-"}
    </Badge>
  );
}

/* =========================================================
   STAT CARD
   ICON DIHAPUS
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-2 text-3xl font-bold text-slate-900">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PHOTO COMPONENT
========================================================= */

function AttendancePhoto({
  title,
  description,
  photo,
  name,
}) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>

      {photo ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <img
            src={photo}
            alt={`${title} ${name}`}
            className="max-h-[520px] w-full object-contain"
            loading="lazy"
            onLoad={() => {
              console.log(
                "FOTO BERHASIL DITAMPILKAN:",
                photo
              );
            }}
            onError={(event) => {
              console.error(
                "FOTO GAGAL DIMUAT:",
                photo
              );

              event.currentTarget.style.display =
                "none";

              const parent =
                event.currentTarget
                  .parentElement;

              if (
                parent &&
                !parent.querySelector(
                  "[data-photo-error]"
                )
              ) {
                const message =
                  document.createElement(
                    "div"
                  );

                message.setAttribute(
                  "data-photo-error",
                  "true"
                );

                message.className =
                  "flex min-h-[260px] flex-col items-center justify-center p-8 text-center";

                message.innerHTML = `
                  <div style="font-size:42px">📷</div>

                  <p style="margin-top:12px;font-weight:600;color:#334155">
                    Foto tidak dapat ditampilkan
                  </p>

                  <p style="margin-top:4px;font-size:14px;color:#94a3b8;max-width:520px">
                    URL foto dari server tidak dapat diakses.
                  </p>

                  <p style="margin-top:8px;font-size:12px;color:#cbd5e1;word-break:break-all">
                    ${photo}
                  </p>
                `;

                parent.appendChild(
                  message
                );
              }
            }}
          />
        </div>
      ) : (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="text-5xl">
            📷
          </div>

          <p className="mt-4 font-semibold text-slate-700">
            Bukti foto tidak tersedia
          </p>

          <p className="mt-1 max-w-md text-sm text-slate-400">
            Data absensi yang diterima admin tidak memiliki URL/path foto.
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function DetailModal({
  row,
  onClose,
}) {
  if (!row) {
    return null;
  }

  const initials =
    row.name &&
    row.name !== "-"
      ? row.name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map(
            (part) =>
              part[0]
          )
          .join("")
          .toUpperCase()
      : "?";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Detail Absensi
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Informasi absensi siswa
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 p-6">

          {/* STUDENT HEADER */}
          <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-blue text-lg font-bold text-white">
              {initials}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900">
                {row.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                NISN: {row.nisn}
              </p>
            </div>

            <div className="sm:ml-auto">
              <StatusBadge
                status={
                  row.status
                }
              />
            </div>
          </div>

          {/* DETAIL */}
          <div className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Tanggal
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {formatDate(
                  row.date
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Mode
              </p>

              <div className="mt-2">
                <ModeBadge
                  mode={
                    row.workMode
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Absen Masuk
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {row.checkIn}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Absen Pulang
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {row.checkOut}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                NISN
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {row.nisn}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-2 break-all font-semibold text-slate-900">
                {row.email}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Sekolah
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {row.school}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Jurusan
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {row.major}
              </p>
            </div>
          </div>

          {/* FOTO ABSEN MASUK */}
          <AttendancePhoto
            title="Bukti Foto Absen Masuk"
            description="Foto yang dikirim siswa saat melakukan absen masuk."
            photo={row.photoIn}
            name={row.name}
          />

          {/* FOTO ABSEN PULANG */}
          <AttendancePhoto
            title="Bukti Foto Absen Pulang"
            description="Foto yang dikirim siswa saat melakukan absen pulang."
            photo={row.photoOut}
            name={row.name}
          />

        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-200 bg-slate-50 p-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue-dark"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Attendance() {
  const today =
    useMemo(
      () => getToday(),
      []
    );

  const [
    date,
    setDate,
  ] = useState(today);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    mode,
    setMode,
  ] = useState("Semua");

  const [
    rows,
    setRows,
  ] = useState([]);

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
    selected,
    setSelected,
  ] = useState(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData =
    useCallback(
      async (
        isRefresh = false
      ) => {
        try {
          setError("");

          if (isRefresh) {
            setRefreshing(
              true
            );
          } else {
            setLoading(true);
          }

          const [
            attendanceResponse,
            studentsResponse,
          ] = await Promise.all([
            date === today
              ? getAdminTodayAttendance()
              : getAdminAttendanceHistory(
                  {
                    startDate:
                      date,
                    endDate:
                      date,
                  }
                ),

            getAdminStudents(),
          ]);

          console.log(
            "========== ADMIN ATTENDANCE =========="
          );

          console.log(
            attendanceResponse
          );

          console.log(
            "========== ADMIN STUDENTS =========="
          );

          console.log(
            studentsResponse
          );

          const attendanceData =
            unwrapArray(
              attendanceResponse
            );

          const studentsData =
            unwrapArray(
              studentsResponse
            );

          console.log(
            "========== ATTENDANCE DATA =========="
          );

          console.log(
            attendanceData
          );

          console.log(
            "========== STUDENTS DATA =========="
          );

          console.log(
            studentsData
          );

          console.log(
            "========== RAW FOTO DATA =========="
          );

          attendanceData.forEach(
            (
              item,
              index
            ) => {
              console.log(
                `ATTENDANCE ${index + 1}:`,
                {
                  id:
                    item?.id,

                  student_id:
                    item?.student_id,

                  user_id:
                    item?.user_id,

                  check_in_photo:
                    item?.check_in_photo,

                  check_in_photo_url:
                    item?.check_in_photo_url,

                  check_out_photo:
                    item?.check_out_photo,

                  check_out_photo_url:
                    item?.check_out_photo_url,

                  foto_masuk:
                    item?.foto_masuk,

                  foto_pulang:
                    item?.foto_pulang,

                  check_in:
                    item?.check_in,

                  check_out:
                    item?.check_out,

                  attendance:
                    item?.attendance,

                  data:
                    item?.data,

                  raw:
                    item,
                }
              );
            }
          );

          const merged =
            mergeAttendanceWithStudents(
              attendanceData,
              studentsData
            );

          console.log(
            "========== MERGED ATTENDANCE =========="
          );

          console.log(
            merged
          );

          console.table(
            merged.map(
              (item) => ({
                id: item.id,
                studentId:
                  item.studentId,
                userId:
                  item.userId,
                nama:
                  item.name,
                nisn:
                  item.nisn,
                email:
                  item.email,
                tanggal:
                  item.date,
                masuk:
                  item.checkIn,
                pulang:
                  item.checkOut,
                mode:
                  item.workMode,
                status:
                  item.status,
                fotoMasuk:
                  item.photoIn,
                fotoPulang:
                  item.photoOut,
              })
            )
          );

          setRows(
            merged
          );
        } catch (err) {
          console.error(
            "Gagal mengambil data absensi admin:",
            err
          );

          setRows([]);

          setError(
            err?.message ||
              "Gagal mengambil data absensi dari server."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [date, today]
    );

  /* =======================================================
     EFFECT
  ======================================================= */

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredRows =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return rows.filter(
        (row) => {
          const matchesSearch =
            !keyword ||
            String(
              row.name || ""
            )
              .toLowerCase()
              .includes(
                keyword
              ) ||
            String(
              row.nisn || ""
            )
              .toLowerCase()
              .includes(
                keyword
              ) ||
            String(
              row.school || ""
            )
              .toLowerCase()
              .includes(
                keyword
              ) ||
            String(
              row.major || ""
            )
              .toLowerCase()
              .includes(
                keyword
              );

          const matchesMode =
            mode ===
              "Semua" ||
            row.workMode ===
              mode;

          return (
            matchesSearch &&
            matchesMode
          );
        }
      );
    }, [
      rows,
      search,
      mode,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      return {
        total:
          rows.length,

        hadir:
          rows.filter(
            (row) =>
              row.status ===
              "Hadir"
          ).length,

        terlambat:
          rows.filter(
            (row) =>
              row.status ===
              "Terlambat"
          ).length,

        wfo:
          rows.filter(
            (row) =>
              row.workMode ===
              "WFO"
          ).length,

        wfh:
          rows.filter(
            (row) =>
              row.workMode ===
              "WFH"
          ).length,

        pulang:
          rows.filter(
            (row) =>
              row.checkOut &&
              row.checkOut !==
                "-"
          ).length,
      };
    }, [rows]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-blue">
              Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Absensi
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Pantau absensi siswa secara langsung dari sistem.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadData(true)
            }
            disabled={
              loading ||
              refreshing
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 11a8 8 0 0 0-15.5-2M4 5v4h4M4 13a8 8 0 0 0 15.5 2M20 19v-4h-4" />
            </svg>

            {refreshing
              ? "Memuat..."
              : "Refresh"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-800">
              Gagal memuat data
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadData(true)
              }
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="Total"
            value={
              stats.total
            }
            subtitle="Siswa yang absen"
          />

          <StatCard
            title="Hadir"
            value={
              stats.hadir
            }
            subtitle="Sudah absen masuk"
          />

          <StatCard
            title="Terlambat"
            value={
              stats.terlambat
            }
            subtitle="Masuk terlambat"
          />

          <StatCard
            title="WFO"
            value={
              stats.wfo
            }
            subtitle="Dari kantor"
          />

          <StatCard
            title="Sudah Pulang"
            value={
              stats.pulang
            }
            subtitle="Absen pulang"
          />

        </div>

        {/* FILTER */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[180px_1fr_180px]">

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Tanggal
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Cari siswa
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Nama, NISN, sekolah, atau jurusan..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Mode
              </label>

              <select
                value={mode}
                onChange={(event) =>
                  setMode(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
              >
                <option value="Semua">
                  Semua
                </option>

                <option value="WFO">
                  WFO
                </option>

                <option value="WFH">
                  WFH
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Daftar Absensi
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatDate(date)}
            </p>
          </div>

          {/* DESKTOP */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[950px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Siswa
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    NISN
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Masuk
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Pulang
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Mode
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-sm text-slate-400"
                    >
                      Memuat data absensi...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto max-w-md">

                        <div className="text-4xl">
                          📋
                        </div>

                        <p className="mt-3 font-semibold text-slate-700">
                          Tidak ada data absensi
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Belum ada siswa yang melakukan absensi pada tanggal ini.
                        </p>

                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map(
                    (row) => {

                      const initials =
                        row.name &&
                        row.name !== "-"
                          ? row.name
                              .split(" ")
                              .filter(
                                Boolean
                              )
                              .slice(
                                0,
                                2
                              )
                              .map(
                                (
                                  part
                                ) =>
                                  part[0]
                              )
                              .join("")
                              .toUpperCase()
                          : "?";

                      return (
                        <tr
                          key={row.id}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-xs font-bold text-brand-blue">
                                {initials}
                              </div>

                              <div className="min-w-0">

                                <p className="max-w-[240px] truncate font-semibold text-slate-800">
                                  {row.name}
                                </p>

                                <p className="max-w-[240px] truncate text-xs text-slate-400">
                                  {row.school}
                                </p>

                              </div>

                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {row.nisn}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                            {row.checkIn}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                            {row.checkOut}
                          </td>

                          <td className="px-5 py-4">
                            <ModeBadge
                              mode={
                                row.workMode
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                row.status
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                setSelected(
                                  row
                                )
                              }
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue-light"
                            >
                              Detail
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="divide-y divide-slate-100 md:hidden">

            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Memuat data absensi...
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="p-8 text-center">

                <div className="text-4xl">
                  📋
                </div>

                <p className="mt-3 font-semibold text-slate-700">
                  Tidak ada data absensi
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Belum ada data pada tanggal ini.
                </p>

              </div>
            ) : (
              filteredRows.map(
                (row) => {

                  const initials =
                    row.name &&
                    row.name !== "-"
                      ? row.name
                          .split(" ")
                          .filter(
                            Boolean
                          )
                          .slice(
                            0,
                            2
                          )
                          .map(
                            (
                              part
                            ) =>
                              part[0]
                          )
                          .join("")
                          .toUpperCase()
                      : "?";

                  return (
                    <div
                      key={row.id}
                      className="p-4"
                    >

                      <div className="flex gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-xs font-bold text-brand-blue">
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-slate-800">
                                {row.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                NISN:{" "}
                                {row.nisn}
                              </p>

                            </div>

                            <StatusBadge
                              status={
                                row.status
                              }
                            />

                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">

                            <div className="rounded-xl bg-slate-50 p-3">

                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                Masuk
                              </p>

                              <p className="mt-1 font-bold text-slate-700">
                                {
                                  row.checkIn
                                }
                              </p>

                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">

                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                Pulang
                              </p>

                              <p className="mt-1 font-bold text-slate-700">
                                {
                                  row.checkOut
                                }
                              </p>

                            </div>

                          </div>

                          <div className="mt-3 flex items-center justify-between">

                            <ModeBadge
                              mode={
                                row.workMode
                              }
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setSelected(
                                  row
                                )
                              }
                              className="text-sm font-semibold text-brand-blue"
                            >
                              Detail →
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>
        </div>
      </div>

      <DetailModal
        row={selected}
        onClose={() =>
          setSelected(null)
        }
      />
    </div>
  );
}