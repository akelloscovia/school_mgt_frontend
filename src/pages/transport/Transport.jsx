import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Transport() {
  const [busRoutes, setBusRoutes] = useState([]);
  const [dormitories, setDormitories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [showBusForm, setShowBusForm] = useState(false);
  const [showDormForm, setShowDormForm] = useState(false);
  const [routeEditingId, setRouteEditingId] = useState(null);
  const [dormEditingId, setDormEditingId] = useState(null);
  const [busFormData, setBusFormData] = useState({
    route_name: "",
    driver_name: "",
    bus_number: "",
    capacity: 50,
    description: "",
  });
  const [dormFormData, setDormFormData] = useState({
    student_id: "",
    dormitory: "",
    room_number: "",
  });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchTransportData();
    fetchStudents();
  }, []);

  const fetchTransportData = async () => {
    try {
      setLoading(true);
      const routesResponse = await axiosClient.get("/transport/routes");
      setBusRoutes(routesResponse.data?.data?.items || []);

      const dormsResponse = await axiosClient.get("/transport/dormitories");
      setDormitories(dormsResponse.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching transport data:", error);
      setStatus("Failed to load transport data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosClient.get("/students");
      setStudents(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleBusChange = (e) => {
    const { name, value } = e.target;
    setBusFormData({
      ...busFormData,
      [name]: name === "capacity" ? (value === "" ? "" : parseInt(value, 10)) : value,
    });
  };

  const handleDormChange = (e) => {
    const { name, value } = e.target;
    setDormFormData({
      ...dormFormData,
      [name]: value,
    });
  };

  const handleBusSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      setLoading(true);
      if (routeEditingId) {
        await axiosClient.put(`/transport/routes/${routeEditingId}`, busFormData);
        setStatus("Bus route updated successfully!");
      } else {
        await axiosClient.post("/transport/routes", busFormData);
        setStatus("Bus route added successfully!");
      }

      setBusFormData({
        route_name: "",
        driver_name: "",
        bus_number: "",
        capacity: 50,
        description: "",
      });
      setRouteEditingId(null);
      setShowBusForm(false);
      await fetchTransportData();
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to save bus route");
    } finally {
      setLoading(false);
    }
  };

  const handleDormSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      setLoading(true);
      if (dormEditingId) {
        await axiosClient.put(`/transport/dormitories/${dormEditingId}`, dormFormData);
        setStatus("Dormitory allocation updated successfully!");
      } else {
        await axiosClient.post("/transport/dormitories", dormFormData);
        setStatus("Dormitory allocation added successfully!");
      }

      setDormFormData({
        student_id: "",
        dormitory: "",
        room_number: "",
      });
      setDormEditingId(null);
      setShowDormForm(false);
      await fetchTransportData();
    } catch (error) {
      setStatus(error.response?.data?.error || "Failed to save dormitory allocation");
    } finally {
      setLoading(false);
    }
  };

  const handleRouteEdit = (route) => {
    setRouteEditingId(route.id);
    setShowBusForm(true);
    setShowDormForm(false);
    setBusFormData({
      route_name: route.route_name || "",
      driver_name: route.driver_name || "",
      bus_number: route.bus_number || "",
      capacity: route.capacity || 50,
      description: route.description || "",
    });
  };

  const handleRouteDelete = async (routeId) => {
    if (!window.confirm("Delete this bus route?")) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/transport/routes/${routeId}`);
      setStatus("Bus route deleted successfully!");
      await fetchTransportData();
    } catch (error) {
      setStatus("Failed to delete bus route");
    } finally {
      setLoading(false);
    }
  };

  const handleDormEdit = (dorm) => {
    setDormEditingId(dorm.id);
    setShowDormForm(true);
    setShowBusForm(false);
    setDormFormData({
      student_id: dorm.student_id || "",
      dormitory: dorm.dormitory || "",
      room_number: dorm.room_number || "",
    });
  };

  const handleDormDelete = async (dormId) => {
    if (!window.confirm("Delete this dormitory allocation?")) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/transport/dormitories/${dormId}`);
      setStatus("Dormitory allocation deleted successfully!");
      await fetchTransportData();
    } catch (error) {
      setStatus("Failed to delete dormitory allocation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Transport & Boarding</h2>

      {status && (
        <p className={status.includes("successfully") ? "success-message" : "error-message"}>
          {status}
        </p>
      )}

      <div className="grid">

        <div className="card">
          <h3>Bus Routes</h3>

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => {
                setShowBusForm(!showBusForm);
                setShowDormForm(false);
                setRouteEditingId(null);
                setBusFormData({
                  route_name: "",
                  driver_name: "",
                  bus_number: "",
                  capacity: 50,
                  description: "",
                });
              }}
              style={{ padding: "8px 16px" }}
            >
              {showBusForm ? "Cancel" : routeEditingId ? "Cancel Edit" : "Add Bus Route"}
            </button>
          </div>

          {showBusForm && (
            <form onSubmit={handleBusSubmit} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
              <h4>{routeEditingId ? "Edit Bus Route" : "New Bus Route"}</h4>

              <input
                type="text"
                name="route_name"
                placeholder="Route Name (e.g., Kampala - Mukono)"
                value={busFormData.route_name}
                onChange={handleBusChange}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <input
                type="text"
                name="driver_name"
                placeholder="Driver Name"
                value={busFormData.driver_name}
                onChange={handleBusChange}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <input
                type="text"
                name="bus_number"
                placeholder="Bus Number (e.g., BUS 001)"
                value={busFormData.bus_number}
                onChange={handleBusChange}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <input
                type="number"
                name="capacity"
                placeholder="Capacity"
                value={busFormData.capacity}
                onChange={handleBusChange}
                min="1"
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <textarea
                name="description"
                placeholder="Description"
                value={busFormData.description}
                onChange={handleBusChange}
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <button type="submit" disabled={loading}>
                {loading ? (routeEditingId ? "Saving..." : "Adding...") : routeEditingId ? "Save Changes" : "Add Route"}
              </button>
            </form>
          )}

          {loading ? (
            <p>Loading bus routes...</p>
          ) : busRoutes.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Bus Number</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {busRoutes.map((route) => (
                  <tr key={route.id}>
                    <td>{route.route_name}</td>
                    <td>{route.driver_name}</td>
                    <td>{route.bus_number}</td>
                    <td>{route.capacity}</td>
                    <td>
                      <button type="button" onClick={() => handleRouteEdit(route)} style={{ marginRight: "8px" }}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleRouteDelete(route.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No bus routes available.</p>
          )}
        </div>

        <div className="card">
          <h3>Dormitory Allocation</h3>

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => {
                const newState = !showDormForm;
                setShowDormForm(newState);
                setShowBusForm(false);
                if (newState) {
                  setDormEditingId(null);
                  setDormFormData({
                    student_id: "",
                    dormitory: "",
                    room_number: "",
                  });
                } else {
                  setDormEditingId(null);
                  setDormFormData({
                    student_id: "",
                    dormitory: "",
                    room_number: "",
                  });
                }
              }}
              style={{ padding: "8px 16px" }}
            >
              {showDormForm ? "Cancel" : "Add Allocation"}
            </button>
          </div>

          {showDormForm && (
            <form onSubmit={handleDormSubmit} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
              <h4>{dormEditingId ? "Edit Dormitory Allocation" : "New Dormitory Allocation"}</h4>

              <select
                name="student_id"
                value={dormFormData.student_id}
                onChange={handleDormChange}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name || `${student.user?.first_name} ${student.user?.last_name}`}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="dormitory"
                placeholder="Dormitory Name (e.g., Peace Dorm)"
                value={dormFormData.dormitory}
                onChange={handleDormChange}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <input
                type="text"
                name="room_number"
                placeholder="Room Number"
                value={dormFormData.room_number}
                onChange={handleDormChange}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <button type="submit" disabled={loading}>
                {loading ? (dormEditingId ? "Saving..." : "Adding...") : dormEditingId ? "Save Changes" : "Add Allocation"}
              </button>
            </form>
          )}

          {dormitories.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Dormitory</th>
                  <th>Room</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {dormitories.map((dorm) => (
                  <tr key={dorm.id}>
                    <td>{dorm.student_name}</td>
                    <td>{dorm.dormitory}</td>
                    <td>{dorm.room_number}</td>
                    <td>
                      <button type="button" onClick={() => handleDormEdit(dorm)} style={{ marginRight: "8px" }}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDormDelete(dorm.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No dormitory allocations available.</p>
          )}
        </div>

      </div>
    </div>
  );
}