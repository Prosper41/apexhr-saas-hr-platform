"use client";

import { BASE_URL } from "@/lib/api";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0–9)", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character (!@#$%^&*...)",
    test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
  },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Reset link is invalid or missing token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      setError(
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/v1/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resetToken: token,
            newPassword: password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(data.message || "Password reset successful. Redirecting...");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleResetPassword}>
            <FieldGroup>
              {/* New Password */}
              <Field>
                <FieldLabel>New Password</FieldLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setShowRequirements(true);
                    }}
                    onFocus={() => setShowRequirements(true)}
                    required
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <Eye className="text-muted-foreground h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password strength checklist */}
                {showRequirements && (
                  <ul className="mt-2 space-y-1">
                    {PASSWORD_REQUIREMENTS.map(({ label, test }) => {
                      const met = test(password);
                      return (
                        <li
                          key={label}
                          className={`flex items-center gap-1.5 text-xs ${
                            met ? "text-green-600" : "text-muted-foreground"
                          }`}
                        >
                          <span>{met ? "✓" : "○"}</span>
                          {label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Field>

              {/* Confirm Password */}
              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <Eye className="text-muted-foreground h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              {error && <div className="text-sm text-red-500">{error}</div>}

              {success && (
                <div className="text-sm text-green-600">{success}</div>
              )}

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Resetting password..." : "Reset Password"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
