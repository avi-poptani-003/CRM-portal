// "use client"

// import React, { useState, useEffect } from "react"
// import { Link, useLocation } from "react-router-dom"
// import { useAuth } from "../../context/AuthContext"
// import { useTheme } from "../../context/ThemeContext"
// import {
//   DashboardIcon,
//   LeadsIcon,
//   PropertiesIcon,
//   VisitsIcon,
//   TeamIcon,
//   AnalyticsIcon,
//   SettingsIcon,
// } from "../icons/DashboardIcons"

// // Proper Logout SVG Icon - Door with arrow design
// const LogoutIcon = (props) => (
//   <svg
//     {...props}
//     fill="none"
//     stroke="currentColor"
//     strokeWidth={1.5}
//     viewBox="0 0 24 24"
//     className="w-5 h-5"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M7 17L3 12M3 12L7 7M3 12H16.5M10 5H18C19.1046 5 20 5.89543 20 7V17C20 18.1046 19.1046 19 18 19H10"
//     />
//   </svg>
// )

// // MenuIcon component for mobile
// const MenuIcon = (props) => (
//   <svg {...props} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
//   </svg>
// )

// const Sidebar = () => {
//   const location = useLocation()
//   const auth = useAuth()
//   const { theme } = useTheme()
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
//   const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024)
//   const userRole = auth.user?.role || "agent"
//   const isDark = theme === "dark"

//   const navItems = [
//     { path: "/dashboard", label: "Dashboard", icon: DashboardIcon, roles: ["admin", "manager", "agent"] },
//     { path: "/dashboard/leads", label: "Leads", icon: LeadsIcon, roles: ["admin", "manager", "agent"] },
//     { path: "/dashboard/properties", label: "Properties", icon: PropertiesIcon, roles: ["admin", "manager", "agent"] },
//     { path: "/dashboard/site-visits", label: "Site Visits", icon: VisitsIcon, roles: ["admin", "manager", "agent"] },
//     { path: "/dashboard/team", label: "Team Management", icon: TeamIcon, roles: ["admin", "manager"] },
//     { path: "/dashboard/analytics", label: "Analytics", icon: AnalyticsIcon, roles: ["admin", "manager"] },
//     { path: "/dashboard/settings", label: "Settings", icon: SettingsIcon, roles: ["admin"] },
//   ]

//   const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

//   // Handle window resize
//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 1024
//       setIsMobileView(mobile)
//       if (!mobile) setIsMobileMenuOpen(false)
//     }

//     window.addEventListener("resize", handleResize)
//     return () => window.removeEventListener("resize", handleResize)
//   }, [])

//   // Close mobile menu when location changes
//   useEffect(() => {
//     setIsMobileMenuOpen(false)
//   }, [location])

//   const handleLogout = () => auth.logout()

//   return (
//     <>
//       {/* Mobile Menu Button */}
//       <button
//         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//         className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${
//           isDark ? "text-white bg-gray-800" : "text-gray-800 bg-white"
//         } shadow-lg`}
//       >
//         <MenuIcon />
//       </button>

//       <aside
//         className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300          ${isMobileView ? "w-64" : "w-[70px] hover:w-64 group"}
//           ${isMobileView && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
//           ${isDark ? "bg-gray-900 text-gray-100" : "bg-[#FFFFFF] text-gray-800"}
//           shadow-lg flex flex-col justify-between`}
//       >
//         {/* Logo */}
//         <div>
//           <div className={`h-[72.5px] flex items-center border-b ${isDark ? "border-gray-800" : "border-gray-300"}`}>
//             <div className="min-w-[70px] flex items-center justify-center">
//               <img src="/vite.svg" alt="Logo" className="h-7 w-7" />
//             </div>
//             <div className="overflow-hidden whitespace-nowrap">
//               <h1
//                 className={`text-lg font-semibold ${
//                   isMobileView ? "opacity-100" : "opacity-0 group-hover:opacity-100"
//                 } transition-opacity duration-300`}
//               >
//                 RealEstate CRM
//               </h1>
//             </div>
//           </div>

