// "use client"

// import { useState } from "react"
// import DatePicker from "react-datepicker"
// import "react-datepicker/dist/react-datepicker.css"
// import { useTheme } from "../../context/ThemeContext"

// const CalendarIcon = ({ className, onClick }) => (
//   <svg
//     onClick={onClick}
//     className={className}
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     viewBox="0 0 24 0 24"
//     xmlns="http://www.w3.org/2000/svg"
//     aria-hidden="true"
//     style={{ cursor: "pointer" }}
//   >
//     <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
//     <line x1="16" y1="2" x2="16" y2="6"></line>
//     <line x1="8" y1="2" x2="8" y2="6"></line>
//     <line x1="3" y1="10" x2="21" y2="10"></line>
//   </svg>
// )

// const Navbar = () => {
//   const { theme } = useTheme()
//   const isDark = theme === "dark"

//   const [calendarOpen, setCalendarOpen] = useState(false)
//   const [selectedDate, setSelectedDate] = useState(null)

//   const toggleCalendar = () => {
//     setCalendarOpen((prev) => !prev)
//   }

//   return (
//     <nav
//       className={`w-full px-6 py-5.5  ${
//         isDark ? "bg-gray-900 border-gray-700" : "bg-[#FFFFFF] border-gray-200"
//       }`}
//     >
//       <div className="relative flex justify-between items-center gap-4">
//         {/* Left: Logo */}
//         <div className="text-xl font-bold text-blue-600">RealEstate CRM</div>

//         {/* Center: Search (absolutely centered) */}
//         <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xs hidden md:block">
//           <input
//             type="search"
//             placeholder="Search..."
//             className={`w-full px-3 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500
//               ${
//                 isDark
//                   ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400"
//                   : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
//               }`}
//           />
//         </div>

//         {/* Right: Nav links and calendar */}
//         <ul className="hidden md:flex items-center gap-6 text-sm">
//           <li className={`font-bold hover:text-blue-500 cursor-pointer ${isDark ? "text-gray-300" : "text-gray-700"}`}>
//             Team
//           </li>

//           <li className="relative">
//             <CalendarIcon
//               className={`w-6 h-6 hover:text-blue-500 ${isDark ? "text-gray-300" : "text-gray-700"}`}
//               onClick={toggleCalendar}
//             />
//             {calendarOpen && (
//               <div
//                 className={`absolute top-8 right-0 z-50 ${isDark ? "bg-gray-800" : "bg-white"} p-2 rounded shadow-lg`}
//               >
//                 <DatePicker
//                   selected={selectedDate}
//                   onChange={(date) => {
//                     setSelectedDate(date)
//                     setCalendarOpen(false)
//                   }}
//                   inline
//                   calendarClassName={isDark ? "react-datepicker-dark" : ""}
//                 />
//               </div>
//             )}
//           </li>
//         </ul>
//       </div>
//     </nav>
//   )
// }

// export default Navbar




"use client"

import { useState, useEffect, useRef } from "react"
// import { useNavigate } from "react-router-dom" // Remove or comment out unused import
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useTheme } from "../../context/ThemeContext"
import { Search, X, Loader2, User, Home, Calendar, Users, FileText } from "lucide-react" // Import more icons
import SearchResultModal from "./SearchResultModal" // Import the new modal component

const CalendarIcon = ({ className, onClick }) => (
  <svg
    onClick={onClick}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 0 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ cursor: "pointer" }}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)

