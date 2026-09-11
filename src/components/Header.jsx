import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
      {/* Page Title */}
      <div>
        <p className="text-sm text-brand-blue">
          Selamat datang kembali 👋
        </p>

        <h2 className="mt-0.5 text-lg font-bold text-slate-900">
          Dashboard Siswa
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button
          type="button"
          className="relative rounded-full p-2.5 text-brand-blue transition hover:bg-brand-blue-light"
        >
          <Bell size={21} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-yellow ring-2 ring-white" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
            F
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900">
              Farras
            </p>

            <p className="text-xs text-slate-500">
              Siswa PKL
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}