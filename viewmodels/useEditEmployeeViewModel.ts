"use client";

import { useEffect, useState } from "react";
import {
  Department,
  EditEmployeeFormState,
  Employee,
} from "../models/employee-department.types";
import { updateEmployee } from "../services/employee-department.service";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function splitName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function buildFormFromEmployee(employee: Employee): EditEmployeeFormState {
  const { firstName, lastName } = splitName(employee.name);
  return {
    firstName,
    lastName,
    contact: employee.contact,
    departmentId: employee.departmentId,
    role: employee.role,
    houseAddress: employee.location,
    dateOfBirth: employee.dateofbirth,
  };
}

const EMPTY_FORM: EditEmployeeFormState = {
  firstName: "",
  lastName: "",
  contact: "",
  departmentId: "",
  role: "",
  houseAddress: "",
  dateOfBirth: "",
};

export type UseEditEmployeeViewModelReturn = {
  form: EditEmployeeFormState;
  setField: (
    key: keyof EditEmployeeFormState,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDepartment: (value: string) => void;
  setRole: (value: string) => void;

  loading: boolean;
  error: string | null;
  success: boolean;

  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

export function useEditEmployeeViewModel(
  employee: Employee | null,
  departments: Department[],
  onEmployeeUpdated: (employee: Employee) => void,
  onDone: () => void,
): UseEditEmployeeViewModelReturn {
  const [form, setForm] = useState<EditEmployeeFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!employee) return;
    setForm(buildFormFromEmployee(employee));
    setError(null);
    setSuccess(false);
  }, [employee]);

  const setField =
    (key: keyof EditEmployeeFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const setDepartment = (value: string) =>
    setForm((f) => ({ ...f, departmentId: value }));

  const setRole = (value: string) => setForm((f) => ({ ...f, role: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employee) return;

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
      await updateEmployee(token, employee.id, form);
      const deptName =
        departments.find((d) => d.id === form.departmentId)?.name ??
        employee.department;

      onEmployeeUpdated({
        ...employee,
        name: `${form.firstName} ${form.lastName}`.trim(),
        avatar: `${form.firstName[0] ?? ""}${
          form.lastName[0] ?? ""
        }`.toUpperCase(),
        contact: form.contact,
        role: form.role,
        department: deptName,
        departmentId: form.departmentId,
        location: form.houseAddress,
        dateofbirth: form.dateOfBirth,
      });

      setSuccess(true);
      setTimeout(() => onDone(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    setField,
    setDepartment,
    setRole,
    loading,
    error,
    success,
    handleSubmit,
  };
}
