"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, Phone, Clock, CheckCircle } from "lucide-react"

interface MonthlyCostData {
  tenant_id: string
  month: string
  total_calls: string
  total_cost_usd: string
}

interface SummaryData {
  tenant_id: string
  total_calls: string
  avg_response_time: string
  success_rate: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function Dashboard() {
  const [monthlyCostData, setMonthlyCostData] = useState<MonthlyCostData[]>([])
  const [summaryData, setSummaryData] = useState<SummaryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [costResponse, summaryResponse] = await Promise.all([
          fetch("http://ralf.com.ng/stats/monthly-cost"),
          fetch("http://ralf.com.ng/stats/summary"),
        ])

        if (!costResponse.ok || !summaryResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const costData = await costResponse.json()
        const summaryDataRes = await summaryResponse.json()

        setMonthlyCostData(costData)
        setSummaryData(summaryDataRes)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate summary statistics
  const totalCost = monthlyCostData.reduce((sum, item) => sum + Number.parseFloat(item.total_cost_usd), 0)
  const totalCalls = monthlyCostData.reduce((sum, item) => sum + Number.parseInt(item.total_calls), 0)
  const avgCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0
  const avgResponseTime =
    summaryData.length > 0
      ? summaryData.reduce((sum, item) => sum + Number.parseFloat(item.avg_response_time), 0) / summaryData.length
      : 0
  const overallSuccessRate =
    summaryData.length > 0
      ? summaryData.reduce((sum, item) => sum + Number.parseFloat(item.success_rate), 0) / summaryData.length
      : 0

  // Prepare chart data
  const costChartData = monthlyCostData.map((item) => ({
    tenant: item.tenant_id,
    cost: Number.parseFloat(item.total_cost_usd),
    calls: Number.parseInt(item.total_calls),
  }))

  const successRateChartData = summaryData.map((item, index) => ({
    tenant: item.tenant_id,
    success_rate: Number.parseFloat(item.success_rate),
    fill: COLORS[index % COLORS.length],
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor your API usage, costs, and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">API requests</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">Across all tenants</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallSuccessRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Cost by Tenant</CardTitle>
              <CardDescription>Monthly cost breakdown across tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  cost: {
                    label: "Cost (USD)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tenant" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [`$${value}`, name === "cost" ? "Cost" : name]}
                    />
                    <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Success Rate Distribution</CardTitle>
              <CardDescription>Performance across tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  success_rate: {
                    label: "Success Rate (%)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={successRateChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ tenant, success_rate }) => `${tenant}: ${success_rate}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="success_rate"
                    >
                      {successRateChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`${value}%`, "Success Rate"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Monthly Cost Details</CardTitle>
              <CardDescription>Detailed cost breakdown by tenant</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Cost/Call</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyCostData.map((item) => {
                    const costPerCall =
                      Number.parseInt(item.total_calls) > 0
                        ? Number.parseFloat(item.total_cost_usd) / Number.parseInt(item.total_calls)
                        : 0
                    return (
                      <TableRow key={item.tenant_id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{item.tenant_id}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {Number.parseInt(item.total_calls).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number.parseFloat(item.total_cost_usd).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">${costPerCall.toFixed(2)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Response time and success metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Avg Response</TableHead>
                    <TableHead className="text-right">Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.map((item) => {
                    const successRate = Number.parseFloat(item.success_rate)
                    return (
                      <TableRow key={item.tenant_id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{item.tenant_id}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {Number.parseInt(item.total_calls).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number.parseFloat(item.avg_response_time).toFixed(0)}ms
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={successRate >= 90 ? "default" : successRate >= 70 ? "secondary" : "destructive"}
                          >
                            {successRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
