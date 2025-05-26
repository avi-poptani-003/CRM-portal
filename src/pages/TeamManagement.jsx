// import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useTheme } from "../context/ThemeContext";
// import authService from "../services/authService";

// function TeamManagement() {
//   const [users, setUsers] = useState([]);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//     password_confirm: "",
//     first_name: "",
//     last_name: "",
//     phone_number: "",
//     role: "agent",
//   });
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const { user } = useAuth();
//   const { theme } = useTheme();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("All");

//   const isDark = theme === "dark";

//   useEffect(() => {
//     if (user?.role === "admin") {
//       fetchUsers();
//     }
//   }, [user]);

//   const fetchUsers = async () => {
//     try {
//       const data = await authService.getApiInstance().get("/users/");
//       setUsers(data.data);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await authService.getApiInstance().post("/users/", formData);
//       setSuccessMessage("User created successfully!");
//       setError("");
//       setShowCreateModal(false);
//       fetchUsers();
//       setFormData({
//         username: "",
//         email: "",
//         password: "",
//         password_confirm: "",
//         first_name: "",
//         last_name: "",
//         phone_number: "",
//         role: "agent",
//       });
//     } catch (err) {
//       if (err.response?.data?.username) {
//         setError(
//           "Username already exists. Please choose a different username."
//         );
//       } else {
//         setError("Error creating user. Please try again.");
//       }
//     }
//   };

//   const handleDeleteClick = (user) => {
//     setUserToDelete(user);
//     setShowDeleteModal(true);
//   };

//   const handleDeleteConfirm = async () => {
//     try {
//       await authService
//         .getApiInstance()
//         .delete(`/auth/user/${userToDelete.id}/`);
//       setSuccessMessage("User deleted successfully!");
//       setError("");
//       setShowDeleteModal(false);
//       setUserToDelete(null);
//       fetchUsers();
//     } catch (err) {
//       setError(
//         err.response?.data?.detail || "Error deleting user. Please try again."
//       );
//     }
//   };

//   const handleDeleteCancel = () => {
//     setShowDeleteModal(false);
//     setUserToDelete(null);
//   };

//   if (user?.role !== "admin") {
//     return (
//       <div className={`p-4 ${isDark ? "text-white" : "text-gray-800"}`}>
//         You don't have permission to access this page.
//       </div>
//     );
//   }

//   const filteredUsers = users.filter((user) => {
//     const searchMatch =
//       user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email?.toLowerCase().includes(searchTerm.toLowerCase());

//     const roleMatch =
//       roleFilter === "All" ||
//       user.role?.toLowerCase() === roleFilter.toLowerCase();

//     return searchMatch && roleMatch;
//   });

//   return (
//     <div
//       className={`p-6 ${
//         isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
//       }`}
//     >
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//         <h1
//           className={`text-2xl font-bold ${
//             isDark ? "text-white" : "text-gray-800"
//           }`}
//         >
//           Team Management
//         </h1>
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Create New User
//         </button>
//       </div>

//       <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div className="relative w-full md:w-64">
//           <input
//             type="text"
//             placeholder="Search team members..."
//             className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm ${
//               isDark
//                 ? "bg-gray-800 border-gray-700 text-white"
//                 : "bg-white border-gray-300 text-gray-800"
//             }`}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <div className="absolute left-3 top-2.5 text-gray-400">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//               />
//             </svg>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <span
//             className={`text-sm font-medium ${
//               isDark ? "text-gray-300" : "text-gray-700"
//             }`}
//           >
//             Role:
//           </span>
//           <div className="flex space-x-2">
//             {["All", "Manager", "Agent"].map((role) => (
//               <button
//                 key={role}
//                 onClick={() => setRoleFilter(role)}
//                 className={`px-3 py-1 text-sm rounded-full ${
//                   roleFilter === role
//                     ? "bg-blue-600 text-white"
//                     : isDark
//                     ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {role}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}
//       {successMessage && (
//         <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
//           {successMessage}
//         </div>
//       )}

