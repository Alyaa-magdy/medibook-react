import {
  Link
} from "react-router";



function HowItWorksPage() {

  /* =========================
     STEPS DATA
  ========================= */

  const steps = [

    {
      number: "01",
      icon: "🔎",
      title: "Find Your Doctor",
      description:
        "Search trusted doctors by specialty, location, availability, rating and consultation fee."
    },

    {
      number: "02",
      icon: "👨‍⚕️",
      title: "View Doctor Profile",
      description:
        "Review the doctor's specialty, experience, clinic information, services, ratings and patient reviews."
    },

    {
      number: "03",
      icon: "📅",
      title: "Choose a Schedule",
      description:
        "Select an available date and appointment time that works best for you."
    },

    {
      number: "04",
      icon: "✓",
      title: "Book Appointment",
      description:
        "Confirm your booking and send the appointment request directly to the doctor."
    },

    {
      number: "05",
      icon: "🔔",
      title: "Get Confirmation",
      description:
        "Receive a notification when your doctor confirms or updates your appointment."
    },

    {
      number: "06",
      icon: "💳",
      title: "Complete Payment",
      description:
        "Use the MediBook mock payment workflow to complete your appointment payment."
    },

    {
      number: "07",
      icon: "🩺",
      title: "Visit Your Doctor",
      description:
        "Attend your confirmed appointment at the scheduled date and time."
    },

    {
      number: "08",
      icon: "★",
      title: "Share Your Review",
      description:
        "After your completed visit, rate your experience and help other patients choose confidently."
    }

  ];


  return (

    <main className="public-page">


      {/* =========================
          HERO
      ========================= */}

      <section className="public-page-hero">

        <div className="public-page-container">


          <span className="public-page-label">

            SIMPLE & EASY

          </span>


          <h1>

            How MediBook
            <span>
              {" "}
              works
            </span>

          </h1>


          <p>

            From finding your doctor to
            completing your visit, MediBook
            makes the appointment journey
            simple and organized.

          </p>


        </div>

      </section>


      {/* =========================
          STEPS
      ========================= */}

      <section className="public-page-section">

        <div className="public-page-container">


          <div className="public-section-heading">

            <div>

              <span>
                PATIENT JOURNEY
              </span>

              <h2>
                Booking in simple steps
              </h2>

            </div>

          </div>


          <div className="how-page-grid">


            {steps.map(
              (step) => (

                <div
                  className="how-page-card"
                  key={step.number}
                >


                  <div className="how-page-top">


                    <div className="how-page-icon">

                      {step.icon}

                    </div>


                    <span className="how-page-number">

                      {step.number}

                    </span>


                  </div>


                  <h3>

                    {step.title}

                  </h3>


                  <p>

                    {step.description}

                  </p>


                </div>

              )
            )}


          </div>


        </div>

      </section>


      {/* =========================
          FLOW
      ========================= */}

      <section className="how-flow-section">

        <div className="public-page-container">


          <div className="how-flow-box">


            <span className="public-page-label">

              COMPLETE JOURNEY

            </span>


            <h2>

              Everything in one place

            </h2>


            <div className="how-flow-line">


              <span>
                Find Doctor
              </span>

              <b>
                →
              </b>

              <span>
                Select Schedule
              </span>

              <b>
                →
              </b>

              <span>
                Book
              </span>

              <b>
                →
              </b>

              <span>
                Confirmation
              </span>

              <b>
                →
              </b>

              <span>
                Payment
              </span>

              <b>
                →
              </b>

              <span>
                Visit
              </span>

              <b>
                →
              </b>

              <span>
                Review
              </span>


            </div>


          </div>


        </div>

      </section>


      {/* =========================
          BENEFITS
      ========================= */}

      <section className="public-page-section">

        <div className="public-page-container">


          <div className="public-benefits-grid">


            <div className="public-benefit-card">

              <span>
                ✓
              </span>

              <h3>
                Verified Doctors
              </h3>

              <p>

                Browse organized doctor
                profiles with complete
                information.

              </p>

            </div>


            <div className="public-benefit-card">

              <span>
                📅
              </span>

              <h3>
                Easy Scheduling
              </h3>

              <p>

                Choose available dates and
                times without double booking.

              </p>

            </div>


            <div className="public-benefit-card">

              <span>
                🔔
              </span>

              <h3>
                Notifications
              </h3>

              <p>

                Stay updated when appointment
                status changes.

              </p>

            </div>


            <div className="public-benefit-card">

              <span>
                ★
              </span>

              <h3>
                Trusted Reviews
              </h3>

              <p>

                Reviews are connected to
                completed appointments.

              </p>

            </div>


          </div>


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
                READY TO START?
              </span>

              <h2>

                Find your doctor and
                book today.

              </h2>

            </div>


            <Link
              to="/doctors"
              className="public-primary-button"
            >

              Find a Doctor

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

export default HowItWorksPage;