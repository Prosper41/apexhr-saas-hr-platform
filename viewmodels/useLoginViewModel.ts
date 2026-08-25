"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { loginUser, forgotPassword } from "@/services/login.services";

export function useLoginViewModel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<{ exp: number }>(token);
        if (decoded.exp * 1000 > Date.now()) {
          router.replace("/dashboard");
          return;
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }

    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError(null);
    setForgotSuccess(null);

    const handlePageShow = () => {
      if (!localStorage.getItem("accessToken")) {
        router.replace("/");
      }
    };

    const handleAuthLogout = () => {
      router.replace("/");
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("auth-logout", handleAuthLogout as EventListener);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener(
        "auth-logout",
        handleAuthLogout as EventListener,
      );
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setForgotSuccess(null);

    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      const data = await loginUser({ email, password });

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
      }

      setEmail("");
      setPassword("");
      setShowPassword(false);
      setTimeout(() => router.push("/dashboard"), 50);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setForgotSuccess(null);

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setForgotLoading(true);
    try {
      const message = await forgotPassword(email);
      setForgotSuccess(message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setForgotLoading(false);
    }
  }

  return {
    fields: {
      email,
      setEmail,
      password,
      setPassword,
    },
    showPassword,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
    loading,
    forgotLoading,
    error,
    forgotSuccess,
    handleSubmit,
    handleForgotPassword,
  };
}
