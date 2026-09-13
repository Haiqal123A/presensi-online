import { useEffect, useState } from "react";
import {
  getMe,
  updateProfile,
  getAuthSession,
  updateStoredUser,
} from "../../services/api";

function normalizeUser(response) {
  return (
    response?.data?.user ||
    response?.data ||
    response?.user ||
    null
  );
}

function formatDateForDisplay(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateForInput(date) {
  if (!date) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialForm(user) {
  return {
    full_name:
      user?.full_name ||
      user?.name ||
      "",
    phone:
      user?.phone ||
      "",
    major:
      user?.major ||
      "",
    birth_place:
      user?.birth_place ||
      "",
    birth_date:
      formatDateForInput(user?.birth_date),
  };
}

export default function Profile() {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    major: "",
    birth_place: "",
    birth_date: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadProfile(showRefresh = false) {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage("");

      const response = await getMe();
      const backendUser = normalizeUser(response);

      if (!backendUser) {
        throw new Error("Data profil tidak ditemukan.");
      }

      setUser(backendUser);
      setForm(getInitialForm(backendUser));

      updateStoredUser(backendUser);
    } catch (error) {
      console.error("Gagal memuat profil:", error);

      /*
       * Jika data sebelumnya masih tersimpan,
       * gunakan sebagai tampilan sementara.
       */
      const savedSession = getAuthSession();
      const savedUser = savedSession?.user;

      if (savedUser) {
        const fallbackUser = {
          id: savedUser.id || "",
          email: savedUser.email || "",
          full_name:
            savedUser.full_name ||
            savedUser.name ||
            "",
          name:
            savedUser.name ||
            savedUser.full_name ||
            "",
          nisn: savedUser.nisn || "",
          school: savedUser.school || "",
          major: savedUser.major || "",
          phone: savedUser.phone || "",
          birth_place: savedUser.birth_place || "",
          birth_date: savedUser.birth_date || "",
          role: savedUser.role || "student",
        };

        setUser(fallbackUser);
        setForm(getInitialForm(fallbackUser));
      }

      setErrorMessage(
        error?.message ||
          "Profil tidak dapat dimuat. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleEdit() {
    setSuccessMessage("");
    setErrorMessage("");
    setForm(getInitialForm(user));
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(getInitialForm(user));
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!form.full_name.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        major: form.major.trim(),
        birth_place: form.birth_place.trim(),
        birth_date: form.birth_date || "",
      };

      const response = await updateProfile(payload);

      let updatedUser = normalizeUser(response);

      /*
       * Setelah menyimpan, ambil data terbaru agar
       * tampilan selalu menggunakan data terbaru.
       */
      if (!updatedUser) {
        const refreshedResponse = await getMe();
        updatedUser = normalizeUser(refreshedResponse);
      }

      if (!updatedUser) {
        throw new Error(
          "Data profil terbaru tidak dapat diperoleh."
        );
      }

      setUser(updatedUser);
      setForm(getInitialForm(updatedUser));

      updateStoredUser(updatedUser);

      setIsEditing(false);
      setSuccessMessage("Profil berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);

      setErrorMessage(
        error?.message ||
          "Profil gagal diperbarui. Silakan coba lagi."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="min-h-[calc(100vh-72px)] bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-40 rounded-lg bg-gray-200" />
              <div className="h-24 rounded-2xl bg-gray-100" />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="h-20 rounded-xl bg-gray-100" />
                <div className="h-20 rounded-xl bg-gray-100" />
                <div className="h-20 rounded-xl bg-gray-100" />
                <div className="h-20 rounded-xl bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const displayName =
    user?.full_name ||
    user?.name ||
    "Siswa PKL";

  return (
    <section className="min-h-[calc(100vh-72px)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Profil Saya
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Kelola informasi pribadi Anda
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadProfile(true)}
            disabled={isRefreshing || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className={`h-4 w-4 ${
                isRefreshing ? "animate-spin" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M5.5 9A7 7 0 0118 6.5L20 9M18.5 15A7 7 0 016 17.5L4 15"
              />
            </svg>
            Muat ulang
          </button>
        </div>

        {/* ALERT */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                d="M12 8v4M12 16h.01"
              />
            </svg>

            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.5 12 2.2 2.2 4.8-5"
              />
            </svg>

            <span>{successMessage}</span>
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* PROFILE HEADER */}
          <div className="bg-brand-blue px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold text-brand-blue shadow-sm">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {displayName}
                  </h2>

                  <p className="mt-1 text-sm text-blue-100">
                    Siswa PKL
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-yellow-300"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 20h9"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 3.5a2.121 2.121 0 013 3L8 18l-4 1 1-4L16.5 3.5z"
                    />
                  </svg>
                  Edit Profil
                </button>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-6 sm:p-8">
            {!isEditing ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Informasi Pribadi
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Informasi akun dan data pribadi Anda
                  </p>
                </div>

                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                  {/* NAMA */}
                  <InfoItem
                    label="Nama Lengkap"
                    value={
                      user?.full_name ||
                      user?.name ||
                      "-"
                    }
                    icon="user"
                  />

                  {/* EMAIL */}
                  <InfoItem
                    label="Email"
                    value={user?.email || "-"}
                    icon="email"
                  />

                  {/* NISN */}
                  <InfoItem
                    label="NISN"
                    value={user?.nisn || "-"}
                    icon="card"
                  />

                  {/* SEKOLAH */}
                  <InfoItem
                    label="Sekolah"
                    value={user?.school || "-"}
                    icon="school"
                  />

                  {/* JURUSAN */}
                  <InfoItem
                    label="Jurusan"
                    value={user?.major || "-"}
                    icon="book"
                  />

                  {/* TELEPON */}
                  <InfoItem
                    label="Nomor Telepon"
                    value={user?.phone || "-"}
                    icon="phone"
                  />

                  {/* TEMPAT LAHIR */}
                  <InfoItem
                    label="Tempat Lahir"
                    value={user?.birth_place || "-"}
                    icon="location"
                  />

                  {/* TANGGAL LAHIR */}
                  <InfoItem
                    label="Tanggal Lahir"
                    value={formatDateForDisplay(
                      user?.birth_date
                    )}
                    icon="calendar"
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Edit Profil
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Perbarui informasi pribadi Anda
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* NAMA */}
                  <FormField
                    label="Nama Lengkap"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    required
                  />

                  {/* EMAIL */}
                  <ReadOnlyField
                    label="Email"
                    value={user?.email || "-"}
                  />

                  {/* NISN */}
                  <ReadOnlyField
                    label="NISN"
                    value={user?.nisn || "-"}
                  />

                  {/* SEKOLAH */}
                  <ReadOnlyField
                    label="Sekolah"
                    value={user?.school || "-"}
                  />

                  {/* JURUSAN */}
                  <FormField
                    label="Jurusan"
                    name="major"
                    value={form.major}
                    onChange={handleChange}
                    placeholder="Masukkan jurusan"
                  />

                  {/* TELEPON */}
                  <FormField
                    label="Nomor Telepon"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Contoh: 08123456789"
                    type="tel"
                  />

                  {/* TEMPAT LAHIR */}
                  <FormField
                    label="Tempat Lahir"
                    name="birth_place"
                    value={form.birth_place}
                    onChange={handleChange}
                    placeholder="Masukkan tempat lahir"
                  />

                  {/* TANGGAL LAHIR */}
                  <FormField
                    label="Tanggal Lahir"
                    name="birth_date"
                    value={form.birth_date}
                    onChange={handleChange}
                    type="date"
                  />
                </div>

                {/* BUTTON */}
                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-30"
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            d="M21 12a9 9 0 00-9-9"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12.5 9.5 17 19 7"
                          />
                        </svg>
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   COMPONENT: INFO ITEM
========================================================= */

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue">
        <ProfileIcon type={icon} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENT: FORM FIELD
========================================================= */

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
      />
    </div>
  );
}

/* =========================================================
   COMPONENT: READ ONLY FIELD
========================================================= */

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function ProfileIcon({ type }) {
  const commonProps = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
  };

  switch (type) {
    case "user":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="3.5" />
          <path
            strokeLinecap="round"
            d="M5 20a7 7 0 0114 0"
          />
        </svg>
      );

    case "email":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4 7 8 6 8-6"
          />
        </svg>
      );

    case "card":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <path d="M3 10h18" />
          <path
            strokeLinecap="round"
            d="M7 15h3"
          />
        </svg>
      );

    case "school":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10l9-5 9 5-9 5-9-5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 12.5V17c2.8 2 7.2 2 10 0v-4.5"
          />
          <path
            strokeLinecap="round"
            d="M21 10v5"
          />
        </svg>
      );

    case "book":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 4.5A2.5 2.5 0 017.5 2H20v17H7.5A2.5 2.5 0 015 16.5v-12z"
          />
          <path
            strokeLinecap="round"
            d="M5 5h15"
          />
          <path
            strokeLinecap="round"
            d="M9 7.5h6"
          />
        </svg>
      );

    case "phone":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.5 3.5l3 3-2 2a14 14 0 008 8l2-2 3 3-1.5 2a2 2 0 01-2 .8A17.5 17.5 0 013.7 6a2 2 0 01.8-2L6.5 3.5z"
          />
        </svg>
      );

    case "location":
      return (
        <svg {...commonProps}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z"
          />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="4.5"
            width="18"
            height="16"
            rx="2"
          />
          <path
            strokeLinecap="round"
            d="M8 2.5v4M16 2.5v4M3 9h18"
          />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}