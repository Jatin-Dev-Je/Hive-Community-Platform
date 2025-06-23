import React, { useEffect, useState } from "react";
import { fetchThreads } from "../../api/posts";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Milestones() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMilestones = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchThreads({ type: "milestone" });
        setMilestones(data.threads || []);
      } catch (err) {
        setError("Failed to load milestones");
      } finally {
        setLoading(false);
      }
    };
    getMilestones();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">Milestones</h1>
      {loading && <div className="text-gray-500">Loading milestones...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && milestones.length === 0 && (
        <div className="text-gray-400">No milestones have been shared yet.</div>
      )}
      <ol className="relative border-l border-indigo-200 dark:border-indigo-700 mt-6">
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
            <div className="mt-2 text-xs text-gray-400">By {m.author?.firstName || 'Unknown'} {m.author?.lastName || ''}</div>
          </li>
        ))}
      </ol>
    </div>
  );
} 