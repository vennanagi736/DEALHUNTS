import React from "react";
import { StarIcon } from "../../components/admin/AIcons";

export default function RecentFeedback({ items }) {
  return (
    <div>
      <h3 className="db-mini-title">Recent Feedback</h3>
      <ul className="db-feedback-list">
        {items.map((f, i) => (
          <li key={i} className="db-feedback-row">
            <span className="db-feedback-stars">
              {Array.from({ length: 5 }).map((_, s) => (
                <StarIcon key={s} filled={s < f.rating} width={13} height={13} />
              ))}
            </span>
            <p className="db-feedback-message">&ldquo;{f.message}&rdquo;</p>
            <p className="db-feedback-name">{f.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}