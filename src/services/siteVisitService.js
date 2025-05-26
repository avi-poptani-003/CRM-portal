import api from './api'; // This now imports the instance of ApiService from api.js

// Updated URL to match potential double-nesting in Django's router setup.
// If your Django project's main urls.py includes 'apps.site_visits.urls' at 'api/site-visits/'
// AND your apps/site_visits/urls.py uses router.register(r'site-visits', ...),
// then the effective path becomes 'api/site-visits/site-visits/'.
const SITE_VISITS_URL = '/site-visits/site-visits/';
const PROPERTIES_URL = '/properties/'; // Assuming properties are at /api/properties/
const USERS_URL = '/accounts/users/'; // Assuming users are at /api/accounts/users/

const siteVisitService = {
  /**
   * Fetches all site visits from the API.
   * @param {object} params - Optional query parameters for filtering, sorting, etc.
   * @returns {Promise<Array>} A promise that resolves to an array of site visit objects.
   * @throws {Error} If the API call fails.
   */
  getAllSiteVisits: async (params = {}) => {
    try {
      // Use the request method from the ApiService instance
      const response = await api.request(SITE_VISITS_URL, { method: 'get', params });
      return response; // api.request already returns response.data
    } catch (error) {
      console.error("Error fetching all site visits:", error);
      throw error;
    }
  },

  /**
   * Fetches a single site visit by its ID.
   * @param {number|string} id - The ID of the site visit to fetch.
   * @returns {Promise<object>} A promise that resolves to the site visit object.
   * @throws {Error} If the API call fails or the visit is not found.
   */
  getSiteVisitById: async (id) => {
    try {
      // Use the request method from the ApiService instance
      const response = await api.request(`${SITE_VISITS_URL}${id}/`, { method: 'get' });
      return response; // api.request already returns response.data
    } catch (error) {
      console.error(`Error fetching site visit ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new site visit.
   * @param {object} visitData - The data for the new site visit.
   * @returns {Promise<object>} A promise that resolves to the newly created site visit object.
   * @throws {Error} If the API call fails (e.g., validation errors).
   */
  createSiteVisit: async (visitData) => {
    try {
      // Use the request method from the ApiService instance
      const response = await api.request(SITE_VISITS_URL, { method: 'post', body: visitData });
      return response; // api.request already returns response.data
    } catch (error) {
      console.error("Error creating site visit:", error);
      throw error;
    }
  },

  /**
   * Updates an existing site visit.
   * @param {number|string} id - The ID of the site visit to update.
   * @param {object} visitData - The data to update the site visit with (can be partial).
   * @returns {Promise<object>} A promise that resolves to the updated site visit object.
   * @throws {Error} If the API call fails.
   */
  updateSiteVisit: async (id, visitData) => {
    try {
      // Use the request method from the ApiService instance
      const response = await api.request(`${SITE_VISITS_URL}${id}/`, { method: 'patch', body: visitData });
      return response; // api.request already returns response.data
    } catch (error) {
      console.error(`Error updating site visit ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a site visit by its ID.
   * @param {number|string} id - The ID of the site visit to delete.
   * @returns {Promise<object>} A promise that resolves when the deletion is successful.
   * @throws {Error} If the API call fails.
   */
  deleteSiteVisit: async (id) => {
    try {
      // Use the request method from the ApiService instance
      const response = await api.request(`${SITE_VISITS_URL}${id}/`, { method: 'delete' });
      return response; // api.request already returns response.data
    } catch (error) {
      console.error(`Error deleting site visit ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetches all properties from the API.
   * This is a placeholder and assumes a /properties/ endpoint.
   * @param {object} params - Optional query parameters.
   * @returns {Promise<Array>} A promise that resolves to an array of property objects.
   * @throws {Error} If the API call fails.
   */
  getProperties: async (params = {}) => {
    try {
      const response = await api.request(PROPERTIES_URL, { method: 'get', params });
      return response;
    } catch (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }
  },

  /**
   * Fetches all users from the API.
   * This is a placeholder and assumes an /accounts/users/ endpoint.
   * @param {object} params - Optional query parameters.
   * @returns {Promise<Array>} A promise that resolves to an array of user objects.
   * @throws {Error} If the API call fails.
   */
  getUsers: async (params = {}) => {
    try {
      const response = await api.request(USERS_URL, { method: 'get', params });
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
};

export default siteVisitService;
