import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createThread } from "../../api/posts";

const categories = [
  "general", "technology", "career", "education", "health", "finance", "relationships", "hobbies", "mentorship", "milestones", "qa", "other"
];

export default function AskQuestion() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
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
        category,
        type: "qa",
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setSuccess("Question posted successfully!");
      setTimeout(() => navigate("/questions"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Ask a Question</h1>
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
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tags (comma separated)</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. react, career, mentorship"
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Posting..." : "Ask Question"}
        </button>
      </form>
    </div>
  );
} 