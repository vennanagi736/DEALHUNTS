import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiEye,
  FiFilter,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
  FiExternalLink,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import "../../styles/AVisitRequests.css";

const API_BASE_URL = "http://localhost:8080";

/* -----------------------------------------------------------------------
   API
------------------------------------------------------------------------ */

const ADMIN_VISITS_URL =
  `${API_BASE_URL}/visits/admin/all`;

const VISIT_DETAILS_URL = (id) =>
  `${API_BASE_URL}/visits/${id}`;

const PRODUCT_DETAILS_URL = (id) =>
  `${API_BASE_URL}/admin/products/${id}`;

/*
 * Existing DealHunts endpoint for product images.
 *
 * The response contains Image records and the Cloudinary
 * thumbnail URL is stored in:
 *
 * image.thumbnailUrl
 */
const PRODUCT_IMAGES_URL = (id) =>
  `${API_BASE_URL}/admin/products/${id}/images`;

const PRODUCT_VENDORS_URL = (id) =>
  `${API_BASE_URL}/inventory/product/${id}/vendors`;

/*
 * React product details route.
 *
 * Clicking the product image opens:
 *
 * /product/{productId}
 */
const PRODUCT_DETAILS_ROUTE = "/product";

/* -----------------------------------------------------------------------
   STATUS
------------------------------------------------------------------------ */

const STATUS = {
  ALL: "ALL",
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

const STATUS_LABELS = {
  ALL: "All Requests",
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

/* -----------------------------------------------------------------------
   AUTH
------------------------------------------------------------------------ */

const getAdminToken = () => {
  return localStorage.getItem(
    "adminJwtToken"
  );
};

const getAuthConfig = () => {
  const token = getAdminToken();

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

/* -----------------------------------------------------------------------
   GENERIC HELPERS
------------------------------------------------------------------------ */

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
};

const safeString = (
  value,
  fallback = ""
) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value).trim();
};

/* -----------------------------------------------------------------------
   STATUS NORMALIZATION
------------------------------------------------------------------------ */

const normalizeStatus = (status) => {
  const value = String(
    status || "PENDING"
  )
    .trim()
    .toUpperCase();

  if (
    ["APPROVED", "CONFIRMED"].includes(
      value
    )
  ) {
    return STATUS.ACCEPTED;
  }

  if (
    ["DONE", "FINISHED"].includes(
      value
    )
  ) {
    return STATUS.COMPLETED;
  }

  if (
    ["DECLINED", "DENIED"].includes(
      value
    )
  ) {
    return STATUS.REJECTED;
  }

  if (
    ["CANCELED"].includes(value)
  ) {
    return STATUS.CANCELLED;
  }

  if (
    Object.values(STATUS).includes(
      value
    )
  ) {
    return value;
  }

  return STATUS.PENDING;
};

/* -----------------------------------------------------------------------
   DATE / TIME
------------------------------------------------------------------------ */

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/* -----------------------------------------------------------------------
   RESPONSE OBJECT HELPERS
------------------------------------------------------------------------ */

const extractObject = (data) => {
  if (!data) {
    return {};
  }

  if (
    typeof data !== "object"
  ) {
    return {};
  }

  if (
    data.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
  ) {
    return data.data;
  }

  if (
    data.product &&
    typeof data.product === "object"
  ) {
    return data.product;
  }

  return data;
};

const extractArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    return [];
  }

  const candidates = [
    data.content,
    data.data,
    data.items,
    data.results,
    data.requests,
    data.visits,
    data.bookings,
    data.vendors,
    data.inventory,
    data.records,
    data.images,
    data.productImages,
  ];

  for (
    const candidate of candidates
  ) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

/* -----------------------------------------------------------------------
   IMAGE HELPERS
------------------------------------------------------------------------ */

const extractImageValue = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (
      const item of value
    ) {
      const result =
        extractImageValue(item);

      if (result) {
        return result;
      }
    }

    return "";
  }

  if (
    typeof value === "object"
  ) {
    return firstValue(
      /*
       * Existing DealHunts Image field.
       */
      value.thumbnailUrl,
      value.thumbnailURL,

      /*
       * Other possible Cloudinary fields.
       */
      value.secureUrl,
      value.secure_url,
      value.url,

      value.imageUrl,
      value.imageURL,
      value.path,
      value.src,
      value.location
    );
  }

  return "";
};

