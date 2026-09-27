import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router";

import axios from "axios";


function Hero() {

  const navigate =
    useNavigate();


  /* =========================
     SEARCH STATES
  ========================= */

  const [specialty, setSpecialty] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [date, setDate] =
    useState("");


  /* =========================
     SEARCH DATA
  ========================= */

  const [specialties, setSpecialties] =
    useState([]);

  const [locations, setLocations] =
    useState([]);


  /* =========================
     GET DOCTORS DATA
  ========================= */

  useEffect(() => {

    const getSearchData = async () => {

      try {

        const response =
          await axios.get(
            "http://localhost:3000/doctors"
          );


        const doctors =
          response.data;


        /* =========================
           SPECIALTIES
        ========================= */

        const uniqueSpecialties =
          [
            ...new Set(
              doctors
                .map((doctor) =>
                  doctor.specialty
                )
                .filter(Boolean)
            )
          ].sort();


        /* =========================
           LOCATIONS
        ========================= */

        const uniqueLocations =
          [
            ...new Set(
              doctors
                .map((doctor) =>
                  doctor.location
                )
                .filter(Boolean)
            )
          ].sort();


        setSpecialties(
          uniqueSpecialties
        );


        setLocations(
          uniqueLocations
        );


      } catch (error) {

        console.log(
          "HERO SEARCH DATA ERROR:",
          error
        );

      }

    };


    getSearchData();

  }, []);


  /* =========================
     TODAY
  ========================= */

  const getToday = () => {

    const today =
      new Date();


    const year =
      today.getFullYear();


    const month =
      String(
        today.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const day =
      String(
        today.getDate()
      ).padStart(
        2,
        "0"
      );


    return (
      `${year}-${month}-${day}`
    );

  };


  const today =
    getToday();


  /* =========================
     SEARCH
  ========================= */

  const handleSearch = (
    event
  ) => {

    event.preventDefault();


    const params =
      new URLSearchParams();


    if (specialty) {

      params.set(
        "specialty",
        specialty
      );

    }


    if (location) {

      params.set(
        "location",
        location
      );

    }


    if (date) {

      params.set(
        "date",
        date
      );

    }


    const query =
      params.toString();


    if (query) {

      navigate(
        `/doctors?${query}`
      );

    } else {

      navigate(
        "/doctors"
      );

    }

  };


  return (

    <section className="hero-pro">


      {/* Background decorations */}

      <div className="hero-pro-shape hero-pro-shape-one"></div>

      <div className="hero-pro-shape hero-pro-shape-two"></div>


      <div className="hero-pro-container">


        {/* =========================
            LEFT CONTENT
        ========================== */}

        <div className="hero-pro-content">


          <div className="hero-pro-badge">

            <span className="hero-pro-badge-icon">
              ✓
            </span>

            Trusted by 35,000+ patients

          </div>


          <h1>

            Your health deserves

            <span>
              {" "}
              the right doctor.
            </span>

          </h1>


          <p className="hero-pro-description">

            Discover trusted doctors near you,
            compare specialties and book your
            appointment at the time that works
            best for you.

          </p>


          {/* =========================
              SEARCH BOX
          ========================== */}

          <form
            className="hero-pro-search"
            onSubmit={handleSearch}
          >


            {/* SPECIALTY */}

            <div className="hero-pro-search-item">


              <div className="hero-pro-search-icon">
                ✚
              </div>


              <div className="hero-pro-search-content">


                <label>
                  Specialty
                </label>


                <select
                  value={specialty}
                  onChange={(event) =>
                    setSpecialty(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select specialty
                  </option>


                  {specialties.map(
                    (item) => (

                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>

                    )
                  )}

                </select>


              </div>


            </div>


            <div className="hero-pro-search-divider"></div>


            {/* LOCATION */}

            <div className="hero-pro-search-item">


              <div className="hero-pro-search-icon">
                ⌖
              </div>


              <div className="hero-pro-search-content">


                <label>
                  Location
                </label>


                <select
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select location
                  </option>


                  {locations.map(
                    (item) => (

                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>

                    )
                  )}

                </select>


              </div>


            </div>


            <div className="hero-pro-search-divider"></div>


            {/* DATE */}

            <div className="hero-pro-search-item">


              <div className="hero-pro-search-icon">
                ◫
              </div>


              <div className="hero-pro-search-content">


                <label>
                  Appointment
                </label>


                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value
                    )
                  }
                />


              </div>


            </div>


            {/* SEARCH BUTTON */}

            <button
              type="submit"
              className="hero-pro-search-button"
            >

              <span>
                Search
              </span>

              <span>
                →
              </span>

            </button>


          </form>


          {/* =========================
              TRUST FEATURES
          ========================== */}

          <div className="hero-pro-features">


            <div>

              <span>
                ✓
              </span>

              Verified Doctors

            </div>


            <div>

              <span>
                ✓
              </span>

              Easy Booking

            </div>


            <div>

              <span>
                ✓
              </span>

              Trusted Reviews

            </div>


          </div>


        </div>


        {/* =========================
            RIGHT SIDE
        ========================== */}

        <div className="hero-pro-visual">


          <div className="hero-pro-image-bg"></div>


          <div className="hero-pro-doctor-image">


            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85"
              alt="Professional doctor"
            />


          </div>


          {/* RATING */}

          <div className="hero-pro-floating hero-pro-rating">


            <div className="hero-pro-floating-icon yellow">
              ★
            </div>


            <div>

              <strong>
                4.9 / 5
              </strong>

              <span>
                2,500+ patient reviews
              </span>

            </div>


          </div>


          {/* APPOINTMENT */}

          <div className="hero-pro-floating hero-pro-appointment">


            <div className="hero-pro-floating-icon green">
              ✓
            </div>


            <div>

              <small>
                Your appointment
              </small>

              <strong>
                Today • 06:30 PM
              </strong>

              <span>
                Dr. Salma Mostafa
              </span>

            </div>


          </div>


          {/* DOCTORS */}

          <div className="hero-pro-doctors-card">


            <div className="hero-pro-avatars">


              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt=""
              />


              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt=""
              />


              <img
                src="https://randomuser.me/api/portraits/men/46.jpg"
                alt=""
              />


              <div>
                +
              </div>


            </div>


            <div>

              <strong>
                250+
              </strong>

              <span>
                Verified doctors
              </span>

            </div>


          </div>


        </div>


      </div>


    </section>

  );

}

export default Hero;