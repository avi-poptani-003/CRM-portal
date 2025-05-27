import { useState, useMemo, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
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
} from "recharts";
import {
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Plus,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import siteVisitService from "../services/siteVisitService"; // Corrected import: default import

const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];

const localizer = momentLocalizer(moment);

const initialNewVisitFormState = {
  property: "", // Will be property ID
  propertyType: "", // Derived from selected property
  location: "", // Derived from selected property
  client: "", // Will be client ID
  clientPhone: "", // Derived from selected client
  date: moment().format("YYYY-MM-DD"),
  time: "10:00 AM",
  status: "scheduled",
  agent: "", // Will be agent ID
  feedback: "", // Added feedback field for new visits
};

function SiteVisits() {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("This Month"); // For chart filter
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("All Agents");
  const [selectedPropertyTypeFilter, setSelectedPropertyTypeFilter] =
    useState("All Types");

  const [allVisits, setAllVisits] = useState([]);
  const [properties, setProperties] = useState([]); // To fetch properties for the dropdown
  const [users, setUsers] = useState([]); // To fetch users (clients/agents) for dropdowns
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVisitData, setNewVisitData] = useState(initialNewVisitFormState);

  const isDark = theme === "dark";
  const secondaryText = isDark ? "text-gray-400" : "text-gray-500";
  const borderColor = isDark ? "border-gray-700" : "border-gray-300";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const inputBg = isDark
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500";

  // Fetch all necessary data from Django backend
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [visits, fetchedProperties, fetchedUsers] = await Promise.all([
        siteVisitService.getAllSiteVisits(),
        siteVisitService.getProperties(), // Fetch properties
        siteVisitService.getUsers(), // Fetch users
      ]);
      setAllVisits(visits);
      setProperties(fetchedProperties);
      setUsers(fetchedUsers);

      // Set a default agent if available, for the new visit form
      setNewVisitData((prev) => ({
        ...prev,
        agent: fetchedUsers.find((u) => u.role === "agent")?.id || "",
      }));
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const stats = useMemo(() => {
    const completedCount = allVisits.filter(
      (v) => v.status === "completed"
    ).length;
    const cancelledCount = allVisits.filter(
      (v) => v.status === "cancelled"
    ).length;
    const upcomingCount = allVisits.filter((v) => {
      const visitMoment = moment(`${v.date} ${v.time}`, "YYYY-MM-DD h:mm A");
      return (
        visitMoment.isSameOrAfter(moment()) &&
        !["completed", "cancelled"].includes(v.status)
      );
    }).length;

    return [
      {
        title: "Total Visits",
        value: allVisits.length.toString(),
        change: "+12.5%",
        trend: "up",
        icon: Home,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
      },
      {
        title: "Completed",
        value: completedCount.toString(),
        change: "+8.3%",
        trend: "up",
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      },
      {
        title: "Cancelled",
        value: cancelledCount.toString(),
        change: "-2.7%",
        trend: "down",
        icon: XCircle,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
      },
      {
        title: "Upcoming",
        value: upcomingCount.toString(),
        change: "+5.2%",
        trend: "up",
        icon: Clock,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
      },
    ];
  }, [allVisits]);

  const applyFilters = (visits) => {
    return visits.filter((visit) => {
      const propertyTitle = visit.property_details?.title || "";
      const clientName =
        visit.client_details?.full_name || visit.client_details?.username || "";
      const agentName =
        visit.agent_details?.full_name || visit.agent_details?.username || "";
      const locationName = visit.property_details?.location || "";

      return (
        (propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          locationName.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedAgentFilter === "All Agents" ||
          agentName === selectedAgentFilter) &&
        (selectedPropertyTypeFilter === "All Types" ||
          visit.property_details?.propertyType === selectedPropertyTypeFilter)
      );
    });
  };

  const filteredUpcomingVisits = useMemo(() => {
    const upcoming = allVisits.filter((visit) => {
      const visitDateTime = moment(
        `${visit.date} ${visit.time}`,
        "YYYY-MM-DD h:mm A"
      );
      return (
        visitDateTime.isSameOrAfter(moment()) &&
        !["completed", "cancelled"].includes(visit.status)
      );
    });
    return applyFilters(upcoming);
  }, [allVisits, searchQuery, selectedAgentFilter, selectedPropertyTypeFilter]);

  const filteredPastVisits = useMemo(() => {
    const past = allVisits.filter((visit) => {
      const visitDateTime = moment(
        `${visit.date} ${visit.time}`,
        "YYYY-MM-DD h:mm A"
      );
      return (
        visitDateTime.isBefore(moment()) ||
        ["completed", "cancelled"].includes(visit.status)
      );
    });
    return applyFilters(past);
  }, [allVisits, searchQuery, selectedAgentFilter, selectedPropertyTypeFilter]);

  const calendarEvents = useMemo(() => {
    return allVisits
      .map((visit) => {
        const visitDate = moment(visit.date, "YYYY-MM-DD");
        const timeParts = visit.time.match(/(\d+):(\d+)\s*(AM|PM)/i);

        if (!timeParts || !visitDate.isValid()) {
          console.warn(
            `Could not parse date/time for visit: ${visit.id} - Date: "${visit.date}", Time: "${visit.time}"`
          );
          return null;
        }

        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const ampm = timeParts[3].toUpperCase();

        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0; // Midnight case

        const startDateTime = visitDate
          .clone()
          .hours(hours)
          .minutes(minutes)
          .toDate();
        let endDateTime = moment(startDateTime).add(1, "hour").toDate();
        if (moment(endDateTime).isSameOrBefore(startDateTime)) {
          endDateTime = moment(startDateTime).add(1, "hour").toDate();
        }

        const propertyTitle = visit.property_details?.title || "N/A Property";
        const clientName =
          visit.client_details?.full_name ||
          visit.client_details?.username ||
          "N/A Client";

        return {
          id: visit.id,
          title: `${propertyTitle} - ${clientName} (${visit.status})`,
          start: startDateTime,
          end: endDateTime,
          allDay: false,
          resource: visit, // Store the full visit object
        };
      })
      .filter((event) => event !== null);
  }, [allVisits]);

  const handleNewVisitChange = (e) => {
    const { name, value } = e.target;
    setNewVisitData((prev) => {
      let updatedValue = value;
      if (name === "property") {
        const selectedProperty = properties.find(
          (p) => p.id === parseInt(value)
        );
        if (selectedProperty) {
          return {
            ...prev,
            property: parseInt(value), // Store ID
            propertyType: selectedProperty.propertyType,
            location: selectedProperty.location,
          };
        }
      } else if (name === "client") {
        const selectedClient = users.find((u) => u.id === parseInt(value));
        if (selectedClient) {
          return {
            ...prev,
            client: parseInt(value), // Store ID
            clientPhone: selectedClient.phone_number || "", // Assuming phone_number field
          };
        }
      } else if (name === "agent") {
        updatedValue = parseInt(value); // Store ID
      }

      return { ...prev, [name]: updatedValue };
    });
  };

  const handleAddNewVisit = async (e) => {
    e.preventDefault();

    // Basic validation for time format
    if (!/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(newVisitData.time)) {
      console.error(
        "Validation Error: Please enter time in HH:MM AM/PM format (e.g., 10:00 AM or 2:30 PM)."
      );
      setError(
        "Please enter time in HH:MM AM/PM format (e.g., 10:00 AM or 2:30 PM)."
      );
      return;
    }
    if (!moment(newVisitData.date, "YYYY-MM-DD", true).isValid()) {
      console.error(
        "Validation Error: Please enter a valid date in YYYY-MM-DD format."
      );
      setError("Please enter a valid date in YYYY-MM-DD format.");
      return;
    }
    if (!newVisitData.property || !newVisitData.client || !newVisitData.agent) {
      console.error(
        "Validation Error: Please select Property, Client, and Agent."
      );
      setError("Please select Property, Client, and Agent.");
      return;
    }

    try {
      const payload = {
        property: newVisitData.property, // Send ID
        client: newVisitData.client, // Send ID
        agent: newVisitData.agent, // Send ID
        date: newVisitData.date,
        time: newVisitData.time,
        status: newVisitData.status,
        feedback: newVisitData.feedback, // Include feedback
      };
      await siteVisitService.createSiteVisit(payload);
      setIsAddModalOpen(false);
      setNewVisitData(initialNewVisitFormState);
      fetchAllData(); // Re-fetch all data to update the list and calendar
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Failed to schedule new visit:", err);
      // Attempt to parse and display a more specific error message from the backend
      let errorMessage =
        "Failed to schedule new visit. Please check your input and try again.";
      if (err.response && err.response.data) {
        // DRF validation errors are often in err.response.data
        errorMessage = JSON.stringify(err.response.data);
      }
      setError(errorMessage);
    }
  };

  const handleSelectSlot = ({ start }) => {
    setNewVisitData({
      ...initialNewVisitFormState,
      date: moment(start).format("YYYY-MM-DD"),
      time: moment(start).format("h:mm A"),
      agent: users.find((u) => u.role === "agent")?.id || "", // Pre-select an agent if available
    });
    setIsAddModalOpen(true);
    setError(null); // Clear errors when opening modal
  };

  const openAddModal = () => {
    setNewVisitData((prev) => ({
      // Reset form when opening manually, retain default agent if set
      ...initialNewVisitFormState,
      agent: users.find((u) => u.role === "agent")?.id || "",
    }));
    setIsAddModalOpen(true);
    setError(null); // Clear errors when opening modal
  };

  const availableAgents = useMemo(() => {
    const agents = users
      .filter((user) => user.role === "agent")
      .map((a) => a.full_name || a.username);
    return ["All Agents", ...Array.from(new Set(agents))];
  }, [users]);

  const availablePropertyTypes = useMemo(() => {
    const types = new Set(properties.map((p) => p.propertyType));
    return ["All Types", ...Array.from(types)];
  }, [properties]);

  const clients = useMemo(
    () => users.filter((user) => user.role === "client"),
    [users]
  );
  const agents = useMemo(
    () => users.filter((user) => user.role === "agent"),
    [users]
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${bgColor}`}
      >
        <p className={textColor}>Loading site visits...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Site Visits</h1>
            <p className={secondaryText}>
              Manage and track property site visits
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule Visit
          </button>
        </div>

        {/* Add Visit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${cardBg} p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}
            >
              <h2 className="text-xl font-bold mb-4">Schedule New Visit</h2>
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              )}
              <form onSubmit={handleAddNewVisit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="property"
                      className="block text-sm font-medium mb-1"
                    >
                      Property Name
                    </label>
                    <select
                      name="property"
                      id="property"
                      value={newVisitData.property}
                      onChange={handleNewVisitChange}
                      required
                      className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select Property</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="propertyType"
                      className="block text-sm font-medium mb-1"
                    >
                      Property Type
                    </label>
                    <input
                      type="text"
                      name="propertyType"
                      id="propertyType"
                      value={newVisitData.propertyType}
                      readOnly
                      disabled
                      className={`w-full p-2 rounded-md border ${inputBg}`}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={newVisitData.location}
                    readOnly
                    disabled
                    className={`w-full p-2 rounded-md border ${inputBg}`}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="client"
                      className="block text-sm font-medium mb-1"
                    >
                      Client Name
                    </label>
                    <select
                      name="client"
                      id="client"
                      value={newVisitData.client}
                      onChange={handleNewVisitChange}
                      required
                      className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select Client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name || c.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="clientPhone"
                      className="block text-sm font-medium mb-1"
                    >
                      Client Phone
                    </label>
                    <input
                      type="tel"
                      name="clientPhone"
                      id="clientPhone"
                      value={newVisitData.clientPhone}
                      readOnly
                      disabled
                      className={`w-full p-2 rounded-md border ${inputBg}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium mb-1"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={newVisitData.date}
                      onChange={handleNewVisitChange}
                      required
                      className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500 ${
                        isDark ? "text-gray-100" : "text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="time"
                      className="block text-sm font-medium mb-1"
                    >
                      Time (e.g., 10:00 AM)
                    </label>
                    <input
                      type="text"
                      name="time"
                      id="time"
                      value={newVisitData.time}
                      onChange={handleNewVisitChange}
                      required
                      placeholder="HH:MM AM/PM"
                      className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="agent"
                      className="block text-sm font-medium mb-1"
                    >
                      Agent
                    </label>
                    <select
                      name="agent"
                      id="agent"
                      value={newVisitData.agent}
                      onChange={handleNewVisitChange}
                      required
                      className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select Agent</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.full_name || a.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium mb-1"
                    >
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={newVisitData.status}
                      onChange={handleNewVisitChange}
                      className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-medium mb-1"
                  >
                    Feedback (for completed/cancelled)
                  </label>
                  <textarea
                    name="feedback"
                    id="feedback"
                    value={newVisitData.feedback}
                    onChange={handleNewVisitChange}
                    rows="3"
                    className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className={`px-4 py-2 rounded-md border ${borderColor} ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Schedule Visit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-6">
          {/* Stats Cards */}
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`${cardBg} ${borderColor} rounded-xl shadow-sm p-6 border transition-all hover:shadow-md hover:border-blue-500 hover:translate-y-[-2px] duration-300 md:col-span-3 lg:col-span-3 group`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={secondaryText}>{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1 group-hover:text-blue-500 transition-colors duration-300">
                    {stat.value}
                  </h3>
                  <div
                    className={`flex items-center mt-1 ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <ArrowUpRight
                      className={`h-3 w-3 mr-1 ${
                        stat.trend === "down" ? "rotate-90" : ""
                      }`}
                    />
                    <span className="text-xs font-medium">{stat.change}</span>
                  </div>
                </div>
                <div
                  className={`${
                    stat.bgColor
                  } p-3 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 ${
                    isDark ? "group-hover:bg-blue-900/50" : ""
                  }`}
                >
                  <stat.icon
                    className={`h-6 w-6 ${stat.color} group-hover:text-blue-600 transition-colors duration-300`}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Visit Trends Chart */}
          <div
            className={`${cardBg} ${borderColor} rounded-xl shadow-sm p-6 border md:col-span-4 lg:col-span-8 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">
                Visit Trends
              </h3>
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
                <AreaChart
                  data={
                    /* Filter visitData based on selectedDateRange here */ []
                  }
                >
                  {" "}
                  {/* Empty data for now */}
                  <defs>
                    <linearGradient
                      id="colorScheduled"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#4285F4" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#4285F4"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#34A853" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#34A853"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorCancelled"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#EA4335" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#EA4335"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#f3f4f6"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDark ? "#9CA3AF" : "#6B7280"}
                  />
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

          {/* Conversion Funnel */}
          <div
            className={`${cardBg} ${borderColor} rounded-xl shadow-sm p-6 border md:col-span-2 lg:col-span-4 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
          >
            <h3 className="text-lg font-bold mb-6 group-hover:text-blue-500 transition-colors duration-300">
              Conversion Funnel
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[]} layout="vertical">
                  {" "}
                  {/* Empty data for now */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke={isDark ? "#374151" : "#f3f4f6"}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    stroke={isDark ? "#9CA3AF" : "#6B7280"}
                  />
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
                    {/* {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))} */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visits List Section */}
          <div
            className={`${cardBg} ${borderColor} rounded-xl shadow-sm border md:col-span-6 lg:col-span-12`}
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
                      className={`pl-10 pr-4 py-2 rounded-lg w-full ${inputBg} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <div className="p-4">
                          <h4 className="font-medium mb-3">Filter Visits</h4>
                          <div className="mb-3">
                            <label className="block text-sm mb-1">Agent</label>
                            <select
                              value={selectedAgentFilter}
                              onChange={(e) =>
                                setSelectedAgentFilter(e.target.value)
                              }
                              className={`w-full p-2 rounded-lg border ${inputBg}`}
                            >
                              {availableAgents.map((agent) => (
                                <option key={agent} value={agent}>
                                  {agent}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="block text-sm mb-1">
                              Property Type
                            </label>
                            <select
                              value={selectedPropertyTypeFilter}
                              onChange={(e) =>
                                setSelectedPropertyTypeFilter(e.target.value)
                              }
                              className={`w-full p-2 rounded-lg border ${inputBg}`}
                            >
                              {availablePropertyTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => {
                                setSelectedAgentFilter("All Agents");
                                setSelectedPropertyTypeFilter("All Types");
                              }}
                              className={`px-3 py-1.5 text-sm rounded-lg ${
                                isDark
                                  ? "text-gray-300 hover:bg-gray-700"
                                  : "text-gray-600 hover:bg-gray-100"
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
                        <tr
                          key={visit.id}
                          className={`${
                            isDark ? "hover:bg-blue-900/10" : "hover:bg-blue-50"
                          } cursor-pointer transition-all duration-200 group border-l-4 border-transparent hover:border-blue-500`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">
                              {visit.property_details?.title || "N/A"}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />{" "}
                              <span className="truncate max-w-[200px]">
                                {visit.property_details?.location || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              {visit.client_details?.full_name ||
                                visit.client_details?.username ||
                                "N/A"}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Phone className="w-3 h-3 mr-1" />{" "}
                              <span>
                                {visit.client_details?.phone_number || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarDays className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                              <div>
                                <div>
                                  {moment(visit.date).format("MMM DD, YYYY")}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {visit.time}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {visit.agent_details?.full_name ||
                              visit.agent_details?.username ||
                              "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                visit.status === "confirmed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              }`}
                            >
                              {visit.status.charAt(0).toUpperCase() +
                                visit.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className={`${
                                isDark
                                  ? "text-blue-400 hover:text-blue-300"
                                  : "text-blue-600 hover:text-blue-800"
                              } font-medium text-sm flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
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
                    <h3 className="text-lg font-medium mb-2">
                      No upcoming visits found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "Schedule a new visit to get started"}
                    </p>
                    <button
                      onClick={openAddModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Schedule Visit
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
                      <tr
                        key={visit.id}
                        className={`${
                          isDark ? "hover:bg-blue-900/10" : "hover:bg-blue-50"
                        } cursor-pointer transition-all duration-200 group border-l-4 border-transparent hover:border-blue-500`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">
                            {visit.property_details?.title || "N/A"}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />{" "}
                            <span className="truncate max-w-[200px]">
                              {visit.property_details?.location || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            {visit.client_details?.full_name ||
                              visit.client_details?.username ||
                              "N/A"}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Phone className="w-3 h-3 mr-1" />{" "}
                            <span>
                              {visit.client_details?.phone_number || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarDays className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <div>
                              <div>
                                {moment(visit.date).format("MMM DD, YYYY")}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {visit.time}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {visit.agent_details?.full_name ||
                            visit.agent_details?.username ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              visit.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {visit.status.charAt(0).toUpperCase() +
                              visit.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p
                            className={`text-sm ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            } line-clamp-2`}
                          >
                            {visit.feedback || "N/A"}
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
                  <h3 className="text-lg font-medium mb-2">
                    No past visits found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? "Try adjusting your search criteria"
                      : "Past visits will appear here"}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination placeholder (implement actual pagination if needed) */}
            {((selectedTab === "upcoming" &&
              filteredUpcomingVisits.length > 5) ||
              (selectedTab === "past" && filteredPastVisits.length > 5)) && (
              <div
                className={`px-6 py-4 border-t ${borderColor} flex justify-between items-center`}
              >
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">
                    {Math.min(
                      5,
                      selectedTab === "upcoming"
                        ? filteredUpcomingVisits.length
                        : filteredPastVisits.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {selectedTab === "upcoming"
                      ? filteredUpcomingVisits.length
                      : filteredUpcomingVisits.length}
                  </span>{" "}
                  results
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded-md border ${borderColor} ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-50"
                    } disabled:opacity-50`}
                    disabled
                  >
                    Previous
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md border ${borderColor} ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-50"
                    } disabled:opacity-50`}
                    disabled
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Section */}
        <div
          className={`${cardBg} ${borderColor} mt-6 rounded-xl shadow-sm border`}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Visits Calendar
            </h2>
          </div>
          <div style={{ height: "700px" }} className="p-2">
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={["month", "week", "day", "agenda"]}
              defaultView={Views.MONTH}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={(event) => {
                const visit = event.resource;
                console.info(
                  `Property: ${visit.property_details?.title || "N/A"}\n` +
                    `Client: ${
                      visit.client_details?.full_name ||
                      visit.client_details?.username ||
                      "N/A"
                    }\n` +
                    `Date: ${moment(event.start).format("MMMM Do, YYYY")}\n` +
                    `Time: ${moment(event.start).format("h:mm a")} - ${moment(
                      event.end
                    ).format("h:mm a")}\n` +
                    `Agent: ${
                      visit.agent_details?.full_name ||
                      visit.agent_details?.username ||
                      "N/A"
                    }\n` +
                    `Status: ${visit.status}\n` +
                    (visit.feedback ? `Feedback: ${visit.feedback}` : "")
                );
              }}
              eventPropGetter={(event) => {
                let backgroundColor, borderColorProp, textColorProp;
                const status = event.resource?.status;

                if (status === "completed") {
                  backgroundColor = isDark ? "#1C4532" : "#C6F6D5";
                  borderColorProp = isDark ? "#2F855A" : "#9AE6B4";
                  textColorProp = isDark ? "#E2E8F0" : "#22543D";
                } else if (status === "cancelled") {
                  backgroundColor = isDark ? "#742A2A" : "#FED7D7";
                  borderColorProp = isDark ? "#C53030" : "#FEB2B2";
                  textColorProp = isDark ? "#F7FAFC" : "#742A2A";
                } else if (status === "confirmed") {
                  backgroundColor = isDark ? "#1E40AF" : "#DBEAFE";
                  borderColorProp = isDark ? "#2563EB" : "#A5B4FC";
                  textColorProp = isDark ? "#EFF6FF" : "#1E40AF";
                } else {
                  // scheduled or other
                  backgroundColor = isDark
                    ? "hsl(45, 74%, 30%)"
                    : "hsl(45, 93%, 85%)"; // Darker yellow for dark, Lighter for light
                  borderColorProp = isDark
                    ? "hsl(45, 74%, 40%)"
                    : "hsl(45, 100%, 51%)";
                  textColorProp = isDark
                    ? "hsl(45, 10%, 90%)"
                    : "hsl(30, 64%, 30%)";
                }
                return {
                  style: {
                    backgroundColor,
                    color: textColorProp,
                    borderRadius: "4px",
                    border: `1px solid ${borderColorProp}`,
                    fontSize: "0.8rem",
                    padding: "2px 4px",
                    opacity: 0.9,
                  },
                };
              }}
              components={{
                toolbar: (props) => (
                  <div
                    className={`flex flex-col md:flex-row justify-between items-center p-4 border-b ${borderColor}`}
                  >
                    <div className="flex items-center mb-4 md:mb-0">
                      <button
                        onClick={() => props.onNavigate("TODAY")}
                        className={`px-3 py-1 rounded-md mr-2 ${
                          isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => props.onNavigate("PREV")}
                        className={`p-1 rounded-md mr-1 ${
                          isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => props.onNavigate("NEXT")}
                        className={`p-1 rounded-md ${
                          isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <span className={`ml-4 font-semibold ${textColor}`}>
                        {props.label}
                      </span>
                    </div>
                    <div className="flex">
                      {props.views.map((view) => (
                        <button
                          key={view}
                          className={`px-3 py-1 mx-1 rounded-md text-sm capitalize ${
                            props.view === view
                              ? "bg-blue-600 text-white"
                              : isDark
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => props.onView(view)}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                  </div>
                ),
                month: {
                  header: (props) => (
                    <div
                      className={`text-center p-2 text-xs font-medium ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {props.label}
                    </div>
                  ),
                },
                week: {
                  header: (props) => (
                    <div
                      className={`text-center p-1 text-xs font-medium ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {moment(props.date).format("ddd")}
                      <br />
                      <span
                        className={`text-sm font-semibold ${
                          moment(props.date).isSame(new Date(), "day")
                            ? "bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center"
                            : textColor
                        }`}
                      >
                        {moment(props.date).format("D")}
                      </span>
                    </div>
                  ),
                },
                day: {
                  header: (props) => (
                    <div
                      className={`text-center p-2 text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {moment(props.date).format("dddd, MMMM D")}
                    </div>
                  ),
                },
                event: (props) => (
                  <div className="p-0.5 text-[0.7rem] leading-tight">
                    <div className="font-semibold truncate">
                      {props.event.title.split(" - ")[0]}
                    </div>
                    <div className="truncate">
                      {props.event.title.split(" - ")[1]}
                    </div>
                    <div className="truncate">
                      {moment(props.event.start).format("h:mma")}
                      {/* - {moment(props.event.end).format('h:mma')} */}
                    </div>
                  </div>
                ),
              }}
              dayPropGetter={(date) => {
                const isCurrentDay = moment(date).isSame(new Date(), "day");
                return {
                  style: {
                    backgroundColor: isCurrentDay
                      ? isDark
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(219, 234, 254, 0.7)"
                      : undefined,
                  },
                  className: isDark ? "rbc-day-bg-dark" : "rbc-day-bg-light", // For custom CSS if needed
                };
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteVisits;