const normalizeImageUrl = (image) => {
  if (!image) {
    return "";
  }

  const value =
    String(image).trim();

  if (
    value.startsWith(
      "http://"
    ) ||
    value.startsWith(
      "https://"
    ) ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (
    value.startsWith("//")
  ) {
    return `https:${value}`;
  }

  if (
    value.startsWith("/")
  ) {
    return `${API_BASE_URL}${value}`;
  }

  return value;
};

/*
 * Extract the first usable Cloudinary image
 * from the response returned by:
 *
 * GET /admin/products/{id}/images
 */
const extractProductImage = (
  data
) => {
  const images =
    extractArray(data);

  if (
    images.length === 0
  ) {
    return "";
  }

  /*
   * Prefer active images when imageStatus
   * is available.
   */
  const activeImage =
    images.find(
      (image) => {
        const status =
          String(
            image?.imageStatus ||
              image?.status ||
              ""
          )
            .trim()
            .toUpperCase();

        return (
          !status ||
          status === "ACTIVE"
        );
      }
    );

  const selectedImage =
    activeImage ||
    images[0];

  return normalizeImageUrl(
    extractImageValue(
      selectedImage
    )
  );
};

/* -----------------------------------------------------------------------
   PRODUCT HELPERS
------------------------------------------------------------------------ */

const getProductObject = (
  request
) => {
  return (
    request?.product ||
    request?.productDetails ||
    request?.productData ||
    request?.item ||
    {}
  );
};

const getProductId = (
  request
) => {
  const product =
    getProductObject(
      request
    );

  return firstValue(
    request?.productId,
    request?.productID,

    request?.product?.id,
    request?.product?.productId,

    product?.id,
    product?.productId,
    product?.productID
  );
};

const getProductImage = (
  request
) => {
  const product =
    getProductObject(
      request
    );

  const candidates = [
    request?.productImage,
    request?.productImageUrl,
    request?.productImageURL,

    request?.image,
    request?.imageUrl,
    request?.imageURL,

    request?.mainImage,
    request?.thumbnail,

    product?.image,
    product?.imageUrl,
    product?.imageURL,

    product?.productImage,
    product?.productImageUrl,
    product?.productImageURL,

    product?.mainImage,
    product?.thumbnail,

    product?.images,
    product?.productImages,

    request?.images,
    request?.productImages,
  ];

  for (
    const candidate of candidates
  ) {
    const image =
      extractImageValue(
        candidate
      );

    if (image) {
      return image;
    }
  }

  return "";
};

const getProductName = (
  request
) => {
  const product =
    getProductObject(
      request
    );

  return firstValue(
    request?.productName,
    request?.productTitle,

    product?.name,
    product?.productName,
    product?.title,

    request?.name,

    "Product unavailable"
  );
};

const getBrandName = (
  request
) => {
  const product =
    getProductObject(
      request
    );

  const brand =
    product?.brand ||
    request?.brand ||
    request?.brandDetails;

  if (
    brand &&
    typeof brand === "object"
  ) {
    return firstValue(
      request?.brandName,

      brand?.name,
      brand?.brandName,
      brand?.title,

      "—"
    );
  }

  return firstValue(
    request?.brandName,
    product?.brandName,
    brand,
    "—"
  );
};

/* -----------------------------------------------------------------------
   CUSTOMER
------------------------------------------------------------------------ */

const getCustomer = (
  request
) => {
  const customer =
    request?.customer ||
    request?.user ||
    request?.customerDetails ||
    {};

  return {
    id: firstValue(
      request?.userId,
      request?.customerId,

      customer?.id,
      customer?.userId
    ),

    name: firstValue(
      request?.customerName,

      customer?.name,
      customer?.fullName,
      customer?.username,

      "Customer"
    ),

    phone: firstValue(
      request?.customerPhone,
      request?.phone,
      request?.phoneNumber,

      customer?.phone,
      customer?.mobile,
      customer?.phoneNumber,

      "—"
    ),

    email: firstValue(
      request?.customerEmail,
      request?.email,

      customer?.email,

      "—"
    ),
  };
};

/* -----------------------------------------------------------------------
   VENDOR
------------------------------------------------------------------------ */

const getVendorObject = (
  request
) => {
  return (
    request?.vendor ||
    request?.shop ||
    request?.vendorDetails ||
    request?.vendorData ||
    request?.shopDetails ||
    {}
  );
};

const getVendorId = (
  request
) => {
  const vendor =
    getVendorObject(
      request
    );

  return firstValue(
    request?.vendorId,
    request?.vendorID,

    request?.shopId,
    request?.shopID,

    vendor?.id,
    vendor?.vendorId,
    vendor?.vendorID,

    vendor?.shopId,
    vendor?.shopID
  );
};

const getVendorName = (
  request
) => {
  const vendor =
    getVendorObject(
      request
    );

  return firstValue(
    request?.vendorName,
    request?.shopName,
    request?.storeName,

    vendor?.name,
    vendor?.vendorName,
    vendor?.businessName,
    vendor?.shopName,
    vendor?.storeName,
    vendor?.companyName,

    "Vendor"
  );
};

const getVendorPhone = (
  request
) => {
  const vendor =
    getVendorObject(
      request
    );

  return firstValue(
    request?.vendorPhone,
    request?.vendorMobile,
    request?.vendorPhoneNumber,

    vendor?.phone,
    vendor?.phoneNumber,
    vendor?.mobile,
    vendor?.mobileNumber,
    vendor?.contactNumber,
    vendor?.contactPhone,

    "—"
  );
};

const getVendorEmail = (
  request
) => {
  const vendor =
    getVendorObject(
      request
    );

  return firstValue(
    request?.vendorEmail,

    vendor?.email,
    vendor?.vendorEmail,
    vendor?.businessEmail,

    "—"
  );
};

const getVendorAddress = (
  request
) => {
  const vendor =
    getVendorObject(
      request
    );

  const addressObject =
    vendor?.address ||
    vendor?.shopAddress ||
    vendor?.storeAddress;

  if (
    addressObject &&
    typeof addressObject ===
      "object"
  ) {
    const parts = [
      addressObject?.addressLine1,
      addressObject?.addressLine2,
      addressObject?.street,
      addressObject?.area,
      addressObject?.locality,
      addressObject?.city,
      addressObject?.district,
      addressObject?.state,
      addressObject?.pincode,
      addressObject?.postalCode,
      addressObject?.zipCode,
    ]
      .filter(Boolean)
      .map((item) =>
        String(item).trim()
      );

    if (
      parts.length > 0
    ) {
      return parts.join(
        ", "
      );
    }
  }

  return firstValue(
    request?.vendorAddress,
    request?.shopAddress,
    request?.storeAddress,
    request?.address,

    vendor?.fullAddress,
    vendor?.address,
    vendor?.shopAddress,
    vendor?.storeAddress,
    vendor?.location,

    "Address unavailable"
  );
};

const getVendor = (
  request
) => {
  return {
    id: getVendorId(
      request
    ),

    name: getVendorName(
      request
    ),

    phone: getVendorPhone(
      request
    ),

    email: getVendorEmail(
      request
    ),

    address:
      getVendorAddress(
        request
      ),
  };
};

/* -----------------------------------------------------------------------
   REQUEST
------------------------------------------------------------------------ */

const getRequestId = (
  request
) => {
  return firstValue(
    request?.bookingId,
    request?.requestId,
    request?.visitId,
    request?.id,

    "—"
  );
};

const getVisitDate = (
  request
) => {
  return firstValue(
    request?.visitDate,
    request?.date,
    request?.scheduledDate,
    request?.preferredDate,
    request?.bookingDate
  );
};

const getVisitTime = (
  request
) => {
  return firstValue(
    request?.visitTime,
    request?.time,
    request?.scheduledTime,
    request?.preferredTime,
    request?.bookingTime
  );
};

const getVariant = (
  request
) => {
  return firstValue(
    request?.variant,
    request?.variantName,
    request?.variantLabel,
    request?.variantDetails?.name,

    "Default variant"
  );
};

const getColor = (
  request
) => {
  return firstValue(
    request?.color,
    request?.colorName,
    request?.selectedColor,
    request?.colorDetails?.name,

    "Default color"
  );
};

const getCreatedAt = (
  request
) => {
  return firstValue(
    request?.createdAt,
    request?.createdDate,
    request?.requestedAt,
    request?.bookedAt
  );
};

/* -----------------------------------------------------------------------
   NORMALIZE
------------------------------------------------------------------------ */

const normalizeRequest = (
  request,
  index = 0
) => {
  const customer =
    getCustomer(
      request
    );

  const vendor =
    getVendor(
      request
    );

  return {
    ...request,

    __key: String(
      firstValue(
        request?.id,
        request?.bookingId,
        request?.requestId,
        `visit-${index}`
      )
    ),

    __requestId:
      getRequestId(
        request
      ),

    __status:
      normalizeStatus(
        request?.status
      ),

    __productId:
      getProductId(
        request
      ),

    __productName:
      getProductName(
        request
      ),

    __brandName:
      getBrandName(
        request
      ),

    __productImage:
      normalizeImageUrl(
        getProductImage(
          request
        )
      ),

    __customer:
      customer,

    __vendor:
      vendor,

    __visitDate:
      getVisitDate(
        request
      ),

    __visitTime:
      getVisitTime(
        request
      ),

    __variant:
      getVariant(
        request
      ),

    __color:
      getColor(
        request
      ),

    __createdAt:
      getCreatedAt(
        request
      ),
  };
};

/* -----------------------------------------------------------------------
   REQUEST EXTRACTION
------------------------------------------------------------------------ */

const extractRequests = (
  data
) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.content
    )
  ) {
    return data.content;
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data;
  }

  if (
    Array.isArray(
      data?.requests
    )
  ) {
    return data.requests;
  }

  if (
    Array.isArray(
      data?.visits
    )
  ) {
    return data.visits;
  }

  if (
    Array.isArray(
      data?.bookings
    )
  ) {
    return data.bookings;
  }

  return [];
};

/* -----------------------------------------------------------------------
   VENDOR LIST EXTRACTION
------------------------------------------------------------------------ */

const extractVendorList = (
  data
) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    return [];
  }

  const candidates = [
    data.vendors,
    data.data,
    data.content,
    data.items,
    data.results,
    data.inventory,
    data.records,
  ];

  for (
    const candidate of candidates
  ) {
    if (
      Array.isArray(candidate)
    ) {
      return candidate;
    }
  }

  return [];
};

