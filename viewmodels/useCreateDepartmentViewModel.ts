"use client";

import { useState } from "react";
import {
  CreateDepartmentFormState,
  EMPTY_DEPARTMENT_FORM,
} from "../models/employee-department.types";
import { createDepartment } from "../services/employee-department.service";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export type UseCreateDepartmentViewModelReturn = {
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;

  form: CreateDepartmentFormState;
  setField: (
    key: keyof CreateDepartmentFormState,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

  loading: boolean;
  error: string | null;
  success: boolean;

  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

export function useCreateDepartmentViewModel(): UseCreateDepartmentViewModelReturn {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateDepartmentFormState>(
    EMPTY_DEPARTMENT_FORM,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function reset() {
    setForm(EMPTY_DEPARTMENT_FORM);
    setError(null);
    setSuccess(false);
  }

  const openDialog = () => setDialogOpen(true);

  function closeDialog() {
    setDialogOpen(false);
    reset();
  }

  const setField =
    (key: keyof CreateDepartmentFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim()) {
      setError("All required fields must be filled.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createDepartment(token, {
        name: form.name,
        description: form.description,
      });
      setSuccess(true);
      setTimeout(() => closeDialog(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return {
    dialogOpen,
    openDialog,
    closeDialog,
    form,
    setField,
    loading,
    error,
    success,
    handleSubmit,
  };
}
