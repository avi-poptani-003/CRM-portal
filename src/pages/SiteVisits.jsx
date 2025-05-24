import { useState } from "react"
import { useTheme } from "../context/ThemeContext"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts"
import { Home, CheckCircle, XCircle, Clock, Calendar, MapPin, Phone, Plus, Filter, Search, ChevronRight, ArrowUpRight, CalendarDays } from 'lucide-react'
import Navbar from "../components/common/Navbar"

// Mock data - replace with actual API calls
const visitData = [
  { date: "Jan", scheduled: 45, completed: 38, cancelled: 7 },
  { date: "Feb", scheduled: 52, completed: 45, cancelled: 7 },
  { date: "Mar", scheduled: 48, completed: 40, cancelled: 8 },
  { date: "Apr", scheduled: 60, completed: 52, cancelled: 8 },
  { date: "May", scheduled: 55, completed: 48, cancelled: 7 },
]

const upcomingVisits = [
  {
    id: 1,
    property: "Sunset Villa",
    propertyType: "Residential",
    location: "Palm Beach Road, Sector 12",
    client: "John Smith",
    clientPhone: "+91 98765 43210",
    date: "2024-05-16",
    time: "10:00 AM",
    status: "scheduled",
    agent: "Rahul Verma",
  },
  {
    id: 2,
    property: "Ocean View Apartment",
    propertyType: "Residential",
    location: "Marine Drive, Block B",
    client: "Sarah Johnson",
    clientPhone: "+91 87654 32109",
    date: "2024-05-16",
    time: "2:30 PM",
    status: "confirmed",
    agent: "Priya Singh",
  },
  {
    id: 3,
    property: "Mountain Lodge",
    propertyType: "Vacation",
    location: "Hill Station Road, Pine Valley",
    client: "Mike Brown",
    clientPhone: "+91 76543 21098",
    date: "2024-05-17",
    time: "11:00 AM",
    status: "scheduled",
    agent: "Amit Kumar",
  },
  {
    id: 4,
    property: "Green Valley Commercial Space",
    propertyType: "Commercial",
    location: "Business District, Tower 3",
    client: "Jennifer Lee",
    clientPhone: "+91 65432 10987",
    date: "2024-05-18",
    time: "3:00 PM",
    status: "confirmed",
    agent: "Vikram Mehta",
  },
]

// Past visits data
const pastVisits = [
  {
    id: 101,
    property: "Riverside Apartment",
    propertyType: "Residential",
    location: "River View Road, Block C",
    client: "David Wilson",
    clientPhone: "+91 54321 09876",
    date: "2024-05-10",
    time: "11:30 AM",
    status: "completed",
    agent: "Neha Sharma",
    feedback: "Client liked the property but concerned about pricing",
  },
  {
    id: 102,
    property: "City Center Office",
    propertyType: "Commercial",
    location: "Downtown, Business Park",
    client: "Robert Johnson",
    clientPhone: "+91 43210 98765",
    date: "2024-05-09",
    time: "2:00 PM",
    status: "completed",
    agent: "Sanjay Mehra",
    feedback: "Very interested, requested follow-up with pricing details",
  },
  {
    id: 103,
    property: "Garden Villa",
    propertyType: "Residential",
    location: "Green Park, Villa 7",
    client: "Emily Davis",
    clientPhone: "+91 32109 87654",
    date: "2024-05-08",
    time: "4:30 PM",
    status: "cancelled",
    agent: "Priya Singh",
    feedback: "Cancelled due to personal emergency",
  },
]

// Conversion data
const conversionData = [
  { name: "Visits to Inquiry", value: 68 },
  { name: "Inquiry to Viewing", value: 42 },
  { name: "Viewing to Offer", value: 28 },
  { name: "Offer to Sale", value: 15 },
]

// Colors for charts
const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"]

