import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchThreads } from "../../api/posts";
import { UserCircleIcon } from "@heroicons/react/24/solid";

function relativeTime(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TopicDetail() {
  const { id } = useParams();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchThreads({ category: id })
      .then((res) => {
        setThreads(res.data.threads || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load topic threads");
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6 capitalize">Topic: {id}</h1>
      {loading ? (
        <div className="flex flex-col items-center py-16 opacity-70">
          <svg className="animate-spin h-8 w-8 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          <p className="text-lg text-gray-500">Loading threads...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 opacity-70">
          <UserCircleIcon className="w-16 h-16 text-red-200 mb-4" />
          <p className="text-lg text-red-500">{error}</p>
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center py-16 opacity-70">
          <UserCircleIcon className="w-16 h-16 text-indigo-200 mb-4" />
          <p className="text-lg text-gray-500">No threads found for this topic.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {threads.map((item) => (
            <Link to={`/post/${item._id}`} key={item._id} className="block rounded-xl shadow p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={item.author?.avatar || "/avatar.svg"}
                  alt={item.author?.firstName || "User"}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-100 dark:border-gray-800 shadow-sm"
                />
                <span className="font-semibold text-gray-900 dark:text-white mr-2">{item.author?.firstName || "User"}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">{item.type?.toUpperCase()}</span>
                <span className="text-xs text-gray-400 ml-auto">{relativeTime(item.createdAt)}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{item.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{item.description}</p>
              <div className="flex gap-2 flex-wrap">
                {item.tags?.map((tag) => (
                  <span key={tag} className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-medium">#{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 