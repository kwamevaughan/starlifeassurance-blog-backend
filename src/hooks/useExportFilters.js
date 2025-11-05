import { useState, useMemo } from "react";

export default function useExportFilters(users) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  // Safety check for undefined users
  if (!users || !Array.isArray(users)) {
    return {
      filterStatus,
      setFilterStatus,
      dateRange,
      setDateRange,
      filteredUsers: [],
    };
  }

  // Memoize filtered users for better performance
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        if (filterStatus !== "all") {
          return (user.status || "Pending") === filterStatus;
        }
        return true;
      })
      .filter((user) => {
        // If no date range selected, show all users
        if (!dateRange[0].startDate || !dateRange[0].endDate) {
          return true;
        }

        // Handle missing or invalid timestamp
        if (!user.created_at) {
          return false;
        }

        const createdAt = new Date(user.created_at);

        // Verify the date is valid
        if (isNaN(createdAt.getTime())) {
          return false;
        }

        // Normalize dates to handle time portion correctly
        const start = new Date(dateRange[0].startDate);
        start.setHours(0, 0, 0, 0); // Start of day
        const end = new Date(dateRange[0].endDate);
        end.setHours(23, 59, 59, 999); // End of day
        const created = new Date(createdAt);

        return created >= start && created <= end;
      });
  }, [users, filterStatus, dateRange]);

  return {
    filterStatus,
    setFilterStatus,
    dateRange,
    setDateRange,
    filteredUsers,
  };
}
