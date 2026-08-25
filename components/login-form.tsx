"use client";

import { BASE_URL } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setForgotSuccess(null);

    const handleAuthLogout = () => {
      router.replace("/");
    };

    window.addEventListener("auth-logout", handleAuthLogout as EventListener);

    return () => {
      window.removeEventListener(
        "auth-logout",
        handleAuthLogout as EventListener,
      );
    };
  }, [router]);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setForgotSuccess(null);

    try {
      const response = await fetch(
        `${BASE_URL}/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email or password is incorrect");
      }

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);

        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        document.cookie = `accessToken=${encodeURIComponent(
          data.accessToken,
        )}; path=/; samesite=strict`;
      }

      setEmail("");
      setPassword("");
      setShowPassword(false);

      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setForgotSuccess(null);

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/v1/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setForgotSuccess(
        data.message || "Password reset link has been sent to your email.",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      setError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>

          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>

                <Input
                  id="email"
                  type="email"
                  placeholder="techsnsp@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                    className="text-gold hover:text-gold-deep ml-auto inline-block text-sm underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    {forgotLoading
                      ? "Sending reset link..."
                      : "Forgot your password?"}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="text-muted-foreground hover:text-gold absolute top-1/2 right-2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </Field>

              {error && <div className="text-sm text-red-500">{error}</div>}

              {forgotSuccess && (
                <div className="text-sm text-green-600">{forgotSuccess}</div>
              )}

              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-gold-hover cursor-pointer"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-gold hover:text-gold-deep underline"
                  >
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
