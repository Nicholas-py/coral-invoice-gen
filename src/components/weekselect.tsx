import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Check, X, ChevronDown, CalendarDays, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ---- types --------------------------------------------------------------
interface Week {
    id: string;
    start: Date;
    end: Date;
    weekNumber: number;
    monthKey: string;
    monthLabel: string;
    minimumhours: number | null;
}

interface MonthGroup {
    label: string;
    items: Week[];
}
// ---- date helpers -----------------------------------------------------

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setDate(d.getUTCDate());
    return d;
}

function addWeeks(date: Date, n: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + n * 7);
    return d;
}

export function isoWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDayy(d: Date): string {
    var yesterday = new Date(d.getTime() - 86400000);
    return `${MONTHS[yesterday.getMonth()]} ${yesterday.getDate()}`;
}
function fmtDay(d: Date): string {
    var yesterday = new Date(d.getTime());
    return `${MONTHS[yesterday.getMonth()]} ${yesterday.getDate()}`;
}


function weekId(d: Date): string {
    return d.toISOString().slice(0, 10);
}

export interface SelectedWeek {
    id: string; // ISO date string of the Monday that starts the week, e.g. "2026-06-29"
    start: Date;
    end: Date;
    weekNumber: number;
    minimumhours: number;
}


function buildWeek(start: Date): Week {
    const end = addWeeks(start, 1);
    end.setDate(end.getDate() - 1);
    return {
        id: weekId(start),
        start,
        end,
        weekNumber: isoWeekNumber(end),
        monthKey: `${end.getFullYear()}-${end.getMonth()}`,
        monthLabel: `${end.toLocaleString("default", { month: "long" })} ${end.getFullYear()}`,
        minimumhours: null
    };
}
export interface WeekMultiSelectProps {
    /** Controlled selection (week ids, e.g. "2026-06-29"). Omit for uncontrolled use. */
    value?: string[];
    /** Uncontrolled initial selection. Ignored if `value` is provided. Defaults to the current week. */
    defaultValue?: string[];
    /** Fires whenever the selection changes, with both the raw ids and full week objects. */
    onChange?: (ids: string[], weeks: SelectedWeek[]) => void;
}

const CHUNK = 26; // weeks per lazy-load batch (~6 months)

// ---- component ----------------------------------------------------------