/* -----------------------------------------------------------------------
   VENDOR MATCHING
------------------------------------------------------------------------ */

const vendorMatches = (
  item,
  vendorId
) => {
  if (
    !item ||
    !vendorId
  ) {
    return false;
  }

  const nestedVendor =
    item?.vendor ||
    item?.vendorDetails ||
    item?.shop ||
    item?.shopDetails ||
    {};

  const possibleIds = [
    item?.vendorId,
    item?.vendorID,

    item?.shopId,
    item?.shopID,

    nestedVendor?.id,
    nestedVendor?.vendorId,
    nestedVendor?.vendorID,

    nestedVendor?.shopId,
    nestedVendor?.shopID,
  ]
    .filter(
      (value) =>
        value !==
          undefined &&
        value !== null &&
        String(value).trim() !==
          ""
    )
    .map((value) =>
      String(value)
    );

  return possibleIds.includes(
    String(vendorId)
  );
};

/* -----------------------------------------------------------------------
   MERGE PRODUCT
------------------------------------------------------------------------ */

const mergeProductData = (
  request,
  productData
) => {
  if (
    !productData ||
    typeof productData !==
      "object"
  ) {
    return request;
  }

  const product =
    extractObject(
      productData
    );

  return {
    ...request,

    product: {
      ...(request?.product ||
        {}),
      ...product,
    },

    productDetails: {
      ...(request?.productDetails ||
        {}),
      ...product,
    },

    productId: firstValue(
      request?.productId,
      product?.id,
      product?.productId
    ),

    productName: firstValue(
      product?.name,
      product?.productName,
      product?.title,
      request?.productName
    ),

    brandName: firstValue(
      product?.brandName,
      product?.brand?.name,
      product?.brand?.brandName,
      request?.brandName
    ),

    /*
     * Keep any image already supplied
     * by the product response.
     *
     * The dedicated image endpoint is
     * handled separately below.
     */
    productImage: firstValue(
      extractImageValue(
        product?.image
      ),

      extractImageValue(
        product?.imageUrl
      ),

      extractImageValue(
        product?.productImage
      ),

      extractImageValue(
        product?.mainImage
      ),

      extractImageValue(
        product?.thumbnail
      ),

      extractImageValue(
        product?.images
      ),

      extractImageValue(
        product?.productImages
      ),

      request?.productImage
    ),
  };
};

/* -----------------------------------------------------------------------
   MERGE VENDOR
------------------------------------------------------------------------ */

const mergeVendorData = (
  request,
  vendorData,
  fallbackVendorId
) => {
  if (
    !vendorData ||
    typeof vendorData !==
      "object"
  ) {
    return request;
  }

  const nestedVendor =
    vendorData?.vendor ||
    vendorData?.vendorDetails ||
    vendorData?.shop ||
    vendorData?.shopDetails ||
    {};

  const vendor =
    Object.keys(
      nestedVendor
    ).length > 0
      ? nestedVendor
      : vendorData;

  return {
    ...request,

    vendor: {
      ...(request?.vendor ||
        {}),
      ...vendorData,
      ...(vendor || {}),
    },

    vendorDetails: {
      ...(request?.vendorDetails ||
        {}),
      ...vendorData,
      ...(vendor || {}),
    },

    vendorId: firstValue(
      vendorData?.vendorId,
      vendorData?.vendorID,
      vendorData?.shopId,
      vendorData?.shopID,

      vendor?.id,
      vendor?.vendorId,
      vendor?.vendorID,

      fallbackVendorId,
      request?.vendorId
    ),

    vendorName: firstValue(
      vendorData?.vendorName,
      vendorData?.businessName,
      vendorData?.shopName,
      vendorData?.storeName,

      vendor?.name,
      vendor?.vendorName,
      vendor?.businessName,
      vendor?.shopName,
      vendor?.storeName,

      request?.vendorName
    ),

    vendorPhone: firstValue(
      vendorData?.vendorPhone,
      vendorData?.phone,
      vendorData?.phoneNumber,
      vendorData?.mobile,

      vendor?.phone,
      vendor?.phoneNumber,
      vendor?.mobile,
      vendor?.mobileNumber,
      vendor?.contactNumber,

      request?.vendorPhone
    ),

    vendorEmail: firstValue(
      vendorData?.vendorEmail,
      vendorData?.email,

      vendor?.email,
      vendor?.vendorEmail,
      vendor?.businessEmail,

      request?.vendorEmail
    ),

    vendorAddress: firstValue(
      vendorData?.vendorAddress,
      vendorData?.shopAddress,
      vendorData?.storeAddress,
      vendorData?.fullAddress,
      vendorData?.address,
      vendorData?.location,

      vendor?.vendorAddress,
      vendor?.shopAddress,
      vendor?.storeAddress,
      vendor?.fullAddress,
      vendor?.address,
      vendor?.location,

      request?.vendorAddress,
      request?.shopAddress
    ),
  };
};

/* -----------------------------------------------------------------------
   ENRICH SINGLE REQUEST
------------------------------------------------------------------------ */

