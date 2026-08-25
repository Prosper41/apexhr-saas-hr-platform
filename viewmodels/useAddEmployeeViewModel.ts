"use client";

import { useEffect, useState } from "react";
import {
  AddEmployeeFormState,
  Department,
  Employee,
  EMPTY_EMPLOYEE_FORM,
} from "../models/employee-department.types";
import {
  createEmployee,
  fetchDepartments,
} from "../services/employee-department.service";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export type UseAddEmployeeViewModelReturn = {
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;

  form: AddEmployeeFormState;
  setField: (
    key: keyof AddEmployeeFormState,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDepartment: (value: string) => void;
  setRole: (value: string) => void;

  loading: boolean;
  error: string | null;
  success: boolean;

  departments: Department[];

  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

export function useAddEmployeeViewModel(
  onEmployeeCreated: (employee: Employee) => void,
): UseAddEmployeeViewModelReturn {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AddEmployeeFormState>(EMPTY_EMPLOYEE_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!dialogOpen) return;
    const token = getToken();
    if (!token) return;
    fetchDepartments(token)
      .then(setDepartments)
      .catch(() => console.error("Failed to load departments"));
  }, [dialogOpen]);

  function reset() {
    setForm(EMPTY_EMPLOYEE_FORM);
    setError(null);
    setSuccess(false);
  }

  const openDialog = () => setDialogOpen(true);

  function closeDialog() {
    setDialogOpen(false);
    reset();
  }

  const setField =
    (key: keyof AddEmployeeFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const setDepartment = (value: string) =>
    setForm((f) => ({ ...f, departmentId: value }));

  const setRole = (value: string) => setForm((f) => ({ ...f, role: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hasEmpty = Object.values(form).some(
      (v) => !v || v.toString().trim() === "",
    );
    if (hasEmpty) {
      setError("All fields are required.");
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
      const data = await createEmployee(token, form);
      const deptName =
        departments.find((d) => d.id === form.departmentId)?.name ?? "";

      onEmployeeCreated({
        id: data.id,
        name: `${form.firstName} ${form.lastName}`,
        avatar: `${form.firstName[0]}${form.lastName[0]}`,
        email: form.workEmail,
        contact: form.contact,
        role: form.role,
        department: deptName,
        departmentId: form.departmentId,
        location: form.houseAddress,
        status: "active",
        dateofbirth: form.dateOfBirth,
      });

      setSuccess(true);
      setTimeout(() => closeDialog(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
    setDepartment,
    setRole,
    loading,
    error,
    success,
    departments,
    handleSubmit,
  };
}
