import { Link } from "react-router";

function NotFound() {
  return (
    <main className="not-found-page">

      <style>
        {`
          .not-found-page {
            min-height: calc(100vh - 150px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 50px 20px;
            background: #f8fafc;
          }

          .not-found-box {
            width: 100%;
            max-width: 600px;
            text-align: center;
            padding: 50px 30px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 22px;
            box-shadow: 0 15px 40px rgba(15, 23, 42, 0.06);
          }

          .not-found-number {
            margin-bottom: 5px;
            color: #2563eb;
            font-size: 90px;
            line-height: 1;
            font-weight: 900;
          }

          .not-found-box h1 {
            margin: 0 0 12px;
            color: #0f172a;
            font-size: 30px;
          }

          .not-found-box p {
            max-width: 430px;
            margin: 0 auto 25px;
            color: #64748b;
            font-size: 14px;
            line-height: 1.8;
          }

          .not-found-home {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 170px;
            min-height: 46px;
            padding: 0 20px;
            border-radius: 10px;
            background: #2563eb;
            color: #ffffff;
            font-size: 12px;
            font-weight: 800;
            text-decoration: none;
            transition: 0.2s;
          }

          .not-found-home:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
          }

          @media (max-width: 600px) {
            .not-found-box {
              padding: 40px 20px;
            }

            .not-found-number {
              font-size: 70px;
            }

            .not-found-box h1 {
              font-size: 24px;
            }
          }
        `}
      </style>


      <div className="not-found-box">

        <div className="not-found-number">
          404
        </div>

        <h1>
          Page Not Found
        </h1>

        <p>
          The page you are looking for does not exist
          or may have been moved.
        </p>

        <Link
          to="/"
          className="not-found-home"
        >
          ← Back to Home
        </Link>

      </div>

    </main>
  );
}

export default NotFound;