//       {/* Card-based layout for users */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredUsers.length > 0 ? (
//           filteredUsers.map((user) => (
//             <div
//               key={`${user.username}-${user.email}`}
//               className={`rounded-lg shadow-sm overflow-hidden ${
//                 isDark ? "bg-gray-800" : "bg-white"
//               }`}
//             >
//               <div className={`p-4 ${isDark ? "border-gray-700" : ""}`}>
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3
//                       className={`text-lg font-semibold ${
//                         isDark ? "text-white" : "text-gray-800"
//                       }`}
//                     >
//                       {user.first_name} {user.last_name}
//                     </h3>
//                     <span
//                       className={`inline-block px-2 py-1 text-xs rounded-full capitalize mt-1 ${
//                         user.role === "admin"
//                           ? "bg-purple-100 text-purple-800"
//                           : user.role === "manager"
//                           ? "bg-blue-100 text-blue-800"
//                           : "bg-green-100 text-green-800"
//                       }`}
//                     >
//                       {user.role}
//                     </span>
//                   </div>
//                   <button
//                     onClick={() => handleDeleteClick(user)}
//                     className="text-red-600 hover:text-red-800"
//                     aria-label="Delete user"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//               <div className="p-4">
//                 <div
//                   className={`grid grid-cols-1 gap-2 ${
//                     isDark ? "text-gray-300" : "text-gray-700"
//                   }`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 opacity-70"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                       />
//                     </svg>
//                     <span>{user.username}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 opacity-70"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                       />
//                     </svg>
//                     <span className="truncate">{user.email}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div
//             className={`col-span-full p-8 text-center rounded-lg ${
//               isDark ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"
//             }`}
//           >
//             No users found matching your filters
//           </div>
//         )}
//       </div>

//       {/* Create User Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
//           <div
//             className={`relative p-0 w-full max-w-md shadow-lg rounded-lg overflow-hidden ${
//               isDark ? "bg-gray-800 border-gray-700" : "bg-white"
//             }`}
//           >
//             {/* Modal Header */}
//             <div
//               className={`px-6 py-4 border-b ${
//                 isDark ? "border-gray-700" : "border-gray-200"
//               }`}
//             >
//               <div className="flex justify-between items-center">
//                 <h3
//                   className={`text-lg font-medium ${
//                     isDark ? "text-white" : "text-gray-800"
//                   }`}
//                 >
//                   Create New User
//                 </h3>
//                 <button
//                   onClick={() => setShowCreateModal(false)}
//                   className={`${
//                     isDark
//                       ? "text-gray-300 hover:text-gray-100"
//                       : "text-gray-500 hover:text-gray-700"
//                   } focus:outline-none`}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             {/* Form Body */}
//             <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label
//                       className={`block text-sm font-medium ${
//                         isDark ? "text-gray-300" : "text-gray-700"
//                       }`}
//                     >
//                       First Name
//                     </label>
//                     <input
//                       type="text"
//                       name="first_name"
//                       value={formData.first_name}
//                       onChange={handleChange}
//                       required
//                       className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
//                         isDark
//                           ? "bg-gray-700 border-gray-600 text-white"
//                           : "bg-white border-gray-300 text-gray-800"
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label
//                       className={`block text-sm font-medium ${
//                         isDark ? "text-gray-300" : "text-gray-700"
//                       }`}
//                     >
//                       Last Name
//                     </label>
//                     <input
//                       type="text"
//                       name="last_name"
//                       value={formData.last_name}
//                       onChange={handleChange}
//                       required
//                       className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
//                         isDark
//                           ? "bg-gray-700 border-gray-600 text-white"
//                           : "bg-white border-gray-300 text-gray-800"
//                       }`}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     className={`block text-sm font-medium ${
//                       isDark ? "text-gray-300" : "text-gray-700"
//                     }`}
//                   >
//                     Username
//                   </label>
//                   <input
//                     type="text"
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     required
//                     className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
//                       isDark
//                         ? "bg-gray-700 border-gray-600 text-white"
//                         : "bg-white border-gray-300 text-gray-800"
//                     }`}
//                   />
//                 </div>

