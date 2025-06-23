import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthWrapper from "../../components/Layout/AuthWrapper";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import Divider from "../../components/UI/Divider";
import Logo from "../../components/UI/Logo";
import { login } from "../../api/auth";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const data = await login(email, password);
      dispatch(loginSuccess(data));
      navigate("/");
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || "Login failed"));
    }
  };

  return (
    <AuthWrapper>
      <div className="flex flex-col items-center mb-6">
        <Logo />
        <h2 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">Sign in to Hive</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back! Please enter your details.</p>
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
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          icon="lock"
          className="pr-10"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div className="flex items-center mb-2">
          <input
            id="show-password"
            type="checkbox"
            className="mr-2 accent-blue-600"
            checked={showPassword}
            onChange={() => setShowPassword((v) => !v)}
          />
          <label htmlFor="show-password" className="text-sm text-gray-600 dark:text-gray-300">
            Show password
          </label>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="mt-2" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
      <div className="flex justify-between w-full mt-4 text-sm">
        <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</a>
        <a href="/register" className="text-blue-600 hover:underline">Create account</a>
      </div>
      <Divider>or continue with</Divider>
      <div className="flex gap-3 mt-4">
        <Button variant="secondary" className="flex-1">Google</Button>
        <Button variant="secondary" className="flex-1">GitHub</Button>
      </div>
    </AuthWrapper>
  );
} 