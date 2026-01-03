import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

/**
 * MonthSelector – robust month/year picker with NO free text editing.
 * - The field is read-only to prevent users from typing/erasing values.
 * - Selection happens via a simple month grid + year stepper inside a Popover.
 * - Prev/Next chevrons change month and roll the year correctly.
 *
 * Props
 *  - selectedMonth: Full English month name, e.g., "September"
 *  - selectedYear: four-digit year, e.g., 2025
 *  - onMonthChange: callback(monthName, year)
 */
interface MonthSelectorProps {
  selectedMonth?: string;
  selectedYear?: number;
  onMonthChange?: (month: string, year: number) => void;
}

const MONTHS_LONG = [
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
] as const;

const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
}) => {
  const today = useMemo(() => new Date(), []);
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();

  // normalize props → default to current month/year if undefined or invalid
  const safeMonthIndex = useMemo(() => {
    const idx = selectedMonth
      ? MONTHS_LONG.findIndex((m) => m === selectedMonth)
      : -1;
    return idx >= 0 ? idx : currentMonthIndex;
  }, [selectedMonth, currentMonthIndex]);

  const safeYear =
    Number.isFinite(selectedYear) && selectedYear ? (selectedYear as number) : currentYear;

  const [open, setOpen] = useState(false);

  const labelShort = `${MONTHS_LONG[safeMonthIndex].slice(0, 3)} ${safeYear}`;
  const labelLong = `${MONTHS_LONG[safeMonthIndex]} ${safeYear}`;

  const commit = (monthIndex: number, year: number) => {
    const name = MONTHS_LONG[(monthIndex + 12) % 12];
    onMonthChange?.(name, year);
  };

  const handlePrev = () => {
    let m = safeMonthIndex - 1;
    let y = safeYear;
    if (m < 0) {
      m = 11;
      y = safeYear - 1;
    }
    commit(m, y);
  };

  const handleNext = () => {
    let m = safeMonthIndex + 1;
    let y = safeYear;
    if (m > 11) {
      m = 0;
      y = safeYear + 1;
    }
    commit(m, y);
  };

  const handleSelectMonth = (idx: number, year: number) => {
    commit(idx, year);
    setOpen(false);
  };

  const handleThisMonth = () => {
    commit(currentMonthIndex, currentYear);
    setOpen(false);
  };

  // Year temp state for the popover (so you can adjust before committing)
  const [tempYear, setTempYear] = useState<number>(safeYear);

  // keep tempYear synced when parent changes year externally
  React.useEffect(() => {
    setTempYear(safeYear);
  }, [safeYear]);

  return (
    <div className="flex items-center justify-center space-x-2 bg-background/60 text-foreground">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrev}
        className="h-8 w-8 p-0"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* Read-only trigger that *looks* like an input */}
          <button
            type="button"
            className="inline-flex items-center rounded-md border bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Choose month"
          >
            <span className="mr-2 min-w-[9ch] text-left">{labelLong}</span>
            <CalendarIcon className="h-4 w-4 opacity-70" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center" sideOffset={8}>
          <div className="flex items-center justify-between px-2 py-1">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labelShort}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setTempYear((y) => y - 1)}
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[4ch] text-center text-sm font-semibold" aria-live="polite">
                {tempYear}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setTempYear((y) => y + 1)}
                aria-label="Next year"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-4 gap-1 p-2">
            {MONTHS_LONG.map((name, idx) => {
              const active = idx === safeMonthIndex && tempYear === safeYear;
              return (
                <Button
                  key={name}
                  variant={active ? "default" : "outline"}
                  className="h-8 px-2 text-xs"
                  onClick={() => handleSelectMonth(idx, tempYear)}
                >
                  {name.slice(0, 3)}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-2 pb-1 pt-2">
            <Button
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={() => {
                // restore current props without committing
                setTempYear(safeYear);
                setOpen(false);
              }}
            >
              Close
            </Button>
            <div className="space-x-2">
              <Button variant="ghost" className="h-8 px-2 text-xs" onClick={handleThisMonth}>
                This month
              </Button>
              <Button
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  // Reset to current month
                  commit(currentMonthIndex, currentYear);
                  setOpen(false);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        className="h-8 w-8 p-0"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MonthSelector;
