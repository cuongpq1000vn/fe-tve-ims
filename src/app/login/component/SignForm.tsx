"use client";
import React, { useState } from "react";

const SignForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <form className="mt-6 w-full max-w-md space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <label htmlFor="username" className="text-black font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="email"
          placeholder="Enter your email"
          value={formData.username}
          onChange={handleInputChange}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="password" className="text-black font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center">
        <input
          id="remember-me"
          name="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={handleInputChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-black font-medium"
        >
          Remember me
        </label>
      </div>
      <button
        type="submit"
        className="w-full bg-green-700 text-white font-bold py-2 px-4 rounded hover:bg-green-700"
      >
        Sign in
      </button>
    </form>
  );
};

export default SignForm;
