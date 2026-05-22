"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Flame, CalendarDays, PenLine, Trophy } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getWritingSessions, type WritingSession } from "@/actions/writing";
import type { Novel } from "@/actions/novels";

interface WritingCalendarProps {
  novels: Novel[];
}

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateStr(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function calculateStreak(sessions: WritingSession[]): number {
  const dateSet = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // If no activity today, start checking from yesterday
  if (!dateSet.has(toLocalDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dateSet.has(toLocalDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function WritingCalendar({ novels }: WritingCalendarProps) {
  const [sessions, setSessions] = useState<WritingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNovelId, setSelectedNovelId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setLoading(true);
    getWritingSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const filtered =
    selectedNovelId === "all"
      ? sessions
      : sessions.filter((s) => String(s.novelId) === selectedNovelId);

  /** Map of YYYY-MM-DD → total words for quick lookups */
  const byDate = filtered.reduce<Record<string, number>>((acc, s) => {
    acc[s.date] = (acc[s.date] || 0) + s.wordsWritten;
    return acc;
  }, {} as Record<string, number>);

  /** Dates that have writing activity — passed to Calendar modifiers */
  const activeDates: Date[] = Object.keys(byDate).map(parseDateStr);

  // Selected date details
  const selectedStr = selectedDate ? toLocalDateStr(selectedDate) : null;
  const selectedWords = selectedStr ? (byDate[selectedStr] || 0) : 0;
  const selectedBreakdown =
    selectedStr && selectedNovelId === "all"
      ? sessions.filter((s) => s.date === selectedStr)
      : [];

  // Monthly stats
  const monthPrefix = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1,
  ).padStart(2, "0")}`;
  const monthSessions = filtered.filter((s) => s.date.startsWith(monthPrefix));
  const monthWords = monthSessions.reduce((sum, s) => sum + s.wordsWritten, 0);
  const activeDaysCount = new Set(monthSessions.map((s) => s.date)).size;
  const bestDaySession = monthSessions.reduce<WritingSession | null>(
    (best, s) => (!best || s.wordsWritten > best.wordsWritten ? s : best),
    null,
  );
  const streak = calculateStreak(filtered);
  const totalWords = filtered.reduce((sum, s) => sum + s.wordsWritten, 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Novel selector */}
      <Select value={selectedNovelId} onValueChange={setSelectedNovelId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Novels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Novels</SelectItem>
          {novels.map((n) => (
            <SelectItem key={n.id} value={String(n.id)}>
              {n.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Calendar */}
      <div className="rounded-md border bg-background">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
          modifiers={{ wrote: activeDates }}
          modifiersClassNames={{
            wrote: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-bold rounded-full",
          }}
          /* Custom day content — shows word count below the date number */
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
            DayContent: ({ date }) => {
              const ds = toLocalDateStr(date);
              const words = byDate[ds];
              return (
                <div className="flex flex-col items-center justify-center leading-none py-0.5 w-full h-full">
                  <span className="text-sm">{date.getDate()}</span>
                  {words && words > 0 ? (
                    <span className="text-[7px] font-semibold text-green-600 dark:text-green-400 leading-none mt-0.5">
                      {words >= 1000
                        ? `${(words / 1000).toFixed(1)}k`
                        : String(words)}
                    </span>
                  ) : null}
                </div>
              );
            },
          }}
          className="w-full p-2"
        />
      </div>

      {/* Selected date detail */}
      {selectedStr && (
        <div className="rounded-md border bg-muted/30 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {selectedWords > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <PenLine className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm font-bold text-green-700 dark:text-green-400">
                  {selectedWords.toLocaleString()} words written
                </span>
              </div>
              {/* Per-novel breakdown when "All Novels" is selected */}
              {selectedBreakdown.length > 0 && (
                <div className="mt-1 space-y-0.5 pl-6">
                  {selectedBreakdown.map((s) => (
                    <p key={s.novelId} className="text-xs text-muted-foreground">
                      • {s.novelTitle}:{" "}
                      <span className="font-medium">{s.wordsWritten.toLocaleString()}</span> words
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No writing recorded for this date.</p>
          )}
        </div>
      )}

      <Separator />

      {/* Monthly stats grid */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <StatTile
            icon={<PenLine className="h-4 w-4 text-primary" />}
            value={monthWords.toLocaleString()}
            label="Words this month"
          />
          <StatTile
            icon={<CalendarDays className="h-4 w-4 text-primary" />}
            value={String(activeDaysCount)}
            label="Active days"
          />
          <StatTile
            icon={<Flame className="h-4 w-4 text-orange-500" />}
            value={String(streak)}
            label={streak === 1 ? "Day streak" : "Day streak 🔥"}
            highlight={streak >= 3}
          />
          <StatTile
            icon={<Trophy className="h-4 w-4 text-amber-500" />}
            value={
              bestDaySession
                ? bestDaySession.wordsWritten.toLocaleString()
                : "—"
            }
            label={
              bestDaySession
                ? `Best day (${parseDateStr(bestDaySession.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
                : "Best day"
            }
          />
        </div>
      </div>

      <Separator />

      {/* All-time total */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedNovelId === "all" ? "All-time total" : "Total for this novel"}
        </span>
        <Badge variant="secondary" className="text-sm font-bold">
          {loading ? "…" : `${totalWords.toLocaleString()} words`}
        </Badge>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  value,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-2.5 rounded-md border flex flex-col gap-1 ${
        highlight ? "border-orange-300 bg-orange-50 dark:bg-orange-950/30" : "bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-base font-bold leading-none">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}