function SiteVisits() {
  const { theme } = useTheme()
  const [selectedTab, setSelectedTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState("This Week")
  const [selectedAgent, setSelectedAgent] = useState("All Agents")
  const [selectedPropertyType, setSelectedPropertyType] = useState("All Types")

  const isDark = theme === "dark"
  const hoverBg = isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
  const secondaryText = isDark ? "text-gray-400" : "text-gray-500"
  const borderColor = isDark ? "border-gray-700" : "border-gray-300"

  const stats = [
    {
      title: "Total Visits",
      value: "183",
      change: "+12.5%",
      trend: "up",
      icon: Home,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Completed",
      value: "145",
      change: "+8.3%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Cancelled",
      value: "38",
      change: "-2.7%",
      trend: "down",
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "Upcoming",
      value: "24",
      change: "+5.2%",
      trend: "up",
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ]

  // Filter visits based on search query
  const filteredUpcomingVisits = upcomingVisits.filter(
    (visit) =>
      visit.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.agent.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPastVisits = pastVisits.filter(
    (visit) =>
      visit.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.agent.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Site Visits</h1>
            <p className={secondaryText}>Manage and track property site visits</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Schedule Visit
          </button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-6">
          {/* Stats Cards - Each takes 3 columns on large screens, 3 on medium */}
          {stats.map((stat, index) => (
            
            <div
              key={stat.title}
              className={`${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border transition-all hover:shadow-md hover:border-blue-500 hover:translate-y-[-2px] duration-300 md:col-span-3 lg:col-span-3 group`}
            >

              <div className="flex items-center justify-between">
                <div>
                  <p className={secondaryText}>{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1 group-hover:text-blue-500 transition-colors duration-300">{stat.value}</h3>
                  <div className={`flex items-center mt-1 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                    <ArrowUpRight className={`h-3 w-3 mr-1 ${stat.trend === "down" ? "rotate-90" : ""}`} />
                    <span className="text-xs font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 ${isDark ? "group-hover:bg-blue-900/50" : ""}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color} group-hover:text-blue-600 transition-colors duration-300`} />
                </div>
              </div>
            </div>
          ))}

          {/* Visit Trends Chart - Takes 8 columns on large screens, 4 on medium */}
          <div
            className={`${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-4 lg:col-span-8 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">Visit Trends</h3>
              <div className="flex space-x-2">
                {["Week", "Month", "Quarter", "Year"].map((range) => (
                  <button
                    key={range}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedDateRange === range
                        ? "bg-blue-600 text-white"
                        : isDark
                          ? "text-gray-400 hover:bg-blue-600/20 hover:text-blue-300"
                          : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                    onClick={() => setSelectedDateRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitData}>
                  <defs>
                    <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4285F4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4285F4" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34A853" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#34A853" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EA4335" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#EA4335" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f3f4f6"} vertical={false} />
                  <XAxis dataKey="date" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
                  <YAxis stroke={isDark ? "#9CA3AF" : "#6B7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                      border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      color: isDark ? "#F3F4F6" : "#1F2937",
                    }}
                  />
                  <RechartsLegend />
                  <Area
                    type="monotone"
                    dataKey="scheduled"
                    stroke="#4285F4"
                    fillOpacity={1}
                    fill="url(#colorScheduled)"
                    name="Scheduled"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#34A853"
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                    name="Completed"
                  />
                  <Area
                    type="monotone"
                    dataKey="cancelled"
                    stroke="#EA4335"
                    fillOpacity={1}
                    fill="url(#colorCancelled)"
                    name="Cancelled"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion Funnel - Takes 4 columns on large screens, 2 on medium */}
          <div
            className={`${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-2 lg:col-span-4 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
          >
            <h3 className="text-lg font-bold mb-6 group-hover:text-blue-500 transition-colors duration-300">Conversion Funnel</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke={isDark ? "#374151" : "#f3f4f6"}
                  />
                  <XAxis type="number" domain={[0, 100]} stroke={isDark ? "#9CA3AF" : "#6B7280"} />
                  <YAxis dataKey="name" type="category" width={120} stroke={isDark ? "#9CA3AF" : "#6B7280"} />
                  <RechartsTooltip
                    formatter={(value) => [`${value}%`, "Conversion Rate"]}
                    contentStyle={{
                      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                      border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                      borderRadius: "8px",
                      color: isDark ? "#F3F4F6" : "#1F2937",
                    }}
                  />
                  <Bar dataKey="value" fill="#4285F4" radius={[0, 4, 4, 0]}>
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visits List Section - Takes full width (12 columns) */}
          <div
            className={`${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm border md:col-span-6 lg:col-span-12`}
          >
            {/* Header with search and filters */}
            <div className={`p-6 border-b ${borderColor}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTab("upcoming")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTab === "upcoming"
                        ? "bg-blue-600 text-white"
                        : isDark
                          ? "text-gray-400 hover:bg-gray-700"
                          : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setSelectedTab("past")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTab === "past"
                        ? "bg-blue-600 text-white"
                        : isDark
                          ? "text-gray-400 hover:bg-gray-700"
                          : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Past Visits
                  </button>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search visits..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-lg w-full ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setFilterOpen(!filterOpen)}
                      className={`p-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                          : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <Filter className="h-5 w-5" />
                    </button>

                    {filterOpen && (
                      <div
                        className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-10 ${
                          isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                        }`}
                      >
                        <div className="p-4">
                          <h4 className="font-medium mb-3">Filter Visits</h4>

                          <div className="mb-3">
                            <label className="block text-sm mb-1">Agent</label>
                            <select
                              value={selectedAgent}
                              onChange={(e) => setSelectedAgent(e.target.value)}
                              className={`w-full p-2 rounded-lg border ${
                                isDark
                                  ? "bg-gray-700 border-gray-600 text-gray-100"
                                  : "bg-gray-50 border-gray-300 text-gray-900"
                              }`}
                            >
                              <option>All Agents</option>
                              <option>Rahul Verma</option>
                              <option>Priya Singh</option>
                              <option>Amit Kumar</option>
                              <option>Vikram Mehta</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm mb-1">Property Type</label>
                            <select
                              value={selectedPropertyType}
                              onChange={(e) => setSelectedPropertyType(e.target.value)}
                              className={`w-full p-2 rounded-lg border ${
                                isDark
                                  ? "bg-gray-700 border-gray-600 text-gray-100"
                                  : "bg-gray-50 border-gray-300 text-gray-900"
                              }`}
                            >
                              <option>All Types</option>
                              <option>Residential</option>
                              <option>Commercial</option>
                              <option>Vacation</option>
                            </select>
                          </div>

                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => {
                                setSelectedAgent("All Agents")
                                setSelectedPropertyType("All Types")
                              }}
                              className={`px-3 py-1.5 text-sm rounded-lg ${
                                isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              Reset
                            </button>
                            <button
                              onClick={() => setFilterOpen(false)}
                              className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Visits List */}
            <div className="overflow-x-auto">
              {selectedTab === "upcoming" ? (
                filteredUpcomingVisits.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor}`}>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${borderColor}`}>
                      {filteredUpcomingVisits.map((visit) => (
                        <tr key={visit.id} className={`${isDark ? "hover:bg-blue-900/10" : "hover:bg-blue-50"} cursor-pointer transition-all duration-200 group border-l-4 border-transparent hover:border-blue-500`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">{visit.property}</div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="truncate max-w-[200px]">{visit.location}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>{visit.client}</div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Phone className="w-3 h-3 mr-1" />
                              <span>{visit.clientPhone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarDays className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                              <div>
                                <div>{visit.date}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{visit.time}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{visit.agent}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                visit.status === "confirmed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              }`}
                            >
                              {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className={`${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"} font-medium text-sm flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
                            >
                              Details <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No upcoming visits found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchQuery ? "Try adjusting your search criteria" : "Schedule a new visit to get started"}
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Visit
                    </button>
                  </div>
                )
              ) : // Past visits
              filteredPastVisits.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${borderColor}`}>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderColor}`}>
                    {filteredPastVisits.map((visit) => (
                      <tr key={visit.id} className={`${isDark ? "hover:bg-blue-900/10" : "hover:bg-blue-50"} cursor-pointer transition-all duration-200 group border-l-4 border-transparent hover:border-blue-500`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">{visit.property}</div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-[200px]">{visit.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{visit.client}</div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            <span>{visit.clientPhone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarDays className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <div>
                              <div>{visit.date}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{visit.time}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{visit.agent}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              visit.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} line-clamp-2`}>
                            {visit.feedback}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No past visits found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? "Try adjusting your search criteria" : "Past visits will appear here"}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {((selectedTab === "upcoming" && filteredUpcomingVisits.length > 0) ||
              (selectedTab === "past" && filteredPastVisits.length > 0)) && (
              <div className={`px-6 py-4 border-t ${borderColor} flex justify-between items-center`}>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">
                    {selectedTab === "upcoming" ? filteredUpcomingVisits.length : filteredPastVisits.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {selectedTab === "upcoming" ? filteredUpcomingVisits.length : filteredPastVisits.length}
                  </span>{" "}
                  results
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded-md border ${borderColor} ${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-50"} disabled:opacity-50`}
                    disabled
                  >
                    Previous
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md border ${borderColor} ${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-50"} disabled:opacity-50`}
                    disabled
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SiteVisits
