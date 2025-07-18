import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Admin.css';
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const chatapp = JSON.parse(localStorage.getItem("chatapp"));
    if (!token || !chatapp?.isAdmin) {
      console.warn("Invalid token or not admin, redirecting...");
      return navigate("/login");
    }
    const headers = { Authorization: `Bearer ${token}` };

    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/stats", { headers });
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/admin/user/all", { headers });
        setUsers(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      }
    };

    const fetchReports = async () => {
      try {
        const res = await axios.get("/api/admin/reports", { headers });
        setReports(res.data.reports);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      }
    };

    fetchStats();
    fetchUsers();
    fetchReports();
  }, [navigate, token]);

  const updateUser = async (userId, action) => {
    try {
      await axios.put(
        `/api/admin/user/${userId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User ${action === "block" ? "blocked" : "unblocked"} successfully`);
      // Refresh the user list
      const res = await axios.get("/api/admin/user/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to update user status");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("chatapp");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <p>Total Users: {stats.totalUsers}</p>
      <p>Total Chats: {stats.totalChats}</p>
      <p>Active Users: {stats.activeUsers}</p>

      <h3>User Management</h3>

   {users.map(u => (
      <div key={u._id} className="user-item">
        <div className="user-info">
          {u.username} – <span className={`user-status ${u.isBlocked ? "blocked" : ""}`}>
            {u.isBlocked ? "Blocked" : "Active"}
          </span>
        </div>
        <div className="user-actions">
          <button
            onClick={() => updateUser(u._id, u.isBlocked ? "activate" : "block")}
          >
            {u.isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </div>
    ))}
    




      <h3>Reports</h3>
      {reports.map(r => (
        <div key={r._id} className="report-item">
          <p>
            <strong>{r.reportedBy.username}</strong> reported <strong>{r.reportedUser.username}</strong> for <em>{r.reason}</em>
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;