// More comprehensive sample search data
const sampleSearchData = [
  // Leads
  { id: 1, type: "lead", title: "John Smith", description: "New lead from website", url: "/leads/1" },
  { id: 2, type: "lead", title: "Emily Johnson", description: "Contacted via email", url: "/leads/2" },
  { id: 3, type: "lead", title: "Michael Rodriguez", description: "Qualified lead", url: "/leads/3" },
  { id: 4, type: "lead", title: "Sarah Thompson", description: "Converted lead", url: "/leads/4" },
  { id: 5, type: "lead", title: "David Wilson", description: "Dropped lead", url: "/leads/5" },

  // Properties
  { id: 1, type: "property", title: "Green Valley Homes", description: "Residential property", url: "/properties/1" },
  { id: 2, type: "property", title: "Urban Heights Tower", description: "Commercial property", url: "/properties/2" },
  { id: 3, type: "property", title: "Lakeside Villas", description: "Residential property", url: "/properties/3" },
  { id: 4, type: "property", title: "Sunset Apartments", description: "Residential property", url: "/properties/4" },
  { id: 5, type: "property", title: "Metro Business Park", description: "Commercial property", url: "/properties/5" },

  // Tasks
  { id: 1, type: "task", title: "Call John Smith", description: "Follow up on inquiry", url: "/tasks/1" },
  { id: 2, type: "task", title: "Email Emily Johnson", description: "Send property details", url: "/tasks/2" },
  { id: 3, type: "task", title: "Schedule site visit", description: "For Lakeside Villas", url: "/tasks/3" },
  { id: 4, type: "task", title: "Prepare proposal", description: "For Metro Business Park", url: "/tasks/4" },
  { id: 5, type: "task", title: "Update CRM", description: "Add new leads from exhibition", url: "/tasks/5" },

  // Users
  { id: 1, type: "user", title: "Alex Johnson", description: "Sales Manager", url: "/users/1" },
  { id: 2, type: "user", title: "Maria Rodriguez", description: "Sales Agent", url: "/users/2" },
  { id: 3, type: "user", title: "David Wilson", description: "Sales Agent", url: "/users/3" },
  { id: 4, type: "user", title: "James Chen", description: "Sales Agent", url: "/users/4" },
  { id: 5, type: "user", title: "Laura Miller", description: "Sales Agent", url: "/users/5" },
]

