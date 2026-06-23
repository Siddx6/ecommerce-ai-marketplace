import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ChatWidget from "./ChatWidget";

function Layout() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <Outlet />
      <ChatWidget />
    </div>
  );
}

export default Layout;