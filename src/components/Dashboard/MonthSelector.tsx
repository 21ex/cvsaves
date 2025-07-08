import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
  selectedMonth?: string;
  selectedYear?: number;
  onMonthChange?: (month: string, year: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth = new Date().toLocaleString("default", { month: "long" }),
  selectedYear = new Date().getFullYear(),
  onMonthChange = () => {},
}) => {
  const months = [
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handlePreviousMonth = () => {
    const currentMonthIndex = months.indexOf(selectedMonth);
    if (currentMonthIndex === 0) {
      onMonthChange("December", selectedYear - 1);
    } else {
      onMonthChange(months[currentMonthIndex - 1], selectedYear);
    }
  };

  const handleNextMonth = () => {
    const currentMonthIndex = months.indexOf(selectedMonth);
    if (currentMonthIndex === 11) {
      onMonthChange("January", selectedYear + 1);
    } else {
      onMonthChange(months[currentMonthIndex + 1], selectedYear);
    }
  };

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [tempMonth, setTempMonth] = useState(
    `${selectedYear}-${String(new Date(Date.parse(selectedMonth + " 1, 2000")).getMonth() + 1).padStart(2, "0")}`,
  );

  const handleMonthPickerChange = (value: string) => {
    const [year, month] = value.split("-");
    const monthName = months[parseInt(month) - 1];
    onMonthChange(monthName, parseInt(year));
    setShowMonthPicker(false);
  };

  return (
    <div className="flex items-center justify-center space-x-2 bg-background p-2 rounded-lg border w-fit mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePreviousMonth}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={showMonthPicker} onOpenChange={setShowMonthPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="font-medium text-sm px-3 h-8">
            {selectedMonth.slice(0, 3)} {selectedYear}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <input
            type="month"
            value={tempMonth}
            onChange={(e) => {
              setTempMonth(e.target.value);
              handleMonthPickerChange(e.target.value);
            }}
            className="border rounded px-2 py-1 text-sm"
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleNextMonth}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MonthSelector;
