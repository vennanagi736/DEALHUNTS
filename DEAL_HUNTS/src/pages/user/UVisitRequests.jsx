import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/UVisitRequests.css";

/* ============================================================
   API BASE URL
============================================================ */

const API_BASE_URL = "http://localhost:8080";

/* ============================================================
   HELPERS
============================================================ */

const getStoredUser = () => {
  try {
    const possibleKeys = [
      "user",
      "currentUser",
      "loggedInUser",
      "userData",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (!value) {
        continue;
      }

      try {
        const parsed = JSON.parse(value);

        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch {
        // Ignore invalid JSON and continue.
      }
    }

    return null;
  } catch (error) {
    console.error(
      "Unable to read stored user:",
      error
    );

    return null;
  }
};


const getUserId = () => {
  const user = getStoredUser();

  /* ----------------------------------------------------------
     Try common user-id property names
  ---------------------------------------------------------- */

  const possibleIds = [
    user?.id,
    user?.userId,
    user?.userID,
    user?.uid,
  ];

  for (const id of possibleIds) {
    if (
      id !== null &&
      id !== undefined &&
      String(id).trim() !== ""
    ) {
      return id;
    }
  }

  /* ----------------------------------------------------------
     Direct localStorage values
  ---------------------------------------------------------- */

  const directKeys = [
    "userId",
    "userID",
    "uid",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return null;
};


const getToken = () => {
  const possibleKeys = [
    "userJwtToken",
    "jwtToken",
    "token",
    "accessToken",
  ];

  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);

    if (
      token &&
      token.trim() !== ""
    ) {
      return token;
    }
  }

  return null;
};


const normalizeRequests = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.visits)) {
    return data.visits;
  }

  if (Array.isArray(data?.requests)) {
    return data.requests;
  }

  return [];
};


const getRequestId = (request) => {
  return (
    request?.id ??
    request?.visitId ??
    request?.visitRequestId
  );
};


const getProductName = (request) => {
  return (
    request?.productName ||
    request?.product?.name ||
    request?.product?.productName ||
    "Product"
  );
};


const getBrandName = (request) => {
  return (
    request?.brandName ||
    request?.product?.brandName ||
    request?.product?.brand?.name ||
    ""
  );
};


const getShopName = (request) => {
  return (
    request?.shopName ||
    request?.vendorShopName ||
    request?.vendor?.shopName ||
    request?.shop?.name ||
    "Shop"
  );
};


const getVendorName = (request) => {
  return (
    request?.vendorName ||
    request?.vendor?.name ||
    ""
  );
};


const getVariant = (request) => {
  return (
    request?.variant ||
    request?.variantName ||
    request?.productVariant ||
    ""
  );
};


const getColor = (request) => {
  return (
    request?.color ||
    request?.colorName ||
    ""
  );
};


const getStatus = (request) => {
  return String(
    request?.status ||
    "PENDING"
  ).trim().toUpperCase();
};


const getVisitDate = (request) => {
  return (
    request?.visitDate ||
    request?.date ||
    ""
  );
};


const getVisitTime = (request) => {
  return (
    request?.visitTime ||
    request?.time ||
    ""
  );
};


const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Not specified";
  }

  try {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return String(dateValue);
  }
};


const formatTime = (timeValue) => {
  if (!timeValue) {
    return "Not specified";
  }

  const value = String(timeValue);

  /* ----------------------------------------------------------
     Handle HH:mm:ss / HH:mm
  ---------------------------------------------------------- */

  const match = value.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
  );

  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {
      const date = new Date();

      date.setHours(
        hours,
        minutes,
        0,
        0
      );

      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    }
  }

  return value;
};


const getStatusClass = (status) => {
  switch (status) {
    case "APPROVED":
    case "CONFIRMED":
      return "dh-user-visit-status-approved";

    case "REJECTED":
    case "CANCELLED":
    case "DECLINED":
      return "dh-user-visit-status-rejected";

    case "COMPLETED":
      return "dh-user-visit-status-completed";

    case "PENDING":
    default:
      return "dh-user-visit-status-pending";
  }
};


/* ============================================================
   COMPONENT
============================================================ */

function UserVisitRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);


  /* ==========================================================
     USER ID
  ========================================================== */

  const userId = useMemo(
    () => getUserId(),
    []
  );


  /* ==========================================================
     FETCH USER VISIT REQUESTS
  ========================================================== */

  const fetchVisitRequests = async (
    showRefreshLoader = false
  ) => {
    if (!userId) {
      setLoading(false);
      setRefreshing(false);

      setError(
        "Unable to identify the logged-in user."
      );

      return;
    }

    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      /* ======================================================
         USER VISIT REQUEST API

         Current expected endpoint:
         GET /visits/user/{userId}
      ====================================================== */

      const response = await fetch(
        `${API_BASE_URL}/visits/user/${userId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        let message =
          "Failed to load visit requests.";

        try {
          const errorData =
            await response.json();

          message =
            errorData?.message ||
            errorData?.error ||
            message;
        } catch {
          // Keep default message.
        }

        if (response.status === 401) {
          message =
            "Your session has expired. Please login again.";
        }

        if (response.status === 403) {
          message =
            "You are not authorized to view these visit requests.";
        }

        if (response.status === 404) {
          message =
            "The visit-request service was not found.";
        }

        throw new Error(message);
      }

      const data =
        await response.json();

      const normalized =
        normalizeRequests(data);

      setRequests(normalized);
    } catch (err) {
      console.error(
        "Failed to fetch user visit requests:",
        err
      );

      setRequests([]);

      setError(
        err?.message ||
        "Unable to load your visit requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchVisitRequests(false);
  }, [userId]);


  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = () => {
    fetchVisitRequests(true);
  };


  /* ==========================================================
     BOOK NEW VISIT
  ========================================================== */

  const handleBookVisit = () => {
    navigate("/products");
  };


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="dh-user-visit-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <section className="dh-user-visit-header">

        <div className="dh-user-visit-heading">

          <div className="dh-user-visit-eyebrow">
            MY ACCOUNT
          </div>

          <h1>
            My Visit Requests
          </h1>

          <p>
            View and track your requests
            to visit local stores.
          </p>

        </div>


        <div className="dh-user-visit-actions">

          <button
            type="button"
            className="dh-user-visit-refresh"
            onClick={handleRefresh}
            disabled={
              loading ||
              refreshing
            }
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            className="dh-user-visit-book"
            onClick={handleBookVisit}
          >
            Book a Visit
          </button>

        </div>

      </section>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <section className="dh-user-visit-error">

          <div className="dh-user-visit-error-title">
            Unable to load requests
          </div>

          <div className="dh-user-visit-error-message">
            {error}
          </div>

          <button
            type="button"
            onClick={() =>
              fetchVisitRequests(false)
            }
          >
            Try Again
          </button>

        </section>
      )}


      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading && !error && (
        <section className="dh-user-visit-loading">

          <div className="dh-user-visit-spinner" />

          <p>
            Loading your visit requests...
          </p>

        </section>
      )}


      {/* ====================================================
          EMPTY
      ==================================================== */}

      {!loading &&
        !error &&
        requests.length === 0 && (

          <section className="dh-user-visit-empty">

            <div className="dh-user-visit-empty-icon">
              📅
            </div>

            <h2>
              No visit requests yet
            </h2>

            <p>
              You have not submitted any
              store visit requests yet.
            </p>

            <button
              type="button"
              onClick={handleBookVisit}
            >
              Browse Products
            </button>

          </section>
        )}


      {/* ====================================================
          REQUEST LIST
      ==================================================== */}

      {!loading &&
        !error &&
        requests.length > 0 && (

          <section className="dh-user-visit-list">

            <div className="dh-user-visit-list-heading">

              <div>
                <span>
                  YOUR REQUESTS
                </span>

                <h2>
                  Visit history
                </h2>
              </div>

              <div className="dh-user-visit-count">
                {requests.length}
                {" "}
                {requests.length === 1
                  ? "request"
                  : "requests"}
              </div>

            </div>


            <div className="dh-user-visit-cards">

              {requests.map(
                (request, index) => {

                  const requestId =
                    getRequestId(request);

                  const status =
                    getStatus(request);

                  const productName =
                    getProductName(request);

                  const brandName =
                    getBrandName(request);

                  const shopName =
                    getShopName(request);

                  const vendorName =
                    getVendorName(request);

                  const variant =
                    getVariant(request);

                  const color =
                    getColor(request);

                  const visitDate =
                    getVisitDate(request);

                  const visitTime =
                    getVisitTime(request);

                  return (
                    <article
                      key={
                        requestId ??
                        `visit-${index}`
                      }
                      className="dh-user-visit-card"
                    >

                      {/* ======================================
                          CARD TOP
                      ====================================== */}

                      <div className="dh-user-visit-card-top">

                        <div className="dh-user-visit-product">

                          <div className="dh-user-visit-product-label">
                            PRODUCT
                          </div>

                          <h3>
                            {productName}
                          </h3>

                          {brandName && (
                            <div className="dh-user-visit-brand">
                              {brandName}
                            </div>
                          )}

                        </div>


                        <span
                          className={`dh-user-visit-status ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </div>


                      {/* ======================================
                          CARD DETAILS
                      ====================================== */}

                      <div className="dh-user-visit-details">

                        {/* ----------------------------------
                            STORE
                        ---------------------------------- */}

                        <div className="dh-user-visit-detail">

                          <span className="dh-user-visit-detail-label">
                            Store
                          </span>

                          <strong>
                            {shopName}
                          </strong>

                          {vendorName && (
                            <small>
                              {vendorName}
                            </small>
                          )}

                        </div>


                        {/* ----------------------------------
                            DATE
                        ---------------------------------- */}

                        <div className="dh-user-visit-detail">

                          <span className="dh-user-visit-detail-label">
                            Visit date
                          </span>

                          <strong>
                            {formatDate(
                              visitDate
                            )}
                          </strong>

                        </div>


                        {/* ----------------------------------
                            TIME
                        ---------------------------------- */}

                        <div className="dh-user-visit-detail">

                          <span className="dh-user-visit-detail-label">
                            Visit time
                          </span>

                          <strong>
                            {formatTime(
                              visitTime
                            )}
                          </strong>

                        </div>


                        {/* ----------------------------------
                            REQUEST ID
                        ---------------------------------- */}

                        {requestId !==
                          null &&
                          requestId !==
                            undefined && (

                            <div className="dh-user-visit-detail">

                              <span className="dh-user-visit-detail-label">
                                Request ID
                              </span>

                              <strong>
                                #{requestId}
                              </strong>

                            </div>
                          )}

                      </div>


                      {/* ======================================
                          SELECTED OPTIONS
                      ====================================== */}

                      {(variant ||
                        color) && (

                        <div className="dh-user-visit-options">

                          {variant && (
                            <div className="dh-user-visit-option">

                              <span>
                                Variant
                              </span>

                              <strong>
                                {variant}
                              </strong>

                            </div>
                          )}


                          {color && (
                            <div className="dh-user-visit-option">

                              <span>
                                Color
                              </span>

                              <strong>
                                {color}
                              </strong>

                            </div>
                          )}

                        </div>
                      )}


                      {/* ======================================
                          CUSTOMER DETAILS
                      ====================================== */}

                      {(request?.customerName ||
                        request?.customerPhone ||
                        request?.customerEmail) && (

                        <div className="dh-user-visit-customer">

                          <div className="dh-user-visit-customer-title">
                            Customer details
                          </div>

                          {request?.customerName && (
                            <div>
                              <span>
                                Name
                              </span>

                              <strong>
                                {request.customerName}
                              </strong>
                            </div>
                          )}

                          {request?.customerPhone && (
                            <div>
                              <span>
                                Phone
                              </span>

                              <strong>
                                {request.customerPhone}
                              </strong>
                            </div>
                          )}

                          {request?.customerEmail && (
                            <div>
                              <span>
                                Email
                              </span>

                              <strong>
                                {request.customerEmail}
                              </strong>
                            </div>
                          )}

                        </div>
                      )}


                      {/* ======================================
                          STATUS MESSAGE
                      ====================================== */}

                      <div className="dh-user-visit-status-message">

                        {status === "PENDING" && (
                          <>
                            Your visit request is waiting
                            for the store to respond.
                          </>
                        )}

                        {(status === "APPROVED" ||
                          status === "CONFIRMED") && (
                          <>
                            Your visit request has been
                            approved by the store.
                          </>
                        )}

                        {(status === "REJECTED" ||
                          status === "DECLINED") && (
                          <>
                            The store has declined
                            this visit request.
                          </>
                        )}

                        {status === "CANCELLED" && (
                          <>
                            This visit request has
                            been cancelled.
                          </>
                        )}

                        {status === "COMPLETED" && (
                          <>
                            This visit has been
                            completed.
                          </>
                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          </section>
        )}

    </main>
  );
}

export default UserVisitRequests;
