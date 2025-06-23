import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Feed from "./pages/Home/Feed";
import Explore from "./pages/Explore/Explore";
import TopicDetail from "./pages/Threads/TopicDetail";
import ThreadDetail from "./pages/Threads/ThreadDetail";
import CreatePost from "./pages/Threads/CreatePost";
import QuestionsList from "./pages/Questions/QuestionsList";
import QuestionDetail from "./pages/Questions/QuestionDetail";
import AskQuestion from "./pages/Questions/AskQuestion";
import Profile from "./pages/Profile/Profile";
import EditProfile from "./pages/Profile/EditProfile";
import MyProfile from "./pages/Profile/MyProfile";
import MentorshipConnect from "./pages/Mentorship/Connect";
import Chat from "./pages/Mentorship/Chat";
import NotFound from "./pages/Error/NotFound";
import Notifications from "./pages/Notifications/Notifications";
import SearchResults from "./pages/Search/SearchResults";
import Terms from "./pages/Legal/Terms";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/" element={<Feed />} />
      <Route path="/topic/:id" element={<TopicDetail />} />
      <Route path="/post/:id" element={<ThreadDetail />} />
      <Route path="/create" element={<CreatePost />} />
      <Route path="/questions" element={<QuestionsList />} />
      <Route path="/questions/ask" element={<AskQuestion />} />
      <Route path="/questions/:id" element={<QuestionDetail />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/profile/me" element={<MyProfile />} />
      <Route path="/mentorship/connect" element={<MentorshipConnect />} />
      <Route path="/mentorship/chat" element={<Chat />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
