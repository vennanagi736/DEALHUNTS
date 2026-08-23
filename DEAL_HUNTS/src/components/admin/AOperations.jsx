import React from "react";

import {
  UsersIcon,
  VendorsIcon,
  ProductsIcon,
  OrdersIcon,
  CategoriesIcon,
  ActivePromotionsIcon,
  ComplaintsIcon,
  FeedbackIcon,
  LowStockAlertsIcon,
} from "../../components/admin/AIcons";


/* -------------------------------------------------------------------------
   AdminOperations

   Displays core admin dashboard metrics:
   Users
   Vendors
   Products
   Orders
   Categories
   Active Promotions
   Complaints
   Feedback
   Low Stock Alerts
------------------------------------------------------------------------- */

export default function AdminOperations({
  userCount,
  vendorCount,
  productCount,
  orderCount,
  categoryCount,
  promotionCount,
  complaintsCount,
  feedbackCount,
  lowStockAlertsCount,
}) {

  const rows = [

    {
      icon: <UsersIcon />,
      label: "Users",
      value: userCount,
    },

    {
      icon: <VendorsIcon />,
      label: "Vendors",
      value: vendorCount,
    },

    {
      icon: <ProductsIcon />,
      label: "Products",
      value: productCount,
    },

    {
      icon: <OrdersIcon />,
      label: "Orders",
      value: orderCount,
    },

    {
      icon: <CategoriesIcon />,
      label: "Categories",
      value: categoryCount,
    },

    {
      icon: <ActivePromotionsIcon />,
      label: "Active Promotions",
      value: promotionCount,
    },

    {
      icon: <ComplaintsIcon />,
      label: "Complaints",
      value: complaintsCount,
    },

    {
      icon: <FeedbackIcon />,
      label: "Feedback",
      value: feedbackCount,
    },

    {
      icon: <LowStockAlertsIcon/>,
      label: "Low Stock Alerts",
      value: lowStockAlertsCount,
    },

  ];


  return (

    <div className="db-card db-ops-card">

      <h2 className="db-ops-heading">
        Admin Operations
      </h2>

      <div className="db-ops-divider" />


      <ul className="db-ops-list">

        {rows.map((row) => (

          <li
            className="db-ops-row"
            key={row.label}
          >

            <span className="db-ops-icon">
              {row.icon}
            </span>

            <span className="db-ops-label">
              {row.label}
            </span>

            <span className="db-ops-value">
              {row.value ?? 0}
            </span>

          </li>

        ))}

      </ul>

    </div>

  );
}