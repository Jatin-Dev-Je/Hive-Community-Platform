import React, { useState } from "react";
import AuthWrapper from "../../components/Layout/AuthWrapper";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import Divider from "../../components/UI/Divider";
import Logo from "../../components/UI/Logo";
import { forgotPassword } from "../../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await forgotPassword(email);
      setSuccess("Reset link sent! Check your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="flex flex-col items-center mb-6">
        <Logo />
        <h2 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">Forgot your password?</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter your email to reset your password.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          icon="mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
      </form>
      <div className="mt-6 text-sm text-center">
        <a href="/login" className="text-blue-600 hover:underline">Back to login</a>
      </div>
      <Divider>or continue with</Divider>
      <div className="flex gap-3 mt-4">
        <Button variant="secondary" className="flex-1">Google</Button>
        <Button variant="secondary" className="flex-1">GitHub</Button>
      </div>
    </AuthWrapper>
  );
} 