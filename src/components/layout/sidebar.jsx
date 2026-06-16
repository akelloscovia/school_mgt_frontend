import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">

      <h2 className="logo">
        SchoolMS
      </h2>

      <nav>

        <Link to="/">Dashboard</Link>

        <Link to="/students">
          Students
        </Link>

        <Link to="/students/register">
          Register Student
        </Link>

        <Link to="/attendance">
          Attendance
        </Link>

        <Link to="/subjects">
          Subjects
        </Link>

        <Link to="/classes">
          Classes
        </Link>

        <Link to="/timetable">
          Timetable
        </Link>

        <Link to="/exams">
          Exams
        </Link>

        <Link to="/finance">
          Finance
        </Link>

        <Link to="/staff">
          Staff
        </Link>

        <Link to="/library">
          Library
        </Link>

        <Link to="/transport">
          Transport
        </Link>

        <Link to="/reports">
          Reports
        </Link>

        <Link to="/settings">
          Settings
        </Link>

      </nav>

    </div>
  );
}