import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router";

import axios from "axios";



function SpecialtiesPage() {

  const [doctors, setDoctors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================
     GET DOCTORS
  ========================= */

  useEffect(() => {

    const getDoctors = async () => {

      try {

        const response =
          await axios.get(
            "http://localhost:3000/doctors"
          );


        setDoctors(
          response.data
        );


      } catch (error) {

        console.log(
          "SPECIALTIES ERROR:",
          error
        );


        setError(
          "Unable to load specialties."
        );


      } finally {

        setLoading(false);

      }

    };


    getDoctors();

  }, []);


  /* =========================
     ICONS
  ========================= */

  const getSpecialtyIcon = (
    specialty
  ) => {

    const icons = {

      Cardiology: "❤️",

      Dentistry: "🦷",

      Neurology: "🧠",

      Pediatrics: "👶",

      Orthopedics: "🦴",

      Dermatology: "✨",

      Ophthalmology: "👁️",

      Psychiatry: "🧠",

      Gynecology: "🌸",

      "ENT": "👂",

      "Internal Medicine": "🩺",

      Surgery: "🏥"

    };


    return (
      icons[specialty] ||
      "🩺"
    );

  };


  /* =========================
     SPECIALTIES DATA
  ========================= */

  const specialties =
    useMemo(() => {

      const specialtyMap =
        {};


      doctors.forEach(
        (doctor) => {

          const name =
            doctor.specialty;


          if (!name) {
            return;
          }


          if (
            !specialtyMap[name]
          ) {

            specialtyMap[name] = {
              name,
              doctors: 0,
              availableDoctors: 0
            };

          }


          specialtyMap[name].doctors +=
            1;


          if (
            doctor.available === true
          ) {

            specialtyMap[
              name
            ].availableDoctors += 1;

          }

        }
      );


      return Object.values(
        specialtyMap
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

    }, [doctors]);


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <main className="public-page">

        <div className="public-page-message">

          Loading specialties...

        </div>

      </main>

    );

  }


  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (

      <main className="public-page">

        <div className="public-page-message error">

          {error}

        </div>

      </main>

    );

  }


  return (

    <main className="public-page">


      {/* =========================
          HERO
      ========================= */}

      <section className="public-page-hero">

        <div className="public-page-container">


          <span className="public-page-label">

            MEDICAL SPECIALTIES

          </span>


          <h1>

            Find care by
            <span>
              {" "}
              specialty
            </span>

          </h1>


          <p>

            Explore our medical specialties
            and find trusted doctors for the
            care you need.

          </p>


        </div>

      </section>


      {/* =========================
          CONTENT
      ========================= */}

      <section className="public-page-section">

        <div className="public-page-container">


          <div className="public-section-heading">

            <div>

              <span>
                EXPLORE
              </span>

              <h2>
                All Specialties
              </h2>

            </div>


            <strong>

              {specialties.length}

              {" "}

              Specialties

            </strong>

          </div>


          {specialties.length > 0 ? (

            <div className="specialties-page-grid">


              {specialties.map(
                (specialty) => (

                  <Link
                    key={
                      specialty.name
                    }
                    to={
                      `/doctors?specialty=${encodeURIComponent(
                        specialty.name
                      )}`
                    }
                    className="specialty-page-card"
                  >


                    <div className="specialty-page-icon">

                      {getSpecialtyIcon(
                        specialty.name
                      )}

                    </div>


                    <div className="specialty-page-content">


                      <h3>

                        {specialty.name}

                      </h3>


                      <p>

                        Find experienced doctors
                        specializing in{" "}

                        {specialty.name}.

                      </p>


                      <div className="specialty-page-meta">


                        <span>

                          👨‍⚕️{" "}

                          {
                            specialty.doctors
                          }{" "}

                          Doctors

                        </span>


                        <span>

                          ✓{" "}

                          {
                            specialty.availableDoctors
                          }{" "}

                          Available

                        </span>


                      </div>


                      <div className="specialty-page-link">

                        View Doctors

                        <span>
                          →
                        </span>

                      </div>


                    </div>


                  </Link>

                )
              )}


            </div>

          ) : (

            <div className="public-empty-state">

              <div>
                🩺
              </div>

              <h3>
                No specialties found
              </h3>

              <p>
                Add doctors to display
                medical specialties.
              </p>

            </div>

          )}


        </div>

      </section>


      {/* =========================
          CTA
      ========================= */}

      <section className="public-simple-cta">

        <div className="public-page-container">

          <div className="public-simple-cta-box">


            <div>

              <span>
                NEED A DOCTOR?
              </span>

              <h2>

                Find the right doctor
                for you today.

              </h2>

            </div>


            <Link
              to="/doctors"
              className="public-primary-button"
            >

              Browse All Doctors

              <span>
                →
              </span>

            </Link>


          </div>

        </div>

      </section>


    </main>

  );

}

export default SpecialtiesPage;