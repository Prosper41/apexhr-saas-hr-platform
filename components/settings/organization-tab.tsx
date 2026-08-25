"use client";

import { useState } from "react";
import { Building2, Globe, Network } from "lucide-react";
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
import { ResponsiveSelect } from "@/components/ui/select";

// --- Mock data (swap for real API data later) ---
const mockCompany = {
  name: "Acme Corporation",
  domain: "acme.com",
  industry: "Technology",
  size: "51-200",
};

const mockRegional = {
  timezone: "Pacific Time (PT)",
  dateFormat: "MM/DD/YYYY",
  fiscalYearStart: "January",
};

const mockDepartments = [
  { id: "1", name: "Engineering", members: 45 },
  { id: "2", name: "Design", members: 34 },
  { id: "3", name: "Product", members: 10 },
  { id: "4", name: "Sales", members: 32 },
  { id: "5", name: "Human Resources", members: 34 },
  { id: "6", name: "Operations", members: 14 },
];

const industryOptions = [
  { label: "Technology", value: "Technology" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Finance", value: "Finance" },
  { label: "Retail", value: "Retail" },
  { label: "Manufacturing", value: "Manufacturing" },
];

const sizeOptions = [
  { label: "1-10", value: "1-10" },
  { label: "11-50", value: "11-50" },
  { label: "51-200", value: "51-200" },
  { label: "201-500", value: "201-500" },
  { label: "500+", value: "500+" },
];

const timezoneOptions = [
  { label: "Pacific Time (PT)", value: "Pacific Time (PT)" },
  { label: "Mountain Time (MT)", value: "Mountain Time (MT)" },
  { label: "Central Time (CT)", value: "Central Time (CT)" },
  { label: "Eastern Time (ET)", value: "Eastern Time (ET)" },
  { label: "GMT", value: "GMT" },
];

const dateFormatOptions = [
  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
];

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((m) => ({ label: m, value: m }));

export function OrganizationTab() {
  const [company, setCompany] = useState(mockCompany);
  const [regional, setRegional] = useState(mockRegional);

  return (
    <div className="space-y-6">
      {/* Company Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">Company Details</CardTitle>
          </div>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
              <Input
                id="companyName"
                value={company.name}
                onChange={(e) =>
                  setCompany({ ...company, name: e.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="domain">Domain</FieldLabel>
              <Input
                id="domain"
                value={company.domain}
                onChange={(e) =>
                  setCompany({ ...company, domain: e.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="industry">Industry</FieldLabel>
              <ResponsiveSelect
                options={industryOptions}
                value={company.industry}
                onChange={(v) => setCompany({ ...company, industry: v })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="companySize">Company Size</FieldLabel>
              <ResponsiveSelect
                options={sizeOptions}
                value={company.size}
                onChange={(v) => setCompany({ ...company, size: v })}
              />
            </Field>
          </FieldGroup>

          <div className="mt-6 flex justify-end">
            <Button size="sm">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">Regional Settings</CardTitle>
          </div>
          <CardDescription>
            Timezone and localization preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid grid-cols-3 gap-4">
            <Field>
              <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
              <ResponsiveSelect
                options={timezoneOptions}
                value={regional.timezone}
                onChange={(v) => setRegional({ ...regional, timezone: v })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="dateFormat">Date Format</FieldLabel>
              <ResponsiveSelect
                options={dateFormatOptions}
                value={regional.dateFormat}
                onChange={(v) => setRegional({ ...regional, dateFormat: v })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fiscalYearStart">
                Fiscal Year Start
              </FieldLabel>
              <ResponsiveSelect
                options={monthOptions}
                value={regional.fiscalYearStart}
                onChange={(v) =>
                  setRegional({ ...regional, fiscalYearStart: v })
                }
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Departments */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">Departments</CardTitle>
          </div>
          <CardDescription>
            Manage your organizational structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockDepartments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span className="text-sm font-medium">{dept.name}</span>
                </div>
                <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs">
                  {dept.members} members
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
