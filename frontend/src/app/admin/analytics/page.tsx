
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, LineChart, PieChart, Bar, CartesianGrid, XAxis, YAxis, Line, Pie } from "recharts";
import { ChartConfig } from "@/components/ui/chart";

const chartData = [
  { month: "January", revenue: 186, users: 80 },
  { month: "February", revenue: 305, users: 200 },
  { month: "March", revenue: 237, users: 120 },
  { month: "April", revenue: 73, users: 190 },
  { month: "May", revenue: 209, users: 130 },
  { month: "June", revenue: 214, users: 140 },
]

const chartConfig = {
  revenue: {
    label: "Revenue ($K)",
    color: "hsl(var(--chart-1))",
  },
  users: {
    label: "New Users",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const courseEngagementData = [
    { name: 'MERN Stack', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'Python Analytics', value: 300, fill: 'hsl(var(--chart-2))' },
    { name: 'Java Full Stack', value: 300, fill: 'hsl(var(--chart-3))' },
    { name: 'DevOps on AWS', value: 200, fill: 'hsl(var(--chart-4))' },
]


export default function AdminAnalyticsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Platform Analytics</h1>
        <p className="text-lg text-muted-foreground mt-2">
          View reports on revenue, user activity, and course engagement.
        </p>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <LineChartIcon className="h-6 w-6 text-primary" />
            <CardTitle>Monthly Revenue & User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <LineChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis yAxisId="left" stroke="hsl(var(--chart-1))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                 <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} yAxisId="left" />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-2))" strokeWidth={2} yAxisId="right" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <PieChartIcon className="h-6 w-6 text-primary" />
            <CardTitle>Course Engagement</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="min-h-[300px] w-full">
                <PieChart>
                     <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={courseEngagementData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} />
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
             </ChartContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
