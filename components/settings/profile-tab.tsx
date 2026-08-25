"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { User } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DecodedToken {
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
}

export function ProfileTab({ isAdmin }: { isAdmin: boolean }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const decoded = jwtDecode<DecodedToken>(token);
      setFirstName(decoded.firstName ?? "");
      setLastName(decoded.lastName ?? "");
      setEmail(decoded.email ?? "");
      setDepartment(decoded.department ?? "");
      setRole(decoded.role ?? "");
    } catch {
      // leave fields blank if token can't be decoded
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-base">Profile</CardTitle>
        </div>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" value={email} disabled />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              placeholder="Add phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          {isAdmin ? (
            <Field>
              <FieldLabel>Role</FieldLabel>
              <div className="flex h-9 items-center">
                <Badge variant="secondary">{role || "Tenant admin"}</Badge>
              </div>
            </Field>
          ) : (
            <Field>
              <FieldLabel htmlFor="department">Department</FieldLabel>
              <Input id="department" value={department} disabled />
            </Field>
          )}
        </FieldGroup>

        <div className="mt-6 flex justify-end">
          <Button size="sm">Save changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