//                 <div>
//                   <label
//                     className={`block text-sm font-medium ${
//                       isDark ? "text-gray-300" : "text-gray-700"
//                     }`}
//                   >
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
//                       isDark
//                         ? "bg-gray-700 border-gray-600 text-white"
//                         : "bg-white border-gray-300 text-gray-800"
//                     }`}
//                   />
//                 </div>

//                 <div>
//                   <label
//                     className={`block text-sm font-medium ${
//                       isDark ? "text-gray-300" : "text-gray-700"
//                     }`}
//                   >
//                     Phone Number
//                   </label>
//                   <input
//                     type="text"
//                     name="phone_number"
//                     value={formData.phone_number}
//                     onChange={handleChange}
//                     className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
//                       isDark
//                         ? "bg-gray-700 border-gray-600 text-white"
//                         : "bg-white border-gray-300 text-gray-800"
//                     }`}
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label
//                       className={`block text-sm font-medium ${
//                         isDark ? "text-gray-300" : "text-gray-700"
//                       }`}
//                     >
//                       Password
//                     </label>
//                     <input
//                       type="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                       className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
//                         isDark
//                           ? "bg-gray-700 border-gray-600 text-white"
//                           : "bg-white border-gray-300 text-gray-800"
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <label
//                       className={`block text-sm font-medium ${
//                         isDark ? "text-gray-300" : "text-gray-700"
//                       }`}
//                     >
//                       Confirm Password
//                     </label>
//                     <input
//                       type="password"
//                       name="password_confirm"
//                       value={formData.password_confirm}
//                       onChange={handleChange}
//                       required
//                       className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
//                         isDark
//                           ? "bg-gray-700 border-gray-600 text-white"
//                           : "bg-white border-gray-300 text-gray-800"
//                       }`}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label
//                     className={`block text-sm font-medium ${
//                       isDark ? "text-gray-300" : "text-gray-700"
//                     }`}
//                   >
//                     Role
//                   </label>
//                   <select
//                     name="role"
//                     value={formData.role}
//                     onChange={handleChange}
//                     className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
//                       isDark
//                         ? "bg-gray-700 border-gray-600 text-white"
//                         : "bg-white border-gray-300 text-gray-800"
//                     }`}
//                   >
//                     <option value="agent">Agent</option>
//                     <option value="manager">Manager</option>
//                   </select>
//                 </div>
//               </form>
//             </div>

//             {/* Modal Footer */}
//             <div
//               className={`px-6 py-4 border-t ${
//                 isDark ? "border-gray-700" : "border-gray-200"
//               }`}
//             >
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowCreateModal(false)}
//                   className={`px-4 py-2 rounded ${
//                     isDark
//                       ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                 >
//                   Create User
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && userToDelete && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
//           <div
//             className={`relative p-6 border w-full max-w-md shadow-lg rounded-md ${
//               isDark
//                 ? "bg-gray-800 border-gray-700"
//                 : "bg-white border-gray-300"
//             }`}
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3
//                 className={`text-lg font-medium ${
//                   isDark ? "text-white" : "text-gray-800"
//                 }`}
//               >
//                 Delete User
//               </h3>
//               <button
//                 onClick={handleDeleteCancel}
//                 className={`${
//                   isDark ? "text-gray-300" : "text-gray-500"
//                 } hover:text-gray-700`}
//               >
//                 ×
//               </button>
//             </div>
//             <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-800"}`}>
//               Are you sure you want to delete{" "}
//               <span className="font-semibold">
//                 {userToDelete.first_name} {userToDelete.last_name}
//               </span>
//               ? This action cannot be undone.
//             </p>
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={handleDeleteCancel}
//                 className={`px-4 py-2 rounded ${
//                   isDark
//                     ? "bg-gray-600 text-gray-300 hover:bg-gray-700"
//                     : "bg-gray-300 text-gray-700 hover:bg-gray-400"
//                 }`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteConfirm}
//                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//               >
//                 Delete User
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default TeamManagement;
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import authService from "../services/authService";

