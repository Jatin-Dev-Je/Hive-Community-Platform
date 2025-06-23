import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.data.user);
        setFirstName(res.data.data.user.firstName || "");
        setLastName(res.data.data.user.lastName || "");
        setBio(res.data.data.user.bio || "");
        setAvatarUrl(res.data.data.user.avatarUrl || res.data.data.user.avatar || "");
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      let uploadedAvatarUrl = avatarUrl;
      // Simulate avatar upload (replace with real upload if available)
      if (avatarFile) {
        // TODO: Implement real upload logic
        uploadedAvatarUrl = avatarUrl; // Keep preview for now
      }
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/auth/profile`,
        {
          firstName,
          lastName,
          bio,
          avatarUrl: uploadedAvatarUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-xl mx-auto py-10 px-4 text-gray-500">Loading profile...</div>;
  if (error) return <div className="max-w-xl mx-auto py-10 px-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 mb-8 relative">
        <button
          type="button"
          className="absolute left-4 top-4 text-indigo-600 hover:underline text-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Edit Profile</h1>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-4">
            <img
              src={avatarUrl || "/avatar.svg"}
              alt="avatar"
              className="w-24 h-24 rounded-full border-4 border-indigo-200 object-cover shadow"
            />
            <button
              type="button"
              className="text-indigo-600 hover:underline text-sm"
              onClick={() => fileInputRef.current.click()}
            >
              Change Avatar
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">First Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                maxLength={50}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Last Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                maxLength={50}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Bio</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 