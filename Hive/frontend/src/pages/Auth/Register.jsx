import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthWrapper from "../../components/Layout/AuthWrapper";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import Divider from "../../components/UI/Divider";
import Logo from "../../components/UI/Logo";
import { register } from "../../api/auth";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      dispatch(loginFailure("Passwords do not match"));
      return;
    }
    dispatch(loginStart());
    try {
      const data = await register(firstName, lastName, email, password);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      navigate("/");
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || "Registration failed"));
    }
  };

  return (
    <AuthWrapper>
      <div className="flex flex-col items-center mb-6">
        <Logo />
        <h2 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">Create your Hive account</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join the community and start connecting.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <Input
            label="First Name"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name"
            type="text"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </div>
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
          autoComplete="new-password"
          required
          icon="lock"
          className="pr-10"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Input
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          icon="lock"
          className="pr-10"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
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
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
      <div className="mt-6 text-sm text-center">
        <a href="/login" className="text-blue-600 hover:underline">Already have an account? Sign in</a>
      </div>
      <Divider>or continue with</Divider>
      <div className="flex gap-3 mt-4">
        <Button variant="secondary" className="flex-1">Google</Button>
        <Button variant="secondary" className="flex-1">GitHub</Button>
      </div>
    </AuthWrapper>
  );
} 