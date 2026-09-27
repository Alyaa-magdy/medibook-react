function Specialties() {
  const specialties = [
    {
      id: 1,
      name: "Cardiology",
      icon: "❤️",
      doctors: 24,
    },
    {
      id: 2,
      name: "Dentistry",
      icon: "🦷",
      doctors: 18,
    },
    {
      id: 3,
      name: "Neurology",
      icon: "🧠",
      doctors: 12,
    },
    {
      id: 4,
      name: "Pediatrics",
      icon: "👶",
      doctors: 20,
    },
    {
      id: 5,
      name: "Orthopedics",
      icon: "🦴",
      doctors: 15,
    },
    {
      id: 6,
      name: "Ophthalmology",
      icon: "👁️",
      doctors: 11,
    },
  ];

  return (
    <section className="specialties-section">

      <div className="section-container">

        <div className="section-heading">

          <div>
            <span className="section-small-title">
              MEDICAL SPECIALTIES
            </span>

            <h2>
              Find a doctor by specialty
            </h2>

            <p>
              Choose the medical specialty you need
              and find the right doctor for your condition.
            </p>
          </div>

          <button className="view-all-specialties">
            View All
          </button>

        </div>


        <div className="specialties-grid">

          {specialties.map((specialty) => (

            <div
              className="specialty-card"
              key={specialty.id}
            >

              <div className="specialty-icon">
                {specialty.icon}
              </div>

              <h3>
                {specialty.name}
              </h3>

              <p>
                {specialty.doctors} Doctors
              </p>

              <button>
                Explore
                <span>→</span>
              </button>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Specialties;