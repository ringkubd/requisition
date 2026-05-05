import React, { useMemo } from "react";
import BaseDataTable from "react-data-table-component";
import { useTheme } from "@/context/ThemeContext";

const mergeTableStyles = (baseStyles, incomingStyles = {}) => {
    const merged = { ...baseStyles };

    Object.entries(incomingStyles || {}).forEach(([section, value]) => {
        const baseSection = merged[section] || {};

        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            baseSection &&
            typeof baseSection === "object" &&
            !Array.isArray(baseSection)
        ) {
            const sectionMerged = { ...baseSection };

            Object.entries(value).forEach(([key, keyValue]) => {
                const baseKey = sectionMerged[key];

                if (
                    keyValue &&
                    typeof keyValue === "object" &&
                    !Array.isArray(keyValue) &&
                    baseKey &&
                    typeof baseKey === "object" &&
                    !Array.isArray(baseKey)
                ) {
                    sectionMerged[key] = { ...baseKey, ...keyValue };
                } else {
                    sectionMerged[key] = keyValue;
                }
            });

            merged[section] = sectionMerged;
            return;
        }

        merged[section] = value;
    });

    return merged;
};

const AppDataTable = ({
    customStyles,
    className,
    ...props
}) => {
    const { dark } = useTheme();

    const baseStyles = useMemo(
        () => ({
            tableWrapper: {
                style: {
                    borderRadius: "12px",
                },
            },
            table: {
                style: {
                    backgroundColor: dark ? "#0f172a" : "#ffffff",
                    color: dark ? "#cbd5e1" : "#334155",
                    border: dark
                        ? "1px solid rgba(71, 85, 105, 0.6)"
                        : "1px solid #e2e8f0",
                    borderRadius: "12px",
                    overflow: "hidden",
                },
            },
            headRow: {
                style: {
                    backgroundColor: dark ? "#0b1220" : "#f8fafc",
                    color: dark ? "#e2e8f0" : "#0f172a",
                    minHeight: "48px",
                    borderBottom: dark
                        ? "1px solid rgba(71, 85, 105, 0.8)"
                        : "1px solid #e2e8f0",
                    fontSize: "13px",
                    fontWeight: 700,
                },
            },
            headCells: {
                style: {
                    paddingLeft: "12px",
                    paddingRight: "12px",
                },
            },
            rows: {
                style: {
                    backgroundColor: dark ? "#0f172a" : "#ffffff",
                    color: dark ? "#cbd5e1" : "#334155",
                    minHeight: "48px",
                    borderBottom: dark
                        ? "1px solid rgba(51, 65, 85, 0.85)"
                        : "1px solid #e2e8f0",
                    fontSize: "13px",
                },
                highlightOnHoverStyle: {
                    backgroundColor: dark
                        ? "rgba(30, 41, 59, 0.9)"
                        : "#eff6ff",
                    color: dark ? "#e2e8f0" : "#0f172a",
                    transitionDuration: "120ms",
                    transitionProperty: "background-color,color",
                },
            },
            cells: {
                style: {
                    paddingLeft: "12px",
                    paddingRight: "12px",
                },
            },
            pagination: {
                style: {
                    backgroundColor: dark ? "#0b1220" : "#f8fafc",
                    color: dark ? "#cbd5e1" : "#334155",
                    borderTop: dark
                        ? "1px solid rgba(71, 85, 105, 0.8)"
                        : "1px solid #e2e8f0",
                    borderBottomLeftRadius: "12px",
                    borderBottomRightRadius: "12px",
                },
                pageButtonsStyle: {
                    borderRadius: "8px",
                    color: dark ? "#cbd5e1" : "#334155",
                    fill: dark ? "#cbd5e1" : "#334155",
                    backgroundColor: "transparent",
                    '&:disabled': {
                        opacity: 0.45,
                    },
                    '&:hover:not(:disabled)': {
                        backgroundColor: dark
                            ? "rgba(30, 41, 59, 0.85)"
                            : "#e2e8f0",
                    },
                },
            },
        }),
        [dark]
    );

    const styles = useMemo(
        () => mergeTableStyles(baseStyles, customStyles),
        [baseStyles, customStyles]
    );

    return (
        <BaseDataTable
            {...props}
            className={className}
            customStyles={styles}
        />
    );
};

export default AppDataTable;
