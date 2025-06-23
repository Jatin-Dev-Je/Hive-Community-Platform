import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createThread } from "../../api/posts";

export default function PostMilestone() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await createThread({
        title,
        description,
        category: "milestones",
        type: "milestone",
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setSuccess("Milestone posted successfully!");
      setTimeout(() => navigate("/milestones"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post milestone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Post a Milestone</h1>
      <form className="space-y-5 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            maxLength={1000}
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tags (comma separated)</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. achievement, award, project"
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post Milestone"}
        </button>
      </form>
    </div>
  );
} 