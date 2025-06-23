import React, { useState } from "react";
import AuthWrapper from "../../components/Layout/AuthWrapper";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import Logo from "../../components/UI/Logo";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <AuthWrapper>
      <div className="flex flex-col items-center mb-6">
        <Logo />
        <h2 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">Reset your password</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter your new password below.</p>
      </div>
      <form className="space-y-4">
        <Input
          label="New Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          icon="lock"
          className="pr-10"
        />
        <Input
          label="Confirm New Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          icon="lock"
          className="pr-10"
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
        <Button type="submit">Reset Password</Button>
      </form>
      <div className="mt-6 text-sm text-center">
        <a href="/login" className="text-blue-600 hover:underline">Back to login</a>
      </div>
    </AuthWrapper>
  );
} 