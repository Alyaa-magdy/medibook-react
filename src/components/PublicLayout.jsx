import { Outlet } from "react-router";

import Navbar from "./Navbar";
import Footer from "./Footer";

function PublicLayout() {
  return (
    <>
      <Navbar />

      <Outlet />

      <Footer />
    </>
  );
}

export default PublicLayout;