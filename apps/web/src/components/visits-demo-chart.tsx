import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { XAxis } from "@/components/charts/x-axis";

const data = [
  { date: new Date("2025-09-21"), visits: 12 },
  { date: new Date("2025-09-22"), visits: 18 },
  { date: new Date("2025-09-23"), visits: 15 },
  { date: new Date("2025-09-24"), visits: 22 },
  { date: new Date("2025-09-25"), visits: 19 },
  { date: new Date("2025-09-26"), visits: 25 },
  { date: new Date("2025-09-27"), visits: 21 },
];

export function VisitsDemoChart() {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area dataKey="visits" fill="var(--chart-line-primary)" />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
