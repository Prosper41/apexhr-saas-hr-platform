"use client";
import { useState } from "react";
import { BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ChangePswdForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setError("You are not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    const payload = { oldPassword, newPassword };

    try {
      const response = await fetch(
        `${BASE_URL}/v1/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to change password");
      }

      setSuccess("Password changed successfully!");

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="ml-auto w-full max-w-sm text-sm" {...props}>
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-base">Change Password</CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <form onSubmit={handleSubmit}>
          <FieldGroup className="flex flex-col gap-3">
            <Field>
              {/* <FieldLabel className="text-xs" htmlFor="email">
                Email
              </FieldLabel> */}
              {/* <Input
                id="email"
                type="email"
                required
                className="h-8 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              /> */}
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="oldPassword">
                Old Password
              </FieldLabel>
              <Input
                id="oldPassword"
                type="password"
                required
                className="h-8 text-sm"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="newPassword">
                New Password
              </FieldLabel>
              <Input
                id="newPassword"
                type="password"
                required
                className="h-8 text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <FieldDescription className="text-xs">
                Must be at least 8 characters.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel className="text-xs" htmlFor="confirmNewPassword">
                Confirm New Password
              </FieldLabel>
              <Input
                id="confirmNewPassword"
                type="password"
                required
                className="h-8 text-sm"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </Field>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {success && <p className="text-xs text-green-500">{success}</p>}

            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Password"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
