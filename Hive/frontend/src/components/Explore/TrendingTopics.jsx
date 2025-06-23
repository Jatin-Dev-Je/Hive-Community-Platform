import React from "react";

export default function TrendingTopics({ topics }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-2 text-indigo-700">Trending Topics</h2>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span key={topic} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-indigo-200 transition">
            #{topic}
          </span>
        ))}
      </div>
    </div>
  );
} 