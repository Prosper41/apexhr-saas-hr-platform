"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerTenant } from "@/services/tenant.services";
import type { CompanyType } from "@/models/tenant.types";

export const COMPANY_TYPES: CompanyType[] = [
  { id: "1", name: "Banking & Finance" },
  { id: "2", name: "Marketing & Advertising" },
  { id: "3", name: "Technology (IT)" },
  { id: "4", name: "Manufacturing" },
  { id: "5", name: "Retail & E-commerce" },
  { id: "6", name: "Healthcare" },
  { id: "7", name: "Education" },
  { id: "8", name: "Logistics & Transportation" },
  { id: "9", name: "Real Estate & Construction" },
  { id: "10", name: "Energy & Natural Resources" },
  { id: "11", name: "Entertainment & Media" },
  { id: "12", name: "Other" },
];

export function useRegisterTenantViewModel() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyTypeId, setCompanyTypeId] = useState("");
  const [email, setEmail] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const selectedCompanyType = COMPANY_TYPES.find((t) => t.id === companyTypeId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedCompanyType) {
      setError("Please select a company type.");
      return;
    }

    setLoading(true);

    try {
      await registerTenant({
        firstName,
        lastName,
        email,
        companyName,
        companyType: selectedCompanyType.name,
        companyPhone: companyNumber,
        companyLocation,
      });

      setShowModal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleModalClose() {
    setShowModal(false);
    router.push("/login");
  }

  return {
    fields: {
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
    },
    companyTypes: COMPANY_TYPES,
    selectedCompanyType,
    loading,
    error,
    showModal,
    handleSubmit,
    handleModalClose,
  };
}
