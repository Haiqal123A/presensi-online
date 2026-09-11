import {
  User,
  GraduationCap,
  School,
  IdCard,
  Phone,
  VenusAndMars,
} from "lucide-react";

const PROFILE_STORAGE_KEY = "pkl_profile";

const DEFAULT_PROFILE = {
  name: "Nama Siswa",
  major: "Rekayasa Perangkat Lunak",
  school: "SMK Contoh Sekolah",
  nisn: "0000000000",
  phone: "08xxxxxxxxxx",
  gender: "Laki-laki",
};

const getProfileData = () => {
  const savedData = localStorage.getItem(
    PROFILE_STORAGE_KEY
  );

  if (!savedData) {
    return DEFAULT_PROFILE;
  }

  try {
    const parsedData = JSON.parse(savedData);

    return {
      ...DEFAULT_PROFILE,
      ...parsedData,
    };
  } catch (error) {
    console.error(
      "Gagal membaca data profile:",
      error
    );

    return DEFAULT_PROFILE;
  }
};

const profile = getProfileData();

const profileItems = [
  {
    label: "Nama Lengkap",
    value: profile.name,
    icon: User,
  },
  {
    label: "Jurusan",
    value: profile.major,
    icon: GraduationCap,
  },
  {
    label: "Sekolah",
    value: profile.school,
    icon: School,
  },
  {
    label: "NISN",
    value: profile.nisn,
    icon: IdCard,
  },
  {
    label: "No. Telepon",
    value: profile.phone,
    icon: Phone,
  },
  {
    label: "Gender",
    value: profile.gender,
    icon: VenusAndMars,
  },
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-brand-blue mb-2">
            <User size={20} />

            <span className="text-sm font-semibold">
              Profile
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Profile Siswa
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Informasi data diri siswa PKL.
          </p>
        </div>

        {/* Profile Header */}
        <div className="bg-brand-blue rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-brand-blue shadow-md shrink-0">
              <User size={38} />
            </div>

            {/* Name */}
            <div>
              <p className="text-white/70 text-sm">
                Siswa PKL
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {profile.name}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium">
                  <GraduationCap size={14} />
                  {profile.major}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium">
                  <School size={14} />
                  {profile.school}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
              <User size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Data Diri
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Informasi identitas siswa PKL.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white text-brand-blue flex items-center justify-center shadow-sm shrink-0">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-400">
                        {item.label}
                      </p>

                      <p className="text-sm font-bold text-gray-900 mt-1 break-words">
                        {item.value || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informasi */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-yellow-light text-yellow-600 flex items-center justify-center shrink-0">
              <IdCard size={21} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Informasi Profile
              </h3>

              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Data profile digunakan sebagai informasi
                identitas siswa dalam sistem absensi PKL.
                Perubahan data nantinya dapat disesuaikan
                dengan data yang diberikan oleh sistem
                sekolah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}