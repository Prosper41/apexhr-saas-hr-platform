"use client";

import { BASE_URL } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSelect } from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const departments = [
    { id: "1", name: "Software Development" },
    { id: "2", name: "SAP" },
    { id: "3", name: "Human Resource" },
    { id: "4", name: "Educational Content Creation" },
    { id: "5", name: "Corporate Relation" },
    { id: "6", name: "Auxiliary Workers" },
  ];

  const selectedDepartment = departments.find(
    (dept) => dept.id === departmentName,
  )?.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    const payload = {
      tenantId: companyName,
      firstName: firstName,
      lastName,
      email,
      password,
      department: selectedDepartment,
    };

    try {
      const response = await fetch(
        `${BASE_URL}/v1/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
        throw new Error(data?.message || "Failed to create account");
      }

      setSuccess("Account created successfully!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  return (
    <div className="flex w-full justify-center px-4 pt-8 pb-8 md:pt-12">
      <Card
        {...props}
        className={`mx-auto w-full max-w-3xl ${props.className ?? ""}`}
      >
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                <Input
                  id="first-name"
                  type="text"
                  placeholder="Jane"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                <Input
                  id="last-name"
                  type="text"
                  placeholder="Amponsah"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="company-name">Company Name</FieldLabel>
                <Input
                  id="company-name"
                  type="text"
                  placeholder="Code Raccoon"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="department-name">
                  Department Name
                </FieldLabel>

                <ResponsiveSelect
                  placeholder="Select a department"
                  value={departmentName}
                  onChange={setDepartmentName}
                  options={departments.map((department) => ({
                    label: department.name,
                    value: department.id,
                  }))}
                />

                {departmentName && (
                  <FieldDescription className="text-muted-foreground mt-2 text-sm">
                    Selected:{" "}
                    <span className="font-medium">{selectedDepartment}</span>
                  </FieldDescription>
                )}
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <FieldDescription>
                  Please confirm your password.
                </FieldDescription>
              </Field>

              {error && (
                <div className="text-red-500 md:col-span-2">{error}</div>
              )}

              {success && (
                <div className="text-green-500 md:col-span-2">{success}</div>
              )}

              <Field className="flex flex-col gap-2 md:col-span-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a href="/login" className="underline">
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
