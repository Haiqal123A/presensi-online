import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function UserLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}