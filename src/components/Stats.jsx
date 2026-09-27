function Stats() {
  const stats = [
    {
      id: 1,
      number: "250+",
      title: "Verified Doctors",
    },
    {
      id: 2,
      number: "35K+",
      title: "Happy Patients",
    },
    {
      id: 3,
      number: "40+",
      title: "Medical Specialties",
    },
    {
      id: 4,
      number: "4.9",
      title: "Average Rating",
    },
  ];

  return (
    <section className="stats-section">
      <div className="section-container">

        <div className="stats-grid">

          {stats.map((stat) => (
            <div
              className="stat-card"
              key={stat.id}
            >
              <strong>
                {stat.number}
              </strong>

              <span>
                {stat.title}
              </span>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Stats;