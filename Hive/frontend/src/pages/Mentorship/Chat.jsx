import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Mock user and messages for demo
const mockUser = {
  _id: "2",
  firstName: "Jane",
  lastName: "Doe",
  username: "janedoe",
  avatarUrl: "",
};
const mockMe = {
  _id: "1",
  firstName: "You",
  lastName: "",
  username: "me",
  avatarUrl: "",
};
const mockMessages = [
  { _id: 1, from: mockUser, to: mockMe, text: "Hi! Are you looking for a mentor in React?", createdAt: new Date(Date.now() - 1000 * 60 * 60) },
  { _id: 2, from: mockMe, to: mockUser, text: "Yes! I want to improve my frontend skills.", createdAt: new Date(Date.now() - 1000 * 60 * 55) },
  { _id: 3, from: mockUser, to: mockMe, text: "Awesome! Let's connect.", createdAt: new Date(Date.now() - 1000 * 60 * 50) },
];

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const location = useLocation();
  const user = location.state?.user;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch messages from backend
  useEffect(() => {
    if (!user?._id) return;
    let isMounted = true;
    const token = localStorage.getItem("token");
    async function fetchMessages() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/messages/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) setMessages(res.data.messages || []);
      } catch (err) {
        if (isMounted) setError("Failed to load messages");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchMessages();
    // Poll for new messages every 5s
    const interval = setInterval(fetchMessages, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user?._id) return;
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${API_URL}/messages`,
        { to: user._id, text: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInput("");
      // Fetch messages again to update UI
      const res = await axios.get(`${API_URL}/messages/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      setError("Failed to send message");
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 mt-10">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 bg-indigo-50 dark:bg-gray-800 rounded-t-xl">
        <img
          src={user?.avatarUrl || user?.avatar || "/avatar.svg"}
          alt={user?.firstName}
          className="w-12 h-12 rounded-full border-2 border-indigo-200 object-cover"
        />
        <div>
          <div className="font-bold text-lg text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</div>
          <div className="text-indigo-600 font-mono text-xs">@{user?.username}</div>
        </div>
      </div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">Loading messages...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400">{error}</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">No messages yet. Say hello!</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.from === mockMe._id ? "justify-end" : "justify-start"} mb-3`}
            >
              {msg.from !== mockMe._id && (
                <img
                  src={user?.avatarUrl || user?.avatar || "/avatar.svg"}
                  alt={user?.firstName}
                  className="w-8 h-8 rounded-full border border-indigo-100 object-cover mr-2 self-end"
                />
              )}
              <div className={`max-w-xs px-4 py-2 rounded-2xl shadow text-sm relative ${msg.from === mockMe._id ? "bg-indigo-600 text-white rounded-br-none" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none"}`}>
                {msg.text}
                <div className="text-xs text-gray-400 mt-1 text-right">{formatTime(msg.createdAt)}</div>
              </div>
              {msg.from === mockMe._id && (
                <img
                  src={"/avatar.svg"}
                  alt="You"
                  className="w-8 h-8 rounded-full border border-indigo-100 object-cover ml-2 self-end"
                />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Chat Input */}
      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-xl sticky bottom-0">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          disabled={!input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
} 