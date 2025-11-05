import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import TooltipIconButton from "../TooltipIconButton";
import { formatDisplayValue, isDateField, formatDateValue } from "./TableUtils";

const TableRow = ({
  row,
  index,
  mode,
  enhancedColumns,
  selectable,
  table,
  actions,
  onEdit,
  onDelete,
  handleDeleteAction,
  getRowClassName,
  onRowClick,
  rowClickable = false,
}) => {
  // Dropdown state management
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);
  // Helper to render a table row's cells
  const renderRowCells = () => {
    if (!row) return null;

    return (
      <>
        {selectable && (
          <td className="w-8 px-1 sm:px-2 py-3 sm:py-4 text-center">
            <input
              type="checkbox"
              checked={table.selected.includes(row.id)}
              onChange={() => table.toggleSelect(row.id)}
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </td>
        )}
        {enhancedColumns.map((col) => {
          let value = row[col.accessor];

          // Use custom render function if provided
          if (typeof col.render === "function") {
            return (
              <td
                key={col.accessor}
                className={`px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm capitalize text-left ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                } ${col.className || ""}`}
              >
                {col.render(row, value, index)}
              </td>
            );
          }

          if (col.type === "image") {
            return (
              <td key={col.accessor} className="px-2 sm:px-4 py-3 sm:py-4">
                <Image
                  src={value}
                  alt={row.name || "Image"}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 ${
                    mode === "dark" ? "border-gray-600" : "border-gray-200"
                  }`}
                  width={40}
                  height={40}
                />
              </td>
            );
          }

          let displayValue = value;

          if (isDateField(col.accessor) && value) {
            displayValue = formatDateValue(value);
          } else {
            // Auto-format monetary and numeric values
            displayValue = formatDisplayValue(value, col.accessor, col.Header);
          }

          return (
            <td
              key={col.accessor}
              className={`px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-left ${
                mode === "dark" ? "text-white" : "text-gray-900"
              } ${col.className || ""}`}
            >
              <div className="truncate max-w-[120px] sm:max-w-none">
                {displayValue}
              </div>
            </td>
          );
        })}
        {(actions.length > 0 || onEdit || onDelete) && (
          <td className="px-2 sm:px-4 py-3 sm:py-4 min-w-[120px]">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Custom actions */}
              {(() => {
                // Filter visible actions
                const visibleActions = actions.filter((action) => {
                  if (!action) return false;
                  if (typeof action.show === "function" && !action.show(row))
                    return false;
                  return true;
                });

                // If 4 or fewer actions, show all directly
                if (visibleActions.length <= 4) {
                  return visibleActions.map((action, i) => {
                    if (typeof action.render === "function") {
                      return (
                        <React.Fragment key={action.label || i}>
                          {action.render(row)}
                        </React.Fragment>
                      );
                    }
                    if (typeof action.onClick !== "function") return null;

                    const label =
                      typeof action.label === "function"
                        ? action.label(row)
                        : action.label;
                    const icon =
                      typeof action.icon === "function"
                        ? action.icon(row)
                        : action.icon;
                    const isDisabled =
                      typeof action.disabled === "function"
                        ? action.disabled(row)
                        : action.disabled;
                    const tooltip =
                      typeof action.tooltip === "function"
                        ? action.tooltip(row)
                        : action.tooltip;
                    const actionClassName =
                      typeof action.className === "function"
                        ? action.className(row)
                        : action.className;
                    const actionStyle =
                      typeof action.style === "function"
                        ? action.style(row)
                        : action.style;

                    return (
                      <TooltipIconButton
                        key={label || i}
                        icon={icon || "mdi:help"}
                        label={tooltip || label || ""}
                        onClick={
                          isDisabled
                            ? undefined
                            : (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                action.onClick(row, e);
                              }
                        }
                        mode={mode}
                        className={`${actionClassName || ""} ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        style={actionStyle || {}}
                        disabled={isDisabled}
                      />
                    );
                  });
                }

                // If more than 4 actions, show first 3 and dropdown for rest
                const primaryActions = visibleActions.slice(0, 3);
                const overflowActions = visibleActions.slice(3);

                return (
                  <>
                    {/* Primary actions (first 3) */}
                    {primaryActions.map((action, i) => {
                      if (typeof action.render === "function") {
                        return (
                          <React.Fragment key={action.label || i}>
                            {action.render(row)}
                          </React.Fragment>
                        );
                      }
                      if (typeof action.onClick !== "function") return null;

                      const label =
                        typeof action.label === "function"
                          ? action.label(row)
                          : action.label;
                      const icon =
                        typeof action.icon === "function"
                          ? action.icon(row)
                          : action.icon;
                      const isDisabled =
                        typeof action.disabled === "function"
                          ? action.disabled(row)
                          : action.disabled;
                      const tooltip =
                        typeof action.tooltip === "function"
                          ? action.tooltip(row)
                          : action.tooltip;
                      const actionClassName =
                        typeof action.className === "function"
                          ? action.className(row)
                          : action.className;
                      const actionStyle =
                        typeof action.style === "function"
                          ? action.style(row)
                          : action.style;

                      return (
                        <TooltipIconButton
                          key={label || i}
                          icon={icon || "mdi:help"}
                          label={tooltip || label || ""}
                          onClick={
                            isDisabled
                              ? undefined
                              : (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  action.onClick(row, e);
                                }
                          }
                          mode={mode}
                          className={`${actionClassName || ""} ${
                            isDisabled ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          style={actionStyle || {}}
                          disabled={isDisabled}
                        />
                      );
                    })}

                    {/* Overflow dropdown for remaining actions */}
                    {overflowActions.length > 0 && (
                      <div className="relative" ref={dropdownRef}>
                        <TooltipIconButton
                          icon="mdi:dots-horizontal"
                          label="More actions"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowDropdown(!showDropdown);
                          }}
                          mode={mode}
                          className="bg-gray-50 text-gray-600 text-xs"
                        />
                        {showDropdown && (
                          <div className={`absolute right-0 top-8 z-50 min-w-[160px] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 ${
                            mode === "dark" 
                              ? "bg-gray-800 border-gray-700" 
                              : "bg-white border-gray-200"
                          }`}>
                          <div className="py-1">
                            {overflowActions.map((action, i) => {
                              if (typeof action.render === "function") {
                                return (
                                  <div key={action.label || i} className="px-2 py-1">
                                    {action.render(row)}
                                  </div>
                                );
                              }
                              if (typeof action.onClick !== "function") return null;

                              const label =
                                typeof action.label === "function"
                                  ? action.label(row)
                                  : action.label;
                              const icon =
                                typeof action.icon === "function"
                                  ? action.icon(row)
                                  : action.icon;
                              const isDisabled =
                                typeof action.disabled === "function"
                                  ? action.disabled(row)
                                  : action.disabled;

                              return (
                                <button
                                  key={label || i}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isDisabled) {
                                      action.onClick(row, e);
                                    }
                                    // Hide dropdown after click
                                    setShowDropdown(false);
                                  }}
                                  disabled={isDisabled}
                                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left transition-colors ${
                                    isDisabled 
                                      ? "opacity-50 cursor-not-allowed" 
                                      : mode === "dark"
                                        ? "text-gray-200 hover:bg-gray-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  <Icon icon={icon || "mdi:help"} className="w-4 h-4" />
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
              {/* Edit/Delete */}
              {onEdit && (
                <TooltipIconButton
                  icon="cuida:edit-outline"
                  label="Edit"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(row);
                  }}
                  mode={mode}
                  className="bg-blue-50 text-blue-600 text-xs"
                />
              )}
              {/* Only show delete button if not already in actions array */}
              {onDelete !== null &&
                typeof onDelete === "function" &&
                !actions.some(
                  (action) =>
                    action.icon === "mynaui:trash" ||
                    action.icon === "mdi:trash"
                ) && (
                  <TooltipIconButton
                    icon="mynaui:trash"
                    label="Delete"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteAction(row);
                    }}
                    mode={mode}
                    className="bg-red-50 text-red-600 text-xs"
                  />
                )}
            </div>
          </td>
        )}
      </>
    );
  };

  // Handle row click
  const handleRowClick = (e) => {
    // Don't trigger row click if clicking on action buttons or checkboxes
    if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) {
      return;
    }
    
    if (rowClickable && onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <tr
      key={row.id || index}
      className={`transition-colors ${
        mode === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"
      } ${rowClickable ? "cursor-pointer" : ""} ${getRowClassName ? getRowClassName(row) : ""}`}
      onClick={handleRowClick}
    >
      {renderRowCells()}
    </tr>
  );
};

export default TableRow;
