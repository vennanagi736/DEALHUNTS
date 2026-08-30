import React from "react";
import {
  PhoneIcon,
  MailIcon,
} from "./ShopIcons";

/* =========================================================================
   ShopContactCard.jsx
   Displays contact information from the real vendor backend.
   ========================================================================= */

function ShopContactCard({ vendor }) {

  const {
    phoneNo,
    email,
  } = vendor;


  return (

    <section className="sd-card">

      <h2 className="sd-card-title">
        Contact Information
      </h2>


      <ul className="sd-contact-list">

        {/* PHONE */}

        {phoneNo && (

          <li className="sd-contact-row">

            <span className="sd-contact-icon">
              <PhoneIcon />
            </span>


            <div className="sd-contact-text">

              <span className="sd-contact-label">
                Phone
              </span>

              <span className="sd-contact-value">
                {phoneNo}
              </span>

            </div>


            <a
              className="sd-contact-action"
              href={`tel:${phoneNo}`}
            >
              Call
            </a>

          </li>

        )}


        {/* EMAIL */}

        {email && (

          <li className="sd-contact-row">

            <span className="sd-contact-icon">
              <MailIcon />
            </span>


            <div className="sd-contact-text">

              <span className="sd-contact-label">
                Email
              </span>

              <span className="sd-contact-value">
                {email}
              </span>

            </div>


            <a
              className="sd-contact-action"
              href={`mailto:${email}`}
            >
              Email
            </a>

          </li>

        )}

      </ul>

    </section>

  );
}

export default ShopContactCard;