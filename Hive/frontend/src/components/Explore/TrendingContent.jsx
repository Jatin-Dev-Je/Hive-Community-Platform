import React from "react";

export default function TrendingContent({ content }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-2 text-indigo-700">Trending Content</h2>
      <div className="space-y-3">
        {content.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-800 rounded-lg p-4 shadow flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
            <span className="text-xs text-gray-500 mt-1">by {item.author}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 