"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "@iconify/react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { DragDropContext } from "@hello-pangea/dnd";
import Portal from "@/components/common/Portal";
import FieldSelector from "./FieldSelector";
import Select from "react-select";
import { getSelectStyles } from "../../utils/selectStyles";
import FilterSection from "./FilterSection";
import PreviewTable from "./PreviewTable";
import useExportFilters from "../../hooks/useExportFilters";
import FormActions from "../forms/FormActions";
// import { useAuth } from "../../hooks/useAuth"; // Hook doesn't exist
import EmailPillInput from "../common/EmailPillInput";

// Utility function to format date to DD-MM-YYYY
const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    // If the date is already in DD/MM/YYYY format, convert it
    if (dateString.includes("/")) {
      const [datePart] = dateString.split(",");
      const [day, month, year] = datePart.split("/");
      return `${day}-${month}-${year}`;
    }

    // Otherwise parse as ISO date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};

export default function ExportModal({
  isOpen,
  onClose,
  users,
  mode,
  type = "users",
  stores = [],
  getFieldsOrder,
  getDefaultFields,
  onToggleType,
  zreportTab,
  animationDuration = 300,
  title,
}) {
  // const { user } = useAuth(); // Hook doesn't exist
  const user = null; // Placeholder
  const getFieldIcon = (key) => {
    const iconMap = {
      name: "mdi:account",
      full_name: "mdi:account",
      email: "mdi:email",
      role: "mdi:account-badge",
      store_name: "mdi:store",
      warehouse_name: "mdi:warehouse",
      supplier_name: "mdi:truck",
      status: "mdi:check-circle",
      is_active: "mdi:check-circle",
      created_at: "mdi:calendar",
      updated_at: "mdi:update",
      last_login: "mdi:login",
      date: "mdi:calendar",
      total: "mdi:currency-usd",
      quantity: "mdi:numeric",
      price: "mdi:currency-usd",
      cost_price: "mdi:currency-usd",
      sku: "mdi:barcode",
      barcode: "mdi:barcode",
      purchase_number: "mdi:receipt",
      order_number: "mdi:clipboard-text",
      return_number: "mdi:undo-variant",
      transfer_number: "mdi:truck-delivery",
      notes: "mdi:note-text",
      phone: "mdi:phone",
      address: "mdi:map-marker",
      category_name: "mdi:folder",
      brand_name: "mdi:tag",
      unit_name: "mdi:ruler",
      tax_type: "mdi:percent",
      tax_percentage: "mdi:percent",
    };

    return iconMap[key] || "mdi:tag";
  };

  // Create dynamic field mapping based on data structure
  const createDynamicFields = (data) => {
    if (!data || data.length === 0) return [];

    const sampleItem = data[0];
    const fields = [];

    Object.keys(sampleItem).forEach((key) => {
      if (["id", "__typename"].includes(key)) return;

      const field = {
        label: key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        key: key,
        icon: getFieldIcon(key),
      };
      fields.push(field);
    });

    return fields;
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const scrollPositionRef = useRef(0);
  const [fieldsOrder, setFieldsOrder] = useState(() =>
    typeof getFieldsOrder === "function"
      ? getFieldsOrder()
      : createDynamicFields(users)
  );

  // Update fieldsOrder when getFieldsOrder changes
  useEffect(() => {
    if (typeof getFieldsOrder === "function") {
      const fields = getFieldsOrder();
      setFieldsOrder(fields);
    } else if (users && users.length > 0) {
      const dynamicFields = createDynamicFields(users);
      setFieldsOrder(dynamicFields);
    }
  }, [createDynamicFields, getFieldsOrder, users]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (shouldRender) {
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [shouldRender]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle modal open/close with smooth transitions
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Re-initialize fields when modal opens
      if (typeof getFieldsOrder === "function") {
        const fields = getFieldsOrder();
        setFieldsOrder(fields);

        // Re-initialize selected fields
        const defaultFields =
          typeof getDefaultFields === "function"
            ? getDefaultFields()
            : createDefaultFields(fields);
        setSelectedFields(defaultFields);
      }

      // Reset email fields
      setEmailRecipients([]);
      setEmailSubject("");
      setEmailMessage("");
      setEmailAttachmentFormat("csv");
      setIsEmailSending(false);

      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, animationDuration, getFieldsOrder, getDefaultFields]);

  const isZReport = type === "zreport";

  // Create default fields selection
  const createDefaultFields = (fields) => {
    const defaults = {};
    fields.forEach((field) => {
      defaults[field.key] = !["updated_at", "created_at", "id"].includes(
        field.key
      );
    });
    return defaults;
  };

  const defaultFields = useMemo(
    () =>
      typeof getDefaultFields === "function"
        ? getDefaultFields()
        : createDefaultFields(fieldsOrder),
    [getDefaultFields, fieldsOrder]
  );

  const [selectedFields, setSelectedFields] = useState(defaultFields);

  // Update selectedFields when defaultFields changes
  useEffect(() => {
    setSelectedFields(defaultFields);
  }, [defaultFields]);

  const [exportFormat, setExportFormat] = useState("csv");
  const [previewRows, setPreviewRows] = useState(3);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailAttachmentFormat, setEmailAttachmentFormat] = useState("csv");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const csvLinkRef = useRef(null);

  const {
    filterStatus,
    setFilterStatus,
    dateRange,
    setDateRange,
    filteredUsers,
  } = isZReport ? { filteredUsers: users } : useExportFilters(users);

  const getStoreName = (store_id) => {
    if (!store_id) return "-";
    const store = stores.find((s) => s.id === store_id);
    return store ? store.name : "Unknown";
  };

  let formattedUsers;
  if (isZReport) {
    formattedUsers = Array.isArray(filteredUsers) ? filteredUsers : [];
  } else {
    formattedUsers = filteredUsers.map((user) => {
      const formatted = { ...user };

      if (formatted.store_name === undefined && formatted.store_id) {
        formatted.store_name = getStoreName(formatted.store_id);
      }
      if (formatted.is_active !== undefined) {
        formatted.is_active = formatted.is_active ? "Active" : "Inactive";
      }
      if (formatted.created_at) {
        formatted.created_at = formatDate(formatted.created_at);
      }
      if (formatted.updated_at) {
        formatted.updated_at = formatDate(formatted.updated_at);
      }
      if (formatted.last_login) {
        formatted.last_login = formatDate(formatted.last_login);
      }
      if (formatted.date) {
        formatted.date = formatDate(formatted.date);
      }

      const safeFormatted = {};
      for (const [key, value] of Object.entries(formatted)) {
        if (value === null || value === undefined) {
          safeFormatted[key] = "";
        } else if (typeof value === "object") {
          if (Array.isArray(value)) {
            safeFormatted[key] = `Array(${value.length})`;
          } else if (value && value.name) {
            safeFormatted[key] = value.name;
          } else {
            safeFormatted[key] = JSON.stringify(value);
          }
        } else {
          safeFormatted[key] = String(value);
        }
      }

      return safeFormatted;
    });
  }

  const statuses = ["all", "Active", "Inactive"];

  const fallbackStaticRanges = [
    {
      label: "All Time",
      range: () => ({ startDate: null, endDate: null }),
      isSelected: () => !dateRange[0].startDate,
    },
    {
      label: "Today",
      range: () => {
        const today = new Date();
        return { startDate: today, endDate: today };
      },
      isSelected: (range) =>
        range.startDate?.toDateString() === new Date().toDateString() &&
        range.endDate?.toDateString() === new Date().toDateString(),
    },
    {
      label: "Last 7 Days",
      range: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        return { startDate: start, endDate: end };
      },
      isSelected: (range) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        return (
          range.startDate?.toDateString() === start.toDateString() &&
          range.endDate?.toDateString() === end.toDateString()
        );
      },
    },
  ];

  const handleFieldToggle = (key) => {
    setSelectedFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    setSelectedFields(
      Object.fromEntries(fieldsOrder.map((f) => [f.key, true]))
    );
    toast.success("All fields selected", { icon: "✅" });
  };

  const handleSelectNone = () => {
    setSelectedFields(
      Object.fromEntries(fieldsOrder.map((f) => [f.key, false]))
    );
    toast.success("All fields deselected", { icon: "✅" });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedFields = Array.from(fieldsOrder);
    const [movedField] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, movedField);
    setFieldsOrder(reorderedFields);
    toast.success("Fields reordered", { icon: "✅" });
  };

  const csvHeaders = fieldsOrder
    .filter((f) => selectedFields[f.key])
    .map((f) => ({
      label: f.label,
      key: f.key,
    }));

  const exportPDF = () => {
    const selectedKeys = fieldsOrder
      .filter((f) => selectedFields[f.key])
      .map((f) => f.key);
    if (selectedKeys.length === 0) {
      toast.error("Please select at least one field to export!", {
        icon: "⚠️",
      });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(modalTitle || "Data Export", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    autoTable(doc, {
      head: [
        selectedKeys.map((key) => fieldsOrder.find((f) => f.key === key).label),
      ],
      body: formattedUsers.map((user) =>
        selectedKeys.map((key) => user[key] || "-")
      ),
      startY: 30,
      theme: "striped",
      headStyles: { fillColor: [240, 93, 35] },
      styles: { textColor: mode === "dark" ? 255 : 35 },
    });

    doc.save(
      `${modalTitle?.toLowerCase().replace(/\s+/g, "_") || "data"}_export.pdf`
    );
    toast.success("PDF exported successfully!", { icon: "✅" });
  };

  const handleExportClick = () => {
    if (Object.values(selectedFields).every((v) => !v)) {
      toast.error("Please select at least one field to export!", {
        icon: "⚠️",
      });
      return false;
    }
    toast.success("CSV exported successfully!", { icon: "✅" });
  };

  const handleCSVExport = () => {
    if (Object.values(selectedFields).every((v) => !v)) {
      toast.error("Please select at least one field to export!", {
        icon: "⚠️",
      });
      return;
    }
    // Trigger the hidden CSVLink
    if (csvLinkRef.current) {
      csvLinkRef.current.link.click();
    }
  };

  const handleEmailExport = async () => {
    if (Object.values(selectedFields).every((v) => !v)) {
      toast.error("Please select at least one field to export!", {
        icon: "⚠️",
      });
      return;
    }

    if (!emailRecipients || emailRecipients.length === 0) {
      toast.error("Please enter at least one email recipient!", {
        icon: "⚠️",
      });
      return;
    }

    // Recipients are already validated by the EmailPillInput component
    const recipients = emailRecipients;

    setIsEmailSending(true);

    try {
      const selectedKeys = fieldsOrder
        .filter((f) => selectedFields[f.key])
        .map((f) => f.key);

      const exportData = formattedUsers.map((user) => {
        const filteredUser = {};
        selectedKeys.forEach((key) => {
          filteredUser[key] = user[key] || "";
        });
        return filteredUser;
      });

      const headers = fieldsOrder
        .filter((f) => selectedFields[f.key])
        .map((f) => ({
          label: f.label,
          key: f.key,
        }));

      const defaultSubject = isZReport
        ? `${
            zreportTab === "zreport" ? "Z-Report" : "X-Report"
          } Export - ${new Date().toLocaleDateString()}`
        : `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } Export - ${new Date().toLocaleDateString()}`;

      const defaultFilename = isZReport
        ? `${zreportTab}_export_${new Date().toISOString().split("T")[0]}`
        : `${type}_export_${new Date().toISOString().split("T")[0]}`;

      const response = await fetch("/api/export/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: exportData,
          headers: headers,
          format: emailAttachmentFormat,
          recipients: recipients,
          subject: emailSubject.trim() || defaultSubject,
          message:
            emailMessage.trim() ||
            "Please find your requested data export attached.",
          filename: defaultFilename,
          user: user,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Export email sent successfully to ${recipients.length} recipient${
            recipients.length > 1 ? "s" : ""
          }!`,
          {
            icon: "✅",
          }
        );
        onClose();
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Email export error:", error);
      toast.error(`Failed to send email: ${error.message}`, {
        icon: "❌",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  if (!shouldRender) return null;

  let modalTitle = title || (isZReport
    ? `Export ${zreportTab === "zreport" ? "Z-Report" : "X-Report"}`
    : `Export ${type.charAt(0).toUpperCase() + type.slice(1)} Data`);

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-${Math.round(
          animationDuration
        )} ${isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div
          className={`relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl transform transition-all duration-${Math.round(
            animationDuration
          )} ${isAnimating ? "scale-100" : "scale-95"} ${
            mode === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white/95 text-gray-900"
          }`}
        >
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Icon icon="mdi:export" className="w-8 h-8 text-white mr-3" />
              <h2 className="text-2xl font-bold text-white">{modalTitle}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition duration-200"
            >
              <Icon icon="mdi:close" width={24} height={24} />
            </button>
          </div>

          {/* Z-Report Tabs (if applicable) */}
          {isZReport && (
            <div className="flex-shrink-0 flex gap-4 px-6 pt-4 pb-2">
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${
                  zreportTab === "products"
                    ? "bg-blue-700 text-white"
                    : mode === "dark"
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => {
                  if (typeof onToggleType === "function")
                    onToggleType("products");
                }}
              >
                Products Sold
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${
                  zreportTab === "payments"
                    ? "bg-blue-700 text-white"
                    : mode === "dark"
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => {
                  if (typeof onToggleType === "function")
                    onToggleType("payments");
                }}
              >
                Payment Breakdown
              </button>
            </div>
          )}

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    className={`block text-sm font-medium ${
                      mode === "dark" ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    Select Fields to Export
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className={`text-xs px-2 py-1 rounded-full ${
                        mode === "dark"
                          ? "bg-gray-600 text-blue-300 hover:bg-gray-500 hover:text-blue-200"
                          : "bg-gray-200 text-blue-600 hover:bg-gray-300 hover:text-blue-700"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={handleSelectNone}
                      className={`text-xs px-2 py-1 rounded-full ${
                        mode === "dark"
                          ? "bg-gray-600 text-blue-300 hover:bg-gray-500 hover:text-blue-200"
                          : "bg-gray-200 text-blue-600 hover:bg-gray-300 hover:text-blue-700"
                      }`}
                    >
                      None
                    </button>
                  </div>
                </div>
                <DragDropContext onDragEnd={onDragEnd}>
                  <FieldSelector
                    fieldsOrder={fieldsOrder}
                    selectedFields={selectedFields}
                    handleFieldToggle={handleFieldToggle}
                    mode={mode}
                  />
                </DragDropContext>
              </div>
              {!isZReport && (
                <FilterSection
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  showDatePicker={showDatePicker}
                  setShowDatePicker={setShowDatePicker}
                  mode={mode}
                  statuses={statuses}
                  fallbackStaticRanges={fallbackStaticRanges}
                />
              )}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Export Format
                </label>
                <Select
                  value={{
                    value: exportFormat,
                    label: exportFormat.toUpperCase(),
                  }}
                  onChange={(selectedOption) =>
                    setExportFormat(selectedOption?.value || "csv")
                  }
                  options={[
                    { value: "csv", label: "CSV" },
                    { value: "pdf", label: "PDF" },
                    { value: "email", label: "Email" },
                  ]}
                  placeholder="Select format..."
                  isClearable={false}
                  isSearchable={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    ...getSelectStyles(mode),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  menuPlacement="auto"
                />
              </div>
              {/* Email Configuration Section */}
              {exportFormat === "email" && (
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        mode === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      Email Recipients *
                    </label>
                    <EmailPillInput
                      value={emailRecipients}
                      onChange={setEmailRecipients}
                      placeholder="Enter email addresses..."
                      mode={mode}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        mode === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder={`Data Export - ${new Date().toLocaleDateString()}`}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        mode === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        mode === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      Email Message
                    </label>
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Please find your requested data export attached."
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        mode === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        mode === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      Attachment Format
                    </label>
                    <Select
                      value={{
                        value: emailAttachmentFormat,
                        label: emailAttachmentFormat.toUpperCase(),
                      }}
                      onChange={(selectedOption) =>
                        setEmailAttachmentFormat(selectedOption?.value || "csv")
                      }
                      options={[
                        { value: "csv", label: "CSV" },
                        { value: "pdf", label: "PDF" },
                      ]}
                      placeholder="Select attachment format..."
                      isClearable={false}
                      isSearchable={false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        ...getSelectStyles(mode),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        menu: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      menuPlacement="auto"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Preview Rows
                </label>
                <Select
                  value={{ value: previewRows, label: previewRows.toString() }}
                  onChange={(selectedOption) =>
                    setPreviewRows(Number(selectedOption?.value) || 3)
                  }
                  options={[
                    { value: 3, label: "3" },
                    { value: 5, label: "5" },
                    { value: 10, label: "10" },
                    { value: 20, label: "20" },
                    { value: 50, label: "50" },
                  ]}
                  placeholder="Select rows..."
                  isClearable={false}
                  isSearchable={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    ...getSelectStyles(mode),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  menuPlacement="auto"
                />
                <PreviewTable
                  filteredUsers={formattedUsers}
                  csvHeaders={csvHeaders}
                  previewRows={previewRows}
                  mode={mode}
                />
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div
            className={`flex-shrink-0 p-4 border-t rounded-b-xl shadow-md ${
              mode === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Hidden CSVLink for programmatic triggering */}
            <CSVLink
              ref={csvLinkRef}
              data={formattedUsers}
              headers={csvHeaders}
              filename={
                isZReport
                  ? "zreport_export.csv"
                  : `${
                      modalTitle?.toLowerCase().replace(/\s+/g, "_") || "data"
                    }_export.csv`
              }
              onClick={handleExportClick}
              style={{ display: "none" }}
            />

            <FormActions
              onCancel={onClose}
              onSave={
                exportFormat === "csv"
                  ? handleCSVExport
                  : exportFormat === "pdf"
                  ? exportPDF
                  : handleEmailExport
              }
              mode={mode}
              saveText={
                exportFormat === "csv"
                  ? "Export as CSV"
                  : exportFormat === "pdf"
                  ? "Export as PDF"
                  : isEmailSending
                  ? "Sending Email..."
                  : "Send Email"
              }
              cancelText="Cancel"
              saveIcon={
                exportFormat === "csv"
                  ? "mdi:file-export"
                  : exportFormat === "pdf"
                  ? "mdi:file-pdf-box"
                  : "mdi:email-send"
              }
              disabled={isEmailSending}
            />
          </div>
        </div>
      </div>
    </Portal>
  );
}
