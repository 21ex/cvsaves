import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Palette, Percent, DollarSign } from "lucide-react";
import { Category } from "@/types/supabase";

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

interface SpendingChartProps {
  categories?: SpendingCategory[];
  totalSpending?: number;
  budget?: number;
  onCategoryClick?: (category: string) => void;
  onCategoryColorChange?: (category: string, color: string) => void;
}

const SpendingChart = ({
  categories = [
    { name: "Housing", amount: 1200, color: "#FF6384" },
    { name: "Food", amount: 400, color: "#36A2EB" },
    { name: "Transportation", amount: 200, color: "#FFCE56" },
    { name: "Entertainment", amount: 150, color: "#4BC0C0" },
    { name: "Utilities", amount: 250, color: "#9966FF" },
  ],
  totalSpending = 2200,
  budget = 4000,
  onCategoryClick = () => {},
  onCategoryColorChange = () => {},
}: SpendingChartProps) => {
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [showPercentage, setShowPercentage] = useState(false);
  // Calculate percentages for the donut chart
  const calculateStrokeDasharray = (amount: number) => {
    const percentage = (amount / totalSpending) * 100;
    return `${percentage} ${100 - percentage}`;
  };

  // Calculate the stroke dash offset for each segment
  const calculateStrokeDashoffset = (index: number) => {
    let offset = 25; // Start at the top
    for (let i = 0; i < index; i++) {
      offset += (categories[i].amount / totalSpending) * 100;
    }
    return offset;
  };

  return (
    <Card className="w-full h-full bg-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-medium">
            Spending Breakdown
          </CardTitle>
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant={!showPercentage ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPercentage(false)}
              className="h-6 px-2"
            >
              <DollarSign className="h-3 w-3" />
            </Button>
            <Button
              variant={showPercentage ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPercentage(true)}
              className="h-6 px-2"
            >
              <Percent className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {categories.length > 0 ? (
          <>
            <div className="relative w-48 h-48 mb-6">
              {/* Empty circle as background */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f1f1"
                  strokeWidth="12"
                />

                {/* Donut chart segments */}
                {categories.map((category, index) => (
                  <TooltipProvider key={category.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={category.color}
                          strokeWidth="12"
                          strokeDasharray={`${calculateStrokeDasharray(category.amount)}`}
                          strokeDashoffset={`${calculateStrokeDashoffset(index)}`}
                          transform="rotate(-90 50 50)"
                          style={{
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                          }}
                          onClick={() => onCategoryClick(category.name)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {category.name}:{" "}
                          {showPercentage
                            ? `${((category.amount / totalSpending) * 100).toFixed(1)}%`
                            : `${category.amount.toFixed(2)}`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}

                {/* Center text showing total */}
                <text
                  x="50"
                  y="45"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-lg font-medium fill-current"
                >
                  {showPercentage
                    ? `${((totalSpending / budget) * 100).toFixed(0)}%`
                    : `${totalSpending.toFixed(2)}`}
                </text>
                <text
                  x="50"
                  y="60"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {showPercentage ? "of budget" : "Total"}
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors group"
                >
                  <div
                    className="w-3 h-3 rounded-full cursor-pointer"
                    style={{ backgroundColor: category.color }}
                    onClick={() => onCategoryClick(category.name)}
                  />
                  <span
                    className="text-sm cursor-pointer flex-1"
                    onClick={() => onCategoryClick(category.name)}
                  >
                    {category.name}
                  </span>
                  <span className="text-sm font-medium">
                    {showPercentage
                      ? `${((category.amount / totalSpending) * 100).toFixed(1)}%`
                      : `${category.amount.toFixed(2)}`}
                  </span>
                  <Popover
                    open={colorPickerOpen === category.name}
                    onOpenChange={(open) =>
                      setColorPickerOpen(open ? category.name : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Palette className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium">
                          Choose Color
                        </label>
                        <input
                          type="color"
                          value={category.color}
                          onChange={(e) => {
                            onCategoryColorChange(
                              category.name,
                              e.target.value,
                            );
                            setColorPickerOpen(null);
                          }}
                          className="w-16 h-8 rounded border cursor-pointer"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your first expense to see the spending breakdown
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpendingChart;
