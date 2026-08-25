"use client";

import { BASE_URL, getHeaders } from "@/lib/api";
import type {
  BirthdayDto,
  LeaveRequestDto,
  PublicHolidayDto,
} from "@/models/calendar.types";

function buildHeaders(): HeadersInit {
  const base: Record<string, string> = {
    "Content-Type": "application/json",
    ...(getHeaders() as Record<string, string>),
  };

  if (
    base["Authorization"] &&
    base["Authorization"] !== "Bearer null" &&
    base["Authorization"] !== "Bearer undefined"
  ) {
    return base;
  }

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ??
      localStorage.getItem("accessToken") ??
      localStorage.getItem("access_token") ??
      localStorage.getItem("authToken") ??
      sessionStorage.getItem("token") ??
      sessionStorage.getItem("accessToken") ??
      sessionStorage.getItem("access_token") ??
      sessionStorage.getItem("authToken");

    if (token) {
      base["Authorization"] = `Bearer ${token}`;
    }
  }

  return base;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: buildHeaders() });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Authentication failed (${res.status}). Make sure a valid token is ` +
          `stored and getHeaders() returns an Authorization header. ` +
          `Server said: ${body || res.statusText}`,
      );
    }

    throw new Error(
      `GET ${path} failed with ${res.status} ${res.statusText}${body ? `: ${body}` : ""}`,
    );
  }

  const data = await res.json();
  return (Array.isArray(data) ? data : (data?.data ?? data)) as T;
}

export const CalendarService = {
  async getLeaveRequests(
    year: number,
    month: number,
  ): Promise<LeaveRequestDto[]> {
    return getJson<LeaveRequestDto[]>(
      `/v1/calendar/leave-requests?year=${year}&month=${month + 1}`,
    );
  },

  async getBirthdays(year: number, month: number): Promise<BirthdayDto[]> {
    return getJson<BirthdayDto[]>(
      `/v1/calendar/birthdays?year=${year}&month=${month + 1}`,
    );
  },

  async getPublicHolidays(
    year: number,
    month: number,
  ): Promise<PublicHolidayDto[]> {
    return getJson<PublicHolidayDto[]>(
      `/v1/calendar/public-holidays?year=${year}&month=${month + 1}`,
    );
  },
};
