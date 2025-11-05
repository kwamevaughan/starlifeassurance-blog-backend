import { Icon } from "@iconify/react";
import { DateRangePicker } from "react-date-range";
import Select from "react-select";
import { getSelectStyles } from "@/utils/selectStyles";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function FilterSection({
                                          filterStatus,
                                          setFilterStatus,
                                          dateRange,
                                          setDateRange,
                                          showDatePicker,
                                          setShowDatePicker,
                                          mode,
                                          statuses,
                                          fallbackStaticRanges,
                                      }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <label
                    className={`block text-sm font-medium mb-2 ${
                        mode === "dark"
                            ? "text-gray-200"
                            : "text-gray-900"
                    }`}
                >
                    Filter by Status
                </label>
                <Select
                    value={{ value: filterStatus, label: filterStatus }}
                    onChange={(selectedOption) => setFilterStatus(selectedOption?.value || "all")}
                    options={statuses.map(status => ({
                        value: status,
                        label: status
                    }))}
                    placeholder="Filter by Status"
                    isClearable={false}
                    isSearchable
                    styles={getSelectStyles(mode)}
                />
            </div>
            <div className="flex-1 relative">
                <label
                    className={`block text-sm font-medium mb-2 ${
                        mode === "dark"
                            ? "text-gray-200"
                            : "text-gray-900"
                    }`}
                >
                    Filter by Date Range
                </label>
                <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between transition duration-200 shadow-md ${
                        mode === "dark"
                            ? "bg-gray-800 text-white hover:bg-gray-700"
                            : "bg-white text-gray-700 hover:bg-gray-300 border border-gray-300"
                    }`}
                    style={mode === "dark" ? { backgroundColor: "#1f2937" } : {}}
                >
                    <span className={mode === "dark" ? "text-white" : "text-gray-900"}>
                        {dateRange[0].startDate && dateRange[0].endDate
                            ? `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
                            : "Select Date Range"}
                    </span>
                    <Icon
                        icon={showDatePicker ? "mdi:chevron-up" : "mdi:chevron-down"}
                        className={`w-5 h-5 ${
                            mode === "dark" ? "text-blue-400" : "text-blue-600"
                        }`}
                    />
                </button>
                {showDatePicker && (
                    <div
                        className={`absolute left-0 top-[100%] mt-2 w-[calc(100%+2rem)] -ml-40 rounded-lg shadow-lg border z-50 ${
                            mode === "dark"
                                ? "bg-gray-800 border-gray-700 text-white dark-mode-datepicker"
                                : "bg-white border-gray-200 text-[#231812]"
                        }`}
                    >
                        <DateRangePicker
                            ranges={dateRange}
                            onChange={(item) => setDateRange([item.selection])}
                            className="w-full"
                            inputRanges={[]}
                            staticRanges={fallbackStaticRanges}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}