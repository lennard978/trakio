// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

export default function Signup() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) return showToast(t("error_required"), "error");
    if (!email.includes("@")) return showToast(t("error_email_invalid"), "error");
    if (password.length < 6) return showToast(t("error_password_short"), "error");

    try {
      await signup(email, password);
      showToast(t("toast_signup_success"), "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(t("signup_failed"), "error");
    }
  };

  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="max-w-md w-full p-8 
      bg-white dark:bg-gray-900 rounded-xl shadow-lg 
      border border-gray-200 dark:border-gray-800">

        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
          {t("signup_title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              {t("signup_email")}
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-md border border-gray-300 
              dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              {t("signup_password")}
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md border border-gray-300 
              dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {t("signup_button")}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-700 dark:text-gray-300">
          {t("signup_have_account")}{" "}
          <Link className="text-blue-600 hover:underline" to="/login">
            {t("signup_login_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
