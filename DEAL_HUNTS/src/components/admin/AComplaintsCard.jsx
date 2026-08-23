import React from "react";

export default function AdminComplaintsCard({ newCount, pendingCount, resolvedCount }) {
  return (
    <div>
      <h3 className="db-mini-title">Complaints</h3>
      <ul className="db-mini-list">
        <li className="db-mini-row">
          <span>New</span>
          <span className="db-count-badge db-count-warning">
            {String(newCount).padStart(2, "0")}
          </span>
        </li>
        <li className="db-mini-row">
          <span>Pending</span>
          <span className="db-count-badge db-count-pending">
            {String(pendingCount).padStart(2, "0")}
          </span>
        </li>
        <li className="db-mini-row">
          <span>Resolved</span>
          <span className="db-count-badge db-count-resolved">
            {String(resolvedCount).padStart(2, "0")}
          </span>
        </li>
      </ul>
    </div>
  );
}