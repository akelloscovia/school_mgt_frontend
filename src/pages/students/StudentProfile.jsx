export default function StudentProfile() {
  return (
    <div>

      <h2>Student Profile</h2>

      <div className="card">

        <div style={{
          display: "flex",
          gap: "20px",
          alignItems: "center"
        }}>

          <img
            src="https://via.placeholder.com/120"
            alt="student"
            style={{
              borderRadius: "10px"
            }}
          />

          <div>
            <h3>John Doe</h3>
            <p>Student ID: STD001</p>
            <p>Gender: Male</p>
            <p>Class: Primary 5</p>
            <p>Parent Contact: 0700000000</p>
            <p>Medical Info: Asthma</p>
            <p>Promotion Status: Promoted</p>
          </div>

        </div>

      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Uploaded Documents</h3>

        <ul>
          <li>Birth Certificate.pdf</li>
          <li>Report Card.pdf</li>
        </ul>
      </div>

    </div>
  );
}