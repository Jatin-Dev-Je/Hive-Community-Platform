import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchThreads } from "../../api/posts";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user by username
        const userRes = await axios.get(`${API_URL}/users`, { params: { search: username } });
        const foundUser = userRes.data?.data?.users?.find(u => u.username === username);
        if (!foundUser) throw new Error("User not found");
        setUser(foundUser);
        // Fetch posts
        const postsRes = await fetchThreads({ author: foundUser._id, type: "discussion" });
        setPosts(postsRes.threads || []);
        // Fetch milestones
        const milestonesRes = await fetchThreads({ author: foundUser._id, type: "milestone" });
        setMilestones(milestonesRes.threads || []);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <div className="max-w-2xl mx-auto py-10 px-4 text-gray-500">Loading profile...</div>;
  if (error) return <div className="max-w-2xl mx-auto py-10 px-4 text-red-500">{error}</div>;
  if (!user) return null;

  const isCurrentUser = currentUser && (currentUser.username === user.username || currentUser.email === user.email);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 mb-8 flex flex-col sm:flex-row items-center gap-8 relative">
        <img
          src={user.avatarUrl || user.avatar || "/avatar.svg"}
          alt="avatar"
          className="w-28 h-28 rounded-full border-4 border-indigo-200 object-cover shadow"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h2>
            <span className="text-indigo-600 font-mono text-sm">@{user.username}</span>
          </div>
          <div className="text-gray-600 dark:text-gray-300 mb-2">{user.bio || <span className="italic text-gray-400">No bio yet.</span>}</div>
          <div className="text-xs text-gray-400 mb-2">Joined {formatDate(user.createdAt)}</div>
          {isCurrentUser && (
            <button
              onClick={() => navigate("/profile/edit")}
              className="mt-2 px-4 py-1 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-sm shadow"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`py-2 px-4 font-semibold transition ${tab === "posts" ? "border-b-2 border-indigo-600 text-indigo-700" : "text-gray-500 hover:text-indigo-600"}`}
          onClick={() => setTab("posts")}
        >
          Posts
        </button>
        <button
          className={`py-2 px-4 font-semibold transition ${tab === "milestones" ? "border-b-2 border-indigo-600 text-indigo-700" : "text-gray-500 hover:text-indigo-600"}`}
          onClick={() => setTab("milestones")}
        >
          Milestones
        </button>
      </div>
      {tab === "posts" && (
        <div>
          {posts.length === 0 ? (
            <div className="text-gray-400">No posts yet.</div>
          ) : (
            <ul className="space-y-6">
              {posts.map((p) => (
                <li key={p._id} className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 border border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{p.title}</h3>
                  <div className="text-xs text-gray-400 mb-1">{formatDate(p.createdAt)}</div>
                  <p className="text-gray-700 dark:text-gray-300">{p.description}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.tags.map((tag) => (
                        <span key={tag} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {tab === "milestones" && (
        <div>
          {milestones.length === 0 ? (
            <div className="text-gray-400">No milestones yet.</div>
          ) : (
            <ol className="relative border-l border-indigo-200 dark:border-indigo-700 mt-2">
              {milestones.map((m) => (
                <li key={m._id} className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-indigo-900">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12.93V15a1 1 0 11-2 0v-.07A6.002 6.002 0 014 10a6 6 0 1112 0 6.002 6.002 0 01-5 5.93z"></path></svg>
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{m.title}</h3>
                    <time className="block text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">{formatDate(m.createdAt)}</time>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{m.description}</p>
                  {m.tags && m.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.tags.map((tag) => (
                        <span key={tag} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
} 