const enrichRequest = async (
  request,
  productCache,
  imageCache,
  vendorCache
) => {
  let enriched = {
    ...request,
  };

  /* -------------------------------------------------------------------
     1. COMPLETE VISIT DETAILS
  ------------------------------------------------------------------- */

  const bookingId =
    firstValue(
      request?.id,
      request?.bookingId,
      request?.visitId,
      request?.requestId
    );

  if (bookingId) {
    try {
      const response =
        await axios.get(
          VISIT_DETAILS_URL(
            bookingId
          ),
          getAuthConfig()
        );

      const visitData =
        extractObject(
          response.data
        );

      if (
        visitData &&
        Object.keys(
          visitData
        ).length > 0
      ) {
        enriched = {
          ...enriched,
          ...visitData,
        };
      }
    } catch (error) {
      console.warn(
        `Unable to load visit details for ${bookingId}:`,
        error
      );
    }
  }

  /* -------------------------------------------------------------------
     2. PRODUCT DETAILS
  ------------------------------------------------------------------- */

  const productId =
    getProductId(
      enriched
    );

  if (productId) {
    const cacheKey =
      String(productId);

    let productData =
      productCache.get(
        cacheKey
      );

    if (
      !productCache.has(
        cacheKey
      )
    ) {
      try {
        const response =
          await axios.get(
            PRODUCT_DETAILS_URL(
              productId
            ),
            getAuthConfig()
          );

        productData =
          extractObject(
            response.data
          );

        productCache.set(
          cacheKey,
          productData
        );
      } catch (error) {
        console.warn(
          `Unable to load product ${productId}:`,
          error
        );

        productCache.set(
          cacheKey,
          null
        );

        productData = null;
      }
    }

    if (productData) {
      enriched =
        mergeProductData(
          enriched,
          productData
        );
    }
  }

  /* -------------------------------------------------------------------
     3. PRODUCT CLOUDINARY IMAGE
  ------------------------------------------------------------------- */

  if (productId) {
    const cacheKey =
      String(productId);

    let productImage =
      imageCache.get(
        cacheKey
      );

    if (
      !imageCache.has(
        cacheKey
      )
    ) {
      try {
        const response =
          await axios.get(
            PRODUCT_IMAGES_URL(
              productId
            ),
            getAuthConfig()
          );

        productImage =
          extractProductImage(
            response.data
          );

        imageCache.set(
          cacheKey,
          productImage
        );
      } catch (error) {
        console.warn(
          `Unable to load product images for ${productId}:`,
          error
        );

        /*
         * Store empty value in cache so
         * the same product is not requested
         * repeatedly.
         */
        productImage = "";

        imageCache.set(
          cacheKey,
          ""
        );
      }
    }

    /*
     * Dedicated Image endpoint has
     * priority over any image value
     * returned by Product.
     */
    if (productImage) {
      enriched = {
        ...enriched,
        productImage:
          productImage,

        product: {
          ...(enriched?.product ||
            {}),
          image:
            productImage,
          imageUrl:
            productImage,
          productImage:
            productImage,
        },

        productDetails: {
          ...(enriched?.productDetails ||
            {}),
          image:
            productImage,
          imageUrl:
            productImage,
          productImage:
            productImage,
        },
      };
    }
  }

  /* -------------------------------------------------------------------
     4. VENDOR / SHOP DETAILS
  ------------------------------------------------------------------- */

  const vendorId =
    getVendorId(
      enriched
    );

  if (productId) {
    const cacheKey =
      String(productId);

    let vendors;

    if (
      vendorCache.has(
        cacheKey
      )
    ) {
      vendors =
        vendorCache.get(
          cacheKey
        );
    } else {
      try {
        const response =
          await axios.get(
            PRODUCT_VENDORS_URL(
              productId
            ),
            getAuthConfig()
          );

        vendors =
          extractVendorList(
            response.data
          );

        vendorCache.set(
          cacheKey,
          vendors
        );
      } catch (error) {
        console.warn(
          `Unable to load vendors for product ${productId}:`,
          error
        );

        vendors = [];

        vendorCache.set(
          cacheKey,
          []
        );
      }
    }

    let matchingVendor =
      vendors.find(
        (item) =>
          vendorMatches(
            item,
            vendorId
          )
      );

    if (
      !matchingVendor &&
      !vendorId &&
      vendors.length === 1
    ) {
      matchingVendor =
        vendors[0];
    }

    if (
      !matchingVendor &&
      vendors.length > 0
    ) {
      const currentVendorName =
        safeString(
          getVendorName(
            enriched
          )
        ).toLowerCase();

      if (
        currentVendorName
      ) {
        matchingVendor =
          vendors.find(
            (item) => {
              const nested =
                item?.vendor ||
                item?.vendorDetails ||
                item?.shop ||
                item?.shopDetails ||
                item;

              const name =
                firstValue(
                  item?.vendorName,
                  item?.businessName,
                  item?.shopName,
                  item?.storeName,

                  nested?.name,
                  nested?.vendorName,
                  nested?.businessName,
                  nested?.shopName,
                  nested?.storeName
                );

              return (
                safeString(
                  name
                ).toLowerCase() ===
                currentVendorName
              );
            }
          );
      }
    }

    if (
      matchingVendor
    ) {
      enriched =
        mergeVendorData(
          enriched,
          matchingVendor,
          vendorId
        );
    }
  }

  return enriched;
};

/* -----------------------------------------------------------------------
   STATUS BADGE
------------------------------------------------------------------------ */

function StatusBadge({
  status,
}) {
  const normalized =
    normalizeStatus(
      status
    );

  return (
    <span
      className={`dh-admin-visit-status dh-admin-visit-status-${normalized.toLowerCase()}`}
    >
      <span className="dh-admin-visit-status-dot" />

      {STATUS_LABELS[
        normalized
      ] || normalized}
    </span>
  );
}

/* -----------------------------------------------------------------------
   STAT CARD
------------------------------------------------------------------------ */