// --- Icon Components ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// --- Main TeamManagement Component ---
function TeamManagement() {
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    role: "agent",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await authService.getApiInstance().get("/users/");
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users.");
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await authService.getApiInstance().post("/users/", formData);
      setSuccessMessage("User created successfully!");
      setError("");
      setShowCreateModal(false);
      fetchUsers();
      setFormData({
        username: "",
        email: "",
        password: "",
        password_confirm: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        role: "agent",
      });
    } catch (err) {
      setError(
        err.response?.data?.username?.[0] ||
          "Error creating user. Please try again."
      );
    }
  };

  const handleEditClick = (user) => {
    console.log("Edit user:", user);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await authService
        .getApiInstance()
        .delete(`/auth/user/${userToDelete.id}/`);
      setSuccessMessage("User deleted successfully!");
      setError("");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Error deleting user. Please try again."
      );
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const searchLower = searchTerm.toLowerCase();
        const roleLower = roleFilter.toLowerCase();
        const matchesSearch =
          u.first_name?.toLowerCase().includes(searchLower) ||
          u.last_name?.toLowerCase().includes(searchLower) ||
          u.username?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower);
        const matchesRole =
          roleFilter === "All" || u.role?.toLowerCase() === roleLower;
        return matchesSearch && matchesRole;
      }),
    [users, searchTerm, roleFilter]
  );

  if (user?.role !== "admin") {
    return (
      <div className={`p-4 ${isDark ? "text-white" : "text-gray-800"}`}>
        You don't have permission to access this page.
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${isDark ? "bg-black" : "bg-gray-100"}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Team Management
          </h1>
          <p
            className={`mt-1 text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage your team members.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition-colors"
        >
          Create New User
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-20">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <div key={u.id} className="relative">
              <div className="relative pt-16">
                {/* Card Background */}
                <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 text-center">
                  {/* User Info */}
                  <div className="mt-12">
                    <h3 className="text-white text-xl font-bold uppercase tracking-widest">
                      {u.first_name} {u.last_name}
                    </h3>
                    <p className="text-gray-400 text-sm capitalize mt-1">
                      {u.role}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-center items-center space-x-4">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-800 rounded-lg hover:bg-white transition-colors"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(u)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-800 rounded-lg hover:bg-white transition-colors"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
                {/* Floating Profile Image */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 p-1 bg-gray-900 rounded-2xl">
                  <div className="w-full h-full rounded-xl bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600 overflow-hidden">
                    {/* Placeholder for actual image */}
                    {u.first_name?.[0]?.toUpperCase()}
                    {u.last_name?.[0]?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`col-span-full p-10 text-center rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-medium">No users found</h3>
            <p className="text-sm text-gray-500">
              No users match your current search and filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* --- Modals are unchanged --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div
            className={`rounded-lg shadow-xl w-full max-w-md ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}
          >
            <div
              className={`px-6 py-4 border-b ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3
                  className={`text-lg font-medium ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Create New User
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`text-gray-400 hover:text-gray-200 transition-colors`}
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    isDark={isDark}
                    required
                  />
                  <InputField
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    isDark={isDark}
                    required
                  />
                </div>
                <InputField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  isDark={isDark}
                  required
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  isDark={isDark}
                  required
                />
                <InputField
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  isDark={isDark}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    isDark={isDark}
                    required
                  />
                  <InputField
                    label="Confirm Password"
                    name="password_confirm"
                    type="password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    isDark={isDark}
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-md p-2 shadow-sm ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  >
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </form>
            </div>
            <div
              className={`px-6 py-4 border-t ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div
            className={`relative p-6 border w-full max-w-md shadow-lg rounded-lg ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            <h3
              className={`text-lg font-medium ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Delete User
            </h3>
            <p className={`my-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {userToDelete.first_name} {userToDelete.last_name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isDark
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for form inputs
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  isDark,
  required = false,
}) => (
  <div>
    <label
      className={`block text-sm font-medium mb-1 ${
        isDark ? "text-gray-300" : "text-gray-700"
      }`}
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${
        isDark
          ? "bg-gray-700 border-gray-600 text-white"
          : "bg-white border-gray-300 text-gray-800"
      }`}
    />
  </div>
);

export default TeamManagement;
