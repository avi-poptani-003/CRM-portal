// Dashboard.jsx
"use client"

import { useState, useMemo, useEffect } from "react"
import propertyService from "../services/propertyService"
import { useTheme } from "../context/ThemeContext"
import { useLeadStats } from "../hooks/useLeadStats"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts"
import {
  Users,
  Building,
  Calendar,
  CheckCircle,
  ArrowUpRight,
  ChevronRight,
  BarChart2,
  PieChartIcon,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Navbar from "../components/common/Navbar"

// Static data for charts that don't have real data yet
const revenueData = [
  { name: "Jan", revenue: 4000000, sales: 2400000 },
  { name: "Feb", revenue: 3000000, sales: 1398000 },
  { name: "Mar", revenue: 9800000, sales: 3908000 },
  { name: "Apr", revenue: 3908000, sales: 4800000 },
  { name: "May", revenue: 6800000, sales: 2900000 },
  { name: "Jun", revenue: 4500000, sales: 2500000 },
]

const upcomingVisits = [
  {
    id: 1,
    property: "Green Valley Villa",
    client: "Vikram Mehta",
    date: "Today",
    time: "2:00 PM",
    status: "Confirmed",
  },
  {
    id: 2,
    property: "Sunset Apartments",
    client: "Ananya Desai",
    date: "Tomorrow",
    time: "11:30 AM",
    status: "Scheduled",
  },
  { id: 3, property: "Riverside Homes", client: "Rajesh Khanna", date: "May 18", time: "4:00 PM", status: "Scheduled" },
]

const teamMembers = [
  {
    name: "Sanjay Mehra",
    role: "Sales Manager",
    deals: 24,
    revenue: "₹72.5M",
    img: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Priya Singh",
    role: "Senior Agent",
    deals: 22,
    revenue: "₹65M",
    img: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Rahul Verma",
    role: "Agent",
    deals: 18,
    revenue: "₹51.5M",
    img: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Neha Bose",
    role: "Agent",
    deals: 15,
    revenue: "₹45M",
    img: "/placeholder.svg?height=40&width=40",
  },
]

const activityData = [
  { date: "May 1", actions: 20 },
  { date: "May 2", actions: 35 },
  { date: "May 3", actions: 50 },
  { date: "May 4", actions: 40 },
  { date: "May 5", actions: 70 },
  { date: "May 6", actions: 60 },
]

// Color palette
const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#8AB4F8", "#CEEAD6", "#FDE293", "#F6AEA9"]

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

// Components
const LoadingSpinner = ({ isDark }) => (
  <div className="flex items-center justify-center p-8">
    <RefreshCw className={`h-8 w-8 animate-spin ${isDark ? "text-gray-400" : "text-gray-600"}`} />
    <span className={`ml-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading...</span>
  </div>
)

const ErrorMessage = ({ error, onRetry, isDark }) => (
  <div className={`flex items-center justify-center p-8 ${isDark ? "text-red-400" : "text-red-600"}`}>
    <AlertCircle className="h-6 w-6 mr-2" />
    <span className="mr-4">Failed to load data: {error}</span>
    <button
      onClick={onRetry}
      className={`px-3 py-1 rounded text-sm ${
        isDark ? "bg-red-900/30 hover:bg-red-900/50 text-red-300" : "bg-red-100 hover:bg-red-200 text-red-700"
      }`}
    >
      Retry
    </button>
  </div>
)

const KPICard = ({ title, value, change, icon: Icon, color, isDark }) => {
  const isPositive = !change.includes("-")
  const bgColor = isDark ? `bg-${color}-900/30` : `bg-${color}-100`
  const iconColor = isDark ? `text-${color}-400` : `text-${color}-600`
  const changeColor = isPositive ? "text-green-500" : "text-red-500"

  return (
    <div
      className={`${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} rounded-xl shadow-sm p-6 border transition-all hover:shadow-md hover:translate-y-[-2px] duration-300 hover:border-blue-400 group`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={isDark ? "text-gray-300" : "text-gray-500"}>{title}</p>
          <h3
            className={`text-2xl font-bold mt-1 ${isDark ? "text-gray-100" : "text-gray-900"} group-hover:text-blue-600 transition-colors duration-300`}
          >
            {value}
          </h3>
          <div className={`flex items-center mt-1 ${changeColor}`}>
            <ArrowUpRight className={`h-3 w-3 mr-1 ${!isPositive ? "rotate-90" : ""}`} />
            <span className="text-xs font-medium">{change}</span>
          </div>
        </div>
        {Icon && (
          <div
            className={`${bgColor} p-3 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 ${isDark ? "group-hover:bg-blue-900/50" : ""}`}
          >
            <Icon className={`h-6 w-6 ${iconColor} group-hover:text-blue-600 transition-colors duration-300`} />
          </div>
        )}
      </div>
    </div>
  )
}

const StatusBadge = ({ status, isDark }) => {
  const getStatusStyles = () => {
    if (status === "New" || status === "Confirmed") {
      return isDark ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
    } else if (status === "Contacted" || status === "Scheduled") {
      return isDark ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-100 text-yellow-800"
    } else {
      return isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
    }
  }

  return <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyles()}`}>{status}</span>
}

const SourceBadge = ({ source, isDark }) => (
  <span
    className={`px-2 py-1 text-xs rounded-full ${isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"}`}
  >
    {source}
  </span>
)

const ChartContainer = ({ title, children, action, isDark, className = "" }) => {
  return (
    <div
      className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border transition-all hover:shadow-md hover:border-blue-500 duration-300 ${className} group`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

const TimeRangeSelector = ({ timeRange, setTimeRange, isDark }) => (
  <div className="flex space-x-2">
    {["week", "month", "year"].map((range) => (
      <button
        key={range}
        onClick={() => setTimeRange(range)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
          timeRange === range
            ? "bg-blue-600 text-white shadow-sm"
            : isDark
              ? "text-gray-300 hover:bg-blue-600/20 hover:text-blue-300"
              : "text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
        }`}
      >
        {range.charAt(0).toUpperCase() + range.slice(1)}
      </button>
    ))}
  </div>
)

