import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function MentorshipConnect() {
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggested = async () => {
      setLoading(true);
      setError(null);
      try {
        // Example: fetch users seeking mentorship or with similar interests/goals
        const res = await axios.get(`${API_URL}/users`, {
          params: { isMentor: true, limit: 10 },
        });
        setSuggested(res.data.data.users || []);
      } catch (err) {
        setError("Failed to load suggestions");
      } finally {
        setLoading(false);
      }
    };
    fetchSuggested();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">Mentorship Connect</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">Suggested mentors based on your interests and goals:</p>
      {loading && <div className="text-gray-500">Loading suggestions...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && suggested.length === 0 && (
        <div className="text-gray-400">No suggestions found. Try updating your interests or goals in your profile.</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {suggested.map((user) => (
          <div key={user._id} className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center">
            <img
              src={user.avatarUrl || user.avatar || "/avatar.svg"}
              alt={user.firstName}
              className="w-20 h-20 rounded-full border-4 border-indigo-200 object-cover shadow mb-3"
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h2>
            <div className="text-indigo-600 font-mono text-xs mb-1">@{user.username}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm mb-2 text-center line-clamp-2">{user.bio || <span className="italic text-gray-400">No bio yet.</span>}</div>
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
              {user.expertise?.slice(0, 3).map((exp) => (
                <span key={exp} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">{exp}</span>
              ))}
            </div>
            <button
              className="mt-auto px-4 py-1 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-sm shadow"
              onClick={() => navigate("/mentorship/chat", { state: { user } })}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 