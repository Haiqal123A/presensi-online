  import { useEffect, useState } from "react";

  import {
    Mail,
    Phone,
    ShieldCheck,
    Pencil,
    Save,
    X,
    User,
    CheckCircle2,
    RefreshCw,
  } from "lucide-react";

  import {
    getMe,
    updateAdminProfile,
    updateStoredUser,
    getAuthSession,
  } from "../../services/api";

  // =========================================================
  // DEFAULT PROFILE
  // =========================================================

  const DEFAULT_PROFILE = {
    id: "",
    name: "Administrator",
    email: "",
    phone: "",
    role: "Administrator",
  };

  // =========================================================
  // NORMALIZE USER
  // =========================================================

  function normalizeUser(response) {
    /*
    * Menyesuaikan beberapa kemungkinan
    * bentuk response dari backend.
    *
    * Contoh:
    *
    * {
    *   success: true,
    *   data: {
    *     user: {
    *       id,
    *       full_name,
    *       email,
    *       phone,
    *       role
    *     }
    *   }
    * }
    */

    const data =
      response?.data?.user ||
      response?.data?.data?.user ||
      response?.user ||
      response?.data ||
      response;

    if (!data || typeof data !== "object") {
      return null;
    }

    return {
      id:
        data?.id ??
        data?.user_id ??
        "",

      name:
        data?.full_name ??
        data?.fullName ??
        data?.name ??
        data?.nama ??
        "",

      email:
        data?.email ??
        "",

      phone:
        data?.phone ??
        data?.phone_number ??
        data?.phoneNumber ??
        data?.no_hp ??
        data?.nomor_telepon ??
        "",

      role:
        data?.role === "admin"
          ? "Administrator"
          : data?.role || "Administrator",
    };
  }

  // =========================================================
  // FALLBACK SESSION
  // =========================================================

  function getFallbackProfile() {
    const session = getAuthSession();

    const user = session?.user;

    if (!user) {
      return null;
    }

    return {
      id:
        user?.id ??
        "",

      name:
        user?.full_name ??
        user?.name ??
        "Administrator",

      email:
        user?.email ??
        "",

      phone:
        user?.phone ??
        "",

      role:
        user?.role === "admin"
          ? "Administrator"
          : user?.role || "Administrator",
    };
  }

  // =========================================================
  // PROFILE ITEM
  // =========================================================

  function ProfileItem({
    icon: Icon,
    label,
    value,
  }) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-start gap-3">

          <div className="w-10 h-10 rounded-lg bg-brand-blue-light flex items-center justify-center shrink-0">
            <Icon
              size={18}
              className="text-brand-blue"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {label}
            </p>

            <p className="text-sm font-bold text-gray-800 mt-1 break-words">
              {value || "-"}
            </p>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // ADMIN PROFILE
  // =========================================================

  export default function AdminProfile() {
    const [profile, setProfile] =
      useState(DEFAULT_PROFILE);

    const [formData, setFormData] =
      useState(DEFAULT_PROFILE);

    const [isLoading, setIsLoading] =
      useState(true);

    const [isRefreshing, setIsRefreshing] =
      useState(false);

    const [isEditing, setIsEditing] =
      useState(false);

    const [isSaving, setIsSaving] =
      useState(false);

    const [savedMessage, setSavedMessage] =
      useState("");

    const [errorMessage, setErrorMessage] =
      useState("");

    // =======================================================
    // LOAD PROFILE
    // =======================================================

    async function loadProfile(showRefresh = false) {
      try {
        if (showRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setErrorMessage("");
        setSavedMessage("");

        // Ambil profile terbaru dari backend
        const response = await getMe();

        console.log(
          "GET ADMIN PROFILE:",
          response
        );

        const backendUser =
          normalizeUser(response);

        if (!backendUser) {
          throw new Error(
            "Data profile administrator tidak ditemukan."
          );
        }

        const normalizedProfile = {
          ...DEFAULT_PROFILE,
          ...backendUser,

          role: "Administrator",
        };

        // Update tampilan
        setProfile(normalizedProfile);
        setFormData(normalizedProfile);

        // Update session login
        updateStoredUser({
          id:
            backendUser.id || "",

          full_name:
            backendUser.name || "",

          name:
            backendUser.name || "",

          email:
            backendUser.email || "",

          phone:
            backendUser.phone || "",

          role: "admin",
        });

      } catch (error) {
        console.error(
          "Gagal memuat profile admin:",
          error
        );

        // Gunakan data session sebagai fallback
        const fallbackProfile =
          getFallbackProfile();

        if (fallbackProfile) {
          const fallback = {
            ...DEFAULT_PROFILE,
            ...fallbackProfile,
            role: "Administrator",
          };

          setProfile(fallback);
          setFormData(fallback);
        }

        setErrorMessage(
          error?.message ||
            "Profile tidak dapat dimuat. Silakan coba lagi."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }

    // =======================================================
    // INITIAL LOAD
    // =======================================================

    useEffect(() => {
      loadProfile();
    }, []);

    // =======================================================
    // HANDLE INPUT
    // =======================================================

    const handleChange = (event) => {
      const {
        name,
        value,
      } = event.target;

      setFormData((current) => ({
        ...current,
        [name]: value,
      }));
    };

    // =======================================================
    // EDIT
    // =======================================================

    const handleEdit = () => {
      setFormData(profile);

      setSavedMessage("");
      setErrorMessage("");

      setIsEditing(true);
    };

    // =======================================================
    // CANCEL
    // =======================================================

    const handleCancel = () => {
      setFormData(profile);

      setSavedMessage("");
      setErrorMessage("");

      setIsEditing(false);
    };

    // =======================================================
    // SAVE PROFILE
    // =======================================================

    const handleSave = async (event) => {
      event.preventDefault();

      setSavedMessage("");
      setErrorMessage("");

      // -----------------------------------------------------
      // VALIDASI NAMA
      // -----------------------------------------------------

      const name =
        formData.name?.trim() || "";

      if (!name) {
        setErrorMessage(
          "Nama wajib diisi."
        );

        return;
      }

      // -----------------------------------------------------
      // VALIDASI EMAIL
      // -----------------------------------------------------

      const email =
        formData.email?.trim() || "";

      if (!email) {
        setErrorMessage(
          "Email wajib diisi."
        );

        return;
      }

      // Validasi format email
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        setErrorMessage(
          "Format email tidak valid."
        );

        return;
      }

      // -----------------------------------------------------
      // PHONE
      // -----------------------------------------------------

      const phone =
        formData.phone?.trim() || "";

      try {
        setIsSaving(true);

        // ---------------------------------------------------
        // DATA YANG DIKIRIM KE BACKEND
        // ---------------------------------------------------

        const payload = {
          full_name: name,
          email: email,
          phone: phone,
        };

        console.log(
          "UPDATE ADMIN PROFILE PAYLOAD:",
          payload
        );

        // ---------------------------------------------------
        // UPDATE DATABASE
        // ---------------------------------------------------

        const response =
          await updateAdminProfile(
            payload
          );

        console.log(
          "UPDATE ADMIN PROFILE RESPONSE:",
          response
        );

        // ---------------------------------------------------
        // AMBIL DATA HASIL UPDATE
        // ---------------------------------------------------

        let updatedUser =
          normalizeUser(response);

        /*
        * Setelah PUT berhasil, ambil ulang
        * dari backend supaya data yang tampil
        * benar-benar berasal dari database.
        */

        try {
          const refreshedResponse =
            await getMe();

          console.log(
            "REFRESH ADMIN PROFILE:",
            refreshedResponse
          );

          const refreshedUser =
            normalizeUser(
              refreshedResponse
            );

          if (refreshedUser) {
            updatedUser =
              refreshedUser;
          }
        } catch (refreshError) {
          console.warn(
            "Gagal refresh profile setelah update:",
            refreshError
          );
        }

        // ---------------------------------------------------
        // JIKA DATA USER TIDAK ADA
        // ---------------------------------------------------

        if (!updatedUser) {
          throw new Error(
            "Profile berhasil diperbarui tetapi data terbaru tidak dapat dibaca."
          );
        }

        // ---------------------------------------------------
        // PROFILE TERBARU
        // ---------------------------------------------------

        const updatedProfile = {
          ...DEFAULT_PROFILE,

          ...updatedUser,

          /*
          * Jika backend tidak mengembalikan
          * salah satu field, gunakan data form.
          */

          name:
            updatedUser.name ||
            name,

          email:
            updatedUser.email ||
            email,

          phone:
            updatedUser.phone ??
            phone,

          role: "Administrator",
        };

        // ---------------------------------------------------
        // UPDATE UI
        // ---------------------------------------------------

        setProfile(
          updatedProfile
        );

        setFormData(
          updatedProfile
        );

        // ---------------------------------------------------
        // UPDATE SESSION LOGIN
        // ---------------------------------------------------

        /*
        * Ini penting.
        *
        * Setelah email diganti:
        *
        * localStorage pkl_auth
        * juga diperbarui.
        *
        * Jadi Navbar / session login
        * menggunakan email terbaru.
        */

        updateStoredUser({
          id:
            updatedUser.id ||
            profile.id ||
            "",

          full_name:
            updatedProfile.name,

          name:
            updatedProfile.name,

          email:
            updatedProfile.email,

          phone:
            updatedProfile.phone,

          role: "admin",
        });

        // ---------------------------------------------------
        // SELESAI
        // ---------------------------------------------------

        setIsEditing(false);

        setSavedMessage(
          "Profile berhasil diperbarui dan disimpan ke database."
        );

      } catch (error) {
        console.error(
          "Gagal memperbarui profile admin:",
          error
        );

        /*
        * Jangan update session kalau
        * database gagal.
        */

        setErrorMessage(
          error?.message ||
            "Profile gagal diperbarui. Silakan coba lagi."
        );
      } finally {
        setIsSaving(false);
      }
    };

    // =======================================================
    // LOADING
    // =======================================================

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50">

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

            {/* HEADER SKELETON */}

            <div className="mb-6">

              <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />

              <div className="h-4 w-72 bg-gray-200 rounded mt-3 animate-pulse" />

            </div>

            {/* CARD SKELETON */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="bg-brand-blue px-5 sm:px-7 py-7">

                <div className="flex items-center gap-5">

                  <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse" />

                  <div className="space-y-3">

                    <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />

                    <div className="h-4 w-56 bg-white/20 rounded animate-pulse" />

                    <div className="h-7 w-32 bg-white/20 rounded-full animate-pulse" />

                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-7">

                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />

                <div className="h-4 w-72 bg-gray-100 rounded mt-2 animate-pulse" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                  <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />

                  <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />

                  <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />

                  <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />

                </div>

              </div>

            </div>

          </div>

        </div>
      );
    }

    // =======================================================
    // RENDER
    // =======================================================

    return (
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Profile
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Kelola informasi profile administrator.
              </p>

            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              {/* REFRESH */}

              <button
                type="button"
                onClick={() =>
                  loadProfile(true)
                }
                disabled={
                  isRefreshing ||
                  isSaving
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >

                <RefreshCw
                  size={17}
                  className={
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

              {/* EDIT */}

              {!isEditing && (
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={
                    isRefreshing ||
                    isSaving
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                >

                  <Pencil size={17} />

                  Edit Profile

                </button>
              )}

            </div>

          </div>

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {savedMessage && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">

              <CheckCircle2 size={18} />

              {savedMessage}

            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <X
                size={18}
                className="text-red-500 mt-0.5 shrink-0"
              />

              <p className="text-sm font-semibold text-red-700">
                {errorMessage}
              </p>

            </div>
          )}

          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <div className="bg-brand-blue px-5 sm:px-7 py-7">

              <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                {/* AVATAR */}

                <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center shrink-0">

                  <ShieldCheck
                    size={40}
                    className="text-white"
                  />

                </div>

                {/* NAME */}

                <div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">

                    {profile.name ||
                      "Administrator"}

                  </h2>

                  <p className="text-blue-100 text-sm mt-1">

                    {profile.email ||
                      "-"}

                  </p>

                  <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-brand-yellow text-brand-blue text-xs font-extrabold">

                    <ShieldCheck
                      size={14}
                    />

                    Administrator

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            {!isEditing ? (

              <div className="p-5 sm:p-7">

                <div className="mb-5">

                  <h3 className="text-base font-extrabold text-gray-900">
                    Informasi Akun
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Informasi administrator yang tersimpan di database.
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* NAMA */}

                  <ProfileItem
                    icon={User}
                    label="Nama"
                    value={
                      profile.name
                    }
                  />

                  {/* EMAIL */}

                  <ProfileItem
                    icon={Mail}
                    label="Email"
                    value={
                      profile.email
                    }
                  />

                  {/* PHONE */}

                  <ProfileItem
                    icon={Phone}
                    label="No. Telepon"
                    value={
                      profile.phone ||
                      "Belum diisi"
                    }
                  />

                  {/* ROLE */}

                  <ProfileItem
                    icon={ShieldCheck}
                    label="Role"
                    value="Administrator"
                  />

                </div>

              </div>

            ) : (

              /* =================================================
                EDIT FORM
              ================================================= */

              <form
                onSubmit={handleSave}
                className="p-5 sm:p-7"
              >

                <div className="mb-5">

                  <h3 className="text-base font-extrabold text-gray-900">
                    Edit Profile
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Perubahan nama, email, dan nomor telepon akan dikirim ke backend dan disimpan ke database.
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* =================================================
                      NAMA
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="name"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Nama
                    </label>

                    <div className="relative">

                      <User
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={
                          formData.name
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Masukkan nama"
                        disabled={
                          isSaving
                        }
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition disabled:opacity-60"
                      />

                    </div>

                  </div>

                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Email Login
                    </label>

                    <div className="relative">

                      <Mail
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={
                          formData.email
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Masukkan email baru"
                        disabled={
                          isSaving
                        }
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition disabled:opacity-60"
                      />

                    </div>

                    <p className="text-xs text-gray-400 mt-1.5">
                      Email ini akan menjadi email login administrator setelah berhasil disimpan.
                    </p>

                  </div>

                  {/* =================================================
                      PHONE
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="phone"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      No. Telepon
                    </label>

                    <div className="relative">

                      <Phone
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={
                          formData.phone
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Masukkan nomor telepon"
                        disabled={
                          isSaving
                        }
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition disabled:opacity-60"
                      />

                    </div>

                  </div>

                  {/* =================================================
                      ROLE
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="role"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Role
                    </label>

                    <div className="relative">

                      <ShieldCheck
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="role"
                        name="role"
                        type="text"
                        value="Administrator"
                        disabled
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                      />

                    </div>

                    <p className="text-xs text-gray-400 mt-1.5">
                      Role administrator tidak dapat diubah.
                    </p>

                  </div>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7 pt-6 border-t border-gray-100">

                  {/* BATAL */}

                  <button
                    type="button"
                    onClick={
                      handleCancel
                    }
                    disabled={
                      isSaving
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >

                    <X size={17} />

                    Batal

                  </button>

                  {/* SIMPAN */}

                  <button
                    type="submit"
                    disabled={
                      isSaving
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >

                    {isSaving ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />

                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save
                          size={17}
                        />

                        Simpan Perubahan
                      </>
                    )}

                  </button>

                </div>

              </form>

            )}

          </div>

          {/* =================================================
              INFO
          ================================================= */}

          <div className="mt-5 rounded-2xl border border-brand-blue/10 bg-brand-blue-light px-5 py-4">

            <div className="flex gap-3">

              <ShieldCheck
                size={19}
                className="text-brand-blue shrink-0 mt-0.5"
              />

              <div>

                <p className="text-sm font-bold text-brand-blue">
                  Profile Administrator
                </p>

                <p className="text-xs sm:text-sm text-brand-blue/75 mt-1 leading-relaxed">
                  Data profile diambil dari backend.
                  Saat profile disimpan, perubahan
                  nama, email, dan nomor telepon
                  dikirim melalui API dan disimpan
                  pada database. Email baru juga
                  digunakan sebagai email login
                  administrator.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }