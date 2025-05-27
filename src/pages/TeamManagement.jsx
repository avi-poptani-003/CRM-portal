import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; //
import { useTheme } from "../context/ThemeContext"; //
import authService from "../services/authService"; //

function TeamManagement() {
  const [users, setUsers] = useState([]); //
  const [showCreateModal, setShowCreateModal] = useState(false); //
  const [showDeleteModal, setShowDeleteModal] = useState(false); //
  const [userToDelete, setUserToDelete] = useState(null); //
  const [formData, setFormData] = useState({ //
    username: "", //
    email: "", //
    password: "", //
    password_confirm: "", //
    first_name: "", //
    last_name: "", //
    phone_number: "", //
    role: "agent", //
  });
  const [error, setError] = useState(""); //
  const [successMessage, setSuccessMessage] = useState(""); //
  const { user } = useAuth(); //
  const { theme } = useTheme(); //
  const [searchTerm, setSearchTerm] = useState(""); //
  const [roleFilter, setRoleFilter] = useState("All"); //

  const isDark = theme === "dark"; //

  useEffect(() => {
    if (user?.role === "admin") { //
      fetchUsers(); //
    }
  }, [user]); //

  const fetchUsers = async () => {
    try {
      const data = await authService.getApiInstance().get("/users/"); //
      setUsers(data.data); //
    } catch (error) {
      console.error("Error fetching users:", error); //
    }
  };

  const handleChange = (e) => {
    setFormData({ //
      ...formData, //
      [e.target.name]: e.target.value, //
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); //
    try {
      await authService.getApiInstance().post("/users/", formData); //
      setSuccessMessage("User created successfully!"); //
      setError(""); //
      setShowCreateModal(false); //
      fetchUsers(); //
      setFormData({ //
        username: "", //
        email: "", //
        password: "", //
        password_confirm: "", //
        first_name: "", //
        last_name: "", //
        phone_number: "", //
        role: "agent", //
      });
    } catch (err) {
      if (err.response?.data?.username) { //
        setError( //
          "Username already exists. Please choose a different username."
        );
      } else {
        setError("Error creating user. Please try again."); //
      }
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user); //
    setShowDeleteModal(true); //
  };

  const handleDeleteConfirm = async () => {
    try {
      await authService //
        .getApiInstance() //
        .delete(`/auth/user/${userToDelete.id}/`); //
      setSuccessMessage("User deleted successfully!"); //
      setError(""); //
      setShowDeleteModal(false); //
      setUserToDelete(null); //
      fetchUsers(); //
    } catch (err) {
      setError( //
        err.response?.data?.detail || "Error deleting user. Please try again." //
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false); //
    setUserToDelete(null); //
  };

  if (user?.role !== "admin") { //
    return (
      <div className={`p-4 ${isDark ? "text-white" : "text-gray-800"}`}>
        You don't have permission to access this page.
      </div>
    );
  }

  const filteredUsers = users.filter((user) => { //
    const searchMatch = //
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || //
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || //
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || //
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()); //

    const roleMatch = //
      roleFilter === "All" || //
      user.role?.toLowerCase() === roleFilter.toLowerCase(); //

    return searchMatch && roleMatch; //
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${ //
      lastName?.charAt(0) || "" //
    }`.toUpperCase(); //
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) { //
      case "admin": //
        return isDark //
          ? "bg-purple-900 text-purple-200 border-purple-700" //
          : "bg-purple-100 text-purple-800 border-purple-200"; //
      case "manager": //
        return isDark //
          ? "bg-blue-900 text-blue-200 border-blue-700" //
          : "bg-blue-100 text-blue-800 border-blue-200"; //
      case "agent": //
        return isDark //
          ? "bg-green-900 text-green-200 border-green-700" //
          : "bg-green-100 text-green-800 border-green-200"; //
      default:
        return isDark //
          ? "bg-gray-700 text-gray-300 border-gray-600" //
          : "bg-gray-100 text-gray-800 border-gray-200"; //
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role?.toLowerCase()) { //
      case "manager": //
        return "Manager"; //
      case "agent": //
        return "Agent"; //
      case "admin": //
        return "Administrator"; //
      default:
        return role; //
    }
  };

  return (
    <div
      className={`p-6 min-h-screen ${ //
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800" //
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1
          className={`text-3xl font-bold ${ //
            isDark ? "text-white" : "text-gray-900" //
          }`}
        >
          Team Management
        </h1>
        <button
          onClick={() => setShowCreateModal(true)} //
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium" //
        >
          Create New User
        </button>
      </div>

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text" //
            placeholder="Search team members..." //
            className={`w-full pl-12 pr-4 py-3 border rounded-lg shadow-sm transition-colors ${ //
              isDark //
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" //
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500" //
            }`}
            value={searchTerm} //
            onChange={(e) => setSearchTerm(e.target.value)} //
          />
          <div className="absolute left-4 top-3.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg" //
              className="h-5 w-5" //
              fill="none" //
              viewBox="0 0 24 24" //
              stroke="currentColor" //
            >
              <path
                strokeLinecap="round" //
                strokeLinejoin="round" //
                strokeWidth={2} //
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" //
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-medium ${ //
              isDark ? "text-gray-300" : "text-gray-700" //
            }`}
          >
            Filter by role:
          </span>
          <div className="flex space-x-2">
            {["All", "Manager", "Agent"].map((role) => ( //
              <button
                key={role} //
                onClick={() => setRoleFilter(role)} //
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${ //
                  roleFilter === role //
                    ? "bg-blue-600 text-white" //
                    : isDark //
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600" //
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200" //
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && ( //
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && ( //
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.length > 0 ? ( //
          filteredUsers.map((user) => ( //
            <div
              key={`${user.username}-${user.email}`} //
              className={`relative rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border ${ //
                isDark //
                  ? "bg-gray-800 border-gray-700" //
                  : "bg-white border-gray-100" //
              }`}
            >
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteClick(user)} //
                className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-sm hover:text-red-600 transition-colors ${ //
                  isDark //
                    ? "bg-gray-700 text-gray-300 hover:bg-red-900" //
                    : "bg-white text-gray-600 hover:bg-red-50" //
                }`}
                aria-label="Delete user" //
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg" //
                  className="h-4 w-4" //
                  fill="none" //
                  viewBox="0 0 24 24" //
                  stroke="currentColor" //
                >
                  <path
                    strokeLinecap="round" //
                    strokeLinejoin="round" //
                    strokeWidth={2} //
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" //
                  />
                </svg>
              </button>

              {/* Card Content */}
              <div className="p-6 text-center">
                {/* Profile Image */}
                <div className="mb-4 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                </div>
                {/* Name */}
                <h3
                  className={`text-xl font-bold mb-1 ${ //
                    isDark ? "text-white" : "text-gray-900" //
                  }`}
                >
                  {user.first_name} {user.last_name}
                </h3>
                {/* Role Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full border capitalize ${getRoleColor( //
                      user.role //
                    )}`}
                  >
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                {/* Contact Info */}
                <div className="space-y-3">
                  <div
                    className={`flex items-center justify-center gap-2 text-sm ${ //
                      isDark ? "text-gray-300" : "text-gray-600" //
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg" //
                      className="h-4 w-4" //
                      fill="none" //
                      viewBox="0 0 24 24" //
                      stroke="currentColor" //
                    >
                      <path
                        strokeLinecap="round" //
                        strokeLinejoin="round" //
                        strokeWidth={2} //
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" //
                      />
                    </svg>
                    <span className="truncate">{user.username}</span>
                  </div>

                  <div
                    className={`flex items-center justify-center gap-2 text-sm ${ //
                      isDark ? "text-gray-300" : "text-gray-600" //
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg" //
                      className="h-4 w-4" //
                      fill="none" //
                      viewBox="0 0 24 24" //
                      stroke="currentColor" //
                    >
                      <path
                        strokeLinecap="round" //
                        strokeLinejoin="round" //
                        strokeWidth={2} //
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" //
                      />
                    </svg>
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`col-span-full p-12 text-center rounded-2xl ${ //
              isDark ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500" //
            }`}
          >
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400" //
                fill="none" //
                viewBox="0 0 24 24" //
                stroke="currentColor" //
              >
                <path
                  strokeLinecap="round" //
                  strokeLinejoin="round" //
                  strokeWidth={2} //
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" //
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No team members found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && ( //
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${ //
              isDark ? "bg-gray-800 border-gray-700" : "bg-white" //
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b ${ //
                isDark ? "border-gray-700" : "border-gray-200" //
              }`}
            >
              <div className="flex justify-between items-center">
                <h3
                  className={`text-xl font-bold ${ //
                    isDark ? "text-white" : "text-gray-900" //
                  }`}
                >
                  Create New User
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)} //
                  className={`p-2 rounded-lg hover:bg-gray-100 ${ //
                    isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-500" //
                  }`}
                >
                  <svg
                    className="h-5 w-5" //
                    viewBox="0 0 20 20" //
                    fill="currentColor" //
                  >
                    <path
                      fillRule="evenodd" //
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" //
                      clipRule="evenodd" //
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${ //
                      isDark ? "text-gray-300" : "text-gray-700" //
                    }`}
                  >
                    First Name
                  </label>
                  <input
                    type="text" //
                    name="first_name" //
                    value={formData.first_name} //
                    onChange={handleChange} //
                    required //
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${ //
                      isDark //
                        ? "bg-gray-700 border-gray-600 text-white" //
                        : "bg-white border-gray-300 text-gray-800" //
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${ //
                      isDark ? "text-gray-300" : "text-gray-700" //
                    }`}
                  >
                    Last Name
                  </label>
                  <input
                    type="text" //
                    name="last_name" //
                    value={formData.last_name} //
                    onChange={handleChange} //
                    required //
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${ //
                      isDark //
                        ? "bg-gray-700 border-gray-600 text-white" //
                        : "bg-white border-gray-300 text-gray-800" //
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${ //
                      isDark ? "text-gray-300" : "text-gray-700" //
                    }`}
                  >
                    Username
                  </label>
                  <input
                    type="text" //
                    name="username" //
                    value={formData.username} //
                    onChange={handleChange} //
                    required //
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${ //
                      isDark //
                        ? "bg-gray-700 border-gray-600 text-white" //
                        : "bg-white border-gray-300 text-gray-800" //
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${ //
                      isDark ? "text-gray-300" : "text-gray-700" //
                    }`}
                  >
                    Email
                  </label>
                  <input
                    type="email" //
                    name="email" //
                    value={formData.email} //
                    onChange={handleChange} //
                    required //
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${ //
                      isDark //
                        ? "bg-gray-700 border-gray-600 text-white" //
                        : "bg-white border-gray-300 text-gray-800" //
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${ //
                      isDark ? "text-gray-300" : "text-gray-700" //
                    }`}
                  >
                    Phone Number
                  </label>
                  <input
                    type="text" //
                    name="phone_number" //
                    value={formData.phone_number} //
                    onChange={handleChange} //
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${ //
                      isDark //
                        ? "bg-gray-700 border-gray-600 text-white" //
                        : "bg-white border-gray-300 text-gray-800" //
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${ //
                      isDark ? "text-gray-300" : "text-gray-700" //
                    }`}
                  >
                    Role
                  </label>
                  <select
                    name="role" //
                    value={formData.role} //
                    onChange={handleChange} //
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${ //
                      isDark //
                        ? "bg-gray-700 border-gray-600 text-white" //
                        : "bg-white border-gray-300 text-gray-800" //
                    }`}
                  >
                    <option value="agent">Agent</option> 
                    <option value="manager">Manager</option> 
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${ //
                      isDark ? "text-gray-300" : "text-gray-700" //
                    }`}
                  >
                    Password
                  </label>
                  <input
                    type="password" //
                    name="password" //
                    value={formData.password} //
                    onChange={handleChange} //
                    required //
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${ //
                      isDark //
                        ? "bg-gray-700 border-gray-600 text-white" //
                        : "bg-white border-gray-300 text-gray-800" //
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${ //
                      isDark ? "text-gray-300" : "text-gray-700" //
                    }`}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password" //
                    name="password_confirm" //
                    value={formData.password_confirm} //
                    onChange={handleChange} //
                    required //
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${ //
                      isDark //
                        ? "bg-gray-700 border-gray-600 text-white" //
                        : "bg-white border-gray-300 text-gray-800" //
                    }`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateModal(false)} //
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${ //
                    isDark //
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" //
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200" //
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit} //
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors" //
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && ( //
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`relative p-6 w-full max-w-md rounded-2xl shadow-xl ${ //
              isDark ? "bg-gray-800 border-gray-700" : "bg-white" //
            }`}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600" //
                  fill="none" //
                  viewBox="0 0 24 24" //
                  stroke="currentColor" //
                >
                  <path
                    strokeLinecap="round" //
                    strokeLinejoin="round" //
                    strokeWidth={2} //
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z" //
                  />
                </svg>
              </div>

              <h3
                className={`text-lg font-bold mb-2 ${ //
                  isDark ? "text-white" : "text-gray-900" //
                }`}
              >
                Delete User
              </h3>

              <p
                className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`} //
              >
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {userToDelete.first_name} {userToDelete.last_name} 
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleDeleteCancel} //
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${ //
                    isDark //
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" //
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200" //
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm} //
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors" //
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamManagement; //