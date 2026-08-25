"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSelect } from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegisterTenantViewModel } from "@/viewmodels/useRegisterTenantViewModel";

export function RegisterTenantForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const {
    fields,
    companyTypes,
    selectedCompanyType,
    loading,
    error,
    showModal,
    handleSubmit,
    handleModalClose,
  } = useRegisterTenantViewModel();

  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    companyName,
    setCompanyName,
    companyTypeId,
    setCompanyTypeId,
    email,
    setEmail,
    companyNumber,
    setCompanyNumber,
    companyLocation,
    setCompanyLocation,
  } = fields;

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background mx-4 w-full max-w-md rounded-2xl p-8 shadow-2xl">
            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="mb-2 text-center text-xl font-semibold">
              Registration Request Received!
            </h2>

            <p className="text-muted-foreground mb-6 text-center text-sm leading-relaxed">
              Thank you for registering{" "}
              <span className="text-foreground font-medium">{companyName}</span>{" "}
              with ApexHR. Login details will be sent to{" "}
              <span className="text-foreground font-medium">{email}</span>.
            </p>

            <p className="font-medium text-red-950">
              Remember to change your password in Settings after logging in.
            </p>

            <Button className="w-full" onClick={handleModalClose}>
              Got it, thanks!
            </Button>
          </div>
        </div>
      )}

      <div className="flex w-full justify-center px-4 pt-8 pb-8 md:pt-12">
        <Card
          {...props}
          className={`mx-auto w-full max-w-3xl border-t-2 ${props.className ?? ""}`}
          style={{
            borderTopColor: "var(--gold)",
            boxShadow: "0 0 50px rgba(171,136,83,0.12)",
          }}
        >
          <CardHeader>
            <CardTitle>Register your company with ApexHR</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>HR First Name</FieldLabel>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>HR Last Name</FieldLabel>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Company Name</FieldLabel>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Company Type</FieldLabel>

                  <ResponsiveSelect
                    value={companyTypeId}
                    onChange={setCompanyTypeId}
                    options={companyTypes.map((t) => ({
                      label: t.name,
                      value: t.id,
                    }))}
                    searchable
                  />

                  {selectedCompanyType && (
                    <FieldDescription className="mt-2 text-sm">
                      Selected:{" "}
                      <span className="font-medium">
                        {selectedCompanyType.name}
                      </span>
                    </FieldDescription>
                  )}
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Company Email</FieldLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Company Number</FieldLabel>
                  <Input
                    value={companyNumber}
                    onChange={(e) => setCompanyNumber(e.target.value)}
                    required
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Location</FieldLabel>
                  <Input
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    required
                  />
                </Field>

                {error && (
                  <div className="text-red-500 md:col-span-2">{error}</div>
                )}

                <Field className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-gold-hover w-full cursor-pointer"
                  >
                    {loading ? "Sending Request..." : "Send Register Request"}
                  </Button>

                  <FieldDescription className="text-center">
                    Already registered?{" "}
                    <Link
                      href="/login"
                      className="text-gold hover:text-gold-deep underline"
                    >
                      Log in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
