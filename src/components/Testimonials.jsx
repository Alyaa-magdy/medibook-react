function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Mohamed Ahmed",
      role: "Verified Patient",
      image:
        "https://randomuser.me/api/portraits/men/11.jpg",
      rating: 5,
      text:
        "The booking process was very easy. I found the right doctor and booked my appointment in just a few minutes.",
    },

    {
      id: 2,
      name: "Nour Ali",
      role: "Verified Patient",
      image:
        "https://randomuser.me/api/portraits/women/24.jpg",
      rating: 5,
      text:
        "I really liked being able to compare doctors, ratings and consultation fees before booking.",
    },

    {
      id: 3,
      name: "Omar Hassan",
      role: "Verified Patient",
      image:
        "https://randomuser.me/api/portraits/men/36.jpg",
      rating: 5,
      text:
        "A very professional platform. Booking appointments is much easier than calling clinics manually.",
    },
  ];

  return (
    <section className="testimonials-section">

      <div className="section-container">

        <div className="testimonials-heading">

          <span className="section-small-title">
            PATIENT REVIEWS
          </span>

          <h2>
            What our patients say
          </h2>

          <p>
            Real experiences from patients who used MediBook
            to find and book trusted doctors.
          </p>

        </div>


        <div className="testimonials-grid">

          {testimonials.map((testimonial) => (

            <div
              className="testimonial-card"
              key={testimonial.id}
            >

              <div className="testimonial-quote">
                “
              </div>


              <div className="testimonial-stars">

                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    ★
                  </span>
                ))}

              </div>


              <p className="testimonial-text">
                {testimonial.text}
              </p>


              <div className="testimonial-user">

                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                />

                <div>
                  <strong>
                    {testimonial.name}
                  </strong>

                  <span>
                    {testimonial.role}
                  </span>
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default Testimonials;