import { useState, useEffect } from "react"
import LeadService from "../services/leadService"

export const useLeadStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the leadService API instance to call the dashboard stats endpoint
      const api = LeadService.getApiInstance ? LeadService.getApiInstance() : LeadService.api
      const response = await api.get("/leads/dashboard_stats/")
      setStats(response.data)
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard statistics")
      console.error("Failed to fetch lead stats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
