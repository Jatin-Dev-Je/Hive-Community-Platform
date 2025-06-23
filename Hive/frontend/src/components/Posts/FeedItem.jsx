import React from "react";
import { HeartIcon, ChatBubbleLeftEllipsisIcon, ShareIcon } from "@heroicons/react/24/outline";

export default function FeedItem({ item }) {
  const typeColors = {
    thread: "bg-blue-100 text-blue-700",
    question: "bg-yellow-100 text-yellow-700",
    milestone: "bg-green-100 text-green-700",
  };
  return (
    <div className="rounded-xl shadow p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-transform hover:scale-[1.015] hover:shadow-lg group">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={item.avatar || "/avatar.svg"}
          alt={item.author}
          className="w-10 h-10 rounded-full object-cover border border-indigo-100 dark:border-gray-800 shadow-sm"
        />
        <div className="flex-1">
          <span className="font-semibold text-gray-900 dark:text-white mr-2">{item.author}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColors[item.type]}`}>{item.type.toUpperCase()}</span>
        </div>
        <span className="text-xs text-gray-400">{item.relativeTime || new Date(item.createdAt).toLocaleString()}</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-700 transition">{item.title}</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-2">{item.content}</p>
      <div className="flex gap-2 flex-wrap mb-3">
        {item.tags.map((tag) => (
          <span key={tag} className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-medium">#{tag}</span>
        ))}
      </div>
      <div className="flex gap-4 mt-2">
        <button className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition text-sm font-medium">
          <HeartIcon className="w-5 h-5" /> Like
        </button>
        <button className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition text-sm font-medium">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5" /> Comment
        </button>
        <button className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition text-sm font-medium">
          <ShareIcon className="w-5 h-5" /> Share
        </button>
      </div>
    </div>
  );
} 