function StatCard({
  icon,
  label,
  value,
  className = "",
}) {
  return (
    <div
      className={`dh-admin-visit-stat-card ${className}`}
    >
      <div className="dh-admin-visit-stat-icon">
        {icon}
      </div>

      <div className="dh-admin-visit-stat-content">
        <span className="dh-admin-visit-stat-label">
          {label}
        </span>

        <strong className="dh-admin-visit-stat-value">
          {value}
        </strong>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
   DETAIL ITEM
------------------------------------------------------------------------ */

function DetailItem({
  icon,
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={`dh-admin-visit-detail-item ${
        full
          ? "dh-admin-visit-detail-item-full"
          : ""
      }`}
    >
      <div className="dh-admin-visit-detail-icon">
        {icon}
      </div>

      <div className="dh-admin-visit-detail-content">
        <span className="dh-admin-visit-detail-label">
          {label}
        </span>

        <strong className="dh-admin-visit-detail-value">
          {value || "—"}
        </strong>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
   CONTACT BUTTON
------------------------------------------------------------------------ */

function ContactButton({
  type,
  value,
  label,
}) {
  if (
    !value ||
    value === "—" ||
    value ===
      "Address unavailable"
  ) {
    return null;
  }

  if (type === "phone") {
    const phone =
      String(value).replace(
        /[^\d+]/g,
        ""
      );

    if (!phone) {
      return null;
    }

    return (
      <a
        href={`tel:${phone}`}
        className="dh-admin-contact-button dh-admin-contact-phone"
      >
        <FiPhone />

        {label || "Call"}
      </a>
    );
  }

  if (type === "email") {
    return (
      <a
        href={`mailto:${value}`}
        className="dh-admin-contact-button dh-admin-contact-email"
      >
        <FiMail />

        {label || "Email"}
      </a>
    );
  }

  return null;
}

/* -----------------------------------------------------------------------
   ADDRESS LINK
------------------------------------------------------------------------ */

function AddressLink({
  address,
}) {
  if (
    !address ||
    address === "—" ||
    address ===
      "Address unavailable"
  ) {
    return null;
  }

  const mapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      className="dh-admin-visit-address-link"
    >
      <FiMapPin />

      <span>
        {address}
      </span>

      <FiExternalLink />
    </a>
  );
}

/* -----------------------------------------------------------------------
   PRODUCT IMAGE
------------------------------------------------------------------------ */

/*
 * Product image behavior:
 *
 * 1. If the Cloudinary image exists:
 *      display it.
 *
 * 2. If product ID exists:
 *      clicking the image opens /product/{productId}.
 *
 * 3. If the image cannot load:
 *      show only the placeholder.
 *
 * 4. No "View Product" overlay.
 *
 * 5. No "Open Complete Product" button.
 */

function ProductImage({
  request,
  onProductClick,
  large = false,
}) {
  const [imageFailed, setImageFailed] =
    useState(false);

  const image =
    normalizeImageUrl(
      request?.__productImage
    );

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  const productId =
    request?.__productId;

  const canOpen =
    productId !==
      undefined &&
    productId !== null &&
    String(
      productId
    ).trim() !== "" &&
    typeof onProductClick ===
      "function";

  const imageContent =
    image && !imageFailed ? (
      <img
        src={image}
        alt={
          request?.__productName ||
          "Product"
        }
        onError={() =>
          setImageFailed(
            true
          )
        }
      />
    ) : (
      <div className="dh-admin-product-image-placeholder">
        <FiPackage />

        <span>
          No image
        </span>
      </div>
    );

  if (canOpen) {
    return (
      <button
        type="button"
        className={
          large
            ? "dh-admin-visit-clickable-product-image dh-admin-visit-clickable-product-image-large"
            : "dh-admin-visit-clickable-product-image"
        }
        onClick={() =>
          onProductClick(
            productId
          )
        }
        aria-label={`Open ${
          request?.__productName ||
          "product"
        }`}
        title="Open product"
      >
        {imageContent}
      </button>
    );
  }

  return (
    <div
      className={
        large
          ? "dh-admin-visit-modal-product-image"
          : "dh-admin-visit-product-image"
      }
    >
      {imageContent}
    </div>
  );
}

/* -----------------------------------------------------------------------
   REQUEST CARD
------------------------------------------------------------------------ */

function RequestCard({
  request,
  onView,
  onProductClick,
}) {
  const status =
    request.__status;

  const isPending =
    status ===
    STATUS.PENDING;

  return (
    <article
      className={`dh-admin-visit-request-card ${
        isPending
          ? "dh-admin-visit-request-card-pending"
          : ""
      }`}
    >
      {isPending && (
        <div className="dh-admin-pending-alert">
          <FiAlertCircle />

          <span>
            Vendor response pending —
            admin may contact the
            customer to investigate if
            required.
          </span>
        </div>
      )}

      <div className="dh-admin-visit-request-main">
        <div className="dh-admin-visit-product-block">
          <ProductImage
            request={request}
            onProductClick={
              onProductClick
            }
          />

          <div className="dh-admin-visit-product-info">
            <div className="dh-admin-visit-product-heading">
              <div>
                <span className="dh-admin-visit-request-label">
                  Visit Request
                </span>

                <h3>
                  {
                    request.__productName
                  }
                </h3>
              </div>

              <StatusBadge
                status={status}
              />
            </div>

            <div className="dh-admin-visit-product-meta">
              <span>
                Brand:{" "}
                <strong>
                  {
                    request.__brandName
                  }
                </strong>
              </span>

              <span>
                Request ID:{" "}
                <strong>
                  {
                    request.__requestId
                  }
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="dh-admin-visit-request-summary">
          <div className="dh-admin-visit-summary-box">
            <span>
              Customer
            </span>

            <strong>
              {
                request.__customer
                  .name
              }
            </strong>

            <small>
              {
                request.__customer
                  .phone
              }
            </small>
          </div>

          <div className="dh-admin-visit-summary-box">
            <span>
              Vendor
            </span>

            <strong>
              {
                request.__vendor
                  .name
              }
            </strong>

            <small>
              {
                request.__vendor
                  .address
              }
            </small>
          </div>

          <div className="dh-admin-visit-summary-box">
            <span>
              Scheduled Visit
            </span>

            <strong>
              {formatDate(
                request.__visitDate
              )}
            </strong>

            <small>
              {
                request.__visitTime ||
                "Time not selected"
              }
            </small>
          </div>
        </div>
      </div>

      <div className="dh-admin-visit-request-footer">
        <div className="dh-admin-visit-footer-left">
          <span>
            <FiUser />

            {
              request.__customer
                .name
            }
          </span>

          <span>
            <FiShoppingBag />

            {
              request.__vendor
                .name
            }
          </span>

          <span>
            <FiClock />

            {
              request.__visitTime ||
              "—"
            }
          </span>

          <span>
            Created{" "}
            {formatDateTime(
              request.__createdAt
            )}
          </span>
        </div>

        <div className="dh-admin-visit-card-actions">
          {request.__customer
            .phone &&
            request.__customer
              .phone !== "—" && (
              <a
                href={`tel:${String(
                  request.__customer
                    .phone
                ).replace(
                  /[^\d+]/g,
                  ""
                )}`}
                className="dh-admin-card-contact"
                title="Call customer"
              >
                <FiPhone />
              </a>
            )}

          {request.__customer
            .email &&
            request.__customer
              .email !== "—" && (
              <a
                href={`mailto:${request.__customer.email}`}
                className="dh-admin-card-contact"
                title="Email customer"
              >
                <FiMail />
              </a>
            )}

          {request.__vendor
            .phone &&
            request.__vendor
              .phone !== "—" && (
              <a
                href={`tel:${String(
                  request.__vendor
                    .phone
                ).replace(
                  /[^\d+]/g,
                  ""
                )}`}
                className="dh-admin-card-contact"
                title="Call vendor"
              >
                <FiShoppingBag />
              </a>
            )}

          <button
            type="button"
            className="dh-admin-visit-view-button"
            onClick={() =>
              onView(request)
            }
          >
            <FiEye />

            View Details

            <FiChevronRight />
          </button>
        </div>
      </div>
    </article>
  );
}

/* -----------------------------------------------------------------------
   REQUEST DETAILS MODAL
------------------------------------------------------------------------ */

function RequestDetailsModal({
  request,
  onClose,
  onProductClick,
}) {
  if (!request) {
    return null;
  }

  const status =
    request.__status;

  const isPending =
    status ===
    STATUS.PENDING;

  const vendorPhone =
    request.__vendor.phone;

  const vendorEmail =
    request.__vendor.email;

  const vendorAddress =
    request.__vendor.address;

  return (
    <div
      className="dh-admin-visit-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="dh-admin-visit-modal">
        {/* ==========================================================
            HEADER
        =========================================================== */}

        <div className="dh-admin-visit-modal-header">
          <div>
            <div className="dh-admin-visit-modal-brand">
              DEALHUNTS
            </div>

            <div className="dh-admin-visit-modal-request-title">
              Visit Request :{" "}
              <strong>
                {
                  request.__requestId
                }
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="dh-admin-visit-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* ==========================================================
            STATUS
        =========================================================== */}

        <div className="dh-admin-visit-modal-status-row">
          <StatusBadge
            status={
              request.__status
            }
          />

          <span className="dh-admin-visit-created">
            Created{" "}
            {formatDateTime(
              request.__createdAt
            )}
          </span>
        </div>

        {/* ==========================================================
            PENDING ALERT
        =========================================================== */}

        {isPending && (
          <div className="dh-admin-investigation-alert">
            <div className="dh-admin-investigation-alert-icon">
              <FiAlertCircle />
            </div>

            <div>
              <strong>
                Vendor response is
                pending
              </strong>

              <p>
                This request has not
                been accepted or
                rejected by the vendor
                yet. Admin can contact
                the customer or vendor
                directly using the
                available information.
              </p>
            </div>
          </div>
        )}

        <div className="dh-admin-visit-modal-body">
          {/* ========================================================
              PRODUCT
          ========================================================= */}

          <section className="dh-admin-visit-modal-section">
            <div className="dh-admin-visit-modal-section-title">
              <FiPackage />

              <h3>
                Product Information
              </h3>
            </div>

            <div className="dh-admin-visit-product-detail-card">
              <ProductImage
                request={request}
                onProductClick={
                  onProductClick
                }
                large
              />

              <div className="dh-admin-visit-modal-product-info">
                <h4>
                  {
                    request.__productName
                  }
                </h4>

                <p>
                  Brand:{" "}
                  <strong>
                    {
                      request.__brandName
                    }
                  </strong>
                </p>

                <div className="dh-admin-visit-product-tags">
                  <span>
                    Variant:{" "}
                    {
                      request.__variant
                    }
                  </span>

                  <span>
                    Color:{" "}
                    {
                      request.__color
                    }
                  </span>
                </div>

                {request.__productId && (
                  <span className="dh-admin-visit-product-id">
                    Product ID:{" "}
                    {
                      request.__productId
                    }
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ========================================================
              CUSTOMER
          ========================================================= */}

          <section className="dh-admin-visit-modal-section">
            <div className="dh-admin-visit-modal-section-title">
              <FiUser />

              <h3>
                Customer Information
              </h3>
            </div>

            <div className="dh-admin-visit-details-grid">
              <DetailItem
                icon={<FiUser />}
                label="Customer Name"
                value={
                  request.__customer
                    .name
                }
              />

              <DetailItem
                icon={<FiPhone />}
                label="Phone Number"
                value={
                  request.__customer
                    .phone
                }
              />

              <DetailItem
                icon={<FiMail />}
                label="Email Address"
                value={
                  request.__customer
                    .email
                }
              />

              <DetailItem
                icon={<FiUser />}
                label="User ID"
                value={
                  request.__customer
                    .id || "—"
                }
              />
            </div>

            <div className="dh-admin-contact-panel">
              <div>
                <strong>
                  Contact Customer
                </strong>

                <span>
                  Use these details if
                  the request needs
                  investigation.
                </span>
              </div>

              <div className="dh-admin-contact-actions">
                <ContactButton
                  type="phone"
                  value={
                    request.__customer
                      .phone
                  }
                  label="Call Customer"
                />

                <ContactButton
                  type="email"
                  value={
                    request.__customer
                      .email
                  }
                  label="Email Customer"
                />
              </div>
            </div>
          </section>

          {/* ========================================================
              VENDOR
          ========================================================= */}

          <section className="dh-admin-visit-modal-section">
            <div className="dh-admin-visit-modal-section-title">
              <FiShoppingBag />

              <h3>
                Vendor / Shop Information
              </h3>
            </div>

            <div className="dh-admin-visit-details-grid">
              <DetailItem
                icon={
                  <FiShoppingBag />
                }
                label="Vendor / Shop"
                value={
                  request.__vendor
                    .name
                }
              />

              <DetailItem
                icon={<FiPhone />}
                label="Vendor Phone"
                value={
                  vendorPhone
                }
              />

              <DetailItem
                icon={<FiMail />}
                label="Vendor Email"
                value={
                  vendorEmail
                }
              />

              <DetailItem
                icon={<FiUsers />}
                label="Vendor ID"
                value={
                  request.__vendor
                    .id || "—"
                }
              />

              <DetailItem
                icon={<FiMapPin />}
                label="Shop Address"
                value={
                  vendorAddress
                }
                full
              />
            </div>

            <div className="dh-admin-contact-panel">
              <div>
                <strong>
                  Contact Vendor
                </strong>

                <span>
                  Admin can directly
                  contact the shop when
                  investigating a request.
                </span>
              </div>

              <div className="dh-admin-contact-actions">
                <ContactButton
                  type="phone"
                  value={
                    vendorPhone
                  }
                  label="Call Vendor"
                />

                <ContactButton
                  type="email"
                  value={
                    vendorEmail
                  }
                  label="Email Vendor"
                />

                <AddressLink
                  address={
                    vendorAddress
                  }
                />
              </div>
            </div>
          </section>

          {/* ========================================================
              VISIT SCHEDULE
          ========================================================= */}

          <section className="dh-admin-visit-modal-section">
            <div className="dh-admin-visit-modal-section-title">
              <FiCalendar />

              <h3>
                Visit Schedule
              </h3>
            </div>

            <div className="dh-admin-visit-schedule-card">
              <div>
                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    request.__visitDate
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Time
                </span>

                <strong>
                  {
                    request.__visitTime ||
                    "—"
                  }
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <StatusBadge
                  status={
                    request.__status
                  }
                />
              </div>
            </div>
          </section>

          {/* ========================================================
              TIMELINE
          ========================================================= */}

          <section className="dh-admin-visit-modal-section">
            <div className="dh-admin-visit-modal-section-title">
              <FiClock />

              <h3>
                Request Timeline
              </h3>
            </div>

            <div className="dh-admin-visit-timeline">
              <div className="dh-admin-visit-timeline-item">
                <div className="dh-admin-visit-timeline-dot">
                  <FiCheck />
                </div>

                <div>
                  <strong>
                    Request Created
                  </strong>

                  <span>
                    {formatDateTime(
                      request.__createdAt
                    )}
                  </span>
                </div>
              </div>

              <div className="dh-admin-visit-timeline-item">
                <div
                  className={`dh-admin-visit-timeline-dot ${
                    status ===
                      STATUS.ACCEPTED ||
                    status ===
                      STATUS.COMPLETED
                      ? "dh-admin-visit-timeline-success"
                      : status ===
                            STATUS.REJECTED ||
                        status ===
                            STATUS.CANCELLED
                      ? "dh-admin-visit-timeline-danger"
                      : ""
                  }`}
                >
                  {status ===
                    STATUS.REJECTED ||
                  status ===
                    STATUS.CANCELLED ? (
                    <FiX />
                  ) : status ===
                      STATUS.ACCEPTED ||
                    status ===
                      STATUS.COMPLETED ? (
                    <FiCheck />
                  ) : (
                    <FiClock />
                  )}
                </div>

                <div>
                  <strong>
                    {status ===
                    STATUS.ACCEPTED
                      ? "Vendor Accepted"
                      : status ===
                        STATUS.COMPLETED
                      ? "Visit Completed"
                      : status ===
                        STATUS.REJECTED
                      ? "Vendor Rejected"
                      : status ===
                        STATUS.CANCELLED
                      ? "Request Cancelled"
                      : "Waiting for Vendor Response"}
                  </strong>

                  <span>
                    {status ===
                    STATUS.PENDING
                      ? "Vendor has not responded yet"
                      : status ===
                        STATUS.ACCEPTED
                      ? "Vendor accepted the visit request"
                      : status ===
                        STATUS.COMPLETED
                      ? "Vendor marked the visit as completed"
                      : status ===
                        STATUS.REJECTED
                      ? "Vendor rejected the visit request"
                      : "Request was cancelled"}
                  </span>
                </div>
              </div>

              {status ===
                STATUS.PENDING && (
                <div className="dh-admin-visit-timeline-item">
                  <div className="dh-admin-visit-timeline-dot">
                    <FiUsers />
                  </div>

                  <div>
                    <strong>
                      Admin Investigation Available
                    </strong>

                    <span>
                      Admin can contact the
                      customer or vendor
                      directly.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ==========================================================
            FOOTER
        =========================================================== */}

        <div className="dh-admin-visit-modal-footer">
          <div className="dh-admin-modal-footer-contact">
            {request.__customer
              .phone &&
              request.__customer
                .phone !== "—" && (
                <a
                  href={`tel:${String(
                    request.__customer
                      .phone
                  ).replace(
                    /[^\d+]/g,
                    ""
                  )}`}
                  className="dh-admin-footer-call"
                >
                  <FiPhone />

                  Call Customer
                </a>
              )}

            {request.__customer
              .email &&
              request.__customer
                .email !== "—" && (
                <a
                  href={`mailto:${request.__customer.email}`}
                  className="dh-admin-footer-email"
                >
                  <FiMail />

                  Email Customer
                </a>
              )}
          </div>

          <button
            type="button"
            className="dh-admin-visit-modal-done"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------------------ */

export default function AdminVisitRequests() {
  const navigate =
    useNavigate();

  const [requests, setRequests] =
    useState([]);

  const [activeStatus, setActiveStatus] =
    useState(
      STATUS.ALL
    );

  const [searchText, setSearchText] =
    useState("");

  const [vendorFilter, setVendorFilter] =
    useState("ALL");

  const [dateFilter, setDateFilter] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("NEWEST");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [showFilters, setShowFilters] =
    useState(false);

  /* -------------------------------------------------------------------
     OPEN PRODUCT
  ------------------------------------------------------------------- */

  const handleOpenProduct =
    useCallback(
      (productId) => {
        if (
          productId ===
            undefined ||
          productId === null ||
          String(
            productId
          ).trim() === ""
        ) {
          return;
        }

        navigate(
          `${PRODUCT_DETAILS_ROUTE}/${productId}`
        );
      },
      [navigate]
    );

  /* -------------------------------------------------------------------
     LOAD ALL ADMIN REQUESTS
  ------------------------------------------------------------------- */

  const loadRequests =
    useCallback(
      async () => {
        try {
          setError("");

          const response =
            await axios.get(
              ADMIN_VISITS_URL,
              getAuthConfig()
            );

          const rawRequests =
            extractRequests(
              response.data
            );

          /*
           * Cache product details,
           * product images and vendors.
           *
           * This prevents duplicate API
           * requests when several visit
           * requests refer to the same product.
           */
          const productCache =
            new Map();

          const imageCache =
            new Map();

          const vendorCache =
            new Map();

          const enriched =
            await Promise.all(
              rawRequests.map(
                async (
                  request,
                  index
                ) => {
                  try {
                    const completeRequest =
                      await enrichRequest(
                        request,
                        productCache,
                        imageCache,
                        vendorCache
                      );

                    return normalizeRequest(
                      completeRequest,
                      index
                    );
                  } catch (error) {
                    console.warn(
                      "Request enrichment failed:",
                      error
                    );

                    return normalizeRequest(
                      request,
                      index
                    );
                  }
                }
              )
            );

          setRequests(
            enriched
          );

          setSelectedRequest(
            (previous) => {
              if (!previous) {
                return null;
              }

              return (
                enriched.find(
                  (item) =>
                    String(
                      item.__key
                    ) ===
                    String(
                      previous.__key
                    )
                ) ||
                previous
              );
            }
          );
        } catch (err) {
          console.error(
            "Failed to load admin visit requests:",
            err
          );

          if (
            err?.response
              ?.status === 401
          ) {
            setError(
              "Your admin session has expired. Please login again."
            );
          } else if (
            err?.response
              ?.status === 403
          ) {
            setError(
              "You do not have permission to view visit requests."
            );
          } else {
            setError(
              err?.response
                ?.data
                ?.message ||
                "Unable to load visit requests."
            );
          }
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /* -------------------------------------------------------------------
     REFRESH
  ------------------------------------------------------------------- */

  const handleRefresh =
    async () => {
      setRefreshing(
        true
      );

      await loadRequests();
    };

  /* -------------------------------------------------------------------
     VENDOR LIST
  ------------------------------------------------------------------- */

  const vendors =
    useMemo(() => {
      const map =
        new Map();

      requests.forEach(
        (request) => {
          const id =
            request.__vendor
              .id ||
            request.__vendor
              .name;

          if (!id) {
            return;
          }

          if (
            !map.has(
              String(id)
            )
          ) {
            map.set(
              String(id),
              {
                id: String(id),

                name:
                  request
                    .__vendor
                    .name,
              }
            );
          }
        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );
    }, [requests]);

  /* -------------------------------------------------------------------
     STATISTICS
  ------------------------------------------------------------------- */

  const stats =
    useMemo(() => {
      return {
        total:
          requests.length,

        pending:
          requests.filter(
            (request) =>
              request.__status ===
              STATUS.PENDING
          ).length,

        accepted:
          requests.filter(
            (request) =>
              request.__status ===
              STATUS.ACCEPTED
          ).length,

        completed:
          requests.filter(
            (request) =>
              request.__status ===
              STATUS.COMPLETED
          ).length,

        rejected:
          requests.filter(
            (request) =>
              request.__status ===
              STATUS.REJECTED
          ).length,

        cancelled:
          requests.filter(
            (request) =>
              request.__status ===
              STATUS.CANCELLED
          ).length,
      };
    }, [requests]);

  /* -------------------------------------------------------------------
     FILTER + SEARCH + SORT
  ------------------------------------------------------------------- */

  const filteredRequests =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      const filtered =
        requests.filter(
          (request) => {
            if (
              activeStatus !==
                STATUS.ALL &&
              request.__status !==
                activeStatus
            ) {
              return false;
            }

            if (
              vendorFilter !==
                "ALL" &&
              String(
                request.__vendor
                  .id ||
                  request.__vendor
                    .name
              ) !==
                String(
                  vendorFilter
                )
            ) {
              return false;
            }

            if (dateFilter) {
              const requestDate =
                request.__visitDate;

              if (!requestDate) {
                return false;
              }

              const normalizedRequestDate =
                String(
                  requestDate
                ).slice(0, 10);

              if (
                normalizedRequestDate !==
                dateFilter
              ) {
                return false;
              }
            }

            if (!query) {
              return true;
            }

            const searchable = [
              request.__requestId,

              request.__productName,

              request.__brandName,

              request.__customer
                .name,

              request.__customer
                .phone,

              request.__customer
                .email,

              request.__customer
                .id,

              request.__vendor
                .name,

              request.__vendor
                .phone,

              request.__vendor
                .email,

              request.__vendor
                .address,

              request.__vendor
                .id,

              request.__variant,

              request.__color,

              request.__status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchable.includes(
              query
            );
          }
        );

      return [
        ...filtered,
      ].sort(
        (a, b) => {
          const aDate =
            new Date(
              a.__createdAt ||
                0
            ).getTime();

          const bDate =
            new Date(
              b.__createdAt ||
                0
            ).getTime();

          if (
            sortOrder ===
            "OLDEST"
          ) {
            return (
              aDate -
              bDate
            );
          }

          if (
            sortOrder ===
            "VISIT_ASC"
          ) {
            return (
              new Date(
                a.__visitDate ||
                  0
              ).getTime() -
              new Date(
                b.__visitDate ||
                  0
              ).getTime()
            );
          }

          return (
            bDate -
            aDate
          );
        }
      );
    }, [
      requests,
      activeStatus,
      vendorFilter,
      dateFilter,
      searchText,
      sortOrder,
    ]);

  /* -------------------------------------------------------------------
     CLEAR FILTERS
  ------------------------------------------------------------------- */

  const clearFilters =
    () => {
      setActiveStatus(
        STATUS.ALL
      );

      setSearchText("");

      setVendorFilter(
        "ALL"
      );

      setDateFilter("");

      setSortOrder(
        "NEWEST"
      );
    };

  /* -------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------- */

  return (
    <div className="dh-admin-visit-page">
      <main className="dh-admin-visit-main">
        {/* ============================================================
            PAGE HEADER
        ============================================================ */}

        <section className="dh-admin-visit-header">
          <div>
            <div className="dh-admin-visit-eyebrow">
              ADMINISTRATION
            </div>

            <h1>
              Visit Requests
            </h1>

            <p>
              Monitor every Book a
              Visit request between
              customers and vendors.
            </p>
          </div>

          <button
            type="button"
            className="dh-admin-visit-refresh"
            onClick={
              handleRefresh
            }
            disabled={
              refreshing
            }
          >
            <FiRefreshCw
              className={
                refreshing
                  ? "dh-admin-visit-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </section>

        {/* ============================================================
            STATS
        ============================================================ */}

        <section className="dh-admin-visit-stats">
          <StatCard
            icon={
              <FiCalendar />
            }
            label="Total Requests"
            value={
              stats.total
            }
          />

          <StatCard
            icon={<FiClock />}
            label="Pending"
            value={
              stats.pending
            }
            className="dh-admin-stat-pending"
          />

          <StatCard
            icon={<FiCheck />}
            label="Accepted"
            value={
              stats.accepted
            }
            className="dh-admin-stat-accepted"
          />

          <StatCard
            icon={<FiCheck />}
            label="Completed"
            value={
              stats.completed
            }
            className="dh-admin-stat-completed"
          />

          <StatCard
            icon={<FiXCircle />}
            label="Rejected"
            value={
              stats.rejected
            }
            className="dh-admin-stat-rejected"
          />

          <StatCard
            icon={
              <FiAlertCircle />
            }
            label="Cancelled"
            value={
              stats.cancelled
            }
            className="dh-admin-stat-cancelled"
          />
        </section>

        {/* ============================================================
            SEARCH TOOLBAR
        ============================================================ */}

        <section className="dh-admin-visit-toolbar">
          <div className="dh-admin-visit-search">
            <FiSearch />

            <input
              type="text"
              value={
                searchText
              }
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target
                    .value
                )
              }
              placeholder="Search request, customer, vendor, product..."
            />

            {searchText && (
              <button
                type="button"
                onClick={() =>
                  setSearchText(
                    ""
                  )
                }
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`dh-admin-filter-toggle ${
              showFilters
                ? "dh-admin-filter-toggle-active"
                : ""
            }`}
            onClick={() =>
              setShowFilters(
                (value) =>
                  !value
              )
            }
          >
            <FiFilter />

            Filters

            <FiChevronDown
              className={
                showFilters
                  ? "dh-admin-chevron-open"
                  : ""
              }
            />
          </button>
        </section>

        {/* ============================================================
            STATUS TABS
        ============================================================ */}

        <section className="dh-admin-visit-status-tabs">
          {Object.values(
            STATUS
          ).map(
            (status) => (
              <button
                key={status}
                type="button"
                className={
                  activeStatus ===
                  status
                    ? "dh-admin-status-tab-active"
                    : ""
                }
                onClick={() =>
                  setActiveStatus(
                    status
                  )
                }
              >
                {
                  STATUS_LABELS[
                    status
                  ]
                }

                <span>
                  {status ===
                  STATUS.ALL
                    ? stats.total
                    : status ===
                      STATUS.PENDING
                    ? stats.pending
                    : status ===
                      STATUS.ACCEPTED
                    ? stats.accepted
                    : status ===
                      STATUS.COMPLETED
                    ? stats.completed
                    : status ===
                      STATUS.REJECTED
                    ? stats.rejected
                    : stats.cancelled}
                </span>
              </button>
            )
          )}
        </section>

        {/* ============================================================
            FILTER PANEL
        ============================================================ */}

        {showFilters && (
          <section className="dh-admin-visit-filter-panel">
            <div className="dh-admin-filter-field">
              <label htmlFor="admin-vendor-filter">
                Vendor
              </label>

              <select
                id="admin-vendor-filter"
                value={
                  vendorFilter
                }
                onChange={(
                  event
                ) =>
                  setVendorFilter(
                    event.target
                      .value
                  )
                }
              >
                <option value="ALL">
                  All Vendors
                </option>

                {vendors.map(
                  (vendor) => (
                    <option
                      key={
                        vendor.id
                      }
                      value={
                        vendor.id
                      }
                    >
                      {
                        vendor.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="dh-admin-filter-field">
              <label htmlFor="admin-date-filter">
                Visit Date
              </label>

              <input
                id="admin-date-filter"
                type="date"
                value={
                  dateFilter
                }
                onChange={(
                  event
                ) =>
                  setDateFilter(
                    event.target
                      .value
                  )
                }
              />
            </div>

            <div className="dh-admin-filter-field">
              <label htmlFor="admin-sort-filter">
                Sort By
              </label>

              <select
                id="admin-sort-filter"
                value={
                  sortOrder
                }
                onChange={(
                  event
                ) =>
                  setSortOrder(
                    event.target
                      .value
                  )
                }
              >
                <option value="NEWEST">
                  Newest Request
                </option>

                <option value="OLDEST">
                  Oldest Request
                </option>

                <option value="VISIT_ASC">
                  Earliest Visit
                </option>
              </select>
            </div>

            <button
              type="button"
              className="dh-admin-clear-filters"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>
          </section>
        )}

        {/* ============================================================
            RESULTS HEADER
        ============================================================ */}

        <section className="dh-admin-visit-results-header">
          <div>
            <h2>
              {activeStatus ===
              STATUS.ALL
                ? "All Visit Requests"
                : STATUS_LABELS[
                    activeStatus
                  ]}
            </h2>

            <span>
              Showing{" "}
              <strong>
                {
                  filteredRequests.length
                }
              </strong>{" "}
              of{" "}
              <strong>
                {
                  requests.length
                }
              </strong>{" "}
              requests
            </span>
          </div>

          <div className="dh-admin-visit-live-indicator">
            <span />

            Live request monitor
          </div>
        </section>

        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div className="dh-admin-visit-error">
            <FiAlertCircle />

            <div>
              <strong>
                Unable to load requests
              </strong>

              <p>
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleRefresh
              }
            >
              Try Again
            </button>
          </div>
        )}

        {/* ============================================================
            LOADING / EMPTY / REQUEST LIST
        ============================================================ */}

        {loading ? (
          <section className="dh-admin-visit-loading">
            <div className="dh-admin-loader" />

            <h3>
              Loading visit requests...
            </h3>

            <p>
              Please wait while the
              request, product, image
              and vendor records are
              loaded.
            </p>
          </section>
        ) : !error &&
          filteredRequests.length ===
            0 ? (
          <section className="dh-admin-visit-empty">
            <div className="dh-admin-empty-icon">
              <FiCalendar />
            </div>

            <h3>
              No visit requests
              found
            </h3>

            <p>
              There are no requests
              matching the current
              filters.
            </p>

            {(searchText ||
              activeStatus !==
                STATUS.ALL ||
              vendorFilter !==
                "ALL" ||
              dateFilter) && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}
          </section>
        ) : (
          <section className="dh-admin-visit-request-list">
            {filteredRequests.map(
              (request) => (
                <RequestCard
                  key={
                    request.__key
                  }
                  request={
                    request
                  }
                  onView={
                    setSelectedRequest
                  }
                  onProductClick={
                    handleOpenProduct
                  }
                />
              )
            )}
          </section>
        )}
      </main>

      {/* ==============================================================
          DETAILS MODAL
      ============================================================== */}

      <RequestDetailsModal
        request={
          selectedRequest
        }
        onClose={() =>
          setSelectedRequest(
            null
          )
        }
        onProductClick={
          handleOpenProduct
        }
      />
    </div>
  );
}