const Navbar = () => {
  // Remove the unused navigate variable
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  // Search states
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1)
  const [searchCategories, setSearchCategories] = useState({
    lead: true,
    property: true,
    task: true,
    user: true,
  })

  // Modal state
  const [selectedResult, setSelectedResult] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const searchRef = useRef(null)
  const searchInputRef = useRef(null)
  const resultsRef = useRef(null)

  const toggleCalendar = () => {
    setCalendarOpen((prev) => !prev)
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setSelectedResultIndex(-1)

    if (query.trim().length > 0) {
      setIsSearching(true)
      setShowResults(true)

      // Simulate search delay
      setTimeout(() => {
        // Filter sample data based on query and active categories
        const results = sampleSearchData.filter((item) => {
          const matchesQuery =
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())

          const categoryEnabled = searchCategories[item.type]

          return matchesQuery && categoryEnabled
        })

        setSearchResults(results)
        setIsSearching(false)
      }, 300)
    } else {
      setShowResults(false)
      setSearchResults([])
    }
  }

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()

    if (searchQuery.trim()) {
      // Add to recent searches if not already there
      if (!recentSearches.includes(searchQuery.trim())) {
        const newRecentSearches = [searchQuery.trim(), ...recentSearches.slice(0, 4)]
        setRecentSearches(newRecentSearches)
        localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches))
      }

      // If a result is selected, navigate to it
      if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
        navigateToResult(searchResults[selectedResultIndex])
      } else if (searchResults.length > 0) {
        // Navigate to first result if none selected
        navigateToResult(searchResults[0])
      } else {
        // Show a message that no results were found
        alert(`No results found for "${searchQuery}". Try a different search term.`)
      }

      // Close results
      setShowResults(false)
    }
  }

  // Navigate to a search result
  const navigateToResult = (result) => {
    // Add to recent searches
    if (!recentSearches.includes(searchQuery.trim())) {
      const newRecentSearches = [searchQuery.trim(), ...recentSearches.slice(0, 4)]
      setRecentSearches(newRecentSearches)
      localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches))
    }

    // Instead of navigating, show the modal with result details
    setSelectedResult(result)
    setShowResultModal(true)

    // Close results and clear query
    setShowResults(false)
    setSearchQuery("")
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
    setSelectedResultIndex(-1)
    searchInputRef.current?.focus()
  }

  // Toggle search category
  const toggleCategory = (category) => {
    setSearchCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))

    // Re-run search with updated filters
    if (searchQuery.trim()) {
      setIsSearching(true)

      setTimeout(() => {
        const updatedCategories = {
          ...searchCategories,
          [category]: !searchCategories[category],
        }

        const results = sampleSearchData.filter((item) => {
          const matchesQuery =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())

          const categoryEnabled = updatedCategories[item.type]

          return matchesQuery && categoryEnabled
        })

        setSearchResults(results)
        setIsSearching(false)
      }, 300)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedResultIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev))

      // Scroll into view if needed
      if (resultsRef.current && selectedResultIndex >= 0) {
        const items = resultsRef.current.querySelectorAll("li")
        if (items[selectedResultIndex + 1]) {
          items[selectedResultIndex + 1].scrollIntoView({ block: "nearest" })
        }
      }
    }

    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : 0))

      // Scroll into view if needed
      if (resultsRef.current && selectedResultIndex > 0) {
        const items = resultsRef.current.querySelectorAll("li")
        if (items[selectedResultIndex - 1]) {
          items[selectedResultIndex - 1].scrollIntoView({ block: "nearest" })
        }
      }
    }

    // Enter key
    else if (e.key === "Enter" && selectedResultIndex >= 0) {
      e.preventDefault()
      navigateToResult(searchResults[selectedResultIndex])
    }

    // Escape key
    else if (e.key === "Escape") {
      setShowResults(false)
    }
  }

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }
  }, [])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get icon for result type
  const getTypeIcon = (type) => {
    switch (type) {
      case "lead":
        return <User className="text-blue-500" size={18} />
      case "property":
        return <Home className="text-green-500" size={18} />
      case "task":
        return <Calendar className="text-orange-500" size={18} />
      case "user":
        return <Users className="text-purple-500" size={18} />
      default:
        return <FileText className="text-gray-500" size={18} />
    }
  }

  return (
    <>
      <nav className={`w-full px-6 py-5.5 ${isDark ? "bg-gray-900 border-gray-700" : "bg-[#FFFFFF] border-gray-200"}`}>
        <div className="relative flex justify-between items-center gap-4">
          {/* Left: Logo */}
          <div className="text-xl font-bold text-blue-600">RealEstate CRM</div>

          {/* Center: Search (absolutely centered) */}
          <div ref={searchRef} className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} className={`${isDark ? "text-gray-400" : "text-gray-500"}`} />
                </div>

                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search leads, properties, tasks..."
                  className={`w-full pl-10 pr-10 py-2 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400"
                        : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
                    }
                    ${showResults ? (isDark ? "rounded-b-none border-b-0" : "rounded-b-none border-b-0") : ""}
                  `}
                />

                {searchQuery && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isSearching ? (
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
                <div
                  className={`absolute z-50 w-full mt-0 overflow-hidden rounded-b-md shadow-lg border-t-0 border border-blue-500
                    ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
                >
                  {/* Search filters */}
                  <div className={`px-4 py-2 flex gap-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    <button
                      type="button"
                      onClick={() => toggleCategory("lead")}
                      className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 transition-colors
                        ${
                          searchCategories.lead
                            ? isDark
                              ? "bg-blue-900/30 text-blue-300"
                              : "bg-blue-100 text-blue-800"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      <User size={12} />
                      Leads
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategory("property")}
                      className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 transition-colors
                        ${
                          searchCategories.property
                            ? isDark
                              ? "bg-green-900/30 text-green-300"
                              : "bg-green-100 text-green-800"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      <Home size={12} />
                      Properties
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategory("task")}
                      className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 transition-colors
                        ${
                          searchCategories.task
                            ? isDark
                              ? "bg-orange-900/30 text-orange-300"
                              : "bg-orange-100 text-orange-800"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      <Calendar size={12} />
                      Tasks
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategory("user")}
                      className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 transition-colors
                        ${
                          searchCategories.user
                            ? isDark
                              ? "bg-purple-900/30 text-purple-300"
                              : "bg-purple-100 text-purple-800"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      <Users size={12} />
                      Users
                    </button>
                  </div>

                  {isSearching ? (
                    <div className={`p-4 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul ref={resultsRef} className="max-h-96 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <li key={`${result.type}-${result.id}`}>
                          <button
                            onClick={() => navigateToResult(result)}
                            className={`block w-full text-left px-4 py-3 items-center gap-3 transition-colors duration-150
                              ${
                                isDark
                                  ? selectedResultIndex === index
                                    ? "bg-blue-900/30"
                                    : "hover:bg-gray-700"
                                  : selectedResultIndex === index
                                    ? "bg-blue-50"
                                    : "hover:bg-gray-50"
                              }
                              ${searchResults.indexOf(result) !== searchResults.length - 1 ? `border-b ${isDark ? "border-gray-700" : "border-gray-200"}` : ""}
                            `}
                          >
                            <span className="flex-shrink-0">{getTypeIcon(result.type)}</span>
                            <div className="min-w-0 flex-1">
                              <div className={`font-medium truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                {result.title}
                              </div>
                              <div className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {result.description}
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : searchQuery.trim() ? (
                    <div className={`p-4 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      <div className="mb-2">No results found for "{searchQuery}"</div>
                      <button
                        className={`text-sm ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                        onClick={() => {
                          // Reset all filters
                          setSearchCategories({
                            lead: true,
                            property: true,
                            task: true,
                            user: true,
                          })

                          // Re-run search
                          handleSearchChange({ target: { value: searchQuery } })
                        }}
                      >
                        Try searching in all categories
                      </button>
                    </div>
                  ) : recentSearches.length > 0 ? (
                    <div>
                      <div className={`px-4 py-2 text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Recent Searches
                      </div>
                      <ul>
                        {recentSearches.map((search, index) => (
                          <li key={index}>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery(search)
                                handleSearchChange({ target: { value: search } })
                              }}
                              className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150
                                ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}
                              `}
                            >
                              <Search size={14} className="opacity-70" />
                              {search}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Search tips */}
                  <div
                    className={`px-4 py-2 text-xs border-t ${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}
                  >
                    <p className="flex items-center gap-2">
                      <span>Press</span>
                      <kbd className={`px-1.5 py-0.5 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>↑</kbd>
                      <kbd className={`px-1.5 py-0.5 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>↓</kbd>
                      <span>to navigate,</span>
                      <kbd className={`px-1.5 py-0.5 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>Enter</kbd>
                      <span>to select</span>
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right: Nav links and calendar */}
          <ul className="hidden md:flex items-center gap-6 text-sm">
            <li
              className={`font-bold hover:text-blue-500 cursor-pointer ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Team
            </li>

            <li className="relative">
              <CalendarIcon
                className={`w-6 h-6 hover:text-blue-500 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                onClick={toggleCalendar}
              />
              {calendarOpen && (
                <div
                  className={`absolute top-8 right-0 z-50 ${isDark ? "bg-gray-800" : "bg-white"} p-2 rounded shadow-lg`}
                >
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date)
                      setCalendarOpen(false)
                    }}
                    inline
                    calendarClassName={isDark ? "react-datepicker-dark" : ""}
                  />
                </div>
              )}
            </li>
          </ul>

          {/* Mobile search button */}
          <button className="md:hidden text-gray-500 hover:text-blue-500" aria-label="Search">
            <Search size={20} />
          </button>
        </div>

        {/* Mobile search overlay */}
        <div className="md:hidden">{/* Mobile search implementation would go here */}</div>
      </nav>

      {/* Search Result Modal */}
      <SearchResultModal isOpen={showResultModal} onClose={() => setShowResultModal(false)} result={selectedResult} />
    </>
  )
}

export default Navbar