//           {/* Profile */}
//           <div className={`h-[70px] flex items-center border-b ${isDark ? "border-gray-800" : "border-gray-300"}`}>
//             <div className="min-w-[70px] flex items-center justify-center">
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
//                 ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-300 text-gray-700"}`}
//               >
//                 {auth.user?.username?.[0]?.toUpperCase() || "U"}
//               </div>
//             </div>
//             <div
//               className={`overflow-hidden whitespace-nowrap ${
//                 isMobileView ? "opacity-100" : "opacity-0 group-hover:opacity-100"
//               } transition-opacity duration-300`}
//             >
//               <h2 className="text-sm font-medium truncate">{auth.user?.username || "User"}</h2>
//               <p className="text-xs capitalize text-gray-500">{userRole}</p>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="py-4">
//             {filteredNavItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`h-[50px] flex items-center transition-all duration-200
//                   ${
//                     location.pathname === item.path
//                       ? "bg-blue-600 text-white"
//                       : isDark
//                         ? "text-gray-300 hover:bg-gray-800 hover:text-white"
//                         : "text-gray-700 hover:bg-gray-300 hover:text-gray-900"
//                   }`}
//               >
//                 <div className="min-w-[70px] flex items-center justify-center">
//                   {React.createElement(item.icon, { className: "w-5 h-5" })}
//                 </div>
//                 <span
//                   className={`overflow-hidden whitespace-nowrap ${
//                     isMobileView ? "opacity-100" : "opacity-0 group-hover:opacity-100"
//                   } transition-opacity duration-300`}
//                 >
//                   {item.label}
//                 </span>
//               </Link>
//             ))}
//           </nav>
//         </div>

//         {/* Logout Button */}
//         <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-300"}`}>
//           <button
//             onClick={handleLogout}
//             className={`h-[50px] w-full flex items-center transition-all duration-200
//               ${isDark ? "text-gray-300 hover:bg-red-900/20 hover:text-red-400" : "text-gray-700 hover:bg-red-100 hover:text-red-600"}`}
//           >
//             <div className="min-w-[70px] flex items-center justify-center">
//               <LogoutIcon />
//             </div>
//             <span
//               className={`overflow-hidden whitespace-nowrap ${
//                 isMobileView ? "opacity-100" : "opacity-0 group-hover:opacity-100"
//               } transition-opacity duration-300`}
//             >
//               Logout
//             </span>
//           </button>
//         </div>
//       </aside>

//       {/* Mobile Menu Overlay */}
//       {isMobileView && isMobileMenuOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMobileMenuOpen(false)} />
//       )}
//     </>
//   )
// }

// export default Sidebar



import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Menu
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const auth = useAuth();
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const userRole = auth.user?.role || "agent";
  const isDark = theme === "dark";

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "agent"] },
    { path: "/dashboard/leads", label: "Leads", icon: Users, roles: ["admin", "manager", "agent"] },
    { path: "/dashboard/properties", label: "Properties", icon: Building2, roles: ["admin", "manager", "agent"] },
    { path: "/dashboard/site-visits", label: "Site Visits", icon: CalendarCheck, roles: ["admin", "manager", "agent"] },
    { path: "/dashboard/team", label: "Team Management", icon: UserCog, roles: ["admin", "manager"] },
    { path: "/dashboard/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "manager"] },
    { path: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileView(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => auth.logout();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${
          isDark ? "text-white bg-gray-800" : "text-gray-800 bg-white"
        } shadow-lg`}
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300
          ${isMobileView ? "w-64" : "w-[70px] hover:w-64 group"}
          ${isMobileView && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
          ${isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}
          shadow-lg flex flex-col justify-between`}
      >
        {/* Logo */}
        <div>
          <div className={`h-[72.5px] flex items-center border-b ${isDark ? "border-gray-800" : "border-gray-300"}`}>
            <div className="min-w-[70px] flex items-center justify-center">
              <img src="/vite.svg" alt="Logo" className="h-7 w-7" />
            </div>
            <div className="overflow-hidden whitespace-nowrap">
              <h1
                className={`text-lg font-semibold ${
                  isMobileView ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                } transition-opacity duration-300`}
              >
                RealEstate CRM
              </h1>
            </div>
          </div>

          {/* Profile */}
          <div className={`h-[70px] flex items-center border-b ${isDark ? "border-gray-800" : "border-gray-300"}`}>
            <div className="min-w-[70px] flex items-center justify-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-300 text-gray-700"}`}
              >
                {auth.user?.username?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
            <div
              className={`overflow-hidden whitespace-nowrap ${
                isMobileView ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } transition-opacity duration-300`}
            >
              <h2 className="text-sm font-medium truncate">{auth.user?.username || "User"}</h2>
              <p className="text-xs capitalize text-gray-500">{userRole}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="py-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`h-[50px] flex items-center transition-all duration-200
                  ${
                    location.pathname === item.path
                      ? "bg-blue-600 text-white"
                      : isDark
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                  }`}
              >
                <div className="min-w-[70px] flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <span
                  className={`overflow-hidden whitespace-nowrap ${
                    isMobileView ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  } transition-opacity duration-300`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-300"}`}>
          <button
            onClick={handleLogout}
            className={`h-[50px] w-full flex items-center transition-all duration-200
              ${isDark ? "text-gray-300 hover:bg-red-900/20 hover:text-red-400" : "text-gray-700 hover:bg-red-100 hover:text-red-600"}`}
          >
            <div className="min-w-[70px] flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span
              className={`overflow-hidden whitespace-nowrap ${
                isMobileView ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } transition-opacity duration-300`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileView && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;