import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { UserCircleIcon, ArrowUpIcon } from "@heroicons/react/24/solid";

function relativeTime(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`/api/threads/${id}`),
      axios.get(`/api/posts/thread/${id}`)
    ])
      .then(([qRes, aRes]) => {
        setQuestion(qRes.data.data.thread);
        setAnswers(aRes.data.data.posts || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load question");
        setLoading(false);
      });
  }, [id]);

  // Upvote handler (if backend supports upvoting threads)
  const handleUpvote = async () => {
    if (!question) return;
    setUpvoting(true);
    try {
      // Example: await axios.post(`/api/threads/${id}/upvote`);
      // For now, just increment locally
      setQuestion((q) => ({ ...q, upvotes: (q.upvotes || 0) + 1 }));
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {loading ? (
        <div className="flex flex-col items-center py-16 opacity-70">
          <svg className="animate-spin h-8 w-8 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          <p className="text-lg text-gray-500">Loading question...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 opacity-70">
          <UserCircleIcon className="w-16 h-16 text-red-200 mb-4" />
          <p className="text-lg text-red-500">{error}</p>
        </div>
      ) : !question ? (
        <div className="flex flex-col items-center py-16 opacity-70">
          <UserCircleIcon className="w-16 h-16 text-indigo-200 mb-4" />
          <p className="text-lg text-gray-500">Question not found.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl shadow p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={question.author?.avatar || "/avatar.svg"}
                alt={question.author?.firstName || "User"}
                className="w-10 h-10 rounded-full object-cover border border-indigo-100 dark:border-gray-800 shadow-sm"
              />
              <span className="font-semibold text-gray-900 dark:text-white mr-2">{question.author?.firstName || "User"}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Q&A</span>
              <span className="text-xs text-gray-400 ml-auto">{relativeTime(question.createdAt)}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{question.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{question.description}</p>
            <div className="flex gap-2 flex-wrap items-center mb-2">
              {question.tags?.map((tag) => (
                <span key={tag} className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-medium">#{tag}</span>
              ))}
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className="flex items-center gap-1 ml-auto px-3 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold text-xs hover:bg-yellow-200 transition"
              >
                <ArrowUpIcon className="w-4 h-4" />
                {question.upvotes || 0} Upvotes
              </button>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">Answers</h3>
            {answers.length === 0 ? (
              <div className="text-gray-500">No answers yet.</div>
            ) : (
              <div className="space-y-4">
                {answers.map((ans) => (
                  <div key={ans._id} className="rounded-lg bg-indigo-50 dark:bg-gray-800 p-4 border border-indigo-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={ans.author?.avatar || "/avatar.svg"}
                        alt={ans.author?.firstName || "User"}
                        className="w-8 h-8 rounded-full object-cover border border-indigo-100 dark:border-gray-800"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{ans.author?.firstName || "User"}</span>
                      <span className="text-xs text-gray-400 ml-auto">{relativeTime(ans.createdAt)}</span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">{ans.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 