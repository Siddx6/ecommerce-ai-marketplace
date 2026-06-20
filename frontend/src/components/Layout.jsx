import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default Layout;