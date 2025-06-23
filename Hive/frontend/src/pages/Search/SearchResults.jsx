import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery().get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/threads/search`, { params: { q: query } });
        setResults(res.data.threads || []);
      } catch (err) {
        setError("Failed to load search results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">Search Results</h1>
      <div className="mb-6 text-gray-600 dark:text-gray-300">Showing results for: <span className="font-semibold">{query}</span></div>
      {loading && <div className="text-gray-500">Loading results...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && results.length === 0 && (
        <div className="text-gray-400">No results found.</div>
      )}
      <div className="space-y-4">
        {results.map((r) => (
          <div key={r._id} className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-5">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{r.title}</div>
            <div className="text-xs text-gray-400 mb-2">{new Date(r.createdAt).toLocaleString()}</div>
            <div className="text-gray-700 dark:text-gray-300 mb-2">{r.description}</div>
            <div className="flex gap-2 flex-wrap">
              {r.tags?.map((tag) => (
                <span key={tag} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 