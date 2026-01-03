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

/* ── custom tooltip position ────────────────────────── */
const OFFSET = 18;
(ChartTooltip as any).positioners.outsideArc = function (
  this: any,
  items: { element: any }[],
) {
  if (!items.length) return false;
  const e = items[0].element;
  const a = (e.startAngle + e.endAngle) / 2;
  const r = e.outerRadius + OFFSET;
  return { x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r };
};

/* ---------- types ---------- */
export interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}
interface Props {
  categories: SpendingCategory[];
  totalSpending: number;
  budget: number;
  /** When true, show spending-only (no remaining-slice, % of spending) */
  trackerMode?: boolean;
  onCategoryClick: (name: string) => void;
  onCategoryColorChange: (name: string, color: string) => void;
}

const SpendingChart: React.FC<Props> = ({
  categories,
  totalSpending,
  budget,
  trackerMode = false,
  onCategoryClick,
  onCategoryColorChange,
}) => {
  const [showPct, setShowPct] = useState(false);
  const chartRef = useRef<ChartJS>(null);

  // color picker popover state
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState<string>("");

  const safeBudget = budget || 1;
  const remaining = Math.max(budget - totalSpending, 0);
  const remainingColor = "#CBD5E1"; // neutral

  // Build dataset depending on mode
  const labels = trackerMode
    ? categories.map((c) => c.name)
    : [...categories.map((c) => c.name), "Remaining"];

  const values = trackerMode
    ? categories.map((c) => c.amount)
    : [...categories.map((c) => c.amount), remaining];

  const colors = trackerMode
    ? categories.map((c) => c.color)
    : [...categories.map((c) => c.color), remainingColor];

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };

  const denom = trackerMode ? Math.max(totalSpending, 1) : safeBudget;
  const fmt = (v: number) =>
    showPct ? `${((v / denom) * 100).toFixed(1)} %` : `$${v.toFixed(2)}`;

  /* ----- chart options ----- */
  const options = {
    cutout: "62%",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        position: "outsideArc",
        displayColors: false,
        callbacks: {
          title: (ctx: TooltipItem<"doughnut">[]) => ctx[0].label ?? "",
          label: (ctx: TooltipItem<"doughnut">) => fmt(ctx.parsed as number),
        },
      },
    },
    onClick: (_: any, elems: any[]) => {
      if (!elems.length) return;
      const idx = elems[0].index;
      // In budget mode, ignore clicks on the "Remaining" slice
      if (!trackerMode && idx >= categories.length) return;
      onCategoryClick(categories[idx].name);
    },
  };

  const clearHover = () => {
    const chart = chartRef.current;
    if (chart) {
      chart.setActiveElements([] as ActiveElement[]);
      chart.update();
    }
  };

  /* ---------- center label ----------
   * % in center ONLY for Budget+%.
   * Tracker+% shows $ total (same as Tracker+$).
   */
  const showPercentInCenter = !trackerMode && showPct;

  const centerTop = showPercentInCenter
    ? ((totalSpending / Math.max(safeBudget, 1)) * 100)
        .toFixed(1)
        .replace(/\.0$/, "")
    : totalSpending.toFixed(2).replace(/\.00$/, "");

  const centerSub = showPercentInCenter ? "of budget" : "Total";

  /* ---------- render ---------- */
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
              aria-label="Show dollars"
            >
              <DollarSign className="h-3 w-3" />
            </Button>
            <Button
              variant={showPct ? "default" : "ghost"}
              size="sm"
              className="h-6 px-2"
              onClick={() => setShowPct(true)}
              aria-label="Show percentages"
            >
              <Percent className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        {categories.length ? (
          <>
            <div
              className="relative w-56 h-56 overflow-visible"
              onMouseLeave={clearHover}
            >
              <Doughnut ref={chartRef} data={data} options={options as any} />

              {/* ── centre text ── */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-semibold">
                  {showPercentInCenter ? `${centerTop} %` : `$${centerTop}`}
                </span>
                <span className="text-sm text-muted-foreground">{centerSub}</span>
              </div>
            </div>

            {/* legend (only categories, no 'Remaining') */}
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
                      ? `${((cat.amount / denom) * 100).toFixed(1)} %`
                      : `$${cat.amount.toFixed(2)}`}
                  </span>

                  {/* colour picker with Confirm/Cancel */}
                  <Popover
                    open={pickerOpen === cat.name}
                    onOpenChange={(o) => {
                      if (o) {
                        setPickerOpen(cat.name);
                        setTempColor(cat.color); // seed with current color
                      } else {
                        setPickerOpen(null);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        aria-label={`Change ${cat.name} color`}
                      >
                        <Palette className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-3">
                      <div className="flex flex-col gap-3">
                        <input
                          type="color"
                          value={tempColor}
                          onChange={(e) => setTempColor(e.target.value)}
                          className="w-full h-10 border rounded cursor-pointer"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPickerOpen(null); // discard changes
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={async () => {
                              if (pickerOpen === cat.name) {
                                await onCategoryColorChange(cat.name, tempColor);
                              }
                              setPickerOpen(null);
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
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
