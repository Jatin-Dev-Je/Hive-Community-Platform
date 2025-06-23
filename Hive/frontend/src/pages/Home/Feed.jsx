import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeedFilters from "../../components/Posts/FeedFilters";
import FeedItem from "../../components/Posts/FeedItem";
import { fetchThreads } from "../../api/posts";
import { UserCircleIcon, PlusIcon, MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";
import { BellIcon } from "@heroicons/react/24/outline";
import axios from "axios";

function relativeTime(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function NotificationBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCount(res.data.notifications.filter(n => !n.read).length);
      } catch {}
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      className="relative"
      onClick={() => navigate("/notifications")}
      aria-label="Notifications"
    >
      <BellIcon className="w-7 h-7 text-white" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
          {count}
        </span>
      )}
    </button>
  );
}

export default function Feed() {
  const [filter, setFilter] = useState("all");
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchThreads()
      .then((res) => {
        setThreads(res.data.threads || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load feed");
        setLoading(false);
      });
  }, []);

  // Filter threads by type if filter is not 'all'
  const filteredFeed =
    filter === "all"
      ? threads
      : threads.filter((item) => item.type === filter);

  // Mock search handler
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement real search logic here
    alert(`Searching for: ${search}`);
  };

  // Navigate to create post page
  const handleCreate = () => {
    navigate("/create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Improved Sticky Header Layout with More Spacing */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center px-8 py-4 gap-x-8">
          {/* SVG Logo and Brand (far left) */}
          <div className="flex items-center gap-x-3 flex-shrink-0">
            <span className="w-10 h-10 inline-block">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="hive-logo-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a5b4fc" />
                    <stop offset="1" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" fill="url(#hive-logo-gradient)" stroke="#fff" strokeWidth="2" />
                <circle cx="24" cy="24" r="7" fill="#fff" fillOpacity="0.9" />
                <circle cx="24" cy="24" r="4" fill="url(#hive-logo-gradient)" />
              </svg>
            </span>
            <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow">Hive</span>
          </div>
          {/* Navigation */}
          <nav className="flex gap-x-6 ml-8">
            <a href="/" className="text-white/90 font-semibold hover:underline underline-offset-4 transition">Home</a>
            <a href="/explore" className="text-white/70 hover:text-white font-semibold hover:underline underline-offset-4 transition">Explore</a>
            <a href="/mentorship/connect" className="text-white/70 hover:text-white font-semibold hover:underline underline-offset-4 transition">Mentorship</a>
          </nav>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 flex justify-center mx-8 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Hive..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/90 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-indigo-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </form>
          {/* Actions */}
          <div className="flex items-center gap-x-4 flex-shrink-0">
            {/* Floating Action Button (FAB) */}
            <div className="relative group">
              <button
                onClick={handleCreate}
                className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Create New Post"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-indigo-700 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 shadow-lg">
                New Post
              </span>
            </div>
            {/* Notification Bell */}
            <NotificationBell />
            {/* User Avatar/Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <img
                  src={user?.avatar}
                  alt={user ? `${user.firstName} ${user.lastName}` : "Profile"}
                  className="w-9 h-9 rounded-full border-2 border-white shadow"
                />
                <ChevronDownIcon className="w-4 h-4 text-white" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg py-2 z-30 border border-indigo-100 dark:border-gray-800 animate-fade-in">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-semibold border-b border-gray-100 dark:border-gray-800">
                    {user ? `${user.firstName} ${user.lastName}` : "Profile"}
                  </div>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
                    onClick={() => {
                      setProfileOpen(false);
                      if (user?.username) {
                        navigate(`/profile/${user.username}`);
                      } else {
                        navigate(`/profile/me`);
                      }
                    }}
                  >
                    Profile
                  </button>
                  <a href="/logout" className="block px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 transition">Logout</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Feed Content */}
      <main className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">Home Feed</h1>
        </div>
        <FeedFilters filter={filter} setFilter={setFilter} />
        <div className="space-y-6 mt-6">
          {loading ? (
            <div className="flex flex-col items-center py-16 opacity-70">
              <svg className="animate-spin h-8 w-8 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              <p className="text-lg text-gray-500">Loading feed...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 opacity-70">
              <UserCircleIcon className="w-16 h-16 text-red-200 mb-4" />
              <p className="text-lg text-red-500">{error}</p>
            </div>
          ) : filteredFeed.length === 0 ? (
            <div className="flex flex-col items-center py-16 opacity-70">
              <UserCircleIcon className="w-16 h-16 text-indigo-200 mb-4" />
              <p className="text-lg text-gray-500">No posts found for this filter.</p>
            </div>
          ) : (
            filteredFeed.map((item) => (
              <FeedItem
                key={item._id}
                item={{
                  id: item._id,
                  type: item.type,
                  author: item.author?.firstName || "User",
                  avatar: item.author?.avatar,
                  title: item.title,
                  content: item.description,
                  createdAt: item.createdAt,
                  tags: item.tags || [],
                  relativeTime: relativeTime(item.createdAt),
                }}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
} 