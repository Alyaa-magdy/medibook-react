function HowItWorks() {
  const steps = [
    {
      id: 1,
      number: "01",
      icon: "🔎",
      title: "Find a Doctor",
      text: "Search doctors by specialty, location, rating and consultation fee.",
    },
    {
      id: 2,
      number: "02",
      icon: "📅",
      title: "Choose Appointment",
      text: "Select the day and available time that works best for you.",
    },
    {
      id: 3,
      number: "03",
      icon: "✅",
      title: "Confirm Booking",
      text: "Confirm your appointment and receive your booking details instantly.",
    },
  ];

  const features = [
    "Verified healthcare professionals",
    "Real patient reviews",
    "Easy appointment management",
    "Fast and simple booking process",
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="section-container">

        <div className="how-grid">

          {/* Left Side */}
          <div className="how-content">

            <span className="section-small-title">
              HOW IT WORKS
            </span>

            <h2>
              Book your doctor in
              <span> three simple steps</span>
            </h2>

            <p className="how-description">
              Finding and booking the right doctor should not be complicated.
              MediBook helps you complete the whole process in minutes.
            </p>

            <div className="steps-list">

              {steps.map((step) => (
                <div className="how-step" key={step.id}>

                  <div className="how-step-number">
                    {step.number}
                  </div>

                  <div className="how-step-icon">
                    {step.icon}
                  </div>

                  <div className="how-step-content">
                    <h3>
                      {step.title}
                    </h3>

                    <p>
                      {step.text}
                    </p>
                  </div>

                </div>
              ))}

            </div>

          </div>


          {/* Right Side */}
          <div className="how-info-card">

            <div className="how-info-top">
              <span>
                Why MediBook?
              </span>

              <h3>
                Healthcare booking made simple.
              </h3>

              <p>
                Everything you need to search, compare and book trusted doctors
                from one place.
              </p>
            </div>


            <div className="how-features">

              {features.map((feature, index) => (
                <div className="how-feature" key={index}>

                  <div className="how-check">
                    ✓
                  </div>

                  <span>
                    {feature}
                  </span>

                </div>
              ))}

            </div>


            <div className="how-mini-stats">

              <div>
                <strong>
                  250+
                </strong>

                <span>
                  Doctors
                </span>
              </div>

              <div>
                <strong>
                  35K+
                </strong>

                <span>
                  Patients
                </span>
              </div>

              <div>
                <strong>
                  40+
                </strong>

                <span>
                  Specialties
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;