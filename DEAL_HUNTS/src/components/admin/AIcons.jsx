import React from "react";

/* -------------------------------------------------------------------------
   AdminIcons
   Small, dependency-free inline SVG icons used across the dashboard.
   The project has no icon library installed today, so these avoid adding
   one unnecessarily (per the redesign brief) while replacing raw emoji /
   single-letter markers with clean, meaningful line icons.

   Usage: <UsersIcon />  (accepts standard svg props: className, size, etc.)
------------------------------------------------------------------------- */

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

export const UsersIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const VendorsIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M3 9h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

export const ProductsIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

export const OrdersIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 2h9l3 3v17H6z" />
    <path d="M15 2v3h3" />
    <path d="M9 11h6" />
    <path d="M9 15h6" />
  </svg>
);

export const CategoriesIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const ActivePromotionsIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M20.59 13.41 13.41 20.59a2 2 0 0 1-2.83 0L3.41 13.41a2 2 0 0 1 0-2.83L10.59 3.41a2 2 0 0 1 2.83 0L20.59 10.59a2 2 0 0 1 0 2.82z" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </svg>
);

export const ComplaintsIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.42 0z" />
  </svg>
);

export const FeedbackIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const MenuIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
  </svg>
);

export const SearchIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const BellIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const ChevronLeft = (props) => (
  <svg {...base} {...props}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const ChevronRight = (props) => (
  <svg {...base} {...props}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const LogoutIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const StarIcon = ({ filled, ...props }) => (
  <svg
    {...base}
    fill={filled ? "currentColor" : "none"}
    strokeWidth={filled ? 0 : 1.6}
    {...props}
  >
    <path d="M12 2.5l2.9 6.2 6.6.7-5 4.6 1.4 6.6L12 17.3l-5.9 3.3 1.4-6.6-5-4.6 6.6-.7z" />
  </svg>
);

/* Rank badge for the Product Performance table: gold / silver / bronze
   medal for the top three, a plain numeral otherwise. */
export const RankBadge = ({ rank }) => {
  if (rank > 3) {
    return <span className="db-rank-plain">{rank}</span>;
  }
  const tone = rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze";
  return (
    <span className={`db-rank-medal db-rank-${tone}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" />
      </svg>
      {rank}
    </span>
  );
};

export const LowStockAlertsIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
    <path d="M16 15h5" />
    <path d="M18.5 12.5 21 15l-2.5 2.5" />
  </svg>
);