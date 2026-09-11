import { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  Save,
  X,
  User,
  CheckCircle2,
} from "lucide-react";

const ADMIN_PROFILE_STORAGE_KEY =
  "pkl_admin_profile";

const DEFAULT_PROFILE = {
  name: "Administrator",
  email: "admin@absenku.com",
  phone: "",
  role: "Administrator",
};

function getSavedProfile() {
  const savedProfile =
    localStorage.getItem(
      ADMIN_PROFILE_STORAGE_KEY
    );

  if (!savedProfile) {
    return DEFAULT_PROFILE;
  }

  try {
    const parsedProfile =
      JSON.parse(savedProfile);

    return {
      ...DEFAULT_PROFILE,
      ...parsedProfile,
    };
  } catch (error) {
    console.error(
      "Gagal membaca profile admin:",
      error
    );

    return DEFAULT_PROFILE;
  }
}

export default function AdminProfile() {
  const [profile, setProfile] =
    useState(DEFAULT_PROFILE);

  const [formData, setFormData] =
    useState(DEFAULT_PROFILE);

  const [isEditing, setIsEditing] =
    useState(false);

  const [savedMessage, setSavedMessage] =
    useState("");

  useEffect(() => {
    const savedProfile =
      getSavedProfile();

    setProfile(savedProfile);
    setFormData(savedProfile);
  }, []);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setFormData(profile);
    setSavedMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile);
    setSavedMessage("");
    setIsEditing(false);
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    if (!formData.email.trim()) {
      return;
    }

    const updatedProfile = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    localStorage.setItem(
      ADMIN_PROFILE_STORAGE_KEY,
      JSON.stringify(updatedProfile)
    );

    setProfile(updatedProfile);
    setFormData(updatedProfile);
    setIsEditing(false);

    setSavedMessage(
      "Profile berhasil diperbarui."
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Profile
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Kelola informasi profile
              administrator.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition"
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          )}
        </div>

        {/* SUCCESS MESSAGE */}

        {savedMessage && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2 size={18} />
            {savedMessage}
          </div>
        )}

        {/* PROFILE CARD */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* PROFILE HEADER */}

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
                  {profile.name}
                </h2>

                <p className="text-blue-100 text-sm mt-1">
                  {profile.email}
                </p>

                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-brand-yellow text-brand-blue text-xs font-extrabold">
                  <ShieldCheck size={14} />
                  Administrator
                </div>
              </div>
            </div>
          </div>

          {/* PROFILE CONTENT */}

          {!isEditing ? (
            <div className="p-5 sm:p-7">
              <div className="mb-5">
                <h3 className="text-base font-extrabold text-gray-900">
                  Informasi Akun
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Informasi administrator
                  yang sedang digunakan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NAMA */}

                <ProfileItem
                  icon={User}
                  label="Nama"
                  value={profile.name}
                />

                {/* EMAIL */}

                <ProfileItem
                  icon={Mail}
                  label="Email"
                  value={profile.email}
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
                  value={profile.role}
                />
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSave}
              className="p-5 sm:p-7"
            >
              <div className="mb-5">
                <h3 className="text-base font-extrabold text-gray-900">
                  Edit Profile
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Ubah informasi administrator
                  sesuai kebutuhan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NAMA */}

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
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama"
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Email
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
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Masukkan email"
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                    />
                  </div>
                </div>

                {/* PHONE */}

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
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Masukkan nomor telepon"
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition"
                    />
                  </div>
                </div>

                {/* ROLE */}

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
                    Role administrator tidak
                    dapat diubah.
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
                >
                  <X size={17} />
                  Batal
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition"
                >
                  <Save size={17} />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}
        </div>

        {/* INFO */}

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
                Admin dapat mengubah informasi
                profilenya sendiri. Saat ini data
                profile masih disimpan sementara di
                browser dan nantinya dapat
                dihubungkan ke backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * =====================================================
 * PROFILE ITEM
 * =====================================================
 */

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
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}