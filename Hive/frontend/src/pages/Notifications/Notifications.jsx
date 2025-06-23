import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function formatTime(date) {
  return new Date(date).toLocaleString();
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data.notifications || []);
      } catch (err) {
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">Notifications</h1>
      {loading && <div className="text-gray-500">Loading notifications...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && notifications.length === 0 && (
        <div className="text-gray-400">No notifications yet.</div>
      )}
      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n._id} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4">
            <span className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            </span>
            <div className="flex-1">
              <div className="text-gray-900 dark:text-white font-medium">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 