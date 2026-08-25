"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Department,
  Employee,
  hasDeletePermission,
} from "../models/employee-department.types";
import {
  deleteEmployee,
  fetchDepartments,
  fetchEmployees,
} from "../services/employee-department.service";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function decodeRoleFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return decoded.role ?? decoded.roles?.[0] ?? null;
  } catch {
    return null;
  }
}

function getCurrentUserRole(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("userRole");
  if (stored) return stored;
  const token = getToken();
  return token ? decodeRoleFromToken(token) : null;
}

export type UseEmployeeListViewModelReturn = {
  employees: Employee[];
  departments: Department[];

  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (v: string) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;

  filteredEmployees: Employee[];
  departmentOptions: { value: string; label: string }[];

  loadingEmployees: boolean;
  fetchError: string | null;

  addEmployee: (employee: Employee) => void;
  updateEmployeeInList: (employee: Employee) => void;
  removeEmployeeFromList: (id: string) => Promise<void>;
  refetch: () => void;

  canDelete: boolean;
  deletingId: string | null;
  deleteError: string | null;
};

export function useEmployeeListViewModel(): UseEmployeeListViewModelReturn {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const canDelete = hasDeletePermission(getCurrentUserRole());

  const loadEmployees = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoadingEmployees(true);
    setFetchError(null);
    try {
      setEmployees(await fetchEmployees(token));
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      setDepartments(await fetchDepartments(token));
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [loadEmployees, loadDepartments]);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedDepartment === "all" || emp.departmentId === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all" || emp.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const departmentOptions = [
    { value: "all", label: "All Departments" },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  function addEmployee(employee: Employee) {
    setEmployees((prev) => [{ ...employee, departmentId: "" }, ...prev]);
  }

  function updateEmployeeInList(employee: Employee) {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employee.id ? employee : e)),
    );
  }

  async function removeEmployeeFromList(id: string) {
    if (!canDelete) {
      setDeleteError("You do not have permission to delete employees.");
      return;
    }

    const token = getToken();
    if (!token) {
      setDeleteError("You are not logged in.");
      return;
    }

    setDeleteError(null);
    setDeletingId(id);
    try {
      await deleteEmployee(token, id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete employee",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return {
    employees,
    departments,
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    setSelectedDepartment,
    selectedStatus,
    setSelectedStatus,
    filteredEmployees,
    departmentOptions,
    loadingEmployees,
    fetchError,
    addEmployee,
    updateEmployeeInList,
    removeEmployeeFromList,
    refetch: loadEmployees,
    canDelete,
    deletingId,
    deleteError,
  };
}
