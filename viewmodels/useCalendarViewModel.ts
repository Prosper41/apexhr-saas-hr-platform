"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarService } from "@/services/calendar.services";
import {
  mapBirthdaysAndLeavesToMembers,
  mapLeaveRequestsToLeaveData,
  mapPublicHolidaysToGhanaHolidays,
} from "@/services/calendar.mappers";
import type {
  BirthdayDto,
  LeaveRequestDto,
  PublicHolidayDto,
} from "@/models/calendar.types";

export const MONTHS = [
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
];

export function useCalendarViewModel() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [monthIdx, setMonthIdx] = useState(today.getMonth());
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const [birthdaysDto, setBirthdaysDto] = useState<BirthdayDto[]>([]);
  const [leaveRequestsDto, setLeaveRequestsDto] = useState<LeaveRequestDto[]>(
    [],
  );
  const [holidaysDto, setHolidaysDto] = useState<PublicHolidayDto[]>([]);

  const [loadingBirthdays, setLoadingBirthdays] = useState(true);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [loadingHolidays, setLoadingHolidays] = useState(true);

  const [birthdaysError, setBirthdaysError] = useState<string | null>(null);
  const [leavesError, setLeavesError] = useState<string | null>(null);
  const [holidaysError, setHolidaysError] = useState<string | null>(null);

  const loadBirthdays = useCallback(async () => {
    setLoadingBirthdays(true);
    setBirthdaysError(null);
    try {
      setBirthdaysDto(await CalendarService.getBirthdays(year, monthIdx));
    } catch (err) {
      setBirthdaysError(err instanceof Error ? err.message : String(err));
      setBirthdaysDto([]);
    } finally {
      setLoadingBirthdays(false);
    }
  }, [year, monthIdx]);

  const loadLeaveRequests = useCallback(async () => {
    setLoadingLeaves(true);
    setLeavesError(null);
    try {
      setLeaveRequestsDto(
        await CalendarService.getLeaveRequests(year, monthIdx),
      );
    } catch (err) {
      setLeavesError(err instanceof Error ? err.message : String(err));
      setLeaveRequestsDto([]);
    } finally {
      setLoadingLeaves(false);
    }
  }, [year, monthIdx]);

  const loadHolidays = useCallback(async () => {
    setLoadingHolidays(true);
    setHolidaysError(null);
    try {
      const nextMonthIdx = monthIdx === 11 ? 0 : monthIdx + 1;
      const nextMonthYear = monthIdx === 11 ? year + 1 : year;

      const [current, next] = await Promise.all([
        CalendarService.getPublicHolidays(year, monthIdx),
        CalendarService.getPublicHolidays(nextMonthYear, nextMonthIdx),
      ]);

      setHolidaysDto([...current, ...next]);
    } catch (err) {
      setHolidaysError(err instanceof Error ? err.message : String(err));
      setHolidaysDto([]);
    } finally {
      setLoadingHolidays(false);
    }
  }, [year, monthIdx]);

  useEffect(() => {
    void loadBirthdays();
  }, [loadBirthdays]);

  useEffect(() => {
    void loadLeaveRequests();
  }, [loadLeaveRequests]);

  useEffect(() => {
    void loadHolidays();
  }, [loadHolidays]);

  const allMembers = useMemo(
    () => mapBirthdaysAndLeavesToMembers(birthdaysDto, leaveRequestsDto),
    [birthdaysDto, leaveRequestsDto],
  );

  const leaveData = useMemo(
    () => mapLeaveRequestsToLeaveData(leaveRequestsDto, year, monthIdx),
    [leaveRequestsDto, year, monthIdx],
  );

  const sidebarHolidays = useMemo(
    () => mapPublicHolidaysToGhanaHolidays(holidaysDto),
    [holidaysDto],
  );

  const monthHolidays = useMemo(
    () => sidebarHolidays.filter((h) => h.month === monthIdx),
    [sidebarHolidays, monthIdx],
  );

  const departmentOptions = useMemo(() => {
    const departments = [
      ...new Set(allMembers.map((m) => m.department)),
    ].filter(Boolean);
    return [
      { label: "All Departments", value: "all" },
      ...departments.map((d) => ({ label: d, value: d })),
    ];
  }, [allMembers]);

  const filteredMembers = useMemo(
    () =>
      selectedDepartment === "all"
        ? allMembers
        : allMembers.filter((m) => m.department === selectedDepartment),
    [allMembers, selectedDepartment],
  );

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const conflictDays = useMemo(() => {
    const conflicts = new Set<number>();
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, monthIdx, d).getDay();
      if (dow === 0 || dow === 6) continue;
      const absent = filteredMembers.filter((m) =>
        (leaveData[m.name] ?? []).some((l) => d >= l.start && d <= l.end),
      ).length;
      if (filteredMembers.length > 0 && absent / filteredMembers.length > 0.2) {
        conflicts.add(d);
      }
    }
    return conflicts;
  }, [filteredMembers, leaveData, daysInMonth, year, monthIdx]);

  const todayDay =
    today.getFullYear() === year && today.getMonth() === monthIdx
      ? today.getDate()
      : null;

  function prevMonth() {
    if (monthIdx === 0) {
      setMonthIdx(11);
      setYear((y) => y - 1);
    } else {
      setMonthIdx((m) => m - 1);
    }
  }

  function nextMonth() {
    if (monthIdx === 11) {
      setMonthIdx(0);
      setYear((y) => y + 1);
    } else {
      setMonthIdx((m) => m + 1);
    }
  }

  function retry() {
    void loadBirthdays();
    void loadLeaveRequests();
    void loadHolidays();
  }

  return {
    year,
    monthIdx,
    monthName: MONTHS[monthIdx],
    todayDay,
    selectedDepartment,
    setSelectedDepartment,
    departmentOptions,
    filteredMembers,
    leaveData,
    monthHolidays,
    sidebarHolidays,
    conflictDays,
    loading: loadingBirthdays || loadingLeaves || loadingHolidays,
    error: birthdaysError || leavesError || holidaysError,
    retry,
    prevMonth,
    nextMonth,
  };
}
