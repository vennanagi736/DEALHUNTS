import React from "react";

/* =========================================================================
   ShopIcons.jsx — stroke icon set for the Shop Details page.
   Inherit color via currentColor.
   ========================================================================= */

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const BackIcon = (props) => (
  <svg {...base} width={16} height={16} {...props}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const VerifiedIcon = (props) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l2.4 1.9 3-.6.9 2.9 2.9.9-.6 3L22.5 12l-1.9 2.4.6 3-2.9.9-.9 2.9-3-.6L12 22.5l-2.4-1.9-3 .6-.9-2.9-2.9-.9.6-3L1.5 12l1.9-2.4-.6-3 2.9-.9.9-2.9 3 .6L12 2z" opacity="0.16" />
    <path d="M12 2l2.4 1.9 3-.6.9 2.9 2.9.9-.6 3L22.5 12l-1.9 2.4.6 3-2.9.9-.9 2.9-3-.6L12 22.5l-2.4-1.9-3 .6-.9-2.9-2.9-.9.6-3L1.5 12l1.9-2.4-.6-3 2.9-.9.9-2.9 3 .6L12 2z" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8.2 12.4l2.4 2.4 5.2-5.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StarIcon = ({ filled = true, ...props }) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}
  >
    <path d="M12 2.5l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.98l-6.18 3.52L7 14.63l-5-4.87 6.91-1L12 2.5z" />
  </svg>
);

export const PinIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const PhoneIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z" />
  </svg>
);

export const MailIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2.5" />
    <path d="M2.5 6l9.5 7 9.5-7" />
  </svg>
);

export const WhatsappIcon = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.1a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20.1z" />
    <path d="M9.2 7.4c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.1.1 1.7 2.7 4.3 3.7 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5 0-.1-.6-1.6-.9-2.2z" />
  </svg>
);

export const ClockIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const TruckIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="1" y="6" width="14" height="11" rx="1.5" />
    <path d="M15 10h4l3 3v4h-7z" />
    <circle cx="6" cy="19" r="1.7" />
    <circle cx="17.5" cy="19" r="1.7" />
  </svg>
);

export const StoreIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 9l1.2-4.6A1.5 1.5 0 0 1 5.6 3.3h12.8a1.5 1.5 0 0 1 1.4 1.1L21 9" />
    <path d="M3 9h18v9.5A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5V9z" />
    <path d="M9 20v-5.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V20" />
  </svg>
);

export const CardIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="2" y="5" width="20" height="14" rx="2.5" />
    <path d="M2 10h20" />
    <path d="M6 15h4" />
  </svg>
);

export const RefreshIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const DirectionsIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 11l8-8 10 10-8 8z" />
    <path d="M3 11l8 8" />
    <path d="M8 8l8 8" />
  </svg>
);

export const ShopFallbackIcon = (props) => (
  <svg {...base} width={30} height={30} {...props}>
    <path d="M3 9l1.2-4.6A1.5 1.5 0 0 1 5.6 3.3h12.8a1.5 1.5 0 0 1 1.4 1.1L21 9" />
    <path d="M3 9h18v9.5A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5V9z" />
    <path d="M3 9h18" />
  </svg>
);
