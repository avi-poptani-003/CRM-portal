import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "../../context/ThemeContext"; // Assuming this path is correct
import {
  Search,
  X,
  Loader2,
  User,
  Home,
  Calendar,
  Users,
  FileText,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import SearchResultModal from "./SearchResultModal"; // Assuming this path is correct
import LeadService from "../../services/leadService"; // Assuming this path is correct
import propertyService from "../../services/propertyService"; // Assuming this path is correct
import UserService from "../../services/UserService"; // Assuming this path is correct
import siteVisitService from "../../services/siteVisitService"; // Assuming this path is correct

const CalendarIcon = ({ className, onClick }) => (
  <svg
    onClick={onClick}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ cursor: "pointer" }}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const Navbar = () => {
  const { theme } = useTheme(); // Make sure ThemeContext provides this
  const isDark = theme === "dark";

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(true); // For initial data load
  const [isFiltering, setIsFiltering] = useState(false); // For filtering operations
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [allSearchableData, setAllSearchableData] = useState([]);
  const [searchCategories, setSearchCategories] = useState({
    lead: true,
    property: true,
    task: true, // Represents site visits
    user: true,
    dashboard: true,
    analytics: true,
  });

  // Modal state
  const [selectedResult, setSelectedResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Effect to fetch and format all data required for searching
  useEffect(() => {
    const fetchAllData = async () => {
      setIsFetchingData(true); // Indicate data fetching start
      try {
        // Fetch all data sources concurrently
        const [leadsResponse, propertiesResponse, usersResponse, siteVisitsResponse] = await Promise.all([
          LeadService.getLeads({ page_size: 1000 }), // Consider backend search for large datasets
          propertyService.getProperties(),
          UserService.getUsers(),
          siteVisitService.getAllSiteVisits()
        ]);

        // Format Leads data
        const formattedLeads = (leadsResponse?.results || []).map(lead => ({
          id: lead.id,
          type: "lead",
          title: lead.name || "Untitled Lead", // Robust title
          description: `Email: ${lead.email || 'N/A'}, Phone: ${lead.phone || 'N/A'}`, // Robust description
          url: `/dashboard/leads/${lead.id}`,
          originalData: lead, // Keep original data if needed by modal
        }));

        // Format Properties data
        const formattedProperties = (propertiesResponse || []).map(property => ({
          id: property.id,
          type: "property",
          title: property.title || "Untitled Property", // Robust title
          description: property.location || property.property_type || "No specific details", // Robust description
          url: `/dashboard/properties/${property.id}`,
          originalData: property,
        }));

        // Format Users data
        const formattedUsers = (usersResponse || []).map(user => ({
          id: user.id,
          type: "user",
          title: user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Unnamed User", // Robust title
          description: user.email || user.role || "No role/email specified", // Robust description
          url: `/dashboard/team`,
          originalData: user,
        }));
        
        // Format Site Visits (as Tasks)
        // Handles if siteVisitsResponse is {results: []} or just []
        const siteVisitsData = siteVisitsResponse?.results || siteVisitsResponse || [];
        const formattedSiteVisits = siteVisitsData.map(visit => ({
          id: visit.id,
          type: "task",
          title: `Visit: ${visit.property_details?.title || 'N/A'} with ${visit.lead_details?.name || 'N/A'}`, // Robust title
          description: `Status: ${visit.status || 'N/A'}, Date: ${visit.visit_datetime ? new Date(visit.visit_datetime).toLocaleDateString() : 'N/A'}`, // Robust description
          url: `/dashboard/site-visits`, // Or a specific visit detail page
          originalData: visit,
        }));

        // Static pages for searching
        const staticPages = [
          {
            id: 'dashboard-main', // Unique ID
            type: 'dashboard',
            title: 'Dashboard Overview',
            description: 'Main dashboard with key metrics and summaries.',
            url: '/dashboard',
          },
          {
            id: 'analytics-reports', // Unique ID
            type: 'analytics',
            title: 'Analytics & Reports',
            description: 'View detailed performance reports and statistics.',
            url: '/dashboard/analytics',
          },
        ];

        // Combine all data sources
        setAllSearchableData([
            ...formattedLeads,
            ...formattedProperties,
            ...formattedUsers,
            ...formattedSiteVisits,
            ...staticPages
        ]);
      } catch (error) {
        console.error("Error fetching data for search:", error);
        // Optionally, set an error state here to inform the user
      } finally {
        setIsFetchingData(false); // Indicate data fetching completion
      }
    };

    fetchAllData();
  }, []); // Empty dependency array: run once on mount

  const toggleCalendar = () => {
    setCalendarOpen((prev) => !prev);
  };

  // Handle changes to the search input field
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedResultIndex(-1); // Reset keyboard selection

    if (query.trim().length > 0) {
      setIsFiltering(true); // Indicate filtering start
      setShowResults(true);

      // Filter data based on query and active categories
      const lowerCaseQuery = query.toLowerCase();
      const filtered = allSearchableData.filter((item) => {
        const matchesQuery =
          (item.title && item.title.toLowerCase().includes(lowerCaseQuery)) ||
          (item.description && item.description.toLowerCase().includes(lowerCaseQuery));
        
        // Ensure item.type is a valid key and category is enabled
        const categoryEnabled = item.type && searchCategories[item.type];

        return matchesQuery && categoryEnabled;
      });

      setSearchResults(filtered);
      setIsFiltering(false); // Indicate filtering completion
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  // Handle search form submission (e.g., pressing Enter)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Add to recent searches
    if (!recentSearches.includes(searchQuery.trim())) {
      const newRecentSearches = [searchQuery.trim(), ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecentSearches);
      localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
    }

    // If a result is highlighted by keyboard, navigate to it
    if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
      navigateToResult(searchResults[selectedResultIndex]);
    } else if (searchResults.length > 0) {
      // Otherwise, navigate to the first result in the list
      navigateToResult(searchResults[0]);
    } else {
      // No results found for the query (dropdown already shows this message)
      // console.warn(`No results found for "${searchQuery}". Try a different search term.`);
      // A more integrated UI message is preferred over an alert.
      // The dropdown already handles displaying "No results found".
    }
    // setShowResults(false); // Keep results open or close based on UX preference. Closing here.
  };

  // Action to take when a search result is selected
  const navigateToResult = (result) => {
    if (!result) return;

    // Add to recent searches if the main query led to this
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
        const newRecentSearches = [searchQuery.trim(), ...recentSearches.slice(0, 4)];
        setRecentSearches(newRecentSearches);
        localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
    }
    
    setSelectedResult(result); // Set data for the modal
    setShowResultModal(true);   // Open the modal

    setShowResults(false);      // Close search dropdown
    // setSearchQuery("");      // Optionally clear search query
  };

  // Clear the search input and results
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSelectedResultIndex(-1);
    searchInputRef.current?.focus();
  };

  // Toggle search categories (Lead, Property, etc.)
  const toggleCategory = (category) => {
    // Calculate the next state of the toggled category
    const nextCategoryState = !searchCategories[category];
    
    // Update the searchCategories state
    setSearchCategories((prev) => ({
      ...prev,
      [category]: nextCategoryState,
    }));

    // Re-filter results if there's an active search query
    if (searchQuery.trim()) {
      setIsFiltering(true);
      const lowerCaseQuery = searchQuery.toLowerCase();
      
      // Use the 'nextCategoryState' for the toggled category directly in this filter pass
      // to avoid issues with asynchronous state updates.
      const tempUpdatedCategories = {
        ...searchCategories,
        [category]: nextCategoryState,
      };

      const filtered = allSearchableData.filter((item) => {
        const matchesQuery =
          (item.title && item.title.toLowerCase().includes(lowerCaseQuery)) ||
          (item.description && item.description.toLowerCase().includes(lowerCaseQuery));
        
        const categoryEnabled = item.type && tempUpdatedCategories[item.type];
        return matchesQuery && categoryEnabled;
      });
      setSearchResults(filtered);
      setIsFiltering(false);
    }
  };

  // Handle keyboard navigation within search results
  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = Math.min(selectedResultIndex + 1, searchResults.length - 1);
      setSelectedResultIndex(newIndex);
      resultsRef.current?.querySelectorAll("li button")[newIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = Math.max(selectedResultIndex - 1, 0);
      setSelectedResultIndex(newIndex);
      resultsRef.current?.querySelectorAll("li button")[newIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && selectedResultIndex >= 0) {
      e.preventDefault();
      navigateToResult(searchResults[selectedResultIndex]);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Failed to parse recent searches from localStorage", e);
        localStorage.removeItem("recentSearches"); // Clear corrupted data
      }
    }
  }, []);

  // Effect to close search results when clicking outside the search area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to get an icon based on the result type
  const getTypeIcon = (type) => {
    const iconProps = { size: 18, className: "flex-shrink-0" };
    switch (type) {
      case "lead": return <User {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      case "property": return <Home {...iconProps} className={`${iconProps.className} text-green-500`} />;
      case "task": return <Calendar {...iconProps} className={`${iconProps.className} text-orange-500`} />;
      case "user": return <Users {...iconProps} className={`${iconProps.className} text-purple-500`} />;
      case "dashboard": return <LayoutDashboard {...iconProps} className={`${iconProps.className} text-indigo-500`} />;
      case "analytics": return <BarChart3 {...iconProps} className={`${iconProps.className} text-pink-500`} />;
      default: return <FileText {...iconProps} className={`${iconProps.className} text-gray-500`} />;
    }
  };
  
  // Determine current loading state for UI
  const isLoading = isFetchingData || isFiltering;

  return (
    <>
      <nav className={`w-full px-6 py-6 ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="relative flex items-center justify-end gap-4">
          {/* Search Component - Centered */}
          <div ref={searchRef} className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />
                </div>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchQuery && searchResults.length > 0 && setShowResults(true)}
                  placeholder="Search Leads, Properties, Tasks..."
                  className={`w-full pl-10 pr-10 py-2 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"} ${showResults ? (isDark ? "rounded-b-none border-b-transparent" : "rounded-b-none border-b-transparent") : ""}`}
                />
                {searchQuery && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isLoading && !isFetchingData ? ( // Show filtering spinner only, not initial load spinner here
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    ) : (
                      <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-500">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className={`absolute z-50 w-full mt-0 overflow-hidden rounded-b-md shadow-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} ${isDark ? "focus-within:border-blue-500" : "focus-within:border-blue-500"}`}>
                  {/* Category Filters */}
                  <div className={`px-3 py-2 flex flex-wrap gap-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    {Object.keys(searchCategories).map(categoryKey => (
                        <button
                          key={categoryKey}
                          type="button"
                          onClick={() => toggleCategory(categoryKey)}
                          className={`px-2.5 py-1 text-xs rounded-full flex items-center gap-1.5 transition-colors ${searchCategories[categoryKey] ? (isDark ? `bg-${getTypeIcon(categoryKey).props.className.split('-')[1]}-900/30 text-${getTypeIcon(categoryKey).props.className.split('-')[1]}-300` : `bg-${getTypeIcon(categoryKey).props.className.split('-')[1]}-100 text-${getTypeIcon(categoryKey).props.className.split('-')[1]}-800`) : (isDark ? "bg-gray-700 text-gray-400 hover:bg-gray-600" : "bg-gray-200 text-gray-500 hover:bg-gray-300")}`}
                        >
                          {getTypeIcon(categoryKey)}
                          {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}s
                        </button>
                    ))}
                  </div>

                  {/* Results List / Messages */}
                  {isLoading && isFetchingData ? ( // Initial data loading spinner
                    <div className={`p-4 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      <Loader2 size={20} className="animate-spin mx-auto mb-2" /> Loading data...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul ref={resultsRef} className="max-h-96 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <li key={`${result.type}-${result.id}-${index}`}>
                          <button
                            type="button"
                            onClick={() => navigateToResult(result)}
                            onMouseEnter={() => setSelectedResultIndex(index)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-150 ${selectedResultIndex === index ? (isDark ? "bg-blue-900/60" : "bg-blue-100") : (isDark ? "hover:bg-gray-700" : "hover:bg-gray-50")} ${index < searchResults.length -1 ? (isDark ? "border-b border-gray-700" : "border-b border-gray-200") : "" }`}
                          >
                            {getTypeIcon(result.type)}
                            <div className="min-w-0 flex-1">
                              <div className={`font-medium truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>{result.title}</div>
                              <div className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{result.description}</div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : searchQuery.trim() ? (
                    <div className={`p-4 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      No results found for "{searchQuery}".
                      <button
                        type="button"
                        className={`block mx-auto mt-2 text-sm ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                        onClick={() => {
                          const allCatsTrue = Object.keys(searchCategories).reduce((acc, key) => ({...acc, [key]: true}), {});
                          setSearchCategories(allCatsTrue);
                          // Re-trigger search with all categories
                          const lowerCaseQuery = searchQuery.toLowerCase();
                          const filtered = allSearchableData.filter((item) => 
                              ((item.title && item.title.toLowerCase().includes(lowerCaseQuery)) || (item.description && item.description.toLowerCase().includes(lowerCaseQuery)))
                          );
                          setSearchResults(filtered);
                        }}
                      >
                        Try searching all categories
                      </button>
                    </div>
                  ) : recentSearches.length > 0 && !isLoading ? ( // Show recent searches if query is empty and not loading
                    <div>
                      <div className={`px-4 py-2 text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Recent Searches</div>
                      <ul>
                        {recentSearches.map((search, index) => (
                          <li key={index}>
                            <button
                              type="button"
                              onClick={() => { setSearchQuery(search); handleSearchChange({ target: { value: search } }); }}
                              className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
                            >
                              <Search size={14} className="opacity-70" />{search}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                     <div className={`p-4 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Start typing to search for leads, properties, tasks, and more.
                     </div>
                  )}
                  <div className={`px-4 py-2 text-xs border-t ${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                    <p className="flex items-center gap-1">
                      <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>↑</kbd>
                      <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>↓</kbd> to navigate,
                      <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>Enter</kbd> to select
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right: Nav links and calendar */}
          <ul className="hidden md:flex items-center gap-6 text-sm">
            <li className={`font-bold hover:text-blue-500 cursor-pointer ${isDark ? "text-gray-300" : "text-gray-700"}`}>Team</li>
            <li className="relative">
              <CalendarIcon className={`w-6 h-6 hover:text-blue-500 ${isDark ? "text-gray-300" : "text-gray-700"}`} onClick={toggleCalendar} />
              {calendarOpen && (
                <div className={`absolute top-full mt-2 right-0 z-50 ${isDark ? "bg-gray-800" : "bg-white"} p-2 rounded shadow-lg border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  <DatePicker selected={selectedDate} onChange={(date) => { setSelectedDate(date); setCalendarOpen(false); }} inline calendarClassName={isDark ? "react-datepicker-dark" : ""} />
                </div>
              )}
            </li>
          </ul>

          {/* Mobile search button */}
          <button className="md:hidden text-gray-500 hover:text-blue-500" aria-label="Search" onClick={() => console.warn("Mobile search UI to be implemented. Consider a modal or dedicated search view.")}>
            <Search size={20} />
          </button>
        </div>
      </nav>

      <SearchResultModal isOpen={showResultModal} onClose={() => setShowResultModal(false)} result={selectedResult} />
    </>
  );
};

export default Navbar;

// Basic dark theme styles for react-datepicker (add to your global CSS or a relevant CSS module)
/*
.react-datepicker-dark {
  background-color: #1f2937; // gray-800
  border-color: #374151; // gray-700
}
.react-datepicker-dark .react-datepicker__header {
  background-color: #111827; // gray-900
  border-bottom-color: #374151; // gray-700
}
.react-datepicker-dark .react-datepicker__current-month,
.react-datepicker-dark .react-datepicker-time__header,
.react-datepicker-dark .react-datepicker__day-name {
  color: #d1d5db; // gray-300
}
.react-datepicker-dark .react-datepicker__day {
  color: #e5e7eb; // gray-200
}
.react-datepicker-dark .react-datepicker__day:hover {
  background-color: #374151; // gray-700
}
.react-datepicker-dark .react-datepicker__day--selected,
.react-datepicker-dark .react-datepicker__day--keyboard-selected {
  background-color: #3b82f6; // blue-500
  color: white;
}
.react-datepicker-dark .react-datepicker__day--disabled {
  color: #4b5563; // gray-600
}
.react-datepicker-dark .react-datepicker__navigation-icon::before {
  border-color: #d1d5db; // gray-300
}
*/
