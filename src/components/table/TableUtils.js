import React from "react";

// Helper function to detect and format monetary values
export const formatDisplayValue = (value, columnAccessor, columnHeader) => {
  if (value === null || value === undefined || value === '') return value;

  const accessor = columnAccessor?.toLowerCase() || '';
  const header = columnHeader?.toLowerCase() || '';
  
  return value;
};

// Function to check if a column has any non-empty data
export const hasColumnData = (accessor, render, safeData) => {
  if (!safeData || safeData.length === 0) return true; // Show all columns if no data

  return safeData.some((row) => {
    if (render) {
      // For columns with custom render functions, check the rendered value
      const renderedValue = render(row);
      if (React.isValidElement && React.isValidElement(renderedValue)) {
        // For React elements, check if it's not just a dash or empty
        return (
          renderedValue.props.children !== "-" &&
          renderedValue.props.children !== "" &&
          !renderedValue.props.className?.includes("text-gray-400")
        );
      }
      // For date columns, be more lenient - show even if some dates are invalid
      if (
        accessor === "timestamp" ||
        accessor === "created_at" ||
        accessor === "updated_at"
      ) {
        return renderedValue !== "-" && renderedValue !== "";
      }
      return renderedValue !== "-" && renderedValue !== "";
    }

    // For regular columns, check the actual value
    const value = row[accessor];
    return (
      value !== null && value !== undefined && value !== "" && value !== 0
    );
  });
};

// Function to automatically determine the best status context
export const getAutoStatusContext = (column, data, customStatusContexts, statusContext) => {
  const columnName = column.accessor.toLowerCase();
  const headerName = column.Header?.toLowerCase() || "";

  // Check custom status contexts first
  if (customStatusContexts[column.accessor]) {
    return customStatusContexts[column.accessor];
  }


  // Default fallback
  return statusContext;
};

// Check if a field is a date field
export const isDateField = (accessor) => {
  return (
    accessor === "timestamp" ||
    accessor === "created_at" ||
    accessor === "updated_at" ||
    accessor === "deleted_at" ||
    accessor === "date" ||
    accessor === "order_date" ||
    accessor === "sale_date" ||
    accessor === "purchase_date" ||
    accessor === "due_date" ||
    accessor === "expiry_date" ||
    accessor === "start_date" ||
    accessor === "end_date" ||
    (accessor && accessor.toLowerCase().includes("date")) ||
    (accessor && accessor.toLowerCase().includes("time"))
  );
};

// Format date values
export const formatDateValue = (value) => {
  if (!value) return value;
  
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  } catch (e) {
    // Keep original value if date parsing fails
  }
  return value;
};