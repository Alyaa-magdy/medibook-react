import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useSearchParams
} from "react-router";

import axios from "axios";


function Doctors() {

  /* =========================
     URL SEARCH PARAMS
  ========================= */

  const [
    searchParams,
    setSearchParams
  ] = useSearchParams();


  /* =========================
     DATA
  ========================= */

  const [doctors, setDoctors] =
    useState([]);

  const [schedules, setSchedules] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================
     FILTER STATES
  ========================= */

  const [search, setSearch] =
    useState(
      searchParams.get("search") || ""
    );


  const [specialty, setSpecialty] =
    useState(
      searchParams.get("specialty") || ""
    );


  const [location, setLocation] =
    useState(
      searchParams.get("location") || ""
    );


  const [date, setDate] =
    useState(
      searchParams.get("date") || ""
    );


  const [availability, setAvailability] =
    useState("");


  const [maxPrice, setMaxPrice] =
    useState(1000);


  const [rating, setRating] =
    useState("");


  const [sort, setSort] =
    useState("");


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
     GET DATA
  ========================= */

  useEffect(() => {

    const getData = async () => {

      try {

        const [
          doctorsResponse,
          schedulesResponse
        ] =
          await Promise.all([

            axios.get(
              "http://localhost:3000/doctors"
            ),

            axios.get(
              "http://localhost:3000/schedules"
            )

          ]);


        setDoctors(
          doctorsResponse.data
        );


        setSchedules(
          schedulesResponse.data
        );


      } catch (error) {

        console.log(
          "DOCTORS PAGE ERROR:",
          error
        );


        setError(
          "Something went wrong while loading doctors."
        );


      } finally {

        setLoading(false);

      }

    };


    getData();

  }, []);


  /* =========================
     DYNAMIC SPECIALTIES
  ========================= */

  const specialties =
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
     DYNAMIC LOCATIONS
  ========================= */

  const locations =
    [
      ...new Set(
        doctors
          .map((doctor) =>
            doctor.location
          )
          .filter(Boolean)
      )
    ].sort();


  /* =========================
     FILTER
  ========================= */

  const filteredDoctors =
    doctors.filter((doctor) => {


      /* NAME */

      const doctorName =
        String(
          doctor.name || ""
        ).toLowerCase();


      const searchMatch =
        doctorName.includes(
          search
            .trim()
            .toLowerCase()
        );


      /* SPECIALTY */

      const specialtyMatch =
        specialty === "" ||
        doctor.specialty ===
          specialty;


      /* LOCATION */

      const locationMatch =
        location === "" ||
        doctor.location ===
          location;


      /* AVAILABILITY */

      let availabilityMatch =
        true;


      if (
        availability ===
        "available"
      ) {

        availabilityMatch =
          doctor.available === true;

      } else if (
        availability ===
        "unavailable"
      ) {

        availabilityMatch =
          doctor.available === false;

      }


      /* PRICE */

      const priceMatch =
        Number(
          doctor.fee || 0
        ) <= maxPrice;


      /* RATING */

      let ratingMatch =
        true;


      if (rating !== "") {

        ratingMatch =
          Number(
            doctor.rating || 0
          ) >=
          Number(rating);

      }


      /* =========================
         APPOINTMENT DATE
      ========================= */

      let dateMatch =
        true;


      if (date !== "") {

        const doctorSchedule =
          schedules.find(
            (schedule) => {

              return (

                String(
                  schedule.doctorId
                ) ===
                String(
                  doctor.id
                )

                &&

                schedule.date ===
                date

                &&

                Array.isArray(
                  schedule.times
                )

                &&

                schedule.times.length > 0

              );

            }
          );


        dateMatch =
          Boolean(
            doctorSchedule
          ) &&
          doctor.available === true;

      }


      return (

        searchMatch &&

        specialtyMatch &&

        locationMatch &&

        availabilityMatch &&

        priceMatch &&

        ratingMatch &&

        dateMatch

      );

    });


  /* =========================
     SORT
  ========================= */

  const sortedDoctors =
    [
      ...filteredDoctors
    ];


  if (
    sort === "rating-high"
  ) {

    sortedDoctors.sort(
      (a, b) =>
        Number(
          b.rating || 0
        ) -
        Number(
          a.rating || 0
        )
    );


  } else if (
    sort === "rating-low"
  ) {

    sortedDoctors.sort(
      (a, b) =>
        Number(
          a.rating || 0
        ) -
        Number(
          b.rating || 0
        )
    );


  } else if (
    sort === "price-low"
  ) {

    sortedDoctors.sort(
      (a, b) =>
        Number(
          a.fee || 0
        ) -
        Number(
          b.fee || 0
        )
    );


  } else if (
    sort === "price-high"
  ) {

    sortedDoctors.sort(
      (a, b) =>
        Number(
          b.fee || 0
        ) -
        Number(
          a.fee || 0
        )
    );


  } else if (
    sort === "name"
  ) {

    sortedDoctors.sort(
      (a, b) =>
        String(
          a.name || ""
        ).localeCompare(
          String(
            b.name || ""
          )
        )
    );

  }


  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {

    setSearch("");

    setSpecialty("");

    setLocation("");

    setDate("");

    setAvailability("");

    setMaxPrice(1000);

    setRating("");

    setSort("");


    setSearchParams({});

  };


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <div className="doctors-message">

        Loading doctors...

      </div>

    );

  }


  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (

      <div className="doctors-message error">

        {error}

      </div>

    );

  }


  return (

    <main className="doctors-page">


      <div className="section-container">


        {/* =========================
            PAGE TITLE
        ========================= */}

        <div className="doctors-page-heading">


          <span className="section-small-title">

            OUR DOCTORS

          </span>


          <h1>

            Find the right doctor for you

          </h1>


          <p>

            Search and compare trusted doctors
            by specialty, location, rating,
            availability and consultation fee.

          </p>


        </div>


        {/* =========================
            FILTERS
        ========================= */}

        <div className="doctors-filters">


          {/* SEARCH */}

          <div className="doctor-search-box">


            <span>
              🔎
            </span>


            <input
              type="text"
              placeholder="Search doctor name..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />


          </div>


          <div className="filters-grid">


            {/* SPECIALTY */}

            <div className="filter-group">


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
                  All Specialties
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


            {/* LOCATION */}

            <div className="filter-group">


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
                  All Locations
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


            {/* APPOINTMENT DATE */}

            <div className="filter-group">


              <label>
                Appointment Date
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


            {/* AVAILABILITY */}

            <div className="filter-group">


              <label>
                Availability
              </label>


              <select
                value={availability}
                onChange={(event) =>
                  setAvailability(
                    event.target.value
                  )
                }
              >

                <option value="">
                  All Doctors
                </option>

                <option value="available">
                  Available
                </option>

                <option value="unavailable">
                  Unavailable
                </option>

              </select>


            </div>


            {/* RATING */}

            <div className="filter-group">


              <label>
                Minimum Rating
              </label>


              <select
                value={rating}
                onChange={(event) =>
                  setRating(
                    event.target.value
                  )
                }
              >

                <option value="">
                  All Ratings
                </option>

                <option value="4.5">
                  ⭐ 4.5 & Above
                </option>

                <option value="4">
                  ⭐ 4.0 & Above
                </option>

                <option value="3">
                  ⭐ 3.0 & Above
                </option>

              </select>


            </div>


            {/* SORT */}

            <div className="filter-group">


              <label>
                Sort By
              </label>


              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Default
                </option>

                <option value="rating-high">
                  Rating: High to Low
                </option>

                <option value="rating-low">
                  Rating: Low to High
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="name">
                  Name A-Z
                </option>

              </select>


            </div>


            {/* PRICE */}

            <div className="filter-group price-filter">


              <label>

                Max Price:

                <strong>

                  {" "}

                  {maxPrice} EGP

                </strong>

              </label>


              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(
                    Number(
                      event.target.value
                    )
                  )
                }
              />


            </div>


          </div>


          {/* FILTER BOTTOM */}

          <div className="filter-bottom">


            <p>

              Showing

              <strong>

                {" "}

                {sortedDoctors.length}

                {" "}

              </strong>

              doctors

            </p>


            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
            >

              Clear Filters

            </button>


          </div>


        </div>


        {/* =========================
            DOCTORS
        ========================= */}

        {sortedDoctors.length > 0 ? (


          <div className="doctors-page-grid">


            {sortedDoctors.map(
              (doctor) => (


                <div
                  className="doctor-list-card"
                  key={doctor.id}
                >


                  {/* IMAGE */}

                  <div className="doctor-list-image">


                    <img
                      src={doctor.image}
                      alt={doctor.name}
                    />


                    {doctor.available ? (

                      <span className="available-badge">

                        Available

                      </span>

                    ) : (

                      <span className="available-badge unavailable">

                        Not Available

                      </span>

                    )}


                  </div>


                  {/* CONTENT */}

                  <div className="doctor-list-content">


                    <h3>

                      {doctor.name}

                    </h3>


                    <p className="doctor-list-specialty">

                      {doctor.specialty}

                    </p>


                    <div className="doctor-list-info">

                      📍 {doctor.location}

                    </div>


                    <div className="doctor-list-rating">


                      <span className="rating-star">

                        ★

                      </span>


                      <strong>

                        {doctor.rating}

                      </strong>


                      <span>

                        ({doctor.reviews} reviews)

                      </span>


                    </div>


                    <div className="doctor-list-bottom">


                      <div>


                        <span>

                          Consultation Fee

                        </span>


                        <strong>

                          {doctor.fee} EGP

                        </strong>


                      </div>


                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="view-profile-btn"
                      >

                        View Profile

                      </Link>


                    </div>


                  </div>


                </div>


              )
            )}


          </div>


        ) : (


          <div className="no-doctors">


            <div>
              🔎
            </div>


            <h3>

              No doctors found

            </h3>


            <p>

              Try changing your search
              or filters.

            </p>


            <button
              type="button"
              onClick={clearFilters}
            >

              Clear Filters

            </button>


          </div>


        )}


      </div>


    </main>

  );

}

export default Doctors;