export default function WeekMultiSelect({
    value,
    defaultValue,
    onChange,
}: WeekMultiSelectProps): React.ReactElement {
    const today = useMemo(() => new Date(), []);
    const currentWeekStart = useMemo(() => today, [today]);
    const currentWeekId = weekId(currentWeekStart);

    // range of weeks currently materialized, expressed as offsets from current week
    const [rangeStart, setRangeStart] = useState<number>(-CHUNK * 2);
    const [rangeEnd, setRangeEnd] = useState<number>(CHUNK * 2);
    const [hoursMap, setHoursMap] = useState<Record<string, number | null>>({});

    const weeks = useMemo<Week[]>(() => {
        const arr: Week[] = [];
        for (let i = rangeStart; i <= rangeEnd; i++) {
            arr.push(buildWeek(addWeeks(currentWeekStart, i)));
        }
        return arr;
    }, [rangeStart, rangeEnd, currentWeekStart]);

    const grouped = useMemo<MonthGroup[]>(() => {
        const map = new Map<string, MonthGroup>();
        for (const w of weeks) {
            if (!map.has(w.monthKey)) map.set(w.monthKey, { label: w.monthLabel, items: [] });
            map.get(w.monthKey)!.items.push(w);
        }
        return Array.from(map.values());
    }, [weeks]);

    const [selected, setSelected] = useState<Set<string>>(() => new Set([]));
    const [open, setOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);
    const currentWeekRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const toggleWeek = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const removeWeek = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    // close on outside click
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const scrollToCurrent = useCallback((behavior: ScrollBehavior = "smooth") => {
        requestAnimationFrame(() => {
            currentWeekRef.current?.scrollIntoView({ block: "center", behavior });
        });
    }, []);

    // on open, jump to current week instantly
    useEffect(() => {
        if (open) scrollToCurrent("auto");
    }, [open, scrollToCurrent]);

    const onScroll = useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        const nearTop = el.scrollTop < 200;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;

        if (nearBottom) {
            setRangeEnd((r) => r + CHUNK);
        }
        if (nearTop && el.scrollTop > 0) {
            const prevHeight = el.scrollHeight;
            setRangeStart((r) => {
                const nr = r - CHUNK;
                requestAnimationFrame(() => {
                    const newHeight = el.scrollHeight;
                    el.scrollTop += newHeight - prevHeight;
                });
                return nr;
            });
        }
    }, []);

    const selectedList = useMemo<Week[]>(() => {
        return Array.from(selected)
            .map((id) => {
                const w = buildWeek(new Date(id));
                return { ...w, minimumhours: hoursMap[id] ?? null };
            })
            .sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [selected, hoursMap]);

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }); // no deps — runs after every render, just updates the ref

    // report changes to the parent — only depends on selectedList now
    useEffect(() => {
        if (!onChangeRef.current) return;
        const ids = selectedList.map((w) => w.id);
        const weeksOut: SelectedWeek[] = selectedList.map((w) => ({
            id: w.id,
            start: w.start,
            end: w.end,
            weekNumber: w.weekNumber,
            minimumhours: w.minimumhours ?? 0,
        }));
        onChangeRef.current(ids, weeksOut);
    }, [selectedList]); // <-- no onChange here

    return (
        <div
            ref={rootRef}
            style={{
                width: "100%",
                color: "#1c2333",
            }}
        >
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "10px 12px",
                    background: "#ffffff",
                    border: `1.5px solid ${open ? "#52001d" : "#d7dce2"}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    boxShadow: open ? "0 0 0 3px rgba(15,118,110,0.12)" : "none",
                    transition: "border-color 120ms, box-shadow 120ms",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                        flex: 1,
                        minWidth: 0,
                    }}

                >
                    {selectedList.length === 0 ? (
                        <span style={{ color: "#8a93a3", fontSize: 14 }}
                        >Select weeks…</span>
                    ) : (
                        <>
                            {selectedList.map((w) => (
                                <div>
                                    <div className="grid grid-cols-0 gap-3 md:grid-cols-6 border border-border shadow-sm" style={{
                                        borderRadius: 10,
                                        padding: "0px 0px 6px 0px",

                                    }}
                                        onClick={(e) => {
                                            if (selectedList.length > 0) e.stopPropagation();
                                        }}

                                    >
                                        <div className="md:col-span-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                                                Week {isoWeekNumber(w.start)}
                                            </Label>
                                            <p>
                                                {fmtDay(w.start)} - {w.start.getMonth() == w.end.getMonth() ? w.end.getDate() : fmtDay(w.end)}
                                            </p>

                                        </div>
                                        <div className="md:col-span-3">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                                                Minimum Guaranteed Hours
                                            </Label>
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                value={w.minimumhours?.toString()}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    setHoursMap((prev) => ({ ...prev, [w.id]: isNaN(val) ? null : val }));
                                                }}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="flex items-end justify-end md:col-span-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeWeek(w.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <ChevronDown
                    size={16}
                    color="#5b6472"
                    style={{
                        transform: open ? "rotate(180deg)" : "none",
                        transition: "transform 120ms",
                        flexShrink: 0,
                    }}
                />
            </button>
            {/* Dropdown */}
            {open && (
                <div
                    ref={containerRef}
                    style={{
                        marginTop: 6,
                        background: "#ffffff",
                        border: "1.5px solid #e2e6eb",
                        borderRadius: 12,
                        boxShadow: "0 10px 30px rgba(20,30,40,0.10)",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            borderBottom: "1px solid #eef0f3",
                        }}
                    >
                        <span style={{ fontSize: 12, color: "#8a93a3", fontWeight: 600 }}>
                            {selectedList.length} week{selectedList.length === 1 ? "" : "s"} selected
                        </span>
                        {/* Jump to today button */}
                        <button
                            type="button"
                            onClick={() => scrollToCurrent()}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#52001d",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "2px 4px",
                            }}
                        >
                            <RotateCcw size={12} />
                            Jump to today
                        </button>
                    </div>

                    {/* Dropdown stuff */}
                    <div
                        ref={listRef}
                        onScroll={onScroll}
                        style={{
                            maxHeight: 320,
                            overflowY: "auto",
                            padding: "4px 0",
                        }}
                    >
                        {grouped.map((group) => (
                            <div key={group.label}>
                                <div
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        background: "#ede9e9",
                                        color: "#000000",
                                        fontSize: 14.5,
                                        fontWeight: 700,
                                        letterSpacing: 0.4,
                                        padding: "6px 12px",
                                        zIndex: 1,
                                    }}
                                >
                                    {group.label}
                                </div>
                                {group.items.map((w) => {
                                    const isSelected = selected.has(w.id);
                                    const isCurrent = w.id === currentWeekId;
                                    return (
                                        <div
                                            key={w.id}
                                            ref={isCurrent ? currentWeekRef : null}
                                            onClick={() => toggleWeek(w.id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "8px 12px",
                                                cursor: "pointer",
                                                background: isSelected ? "#fff0f0" : "transparent",
                                                borderLeft:
                                                    "3px solid transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = "#f7f8fa";
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = "transparent";
                                            }}
                                        >
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span
                                                    style={{
                                                        fontSize: 14.5,
                                                        fontWeight: isCurrent ? 700 : 500,
                                                        color: "#1c2333",
                                                    }}
                                                >
                                                    Week {w.weekNumber} · {fmtDayy(w.start)} - {fmtDayy(w.end)}
                                                    {isCurrent && (
                                                        <span style={{ color: "#52001d", fontWeight: 700 }}> · This week</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: 5,
                                                    border: isSelected ? "none" : "1.5px solid #d7dce2",
                                                    background: isSelected ? "#52001d" : "transparent",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        <div style={{ padding: "8px 12px", textAlign: "center", fontSize: 11, color: "#b7bdc7" }}>
                            scroll for more weeks
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}