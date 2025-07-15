import React, { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Percent, Palette } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Chart as ChartJS,
  ArcElement,
  Legend,
  Tooltip as ChartTooltip,
  ActiveElement,
  TooltipItem,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Legend, ChartTooltip);

//popup when hovering
const OFFSET = 18;
(ChartTooltip as any).positioners.outsideArc = function (
  this: any,
  items: { element: any }[],
) {
  if (!items.length) return false;
  const e = items[0].element;
  const angle = (e.startAngle + e.endAngle) / 2;
  const r = e.outerRadius + OFFSET;
  return {
    x: e.x + Math.cos(angle) * r,
    y: e.y + Math.sin(angle) * r,
  };
};

export interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

interface Props {
  categories: SpendingCategory[];
  totalSpending: number;
  budget: number;
  onCategoryClick: (name: string) => void;
  onCategoryColorChange: (name: string, color: string) => void;
}

const SpendingChart: React.FC<Props> = ({
  categories,
  totalSpending,
  budget,
  onCategoryClick,
  onCategoryColorChange,
}) => {
  const [showPct, setShowPct] = useState(false);
  const chartRef = useRef<ChartJS>(null);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);

  //chart data
  const data = {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        data: categories.map((c) => c.amount),
        backgroundColor: categories.map((c) => c.color),
        borderWidth: 0,
      },
    ],
  };

  const format = (n: number) =>
    showPct ? `${((n / totalSpending) * 100).toFixed(1)} %`
      : `$${n.toFixed(2)}`;

  const options = {
    cutout: "62%",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        position: "outsideArc",
        displayColors: false,
        callbacks: {
          title: (ctx: TooltipItem<"doughnut">[]) => ctx[0].label || "",
          label: (ctx: TooltipItem<"doughnut">) => format(ctx.parsed as number),
        },
      },
    },
    onClick: (_: any, elems: any[]) => {
      if (elems.length) {
        const idx = elems[0].index;
        onCategoryClick(categories[idx].name);
      }
    },
  };

  //hiding the tooltip when cursor leaves the donut
  const clearHover = () => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setActiveElements([] as ActiveElement[]);
    chart.update();
  };

  return (
    <Card className="w-full h-full bg-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Spending Breakdown</CardTitle>
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant={!showPct ? "default" : "ghost"}
              size="sm"
              className="h-6 px-2"
              onClick={() => setShowPct(false)}
            >
              <DollarSign className="h-3 w-3" />
            </Button>
            <Button
              variant={showPct ? "default" : "ghost"}
              size="sm"
              className="h-6 px-2"
              onClick={() => setShowPct(true)}
            >
              <Percent className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        {categories.length ? (
          <>
            {/* donut wrapper allows tooltip / highlight to overflow */}
            <div
              className="relative w-56 h-56 overflow-visible"
              onMouseLeave={clearHover}
            >
              <Doughnut ref={chartRef} data={data} options={options as any} />

              {/* centre labels */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-semibold">
                  {showPct
                    ? `${Math.round(
                      Math.min((totalSpending / budget) * 100, 999),
                    )} %`
                    : `$${totalSpending.toFixed(2)}`}
                </span>
                <span className="text-sm text-muted-foreground">
                  {showPct ? "of budget" : "Total"}
                </span>
              </div>
            </div>

            {/* legend */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors group"
                >
                  <span
                    style={{ background: cat.color }}
                    className="w-3 h-3 rounded-full"
                  />
                  <span
                    className="text-sm flex-1 cursor-pointer"
                    onClick={() => onCategoryClick(cat.name)}
                  >
                    {cat.name}
                  </span>
                  <span className="text-sm font-medium">
                    {showPct
                      ? `${((cat.amount / totalSpending) * 100).toFixed(1)} %`
                      : `$${cat.amount.toFixed(2)}`}
                  </span>

                  {/* color picker */}
                  <Popover
                    open={pickerOpen === cat.name}
                    onOpenChange={(open) =>
                      setPickerOpen(open ? cat.name : null)
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
                      <input
                        type="color"
                        value={cat.color}
                        onChange={(e) => {
                          onCategoryColorChange(cat.name, e.target.value);
                          setPickerOpen(null);
                        }}
                        className="w-20 h-10 border rounded cursor-pointer"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            No expenses yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpendingChart;
