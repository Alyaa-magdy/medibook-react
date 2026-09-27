import {
  Routes,
  Route
} from "react-router";


/* ========================================
   LAYOUTS
======================================== */

import PublicLayout from "./components/PublicLayout";

import AdminLayout from "./components/AdminLayout";

import DoctorLayout from "./components/DoctorLayout";


/* ========================================
   ROUTE PROTECTION
======================================== */

import ProtectedRoute from "./components/ProtectedRoute";

import DoctorRoute from "./components/DoctorRoute";

import AdminRoute from "./components/AdminRoute";

import GuestRoute from "./components/GuestRoute";


/* ========================================
   HOME COMPONENTS
======================================== */

import Hero from "./components/Hero";

import Specialties from "./components/Specialties";

import FeaturedDoctors from "./components/FeaturedDoctors";

import HowItWorks from "./components/HowItWorks";

import Stats from "./components/Stats";

import Testimonials from "./components/Testimonials";

import CTA from "./components/CTA";


/* ========================================
   PUBLIC PAGES
======================================== */

import Doctors from "./pages/Doctors";

import DoctorDetails from "./pages/DoctorDetails";

import SpecialtiesPage from "./pages/SpecialtiesPage";

import HowItWorksPage from "./pages/HowItWorksPage";

import Contact from "./pages/Contact";

import Appointments from "./pages/Appointments";

import EditAppointment from "./pages/EditAppointment";

import Profile from "./pages/Profile";

import Notifications from "./pages/Notifications";

import Register from "./pages/Register";

import Login from "./pages/Login";

import NotFound from "./pages/NotFound";


/* ========================================
   DOCTOR
======================================== */

import DoctorDashboard from "./pages/DoctorDashboard";

import DoctorProfile from "./pages/DoctorProfile";

import DoctorSchedule from "./pages/DoctorSchedule";


/* ========================================
   ADMIN
======================================== */

import AdminDashboard from "./pages/AdminDashboard";

import AdminDoctors from "./pages/AdminDoctors";

import AdminPatients from "./pages/AdminPatients";

import AdminAppointments from "./pages/AdminAppointments";


/* ========================================
   HOME
======================================== */

function Home() {

  return (

    <>

      <Hero />

      <Specialties />

      <FeaturedDoctors />

      <HowItWorks />

      <Stats />

      <Testimonials />

      <CTA />

    </>

  );

}


/* ========================================
   APP
======================================== */

function App() {

  return (

    <Routes>


      {/* ==================================
          PUBLIC WEBSITE
      ================================== */}

      <Route
        element={
          <PublicLayout />
        }
      >


        {/* HOME */}

        <Route
          path="/"
          element={
            <Home />
          }
        />


        {/* DOCTORS */}

        <Route
          path="/doctors"
          element={
            <Doctors />
          }
        />


        {/* DOCTOR DETAILS */}

        <Route
          path="/doctors/:id"
          element={
            <DoctorDetails />
          }
        />


        {/* SPECIALTIES */}

        <Route
          path="/specialties"
          element={
            <SpecialtiesPage />
          }
        />


        {/* HOW IT WORKS */}

        <Route
          path="/how-it-works"
          element={
            <HowItWorksPage />
          }
        />


        {/* CONTACT */}

        <Route
          path="/contact"
          element={
            <Contact />
          }
        />


        {/* PATIENT APPOINTMENTS */}

        <Route
          path="/appointments"
          element={

            <ProtectedRoute>

              <Appointments />

            </ProtectedRoute>

          }
        />


        {/* PATIENT NOTIFICATIONS */}

        <Route
          path="/notifications"
          element={

            <ProtectedRoute>

              <Notifications />

            </ProtectedRoute>

          }
        />


        {/* EDIT APPOINTMENT */}

        <Route
          path="/appointments/:id/edit"
          element={

            <ProtectedRoute>

              <EditAppointment />

            </ProtectedRoute>

          }
        />


        {/* PATIENT PROFILE */}

        <Route
          path="/profile"
          element={

            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>

          }
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={

            <GuestRoute>

              <Login />

            </GuestRoute>

          }
        />


        {/* REGISTER */}

        <Route
          path="/register"
          element={

            <GuestRoute>

              <Register />

            </GuestRoute>

          }
        />


        {/* 404 */}

        <Route
          path="*"
          element={
            <NotFound />
          }
        />


      </Route>


      {/* ==================================
          DOCTOR PORTAL
      ================================== */}

      <Route
        element={

          <DoctorRoute>

            <DoctorLayout />

          </DoctorRoute>

        }
      >


        {/* DASHBOARD */}

        <Route
          path="/doctor/dashboard"
          element={
            <DoctorDashboard />
          }
        />


        {/* PROFILE */}

        <Route
          path="/doctor/profile"
          element={
            <DoctorProfile />
          }
        />


        {/* SCHEDULE */}

        <Route
          path="/doctor/schedule"
          element={
            <DoctorSchedule />
          }
        />


        {/* NOTIFICATIONS */}

        <Route
          path="/doctor/notifications"
          element={
            <Notifications />
          }
        />


      </Route>


      {/* ==================================
          ADMIN PORTAL
      ================================== */}

      <Route
        element={

          <AdminRoute>

            <AdminLayout />

          </AdminRoute>

        }
      >


        {/* DASHBOARD */}

        <Route
          path="/admin/dashboard"
          element={
            <AdminDashboard />
          }
        />


        {/* DOCTORS */}

        <Route
          path="/admin/doctors"
          element={
            <AdminDoctors />
          }
        />


        {/* PATIENTS */}

        <Route
          path="/admin/patients"
          element={
            <AdminPatients />
          }
        />


        {/* APPOINTMENTS */}

        <Route
          path="/admin/appointments"
          element={
            <AdminAppointments />
          }
        />


      </Route>


    </Routes>

  );

}

export default App;