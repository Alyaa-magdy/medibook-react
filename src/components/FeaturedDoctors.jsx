import DoctorCard from "./DoctorCard";

function FeaturedDoctors() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Ahmed Hassan",
      specialty: "Cardiologist",
      image:
        "https://randomuser.me/api/portraits/men/32.jpg",
      location: "Nasr City, Cairo",
      rating: 4.9,
      reviews: 124,
      fee: 500,
      available: "Available Today",
    },

    {
      id: 2,
      name: "Dr. Sara Mohamed",
      specialty: "Dentist",
      image:
        "https://randomuser.me/api/portraits/women/44.jpg",
      location: "Heliopolis, Cairo",
      rating: 4.8,
      reviews: 98,
      fee: 400,
      available: "Available Tomorrow",
    },

    {
      id: 3,
      name: "Dr. Omar Ali",
      specialty: "Neurologist",
      image:
        "https://randomuser.me/api/portraits/men/46.jpg",
      location: "New Cairo, Cairo",
      rating: 4.7,
      reviews: 76,
      fee: 650,
      available: "Available Today",
    },

    {
      id: 4,
      name: "Dr. Mariam Adel",
      specialty: "Pediatrician",
      image:
        "https://randomuser.me/api/portraits/women/65.jpg",
      location: "Maadi, Cairo",
      rating: 4.9,
      reviews: 145,
      fee: 450,
      available: "Available Today",
    },
  ];

  return (
    <section className="featured-doctors-section">

      <div className="section-container">

        <div className="section-heading">

          <div>

            <span className="section-small-title">
              TOP DOCTORS
            </span>

            <h2>
              Meet our highly rated doctors
            </h2>

            <p>
              Choose from trusted healthcare professionals
              and book your appointment easily.
            </p>

          </div>


          <button className="view-all-specialties">
            View All Doctors
          </button>

        </div>


        <div className="doctors-grid">

          {doctors.map((doctor) => (

            <DoctorCard
              key={doctor.id}
              doctor={doctor}
            />

          ))}

        </div>

      </div>

    </section>
  );
}

export default FeaturedDoctors;