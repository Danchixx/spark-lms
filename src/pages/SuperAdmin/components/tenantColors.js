// src/pages/SuperAdmin/components/tenantColors.js

const DEFAULT_TENANT_PALETTE = [
  "#27ae60", "#2980b9", "#c0392b", "#8e44ad", "#e67e22", "#f39c12", "#16a085", "#2c3e50"
];

export const getStableTenantColor = (id, fallback = "#FF6B00") => {
  if (typeof id === "number" && !isNaN(id)) {
    return DEFAULT_TENANT_PALETTE[Math.abs(id) % DEFAULT_TENANT_PALETTE.length];
  }
  return fallback;
};

export const getTenantColorStyles = (color, isDark = false) => {
  const safeColor = color || "#FF6B00";
  return {
    bg: `color-mix(in srgb, ${safeColor} 16%, transparent)`,
    text: isDark
      ? `color-mix(in srgb, ${safeColor} 70%, white)`
      : `color-mix(in srgb, ${safeColor} 80%, black)`,
    border: `1px solid color-mix(in srgb, ${safeColor} 30%, transparent)`,
  };
};
