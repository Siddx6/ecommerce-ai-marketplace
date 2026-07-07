import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ChatWidget from "./ChatWidget";

function Layout() {
  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <Navbar />
      <Outlet />
      <ChatWidget />
    </div>
  );
}

export default Layout;