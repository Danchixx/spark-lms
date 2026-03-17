/**
 * Button component
 *
 * Props:
 * - variant:  "primary" | "secondary" | "outline" | "ghost" | "danger"  (default: "primary")
 * - size:     "sm" | "md" | "lg"                                         (default: "md")
 * - rounded:  "default" | "pill"                                         (default: "default")
 * - disabled: bool
 * - loading:  bool — shows spinner and disables
 * - leftIcon: JSX element
 * - rightIcon: JSX element
 * - fullWidth: bool
 * - onClick:  function
 * - children: content
 */

const VARIANTS = {
    primary: { bg: "#FF6B00", color: "white", border: "none", hoverBg: "#e55a00" },
    secondary: { bg: "#1e1e1e", color: "white", border: "none", hoverBg: "#333" },
    outline: { bg: "white", color: "#FF6B00", border: "1.5px solid #FF6B00", hoverBg: "#fff3e8" },
    ghost: { bg: "white", color: "#555", border: "1.5px solid #e0e0e0", hoverBg: "#f5f5f5" },
    danger: { bg: "#e74c3c", color: "white", border: "none", hoverBg: "#c0392b" },
};

const SIZES = {
    sm: { padding: "5px 12px", fontSize: 12, iconSize: 14 },
    md: { padding: "9px 20px", fontSize: 13, iconSize: 16 },
    lg: { padding: "12px 28px", fontSize: 15, iconSize: 18 },
};

const Spinner = ({ size }) => (
    <div style={{
        width: size, height: size,
        border: "2px solid rgba(255,255,255,0.4)",
        borderTop: "2px solid white",
        borderRadius: "50%",
        animation: "btn-spin 0.7s linear infinite",
        flexShrink: 0,
    }} />
);

import { useState } from "react";

const Button = ({
    variant = "primary",
    size = "md",
    rounded = "default",
    disabled = false,
    loading = false,
    leftIcon = null,
    rightIcon = null,
    fullWidth = false,
    onClick,
    children,
    style = {},
    ...rest
}) => {
    const [hovered, setHovered] = useState(false);

    const v = VARIANTS[variant] || VARIANTS.primary;
    const s = SIZES[size] || SIZES.md;
    const isDisabled = disabled || loading;
    const borderRadius = rounded === "pill" ? 99 : 8;

    return (
        <>
            <style>{`@keyframes btn-spin { to { transform: rotate(360deg); } }`}</style>
            <button
                onClick={!isDisabled ? onClick : undefined}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                disabled={isDisabled}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: s.padding,
                    fontSize: s.fontSize,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    borderRadius,
                    border: v.border,
                    background: isDisabled ? (variant === "outline" || variant === "ghost" ? v.bg : "#ffb87a") : hovered ? v.hoverBg : v.bg,
                    color: isDisabled && variant !== "outline" && variant !== "ghost" ? "white" : v.color,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    width: fullWidth ? "100%" : "auto",
                    ...style,
                }}
                {...rest}
            >
                {loading && <Spinner size={s.iconSize} />}
                {!loading && leftIcon && <span style={{ display: "flex", alignItems: "center" }}>{leftIcon}</span>}
                {children}
                {!loading && rightIcon && <span style={{ display: "flex", alignItems: "center" }}>{rightIcon}</span>}
            </button>
        </>
    );
};

export default Button;
