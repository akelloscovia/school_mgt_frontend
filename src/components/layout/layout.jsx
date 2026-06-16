import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

export default function Layout() {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main-content">

        <Topbar />

        <div className="page-content">
          <Outlet />
        </div>

      </div>

    </div>
  );
}