// Main Dashboard Component
const Dashboard = () => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [timeRange, setTimeRange] = useState("month")
  const [properties, setProperties] = useState([])
  const [propertyLoading, setPropertyLoading] = useState(true)
  const [propertyError, setPropertyError] = useState(null)

  // Fetch real lead data
  const { stats, loading, error, refetch } = useLeadStats()

  useEffect(() => {
    const fetchPropertiesData = async () => {
      try {
        setPropertyLoading(true)
        const data = await propertyService.getProperties()
        if (Array.isArray(data)) {
          setProperties(data)
          setPropertyError(null)
        } else {
          setPropertyError("Invalid property data format received from server")
        }
      } catch (err) {
        setPropertyError("Failed to load property data. Please try again later.")
      } finally {
        setPropertyLoading(false)
      }
    }
    fetchPropertiesData()
  }, [])

  const chartConfig = useMemo(
    () => ({
      contentStyle: {
        backgroundColor: isDark ? "#374151" : "#FFFFFF",
        border: `1px solid ${isDark ? "#4B5563" : "#E5E7EB"}`,
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        color: isDark ? "#F3F4F6" : "#1F2937",
      },
      gridStroke: isDark ? "#4B5563" : "#f3f4f6",
      axisStroke: isDark ? "#9CA3AF" : "#6B7280",
      backgroundColor: isDark ? "#374151" : "#FFFFFF",
    }),
    [isDark],
  )

  // Transform lead status data for the pipeline chart
  const leadPipelineData = useMemo(() => {
    if (!stats?.status_distribution) return []

    return stats.status_distribution.map((item) => ({
      name: item.status,
      value: item.count,
    }))
  }, [stats])

  // Transform lead source data for the chart
  const leadSourceData = useMemo(() => {
    if (!stats?.source_distribution) return []

    return stats.source_distribution.map((item) => ({
      name: item.source,
      value: item.count,
    }))
  }, [stats])

  const propertyTypeData = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    const counts = properties.reduce((acc, property) => {
      const type = property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const total = properties.length;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: parseFloat(((count / total) * 100).toFixed(2)),
      count: count // Add count for display if needed
    }));
  }, [properties]);

  const handleExportReport = () => {
    console.log("Exporting report...")
    alert("Report export initiated! Check console for details.")
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
        <Navbar />
        <LoadingSpinner isDark={isDark} />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, Admin</h1>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>Dashboard Overview</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={refetch}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {error && <ErrorMessage error={error} onRetry={refetch} isDark={isDark} />}

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Leads"
            value={stats?.total_leads?.toString() || "0"}
            change="12.5%"
            icon={Users}
            color="blue"
            isDark={isDark}
          />
          <KPICard
            title="Conversions"
            value={stats?.converted_leads?.toString() || "0"}
            change={`${stats?.conversion_rate || 0}%`}
            icon={CheckCircle}
            color="green"
            isDark={isDark}
          />
          <KPICard
            title="New Leads"
            value={stats?.new_leads?.toString() || "0"}
            change="5.3%"
            icon={Calendar}
            color="orange"
            isDark={isDark}
          />
          <KPICard
            title="Qualified Leads"
            value={stats?.qualified_leads?.toString() || "0"}
            change="3.8%"
            icon={Building}
            color="purple"
            isDark={isDark}
          />
        </section>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
          {/* Revenue Chart */}
          <ChartContainer
            className="md:col-span-2 lg:col-span-3"
            title="Revenue Overview"
            isDark={isDark}
            action={<TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} isDark={isDark} />}
          >
            {propertyLoading ? (
              <LoadingSpinner isDark={isDark} />
            ) : propertyError ? (
              <ErrorMessage error={propertyError} onRetry={refetch} isDark={isDark} />
            ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4285F4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4285F4" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34A853" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#34A853" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridStroke} vertical={false} />
                  <XAxis dataKey="name" stroke={chartConfig.axisStroke} />
                  <YAxis stroke={chartConfig.axisStroke} tickFormatter={formatCurrency} />
                  <RechartsTooltip
                    contentStyle={chartConfig.contentStyle}
                    formatter={(value) => [formatCurrency(value), ""]}
                  />
                  <RechartsLegend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4285F4"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#34A853"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    name="Sales"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            )}
          </ChartContainer>

          {/* Lead Pipeline Chart - Now with real data */}
          <ChartContainer
            className="md:col-span-2 lg:col-span-3"
            title="Lead Pipeline"
            isDark={isDark}
            action={
              <button
                className={`${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                All Leads 
                {/* <ChevronRight className="h-4 w-4 ml-1" /> */}
              </button>
            }
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadPipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadPipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={chartConfig.contentStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {leadPipelineData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-xs font-medium">{item.name}</span>
                  </div>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>

        {/* Activity Chart */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
          <ChartContainer title="Daily Activity" isDark={isDark} className="md:col-span-4 lg:col-span-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridStroke} />
                  <XAxis dataKey="date" stroke={chartConfig.axisStroke} />
                  <YAxis stroke={chartConfig.axisStroke} />
                  <RechartsTooltip contentStyle={chartConfig.contentStyle} />
                  <Line
                    type="monotone"
                    dataKey="actions"
                    stroke="#3B82F4"
                    strokeWidth={2}
                    dot={{ fill: isDark ? "#60A5FA" : "#3B82F6", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        {/* Recent Leads and Upcoming Visits */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
          {/* Recent Leads - Now with real data */}
          <div
            className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm border h-full md:col-span-3 lg:col-span-4`}
          >
            <div
              className={`p-6 border-b ${isDark ? "border-gray-600" : "border-gray-300"} flex justify-between items-center`}
            >
              <h3 className="text-lg font-bold">Recent Leads</h3>
              <button
                className={`${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Name
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Contact
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Source
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-gray-600" : "divide-gray-300"}`}>
                  {(stats?.recent_leads || []).map((lead) => (
                    <tr
                      key={lead.id}
                      className={`${
                        isDark ? "hover:bg-blue-900/20" : "hover:bg-blue-50"
                      } cursor-pointer transition-all duration-200 group hover:shadow-sm`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap border-l-4 border-transparent group-hover:border-blue-500">
                        <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">
                          {lead.name}
                        </div>
                        <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {lead.company || lead.interest}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{lead.email}</div>
                        <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SourceBadge source={lead.source} isDark={isDark} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={lead.status} isDark={isDark} />
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Visits */}
          <div
            className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm border h-full md:col-span-1 lg:col-span-2`}
          >
            <div
              className={`p-6 border-b ${isDark ? "border-gray-600" : "border-gray-300"} flex justify-between items-center`}
            >
              <h3 className="text-lg font-bold">Upcoming Site Visits</h3>
              <button
                className={`${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                View Calendar <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {upcomingVisits.map((visit, index) => (
                <div
                  key={visit.id}
                  className={`p-4 rounded-lg ${isDark ? "hover:bg-blue-900/10" : "hover:bg-blue-50"} cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-l-4 hover:border-blue-500 ${
                    index !== upcomingVisits.length - 1 ? "mb-3" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{visit.property}</h4>
                    <StatusBadge status={visit.status} isDark={isDark} />
                  </div>
                  <div className={`flex items-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mb-2`}>
                    <Users className="h-4 w-4 mr-1" />
                    <span>{visit.client}</span>
                  </div>
                  <div className={`flex items-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {visit.date}, {visit.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
          {/* Property Types */}
          <ChartContainer
            className="md:col-span-2 lg:col-span-3"
            title="Property Types"
            isDark={isDark}
            action={
              <div className={`flex items-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <PieChartIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">Distribution</span>
              </div>
            }
          >
            {propertyLoading ? (
              <LoadingSpinner isDark={isDark} />
            ) : propertyError ? (
              <ErrorMessage error={propertyError} onRetry={refetch} isDark={isDark} />
            ) : (
            <div className="grid grid-cols-2 gap-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={chartConfig.contentStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center">
                {propertyTypeData.map((item, index) => (
                  <div key={index} className="flex items-center mb-3 last:mb-0">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.count} ({item.value}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </ChartContainer>

          {/* Lead Sources - Now with real data */}
          <ChartContainer
            className="md:col-span-2 lg:col-span-3"
            title="Lead Sources"
            isDark={isDark}
            action={
              <div className={`flex items-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <BarChart2 className="h-4 w-4 mr-1" />
                <span className="text-xs">Distribution</span>
              </div>
            }
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadSourceData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke={chartConfig.gridStroke}
                  />
                  <XAxis type="number" stroke={chartConfig.axisStroke} />
                  <YAxis dataKey="name" type="category" width={100} stroke={chartConfig.axisStroke} />
                  <RechartsTooltip formatter={(value) => [value, "Count"]} contentStyle={chartConfig.contentStyle} />
                  <Bar dataKey="value" fill="#4285F4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        {/* Team Performance Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
          <div
            className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border h-full md:col-span-3 lg:col-span-4`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Builder Performance</h3>
              <button
                className={`${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Project
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Leads
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Site Visits
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Conversions
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Rate
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-gray-600" : "divide-gray-300"}`}>
                  {[
                    {
                      name: "Green Valley Homes",
                      leads: 128,
                      visits: 87,
                      conversions: 43,
                      rate: 33.6,
                      color: "bg-blue-600",
                    },
                    {
                      name: "Urban Heights Tower",
                      leads: 95,
                      visits: 62,
                      conversions: 29,
                      rate: 30.5,
                      color: "bg-blue-500",
                    },
                    {
                      name: "Lakeside Villas",
                      leads: 76,
                      visits: 41,
                      conversions: 18,
                      rate: 23.7,
                      color: "bg-blue-400",
                    },
                    {
                      name: "Sunset Apartments",
                      leads: 112,
                      visits: 64,
                      conversions: 26,
                      rate: 23.2,
                      color: "bg-blue-400",
                    },
                    {
                      name: "Metro Business Park",
                      leads: 68,
                      visits: 29,
                      conversions: 12,
                      rate: 17.6,
                      color: "bg-blue-300",
                    },
                  ].map((item, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        isDark ? "hover:bg-blue-900/20" : "hover:bg-blue-50"
                      } cursor-pointer transition-all duration-200 group hover:shadow-sm`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap border-l-4 border-transparent group-hover:border-blue-500">
                        <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">
                          {item.name}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:font-medium`}
                      >
                        {item.leads}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:font-medium`}
                      >
                        {item.visits}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:font-medium`}
                      >
                        {item.conversions}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:font-medium`}
                      >
                        {item.rate}%
                      </td>
                      <td className="px-6 py-4">
                        <div className={`w-full rounded-full h-1.5 ${isDark ? "bg-gray-600" : "bg-gray-100"}`}>
                          <div
                            className={`${item.color} h-1.5 rounded-full transition-all duration-1000 ease-out group-hover:h-2.5 group-hover:shadow-md group-hover:shadow-blue-500/30`}
                            style={{ width: `${item.rate}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Performance */}
          <div
            className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border transition-all hover:shadow-md h-full md:col-span-1 lg:col-span-2`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Team Performance</h3>
              <button
                className={`${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                View Team
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-lg border ${
                    isDark
                      ? "border-gray-600 hover:bg-blue-900/10 hover:border-blue-400"
                      : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                  } transition-all duration-200 hover:shadow-sm`}
                >
                  <img
                    src={member.img || "/placeholder.svg"}
                    alt={member.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mb-1`}>{member.role}</p>
                    <div className="flex items-center">
                      <span
                        className={`text-xs ${
                          isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
                        } px-2 py-0.5 rounded-full mr-2`}
                      >
                        {member.deals} deals
                      </span>
                      <span className="text-xs font-medium">{member.revenue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
