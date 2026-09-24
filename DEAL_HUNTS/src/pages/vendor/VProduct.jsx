import React, { useEffect, useState } from "react";
import SideWindow from "../../components/SideBar";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";

import { getProductById } from "../../api/ProductApi";
import {
  addInventory,
  getVendorInventory,
  updateInventory,
  deleteInventory,
} from "../../api/InventoryApi";

import "../../styles/ProductPreview.css";

const API_BASE_URL = "http://localhost:8080";

function VendorProductPage() {
  const navigate = useNavigate();
  const { inventoryId } = useParams();

  const isEditMode = Boolean(inventoryId);

  // ============================================================
  // INITIAL COMMON DETAILS
  // ============================================================

  const initialCommonDetails = {
    product: "",

    minPurchase: "",
    maxPurchase: "",

    warranty: "",
    condition: "",
    deliveryTime: "",

    homeDelivery: false,
    storePickup: false,

    cod: false,
    emi: false,
    exchange: false,

    offerTitle: "",
    offerDescription: "",

    returnPolicy: "",
  };

  // ============================================================
  // CONSTANTS
  // ============================================================

  const DEFAULT_VARIANT_ID = null;
  const DEFAULT_COLOR_ID = null;

  // ============================================================
  // HELPERS
  // ============================================================

  const isFilled = (value) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "";

  const normalizeId = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const numberValue = Number(value);

    return Number.isFinite(numberValue)
      ? numberValue
      : null;
  };

  const sameId = (a, b) => {
    const na = normalizeId(a);
    const nb = normalizeId(b);

    if (na === null || nb === null) {
      return na === nb;
    }

    return String(na) === String(nb);
  };

  const parseBoolean = (value) => {
    if (typeof value === "boolean") {
      return value;
    }

    return (
      value === 1 ||
      value === "1" ||
      String(value).toLowerCase() === "true"
    );
  };

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("vendorJwtToken") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("userJwtToken");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const createFrontendId = () =>
    `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;

  // ============================================================
  // INVENTORY HELPERS
  // ============================================================

  const getInventoryId = (item) =>
    item?.id ??
    item?.inventoryId ??
    item?.inventory_id;

  const getInventoryProductId = (item) =>
    item?.productId ??
    item?.product?.id ??
    item?.product_id;

  /*
   * Vendor inventory APIs can expose variant information
   * in different shapes.
   */
  const getInventoryVariantId = (item) => {
    const direct =
      item?.variantId ??
      item?.variant_id ??
      item?.variant?.id;

    if (direct !== undefined && direct !== null) {
      return direct;
    }

    const colorVariant =
      item?.color?.variantId ??
      item?.color?.variant_id ??
      item?.color?.variant?.id;

    if (
      colorVariant !== undefined &&
      colorVariant !== null
    ) {
      return colorVariant;
    }

    return null;
  };

  const getInventoryColorId = (item) =>
    item?.colorId ??
    item?.color_id ??
    item?.color?.id;

  const getInventoryStock = (item) =>
    item?.stock ??
    item?.quantity ??
    "";

  const getInventoryDiscount = (item) =>
    item?.discount ??
    "";

  const getInventoryCommonValue = (
    item,
    camelCase,
    snakeCase,
    fallback = ""
  ) =>
    item?.[camelCase] ??
    item?.[snakeCase] ??
    fallback;

  // ============================================================
  // STATES
  // ============================================================

  const [inventory, setInventory] = useState(
    initialCommonDetails
  );

  const [vendorId, setVendorId] = useState("");

  const [products, setProducts] = useState([]);

  const [addedProductIds, setAddedProductIds] =
    useState(new Set());

  const [productInfo, setProductInfo] =
    useState(null);

  const [variants, setVariants] =
    useState([]);

  const [colors, setColors] =
    useState([]);

  const [attributes, setAttributes] =
    useState([]);

  const [attributeValues, setAttributeValues] =
    useState({});

  /*
   * UI representation of vendor inventory.
   *
   * Example:
   *
   * [
   *   {
   *     id: "frontend-id",
   *     variantId: 35,
   *     colors: [
   *       {
   *         id: "frontend-id",
   *         inventoryId: 101,
   *         colorId: 51,
   *         stock: "20000",
   *         discount: "10"
   *       },
   *       {
   *         id: "frontend-id",
   *         inventoryId: 102,
   *         colorId: 53,
   *         stock: "15000",
   *         discount: "5"
   *       }
   *     ]
   *   }
   * ]
   */
  const [variantSelections, setVariantSelections] =
    useState([]);

  /*
   * Original inventory records loaded from backend.
   *
   * Used to know which records must be deleted during edit.
   */
  const [originalInventoryRecords, setOriginalInventoryRecords] =
    useState([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [loadingProducts, setLoadingProducts] =
    useState(false);

  const [loadingProductDetails, setLoadingProductDetails] =
    useState(false);

  // ============================================================
  // CREATE DEFAULT VARIANT
  // ============================================================

  const createDefaultVariant = () => ({
    id: createFrontendId(),

    variantId: DEFAULT_VARIANT_ID,

    isDefault: true,

    colors: [
      {
        id: createFrontendId(),

        inventoryId: undefined,

        colorId: DEFAULT_COLOR_ID,

        isDefault: true,

        stock: "",

        discount: "",
      },
    ],
  });

  // ============================================================
  // CREATE VARIANT FROM PRODUCT MASTER
  //
  // IMPORTANT:
  // First product variant is automatically selected.
  // First color of that variant is automatically selected.
  // ============================================================

  const createFirstVariantSelection = (
    productVariants,
    productColors
  ) => {
    if (
      !Array.isArray(productVariants) ||
      productVariants.length === 0
    ) {
      return [createDefaultVariant()];
    }

    const firstVariant =
      productVariants[0];

    const firstVariantColors =
      getColorsForVariantFromData(
        productVariants,
        productColors,
        firstVariant.id
      );

    const firstColor =
      firstVariantColors.length > 0
        ? firstVariantColors[0]
        : null;

    return [
      {
        id: createFrontendId(),

        variantId: firstVariant.id,

        isDefault: false,

        colors: [
          {
            id: createFrontendId(),

            inventoryId: undefined,

            colorId:
              firstColor?.id ??
              DEFAULT_COLOR_ID,

            isDefault: false,

            stock: "",

            discount: "",
          },
        ],
      },
    ];
  };

  // ============================================================
  // LOAD VENDOR ID
  // ============================================================

  useEffect(() => {
    const storedVendorId =
      localStorage.getItem("vendorId");

    if (storedVendorId) {
      setVendorId(storedVendorId);
    } else {
      console.error(
        "No vendorId found in localStorage"
      );
    }
  }, []);

  // ============================================================
  // LOAD PRODUCTS + VENDOR INVENTORY
  // ============================================================

  useEffect(() => {
    if (!vendorId) {
      return;
    }

    const fetchProductsAndVendorInventory =
      async () => {
        setLoadingProducts(true);

        try {
          // ==================================================
          // LOAD ACTIVE PRODUCTS
          // ==================================================

          const productsResponse =
            await axios.get(
              `${API_BASE_URL}/admin/products/active`,
              {
                headers: getAuthHeaders(),
              }
            );

          const productData =
            Array.isArray(
              productsResponse.data
            )
              ? productsResponse.data
              : [];

          const activeProducts =
            productData.filter(
              (product) => {
                if (
                  product.active ===
                    undefined ||
                  product.active === null
                ) {
                  return true;
                }

                return parseBoolean(
                  product.active
                );
              }
            );

          setProducts(
            activeProducts
          );

          // ==================================================
          // LOAD ALL VENDOR INVENTORY
          // ==================================================

          const inventoryResponse =
            await getVendorInventory(
              vendorId
            );

          const vendorInventory =
            Array.isArray(
              inventoryResponse.data
            )
              ? inventoryResponse.data
              : [];

          console.log(
            "ALL VENDOR INVENTORY:",
            vendorInventory
          );

          // ==================================================
          // PRODUCTS ALREADY ADDED
          // ==================================================

          const addedIds =
            new Set();

          vendorInventory.forEach(
            (item) => {
              const productId =
                normalizeId(
                  getInventoryProductId(
                    item
                  )
                );

              if (
                productId !== null
              ) {
                addedIds.add(
                  productId
                );
              }
            }
          );

          setAddedProductIds(
            addedIds
          );

          // ==================================================
          // EDIT MODE
          // ==================================================

          if (isEditMode) {
            const selectedInventory =
              vendorInventory.find(
                (item) =>
                  sameId(
                    getInventoryId(
                      item
                    ),
                    inventoryId
                  )
              );

            if (
              !selectedInventory
            ) {
              alert(
                "Inventory product not found."
              );

              navigate(
                "/vendor/manage-products"
              );

              return;
            }

            const selectedProductId =
              getInventoryProductId(
                selectedInventory
              );

            if (
              !isFilled(
                selectedProductId
              )
            ) {
              alert(
                "Product information not found."
              );

              navigate(
                "/vendor/manage-products"
              );

              return;
            }

            await loadProductForEdit(
              selectedProductId,
              selectedInventory,
              vendorInventory
            );
          }
        } catch (error) {
          console.error(
            "Error loading products/vendor inventory:",
            error
          );

          if (!isEditMode) {
            setProducts([]);
            setAddedProductIds(
              new Set()
            );

            alert(
              "Failed to load products."
            );
          }
        } finally {
          setLoadingProducts(false);
        }
      };

    fetchProductsAndVendorInventory();
  }, [
    vendorId,
    inventoryId,
    isEditMode,
  ]);

  // ============================================================
  // PRODUCT BASE PRICE
  // ============================================================

  const getProductBasePrice = (
    product
  ) => {
    if (!product) {
      return 0;
    }

    const value =
      product.basePrice ??
      product.base_price ??
      product.price;

    const numberValue =
      Number(value);

    return Number.isFinite(
      numberValue
    )
      ? numberValue
      : 0;
  };

  // ============================================================
  // BUILD SPECIFICATION MAP
  // ============================================================

  const buildAttributeValueMap = (
    product,
    backendAttributes = []
  ) => {
    const valueMap = {};

    const specifications =
      product?.specifications;

    if (!specifications) {
      return valueMap;
    }

    // ==================================================
    // OBJECT FORMAT
    // ==================================================

    if (
      typeof specifications ===
        "object" &&
      !Array.isArray(
        specifications
      )
    ) {
      backendAttributes.forEach(
        (attribute) => {
          const attributeName =
            String(
              attribute.label ??
                attribute.name ??
                ""
            )
              .trim()
              .toLowerCase();

          const matchingKey =
            Object.keys(
              specifications
            ).find(
              (key) =>
                String(key)
                  .trim()
                  .toLowerCase() ===
                attributeName
            );

          if (
            matchingKey !==
            undefined
          ) {
            valueMap[
              attribute.id
            ] =
              specifications[
                matchingKey
              ];
          }
        }
      );

      return valueMap;
    }

    // ==================================================
    // ARRAY FORMAT
    // ==================================================

    if (
      Array.isArray(
        specifications
      )
    ) {
      specifications.forEach(
        (item) => {
          const attributeId =
            item.attributeId ??
            item.attribute?.id ??
            item.id;

          const value =
            item.value ??
            item.attributeValue ??
            item.specificationValue;

          if (
            attributeId !==
              null &&
            attributeId !==
              undefined
          ) {
            valueMap[
              attributeId
            ] =
              value ?? "";
          }
        }
      );
    }

    return valueMap;
  };

  // ============================================================
  // LOAD CATEGORY ATTRIBUTES
  // ============================================================

  const loadCategoryAttributes =
    async (
      categoryId,
      product
    ) => {
      if (!categoryId) {
        setAttributes([]);
        setAttributeValues({});
        return;
      }

      try {
        const response =
          await axios.get(
            `${API_BASE_URL}/attributes/category/${categoryId}`,
            {
              headers:
                getAuthHeaders(),
            }
          );

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        const filteredAttributes =
          data.filter(
            (attribute) => {
              const name =
                String(
                  attribute.label ??
                    attribute.name ??
                    ""
                )
                  .trim()
                  .toLowerCase();

              return (
                name !== "ram" &&
                name !==
                  "storage" &&
                name !==
                  "ram size" &&
                name !==
                  "storage size"
              );
            }
          );

        setAttributes(
          filteredAttributes
        );

        const valueMap =
          buildAttributeValueMap(
            product,
            filteredAttributes
          );

        const initialValues =
          {};

        filteredAttributes.forEach(
          (attribute) => {
            initialValues[
              attribute.id
            ] =
              valueMap[
                attribute.id
              ] ?? "";
          }
        );

        setAttributeValues(
          initialValues
        );
      } catch (error) {
        console.error(
          "Error loading category attributes:",
          error
        );

        setAttributes([]);
        setAttributeValues({});
      }
    };

  // ============================================================
  // NORMALIZE PRODUCT VARIANTS
  // ============================================================

  const normalizeVariants =
    (product) => {
      if (
        Array.isArray(
          product?.variants
        )
      ) {
        return product.variants;
      }

      if (
        Array.isArray(
          product?.variantList
        )
      ) {
        return product.variantList;
      }

      return [];
    };

  // ============================================================
  // NORMALIZE PRODUCT COLORS
  // ============================================================

  const normalizeColors =
    (product) => {
      const directColors =
        Array.isArray(
          product?.colors
        )
          ? product.colors
          : Array.isArray(
              product?.colorList
            )
          ? product.colorList
          : [];

      const productVariants =
        normalizeVariants(
          product
        );

      const variantColors =
        productVariants.flatMap(
          (variant) =>
            Array.isArray(
              variant?.colors
            )
              ? variant.colors
              : Array.isArray(
                  variant?.colorList
                )
              ? variant.colorList
              : []
        );

      const allColors = [
        ...directColors,
        ...variantColors,
      ];

      const uniqueColors =
        [];

      const seenIds =
        new Set();

      allColors.forEach(
        (color) => {
          const colorId =
            normalizeId(
              color?.id
            );

          if (
            colorId !== null &&
            !seenIds.has(
              colorId
            )
          ) {
            seenIds.add(
              colorId
            );

            uniqueColors.push(
              color
            );
          }
        }
      );

      return uniqueColors;
    };

  // ============================================================
  // GET COLORS FOR VARIANT FROM RAW PRODUCT DATA
  // ============================================================

  const getColorsForVariantFromData =
    (
      productVariants,
      allColors,
      variantId
    ) => {
      const normalizedVariantId =
        normalizeId(
          variantId
        );

      if (
        normalizedVariantId ===
        null
      ) {
        return [];
      }

      const selectedVariant =
        productVariants.find(
          (variant) =>
            sameId(
              variant?.id,
              normalizedVariantId
            )
        );

      if (!selectedVariant) {
        return [];
      }

      if (
        Array.isArray(
          selectedVariant.colors
        )
      ) {
        return selectedVariant.colors;
      }

      if (
        Array.isArray(
          selectedVariant.colorList
        )
      ) {
        return selectedVariant.colorList;
      }

      return allColors.filter(
        (color) =>
          sameId(
            color?.variantId ??
              color?.variant_id ??
              color?.variant?.id,
            normalizedVariantId
          )
      );
    };

  // ============================================================
  // LOAD PRODUCT FOR EDIT
  // ============================================================

  const loadProductForEdit =
    async (
      productId,
      selectedInventory,
      vendorInventory
    ) => {
      setLoadingProductDetails(
        true
      );

      try {
        // ==================================================
        // LOAD MASTER PRODUCT
        // ==================================================

        const response =
          await getProductById(
            productId
          );

        if (!response?.data) {
          throw new Error(
            "Product information not found."
          );
        }

        const product =
          response.data;

        const basePrice =
          getProductBasePrice(
            product
          );

        const productVariants =
          normalizeVariants(
            product
          );

        const productColors =
          normalizeColors(
            product
          );

        // ==================================================
        // COMMON VENDOR DETAILS
        // ==================================================

        setInventory({
          ...initialCommonDetails,

          product:
            String(
              productId
            ),

          minPurchase:
            getInventoryCommonValue(
              selectedInventory,
              "minPurchase",
              "min_purchase"
            ),

          maxPurchase:
            getInventoryCommonValue(
              selectedInventory,
              "maxPurchase",
              "max_purchase"
            ),

          warranty:
            getInventoryCommonValue(
              selectedInventory,
              "warranty",
              "warranty"
            ),

          condition:
            getInventoryCommonValue(
              selectedInventory,
              "condition",
              "product_condition"
            ),

          deliveryTime:
            getInventoryCommonValue(
              selectedInventory,
              "deliveryTime",
              "delivery_time"
            ),

          homeDelivery:
            parseBoolean(
              getInventoryCommonValue(
                selectedInventory,
                "homeDelivery",
                "home_delivery",
                false
              )
            ),

          storePickup:
            parseBoolean(
              getInventoryCommonValue(
                selectedInventory,
                "storePickup",
                "store_pickup",
                false
              )
            ),

          cod:
            parseBoolean(
              selectedInventory.cod
            ),

          emi:
            parseBoolean(
              selectedInventory.emi
            ),

          exchange:
            parseBoolean(
              selectedInventory.exchange
            ),

          offerTitle:
            getInventoryCommonValue(
              selectedInventory,
              "offerTitle",
              "offer_title"
            ),

          offerDescription:
            getInventoryCommonValue(
              selectedInventory,
              "offerDescription",
              "offer_description"
            ),

          returnPolicy:
            getInventoryCommonValue(
              selectedInventory,
              "returnPolicy",
              "return_policy"
            ),
        });

        // ==================================================
        // MASTER PRODUCT DATA
        // ==================================================

        setProductInfo({
          ...product,
          basePrice,
        });

        setVariants(
          productVariants
        );

        setColors(
          productColors
        );

        // ==================================================
        // PRODUCT SPECIFICATIONS
        // ==================================================

        const categoryId =
          product.category?.id ??
          product.categoryId;

        await loadCategoryAttributes(
          categoryId,
          product
        );

        // ==================================================
        // ONLY THIS PRODUCT'S INVENTORY
        // ==================================================

        const productInventory =
          vendorInventory.filter(
            (item) =>
              sameId(
                getInventoryProductId(
                  item
                ),
                productId
              )
          );

        console.log(
          "PRODUCT INVENTORY:",
          productInventory
        );

        setOriginalInventoryRecords(
          productInventory
        );

        // ==================================================
        // IMPORTANT:
        //
        // PRODUCT HAS VARIANTS
        //
        // EDIT MODE:
        // Load ONLY variants that vendor already owns.
        //
        // ADD MODE:
        // First master variant is shown automatically.
        // ==================================================

        if (
          productVariants.length ===
          0
        ) {
          const existingInventory =
            productInventory[0] ??
            selectedInventory;

          setVariantSelections([
            {
              id: createFrontendId(),

              variantId:
                DEFAULT_VARIANT_ID,

              isDefault: true,

              colors: [
                {
                  id:
                    createFrontendId(),

                  inventoryId:
                    getInventoryId(
                      existingInventory
                    ),

                  colorId:
                    DEFAULT_COLOR_ID,

                  isDefault: true,

                  stock:
                    getInventoryStock(
                      existingInventory
                    ),

                  discount:
                    getInventoryDiscount(
                      existingInventory
                    ),
                },
              ],
            },
          ]);

          return;
        }

        // ==================================================
        // GROUP VENDOR INVENTORY BY VARIANT
        // ==================================================

        const variantGroups =
          new Map();

        productInventory.forEach(
          (inventoryItem) => {
            const variantId =
              normalizeId(
                getInventoryVariantId(
                  inventoryItem
                )
              );

            const colorId =
              normalizeId(
                getInventoryColorId(
                  inventoryItem
                )
              );

            const recordId =
              getInventoryId(
                inventoryItem
              );

            console.log(
              "EDIT INVENTORY RECORD:",
              {
                inventoryId:
                  recordId,

                variantId,

                colorId,

                stock:
                  getInventoryStock(
                    inventoryItem
                  ),

                discount:
                  getInventoryDiscount(
                    inventoryItem
                  ),
              }
            );

            /*
             * A product with variants must have
             * a real variant ID.
             */
            if (
              variantId === null
            ) {
              return;
            }

            if (
              !variantGroups.has(
                variantId
              )
            ) {
              variantGroups.set(
                variantId,
                []
              );
            }

            variantGroups
              .get(variantId)
              .push(
                inventoryItem
              );
          }
        );

        // ==================================================
        // BUILD EDIT UI
        //
        // ORDER FOLLOWS MASTER PRODUCT VARIANT ORDER.
        // ==================================================

        const editSelections =
          [];

        productVariants.forEach(
          (masterVariant) => {
            const masterVariantId =
              normalizeId(
                masterVariant.id
              );

            if (
              masterVariantId ===
              null
            ) {
              return;
            }

            const records =
              variantGroups.get(
                masterVariantId
              );

            /*
             * Vendor has not added this variant.
             * Do NOT display it in edit mode.
             */
            if (
              !records ||
              records.length === 0
            ) {
              return;
            }

            // ==============================================
            // BUILD ALL EXISTING COLORS
            // ==============================================

            const editColors =
              [];

            records.forEach(
              (record) => {
                const recordColorId =
                  normalizeId(
                    getInventoryColorId(
                      record
                    )
                  );

                /*
                 * If backend has no color ID,
                 * still preserve the inventory row.
                 */
                editColors.push({
                  id:
                    createFrontendId(),

                  inventoryId:
                    getInventoryId(
                      record
                    ),

                  colorId:
                    recordColorId,

                  isDefault:
                    false,

                  stock:
                    getInventoryStock(
                      record
                    ),

                  discount:
                    getInventoryDiscount(
                      record
                    ),
                });
              }
            );

            if (
              editColors.length ===
              0
            ) {
              return;
            }

            editSelections.push({
              id:
                createFrontendId(),

              variantId:
                masterVariantId,

              isDefault: false,

              colors:
                editColors,
            });
          }
        );

        // ==================================================
        // FALLBACK
        //
        // If backend returned selected record but grouping
        // somehow failed, still show that record.
        // ==================================================

        if (
          editSelections.length ===
            0 &&
          selectedInventory
        ) {
          const fallbackVariantId =
            normalizeId(
              getInventoryVariantId(
                selectedInventory
              )
            );

          const fallbackColorId =
            normalizeId(
              getInventoryColorId(
                selectedInventory
              )
            );

          if (
            fallbackVariantId !==
            null
          ) {
            editSelections.push({
              id:
                createFrontendId(),

              variantId:
                fallbackVariantId,

              isDefault: false,

              colors: [
                {
                  id:
                    createFrontendId(),

                  inventoryId:
                    getInventoryId(
                      selectedInventory
                    ),

                  colorId:
                    fallbackColorId,

                  isDefault: false,

                  stock:
                    getInventoryStock(
                      selectedInventory
                    ),

                  discount:
                    getInventoryDiscount(
                      selectedInventory
                    ),
                },
              ],
            });
          }
        }

        /*
         * Final safety:
         * Every product has at least one variant.
         *
         * If no vendor records were found for some unexpected
         * reason, show the FIRST master variant instead of
         * showing an empty Add Variant section.
         */
        if (
          editSelections.length ===
          0
        ) {
          setVariantSelections(
            createFirstVariantSelection(
              productVariants,
              productColors
            )
          );
        } else {
          setVariantSelections(
            editSelections
          );
        }

        console.log(
          "FINAL EDIT SELECTIONS:",
          editSelections
        );
      } catch (error) {
        console.error(
          "Error loading product for edit:",
          error
        );

        alert(
          "Failed to load product information."
        );

        navigate(
          "/vendor/manage-products"
        );
      } finally {
        setLoadingProductDetails(
          false
        );
      }
    };

  // ============================================================
  // PRODUCT CHANGE — ADD MODE
  // ============================================================

  const handleProductChange =
    async (e) => {
      const value =
        e.target.value;

      setInventory({
        ...initialCommonDetails,

        product: value,
      });

      if (!value) {
        setProductInfo(null);
        setVariants([]);
        setColors([]);
        setAttributes([]);
        setAttributeValues({});
        setVariantSelections([]);
        setOriginalInventoryRecords([]);

        return;
      }

      setLoadingProductDetails(
        true
      );

      try {
        const response =
          await getProductById(
            value
          );

        if (!response?.data) {
          throw new Error(
            "Product information not found."
          );
        }

        const product =
          response.data;

        const basePrice =
          getProductBasePrice(
            product
          );

        const productVariants =
          normalizeVariants(
            product
          );

        const productColors =
          normalizeColors(
            product
          );

        setProductInfo({
          ...product,

          basePrice,
        });

        setVariants(
          productVariants
        );

        setColors(
          productColors
        );

        setOriginalInventoryRecords(
          []
        );

        const categoryId =
          product.category?.id ??
          product.categoryId;

        await loadCategoryAttributes(
          categoryId,
          product
        );

        // ==================================================
        // IMPORTANT:
        //
        // ALWAYS DISPLAY FIRST MASTER VARIANT.
        //
        // Never show an empty "Add Variant" section.
        // ==================================================

        setVariantSelections(
          createFirstVariantSelection(
            productVariants,
            productColors
          )
        );
      } catch (error) {
        console.error(
          "Error loading product:",
          error
        );

        setProductInfo(null);
        setVariants([]);
        setColors([]);
        setAttributes([]);
        setAttributeValues({});
        setVariantSelections([]);
        setOriginalInventoryRecords(
          []
        );

        alert(
          "Failed to load product information."
        );
      } finally {
        setLoadingProductDetails(
          false
        );
      }
    };

  // ============================================================
  // ADD VARIANT
  // ============================================================

  const handleAddVariant =
    () => {
      if (
        variants.length ===
        0
      ) {
        return;
      }

      setVariantSelections(
        (prev) => [
          ...prev,

          {
            id: createFrontendId(),

            /*
             * Empty means this is a NEW variant
             * that vendor must select.
             */
            variantId: "",

            isDefault: false,

            /*
             * Every variant starts with one color.
             */
            colors: [
              {
                id: createFrontendId(),

                inventoryId:
                  undefined,

                colorId: "",

                isDefault: false,

                stock: "",

                discount: "",
              },
            ],
          },
        ]
      );
    };

  // ============================================================
  // REMOVE VARIANT
  //
  // ONLY AVAILABLE WHEN THERE ARE 2+ VARIANTS.
  // ============================================================

  const handleRemoveVariant =
    (variantIndex) => {
      setVariantSelections(
        (prev) => {
          /*
           * Never allow zero variants.
           */
          if (
            prev.length <= 1
          ) {
            return prev;
          }

          return prev.filter(
            (_, index) =>
              index !==
              variantIndex
          );
        }
      );
    };

  // ============================================================
  // CHANGE VARIANT
  // ============================================================

  const handleVariantChange = (
    variantIndex,
    value
  ) => {
    setVariantSelections(
      (prev) =>
        prev.map(
          (
            variantSelection,
            index
          ) => {
            if (
              index !==
              variantIndex
            ) {
              return variantSelection;
            }

            const selectedVariant =
              variants.find(
                (variant) =>
                  sameId(
                    variant.id,
                    value
                  )
              );

            const backendColors =
              selectedVariant?.colors ??
              selectedVariant?.colorList ??
              [];

            /*
             * Changing variant means this is
             * a new combination.
             *
             * Therefore old inventory IDs
             * must be removed.
             */
            return {
              ...variantSelection,

              variantId:
                value,

              isDefault: false,

              colors: [
                {
                  id:
                    createFrontendId(),

                  inventoryId:
                    undefined,

                  colorId:
                    backendColors.length >
                    0
                      ? backendColors[0]
                          .id
                      : "",

                  isDefault: false,

                  stock: "",

                  discount: "",
                },
              ],
            };
          }
        )
    );
  };

  // ============================================================
  // ADD COLOR
  // ============================================================

  const handleAddColor =
    (variantIndex) => {
      setVariantSelections(
        (prev) =>
          prev.map(
            (
              variant,
              index
            ) => {
              if (
                index !==
                variantIndex
              ) {
                return variant;
              }

              const availableColors =
                getColorsForVariant(
                  variant.variantId
                );

              if (
                availableColors.length ===
                0
              ) {
                return variant;
              }

              return {
                ...variant,

                colors: [
                  ...variant.colors,

                  {
                    id:
                      createFrontendId(),

                    inventoryId:
                      undefined,

                    colorId: "",

                    isDefault: false,

                    stock: "",

                    discount: "",
                  },
                ],
              };
            }
          )
      );
    };

  // ============================================================
  // REMOVE COLOR
  //
  // ONLY AVAILABLE WHEN THAT VARIANT HAS 2+ COLORS.
  // ============================================================

  const handleRemoveColor =
    (
      variantIndex,
      colorIndex
    ) => {
      setVariantSelections(
        (prev) =>
          prev.map(
            (
              variant,
              index
            ) => {
              if (
                index !==
                variantIndex
              ) {
                return variant;
              }

              /*
               * Never allow a variant to have zero colors.
               */
              if (
                variant.colors.length <=
                1
              ) {
                return variant;
              }

              return {
                ...variant,

                colors:
                  variant.colors.filter(
                    (
                      _,
                      currentColorIndex
                    ) =>
                      currentColorIndex !==
                      colorIndex
                  ),
              };
            }
          )
      );
    };

  // ============================================================
  // COLOR FIELD CHANGE
  // ============================================================

  const handleColorFieldChange =
    (
      variantIndex,
      colorIndex,
      field,
      value
    ) => {
      setVariantSelections(
        (prev) =>
          prev.map(
            (
              variant,
              vIndex
            ) => {
              if (
                vIndex !==
                variantIndex
              ) {
                return variant;
              }

              return {
                ...variant,

                colors:
                  variant.colors.map(
                    (
                      color,
                      cIndex
                    ) => {
                      if (
                        cIndex !==
                        colorIndex
                      ) {
                        return color;
                      }

                      /*
                       * Only changing COLOR invalidates
                       * the existing inventory record.
                       *
                       * Changing stock or discount does NOT
                       * invalidate the inventory ID because
                       * those are fields of the same record.
                       */
                      return {
                        ...color,

                        [field]:
                          value,

                        ...(field ===
                        "colorId"
                          ? {
                              inventoryId:
                                undefined,
                            }
                          : {}),

                        isDefault:
                          false,
                      };
                    }
                  ),
              };
            }
          )
      );
    };

  // ============================================================
  // GET VARIANT NAME
  // ============================================================

  const getVariantName =
    (variantId) => {
      if (
        variantId ===
          null ||
        variantId ===
          undefined ||
        variantId ===
          ""
      ) {
        return "Default Variant";
      }

      const variant =
        variants.find(
          (item) =>
            sameId(
              item.id,
              variantId
            )
        );

      return (
        variant?.name ||
        variant?.value ||
        variant?.label ||
        "Variant"
      );
    };

  // ============================================================
  // GET COLOR NAME
  // ============================================================

  const getColorName =
    (
      colorId,
      variantId = null
    ) => {
      if (
        colorId ===
          null ||
        colorId ===
          undefined ||
        colorId ===
          ""
      ) {
        return "Default Color";
      }

      // ==================================================
      // SEARCH SELECTED VARIANT FIRST
      // ==================================================

      if (
        isFilled(
          variantId
        )
      ) {
        const selectedVariant =
          variants.find(
            (variant) =>
              sameId(
                variant.id,
                variantId
              )
          );

        const variantColors =
          selectedVariant?.colors ??
          selectedVariant?.colorList ??
          [];

        const variantColor =
          variantColors.find(
            (color) =>
              sameId(
                color.id,
                colorId
              )
          );

        if (
          variantColor
        ) {
          return (
            variantColor.name ||
            variantColor.value ||
            variantColor.label ||
            "Color"
          );
        }
      }

      // ==================================================
      // GLOBAL COLOR FALLBACK
      // ==================================================

      const color =
        colors.find(
          (item) =>
            sameId(
              item.id,
              colorId
            )
        );

      return (
        color?.name ||
        color?.value ||
        color?.label ||
        "Color"
      );
    };

  // ============================================================
  // GET COLORS FOR VARIANT
  // ============================================================

  const getColorsForVariant =
    (variantId) => {
      if (
        !isFilled(
          variantId
        )
      ) {
        return [];
      }

      const selectedVariant =
        variants.find(
          (variant) =>
            sameId(
              variant.id,
              variantId
            )
        );

      if (!selectedVariant) {
        return [];
      }

      if (
        Array.isArray(
          selectedVariant.colors
        )
      ) {
        return selectedVariant.colors;
      }

      if (
        Array.isArray(
          selectedVariant.colorList
        )
      ) {
        return selectedVariant.colorList;
      }

      return colors.filter(
        (color) =>
          sameId(
            color?.variantId ??
              color?.variant_id ??
              color?.variant?.id,
            variantId
          )
      );
    };

  // ============================================================
  // PRODUCT PRICE
  // ============================================================

  const productPrice =
    getProductBasePrice(
      productInfo
    );

  // ============================================================
  // CALCULATE VENDOR PRICE
  // ============================================================

  const calculateYourPrice =
    (discount) => {
      const discountPercent =
        isFilled(
          discount
        )
          ? Number(discount)
          : 0;

      const safeDiscount =
        Number.isFinite(
          discountPercent
        )
          ? discountPercent
          : 0;

      const yourPrice =
        productPrice -
        (productPrice *
          safeDiscount) /
          100;

      return Math.max(
        0,
        yourPrice
      );
    };

  // ============================================================
  // PREVIEW PRICE ROWS
  // ============================================================

  const getPreviewPriceRows =
    () => {
      const rows = [];

      variantSelections.forEach(
        (
          variantSelection
        ) => {
          if (
            variants.length >
              0 &&
            !isFilled(
              variantSelection.variantId
            )
          ) {
            return;
          }

          (
            variantSelection.colors ||
            []
          ).forEach(
            (
              colorSelection
            ) => {
              if (
                variants.length >
                  0 &&
                !isFilled(
                  colorSelection.colorId
                )
              ) {
                return;
              }

              rows.push({
                variant:
                  getVariantName(
                    variantSelection.variantId
                  ),

                color:
                  getColorName(
                    colorSelection.colorId,
                    variantSelection.variantId
                  ),

                discount:
                  isFilled(
                    colorSelection.discount
                  )
                    ? Number(
                        colorSelection.discount
                      )
                    : 0,

                vendorPrice:
                  calculateYourPrice(
                    colorSelection.discount
                  ),

                stock:
                  colorSelection.stock,
              });
            }
          );
        }
      );

      return rows;
    };

  // ============================================================
  // VALIDATE VARIANTS
  // ============================================================

  const validateVariantSelections =
    () => {
      // ==================================================
      // MUST HAVE AT LEAST ONE VARIANT
      // ==================================================

      if (
        variantSelections.length ===
        0
      ) {
        alert(
          "Please add at least one variant."
        );

        return false;
      }

      const usedVariants =
        new Set();

      // ==================================================
      // VARIANTS
      // ==================================================

      for (
        let vIndex = 0;
        vIndex <
        variantSelections.length;
        vIndex++
      ) {
        const variant =
          variantSelections[
            vIndex
          ];

        const isDefaultProduct =
          variants.length ===
          0;

        // ==================================================
        // VARIANT REQUIRED
        // ==================================================

        if (
          !isDefaultProduct &&
          !isFilled(
            variant.variantId
          )
        ) {
          alert(
            `Please select Variant ${
              vIndex + 1
            }.`
          );

          return false;
        }

        const variantId =
          isFilled(
            variant.variantId
          )
            ? normalizeId(
                variant.variantId
              )
            : null;

        // ==================================================
        // DUPLICATE VARIANT
        // ==================================================

        if (
          variantId !== null
        ) {
          if (
            usedVariants.has(
              variantId
            )
          ) {
            alert(
              "The same variant cannot be added more than once."
            );

            return false;
          }

          usedVariants.add(
            variantId
          );
        }

        // ==================================================
        // MUST HAVE AT LEAST ONE COLOR
        // ==================================================

        if (
          !Array.isArray(
            variant.colors
          ) ||
          variant.colors.length ===
            0
        ) {
          alert(
            `Please add at least one color for Variant ${
              vIndex + 1
            }.`
          );

          return false;
        }

        const usedColors =
          new Set();

        // ==================================================
        // COLORS
        // ==================================================

        for (
          let cIndex = 0;
          cIndex <
          variant.colors.length;
          cIndex++
        ) {
          const color =
            variant.colors[
              cIndex
            ];

          const availableColors =
            getColorsForVariant(
              variant.variantId
            );

          const hasRealColors =
            availableColors.length >
            0;

          // ==============================================
          // COLOR REQUIRED
          // ==============================================

          if (
            hasRealColors &&
            !isFilled(
              color.colorId
            )
          ) {
            alert(
              `Please select Color ${
                cIndex + 1
              } for Variant ${
                vIndex + 1
              }.`
            );

            return false;
          }

          const colorId =
            isFilled(
              color.colorId
            )
              ? normalizeId(
                  color.colorId
                )
              : null;

          // ==============================================
          // DUPLICATE COLOR
          // ==============================================

          if (
            colorId !== null
          ) {
            if (
              usedColors.has(
                colorId
              )
            ) {
              alert(
                "The same color cannot be added twice under the same variant."
              );

              return false;
            }

            usedColors.add(
              colorId
            );
          }

          // ==============================================
          // STOCK
          // ==============================================

          if (
            !isFilled(
              color.stock
            ) ||
            Number(
              color.stock
            ) <= 0
          ) {
            alert(
              `Please enter valid stock for ${getVariantName(
                variant.variantId
              )} - ${getColorName(
                color.colorId,
                variant.variantId
              )}.`
            );

            return false;
          }

          // ==============================================
          // DISCOUNT
          // ==============================================

          if (
            isFilled(
              color.discount
            )
          ) {
            const discount =
              Number(
                color.discount
              );

            if (
              !Number.isFinite(
                discount
              ) ||
              discount < 0 ||
              discount > 100
            ) {
              alert(
                `Discount must be between 0 and 100 for ${getVariantName(
                  variant.variantId
                )} - ${getColorName(
                  color.colorId,
                  variant.variantId
                )}.`
              );

              return false;
            }
          }
        }
      }

      return true;
    };

  // ============================================================
  // FORM VALIDATION
  // ============================================================

  const validateForm =
    () => {
      if (
        !isFilled(
          inventory.product
        )
      ) {
        alert(
          "Please select a product."
        );

        return false;
      }

      if (
        !productInfo ||
        productPrice <= 0
      ) {
        alert(
          "Selected product has an invalid base price."
        );

        return false;
      }

      if (
        !validateVariantSelections()
      ) {
        return false;
      }

      if (
        !isFilled(
          inventory.minPurchase
        ) ||
        Number(
          inventory.minPurchase
        ) < 1
      ) {
        alert(
          "Please enter a valid minimum purchase quantity."
        );

        return false;
      }

      if (
        !isFilled(
          inventory.maxPurchase
        ) ||
        Number(
          inventory.maxPurchase
        ) < 1
      ) {
        alert(
          "Please enter a valid maximum purchase quantity."
        );

        return false;
      }

      if (
        Number(
          inventory.minPurchase
        ) >
        Number(
          inventory.maxPurchase
        )
      ) {
        alert(
          "Minimum purchase cannot be greater than maximum purchase."
        );

        return false;
      }

      if (
        !isFilled(
          inventory.warranty
        )
      ) {
        alert(
          "Please enter the warranty."
        );

        return false;
      }

      if (
        !isFilled(
          inventory.condition
        )
      ) {
        alert(
          "Please select the product condition."
        );

        return false;
      }

      if (
        !isFilled(
          inventory.deliveryTime
        )
      ) {
        alert(
          "Please enter the delivery time."
        );

        return false;
      }

      if (
        !inventory.homeDelivery &&
        !inventory.storePickup
      ) {
        alert(
          "Please select at least one service."
        );

        return false;
      }

      if (
        !inventory.cod &&
        !inventory.emi &&
        !inventory.exchange
      ) {
        alert(
          "Please select at least one payment option."
        );

        return false;
      }

      if (
        !isFilled(
          inventory.offerTitle
        )
      ) {
        alert(
          "Please enter the offer title."
        );

        return false;
      }

      if (
        !isFilled(
          inventory.offerDescription
        )
      ) {
        alert(
          "Please enter the offer description."
        );

        return false;
      }

      if (
        !isFilled(
          inventory.returnPolicy
        )
      ) {
        alert(
          "Please enter the return policy."
        );

        return false;
      }

      return true;
    };

  // ============================================================
  // PRODUCT READY
  // ============================================================

  const isProductReady =
    () => {
      if (
        !isFilled(
          inventory.product
        )
      ) {
        return false;
      }

      if (
        !productInfo ||
        productPrice <= 0
      ) {
        return false;
      }

      // ==================================================
      // VARIANTS
      // ==================================================

      const variantsReady =
        variantSelections.length >
          0 &&
        variantSelections.every(
          (variant) => {
            const variantIdReady =
              variants.length ===
              0
                ? variant.variantId ===
                  DEFAULT_VARIANT_ID
                : isFilled(
                    variant.variantId
                  );

            const colorsReady =
              Array.isArray(
                variant.colors
              ) &&
              variant.colors.length >
                0 &&
              variant.colors.every(
                (color) => {
                  const availableColors =
                    getColorsForVariant(
                      variant.variantId
                    );

                  const colorIdReady =
                    availableColors.length ===
                    0
                      ? color.colorId ===
                          DEFAULT_COLOR_ID ||
                        isFilled(
                          color.colorId
                        )
                      : isFilled(
                          color.colorId
                        );

                  const validStock =
                    isFilled(
                      color.stock
                    ) &&
                    Number(
                      color.stock
                    ) > 0;

                  const validDiscount =
                    !isFilled(
                      color.discount
                    ) ||
                    (
                      Number(
                        color.discount
                      ) >= 0 &&
                      Number(
                        color.discount
                      ) <= 100
                    );

                  return (
                    colorIdReady &&
                    validStock &&
                    validDiscount
                  );
                }
              );

            return (
              variantIdReady &&
              colorsReady
            );
          }
        );

      if (!variantsReady) {
        return false;
      }

      // ==================================================
      // PURCHASE
      // ==================================================

      if (
        !isFilled(
          inventory.minPurchase
        ) ||
        Number(
          inventory.minPurchase
        ) <= 0
      ) {
        return false;
      }

      if (
        !isFilled(
          inventory.maxPurchase
        ) ||
        Number(
          inventory.maxPurchase
        ) <= 0
      ) {
        return false;
      }

      if (
        Number(
          inventory.minPurchase
        ) >
        Number(
          inventory.maxPurchase
        )
      ) {
        return false;
      }

      // ==================================================
      // CONDITION / DELIVERY
      // ==================================================

      if (
        !isFilled(
          inventory.warranty
        ) ||
        !isFilled(
          inventory.condition
        ) ||
        !isFilled(
          inventory.deliveryTime
        )
      ) {
        return false;
      }

      // ==================================================
      // SERVICES
      // ==================================================

      if (
        !inventory.homeDelivery &&
        !inventory.storePickup
      ) {
        return false;
      }

      // ==================================================
      // PAYMENT
      // ==================================================

      if (
        !inventory.cod &&
        !inventory.emi &&
        !inventory.exchange
      ) {
        return false;
      }

      // ==================================================
      // OFFERS / RETURN
      // ==================================================

      if (
        !isFilled(
          inventory.offerTitle
        ) ||
        !isFilled(
          inventory.offerDescription
        ) ||
        !isFilled(
          inventory.returnPolicy
        )
      ) {
        return false;
      }

      return true;
    };

  // ============================================================
  // BUILD INVENTORY DATA
  // ============================================================

  const buildInventoryData = (
    variantSelection,
    colorSelection,
    currentVendorId
  ) => {
    const variantId =
      isFilled(
        variantSelection.variantId
      )
        ? normalizeId(
            variantSelection.variantId
          )
        : null;

    const colorId =
      isFilled(
        colorSelection.colorId
      )
        ? normalizeId(
            colorSelection.colorId
          )
        : null;

    return {
      vendorId:
        Number(
          currentVendorId
        ),

      productId:
        Number(
          inventory.product
        ),

      variantId,

      colorId,

      stock:
        Number(
          colorSelection.stock
        ),

      discount:
        isFilled(
          colorSelection.discount
        )
          ? Number(
              colorSelection.discount
            )
          : 0,

      minPurchase:
        Number(
          inventory.minPurchase
        ),

      maxPurchase:
        Number(
          inventory.maxPurchase
        ),

      condition:
        inventory.condition,

      warranty:
        String(
          inventory.warranty ||
            ""
        ).trim(),

      deliveryTime:
        String(
          inventory.deliveryTime ||
            ""
        ).trim(),

      homeDelivery:
        Boolean(
          inventory.homeDelivery
        ),

      storePickup:
        Boolean(
          inventory.storePickup
        ),

      cod:
        Boolean(
          inventory.cod
        ),

      emi:
        Boolean(
          inventory.emi
        ),

      exchange:
        Boolean(
          inventory.exchange
        ),

      offerTitle:
        String(
          inventory.offerTitle ||
            ""
        ).trim(),

      offerDescription:
        String(
          inventory.offerDescription ||
            ""
        ).trim(),

      returnPolicy:
        String(
          inventory.returnPolicy ||
            ""
        ).trim(),
    };
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (submitting) {
        return;
      }

      const currentVendorId =
        vendorId ||
        localStorage.getItem(
          "vendorId"
        );

      if (!currentVendorId) {
        alert(
          "Vendor session not found. Please login again."
        );

        navigate(
          "/vendor/login"
        );

        return;
      }

      if (!validateForm()) {
        return;
      }

      setSubmitting(true);

      try {
        // ==================================================
        // EDIT MODE
        // ==================================================

        if (isEditMode) {
          const currentRecords =
            [];

          // ================================================
          // FLATTEN CURRENT UI
          // ================================================

          variantSelections.forEach(
            (
              variantSelection
            ) => {
              (
                variantSelection.colors ||
                []
              ).forEach(
                (
                  colorSelection
                ) => {
                  currentRecords.push({
                    inventoryId:
                      colorSelection.inventoryId,

                    variantId:
                      variantSelection.variantId,

                    colorId:
                      colorSelection.colorId,

                    data:
                      buildInventoryData(
                        variantSelection,
                        colorSelection,
                        currentVendorId
                      ),
                  });
                }
              );
            }
          );

          // ================================================
          // CURRENT INVENTORY IDS
          // ================================================

          const currentInventoryIds =
            new Set(
              currentRecords
                .map(
                  (record) =>
                    normalizeId(
                      record.inventoryId
                    )
                )
                .filter(
                  (id) =>
                    id !== null
                )
            );

          // ================================================
          // REMOVED RECORDS
          // ================================================

          const removedInventoryIds =
            originalInventoryRecords
              .map(
                (record) =>
                  normalizeId(
                    getInventoryId(
                      record
                    )
                  )
              )
              .filter(
                (id) =>
                  id !== null &&
                  !currentInventoryIds.has(
                    id
                  )
              );

          console.log(
            "REMOVED INVENTORY IDS:",
            removedInventoryIds
          );

          // ================================================
          // DELETE REMOVED RECORDS
          // ================================================

          for (
            const removedId of
              removedInventoryIds
          ) {
            await deleteInventory(
              removedId
            );
          }

          // ================================================
          // UPDATE EXISTING RECORDS
          // ================================================

          const recordsToUpdate =
            currentRecords.filter(
              (record) =>
                normalizeId(
                  record.inventoryId
                ) !== null
            );

          for (
            const record of
              recordsToUpdate
          ) {
            await updateInventory(
              normalizeId(
                record.inventoryId
              ),
              record.data
            );
          }

          // ================================================
          // ADD NEW RECORDS
          // ================================================

          const recordsToAdd =
            currentRecords.filter(
              (record) =>
                normalizeId(
                  record.inventoryId
                ) === null
            );

          for (
            const record of
              recordsToAdd
          ) {
            await addInventory(
              record.data
            );
          }

          console.log(
            "UPDATED:",
            recordsToUpdate.length
          );

          console.log(
            "ADDED:",
            recordsToAdd.length
          );

          console.log(
            "DELETED:",
            removedInventoryIds.length
          );

          alert(
            "Product updated successfully."
          );

          navigate(
            "/vendor/manage-products"
          );

          return;
        }

        // ==================================================
        // ADD MODE
        // ==================================================

        const inventoryRequests =
          [];

        variantSelections.forEach(
          (
            variantSelection
          ) => {
            (
              variantSelection.colors ||
              []
            ).forEach(
              (
                colorSelection
              ) => {
                inventoryRequests.push(
                  buildInventoryData(
                    variantSelection,
                    colorSelection,
                    currentVendorId
                  )
                );
              }
            );
          }
        );

        // ==================================================
        // ADD EACH RECORD
        // ==================================================

        for (
          const inventoryData of
            inventoryRequests
        ) {
          await addInventory(
            inventoryData
          );
        }

        alert(
          "Product added successfully."
        );

        setAddedProductIds(
          (prev) => {
            const next =
              new Set(prev);

            next.add(
              Number(
                inventory.product
              )
            );

            return next;
          }
        );

        handleClearProduct();
      } catch (error) {
        console.error(
          isEditMode
            ? "Failed to update inventory:"
            : "Failed to add inventory:",
          error
        );

        if (
          error.response
        ) {
          console.error(
            "Backend status:",
            error.response.status
          );

          console.error(
            "Backend response:",
            error.response.data
          );
        }

        alert(
          error.response?.data
            ?.message ||
            (
              isEditMode
                ? "Failed to update product."
                : "Failed to add product."
            )
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ============================================================
  // CLEAR
  // ============================================================

  const handleClearProduct =
    () => {
      setInventory({
        ...initialCommonDetails,
      });

      setProductInfo(null);
      setVariants([]);
      setColors([]);
      setAttributes([]);
      setAttributeValues({});
      setVariantSelections([]);
      setOriginalInventoryRecords([]);
    };

  // ============================================================
  // PREVIEW
  // ============================================================

  const previewPriceRows =
    getPreviewPriceRows();

  const selectedServices =
    [];

  if (
    inventory.homeDelivery
  ) {
    selectedServices.push(
      "Home Delivery"
    );
  }

  if (
    inventory.storePickup
  ) {
    selectedServices.push(
      "Store Pickup"
    );
  }

  const selectedPayments =
    [];

  if (inventory.cod) {
    selectedPayments.push(
      "Cash On Delivery"
    );
  }

  if (inventory.emi) {
    selectedPayments.push(
      "EMI"
    );
  }

  if (
    inventory.exchange
  ) {
    selectedPayments.push(
      "Exchange"
    );
  }

  // ============================================================
  // UI
  // ============================================================
return (
  <>
    {/* ======================================================
        HEADER
    ====================================================== */}


    {/* ======================================================
        TITLE
    ====================================================== */}

    <h1 className="page-title">

      {isEditMode
        ? "Edit Product"
        : "New Product"}

    </h1>


    <div className="master-layout">

      {/* ====================================================
          LEFT FORM
      ==================================================== */}

      <form
        className="master-form-section"
        onSubmit={
          handleSubmit
        }
      >

        <h2>
          Product Details
        </h2>


        {/* ==================================================
            PRODUCT
        ================================================== */}

        <h3>
          Product Name
        </h3>

        <select
          name="product"
          value={
            inventory.product
          }
          onChange={
            handleProductChange
          }
          disabled={
            isEditMode
          }
          required
        >

          <option value="">
            {loadingProducts
              ? "Loading Active Products..."
              : "Select Product"}
          </option>

          {products.map(
            (product) => {

              const isAdded =
                addedProductIds.has(
                  Number(
                    product.id
                  )
                );

              return (
                <option
                  key={`product-${product.id}`}
                  value={
                    product.id
                  }
                  disabled={
                    !isEditMode &&
                    isAdded
                  }
                >

                  {product.name}

                  {!isEditMode &&
                  isAdded
                    ? " ✓ Added"
                    : ""}

                </option>
              );
            }
          )}

        </select>


        {loadingProductDetails && (
          <p>
            Loading product details...
          </p>
        )}


        {/* ==================================================
            PRODUCT SPECIFICATIONS
        ================================================== */}

        {attributes.length >
          0 && (
          <>

            <h3>
              Product Specifications
            </h3>

            <p>
              These specifications
              are provided by the
              Product Master and
              cannot be changed by
              the vendor.
            </p>

            {attributes.map(
              (attribute) => (

                <div
                  className="specification-field"
                  key={`spec-${attribute.id}`}
                >

                  <label>

                    {attribute.label ||
                      attribute.name}

                    {attribute.unit
                      ? ` (${attribute.unit})`
                      : ""}

                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      attributeValues[
                        attribute.id
                      ] ?? ""
                    }
                  />

                </div>

              )
            )}

          </>
        )}


        {/* ==================================================
            VARIANTS
        ================================================== */}

        {inventory.product && (
          <>

            <h3>
              Variants
            </h3>

            {variantSelections.map(
              (
                variantSelection,
                variantIndex
              ) => (

                <div
                  className="variant-section"
                  key={
                    variantSelection.id
                  }
                >

                  {/* ======================================
                      VARIANT
                  ====================================== */}

                  <label>
                    Variant
                  </label>

                  {variants.length ===
                  0 ? (

                    <input
                      type="text"
                      readOnly
                      value="Default Variant"
                    />

                  ) : (

                    <select
                      value={
                        variantSelection.variantId ??
                        ""
                      }
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          e.target.value
                        )
                      }
                      required
                    >

                      <option value="">
                        Select Variant
                      </option>

                      {variants.map(
                        (
                          variant
                        ) => (

                          <option
                            key={`variant-option-${variant.id}`}
                            value={
                              variant.id
                            }
                          >

                            {variant.name ||
                              variant.value ||
                              variant.label}

                          </option>

                        )
                      )}

                    </select>

                  )}


                  {/* ======================================
                      COLORS
                  ====================================== */}

                  <h4>
                    Colors
                  </h4>

                  {(
                    variantSelection.colors ||
                    []
                  ).map(
                    (
                      colorSelection,
                      colorIndex
                    ) => (

                      <div
                        className="variant-color-section"
                        key={
                          colorSelection.id
                        }
                      >

                        <label>
                          Color
                        </label>

                        {getColorsForVariant(
                          variantSelection.variantId
                        ).length ===
                        0 ? (

                          <input
                            type="text"
                            readOnly
                            value="Default Color"
                          />

                        ) : (

                          <select
                            value={
                              colorSelection.colorId ??
                              ""
                            }
                            onChange={(e) =>
                              handleColorFieldChange(
                                variantIndex,
                                colorIndex,
                                "colorId",
                                e.target.value
                              )
                            }
                            required
                          >

                            <option value="">
                              Select Color
                            </option>

                            {getColorsForVariant(
                              variantSelection.variantId
                            ).map(
                              (
                                color
                              ) => (

                                <option
                                  key={`color-option-${variantSelection.variantId}-${color.id}`}
                                  value={
                                    color.id
                                  }
                                >

                                  {color.name ||
                                    color.value ||
                                    color.label}

                                </option>

                              )
                            )}

                          </select>

                        )}


                        {/* ==================================
                            STOCK
                        ================================== */}

                        <label>
                          Stock Quantity
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={
                            colorSelection.stock ??
                            ""
                          }
                          onChange={(
                            e
                          ) => {

                            const stockValue =
                              e.target.value;

                            handleColorFieldChange(
                              variantIndex,
                              colorIndex,
                              "stock",
                              stockValue
                            );

                            if (
                              isFilled(
                                stockValue
                              ) &&
                              Number(
                                stockValue
                              ) >
                                0 &&
                              (
                                !isFilled(
                                  inventory.maxPurchase
                                ) ||
                                Number(
                                  inventory.maxPurchase
                                ) >
                                  Number(
                                    stockValue
                                  )
                              )
                            ) {

                              setInventory(
                                (
                                  prev
                                ) => ({
                                  ...prev,

                                  maxPurchase:
                                    stockValue,
                                })
                              );

                            }

                          }}
                          required
                        />


                        {/* ==================================
                            ORIGINAL PRICE
                        ================================== */}

                        <div className="preview-item">

                          <label>
                            Original Price
                          </label>

                          <input
                            type="text"
                            readOnly
                            value={
                              productPrice >
                              0
                                ? `₹${productPrice.toFixed(
                                    2
                                  )}`
                                : ""
                            }
                          />

                        </div>


                        {/* ==================================
                            DISCOUNT
                        ================================== */}

                        <label>
                          Discount (%)
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={
                            colorSelection.discount ??
                            ""
                          }
                          onChange={(e) =>
                            handleColorFieldChange(
                              variantIndex,
                              colorIndex,
                              "discount",
                              e.target.value
                            )
                          }
                        />


                        {/* ==================================
                            YOUR PRICE
                        ================================== */}

                        <div className="preview-item">

                          <label>
                            Your Price
                          </label>

                          <input
                            type="text"
                            readOnly
                            value={
                              productPrice >
                              0
                                ? `₹${calculateYourPrice(
                                    colorSelection.discount
                                  ).toFixed(
                                    2
                                  )}`
                                : ""
                            }
                          />

                        </div>


                        {/* ==================================
                            REMOVE COLOR

                            ONLY IF 2+ COLORS
                        ================================== */}

                        {variantSelection
                          .colors
                          .length >
                          1 && (

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveColor(
                                variantIndex,
                                colorIndex
                              )
                            }
                          >
                            Remove Color
                          </button>

                        )}

                      </div>

                    )
                  )}


                  {/* ======================================
                      ADD COLOR
                  ====================================== */}

                  {getColorsForVariant(
                    variantSelection.variantId
                  ).length >
                    0 && (

                    <button
                      type="button"
                      onClick={() =>
                        handleAddColor(
                          variantIndex
                        )
                      }
                    >
                      + Add Color
                    </button>

                  )}


                  {/* ======================================
                      REMOVE VARIANT

                      ONLY IF 2+ VARIANTS
                  ====================================== */}

                  {variantSelections.length >
                    1 && (

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveVariant(
                          variantIndex
                        )
                      }
                    >
                      Remove Variant
                    </button>

                  )}

                </div>

              )
            )}


            {/* =================================================
                ADD VARIANT

                ALWAYS AFTER EXISTING VARIANT SECTIONS
            ================================================= */}

            {variants.length >
              0 && (

              <button
                type="button"
                onClick={
                  handleAddVariant
                }
              >
                + Add Variant
              </button>

            )}

          </>
        )}


        {/* ==================================================
            PURCHASE DETAILS
        ================================================== */}

        <h3>
          Purchase Details
        </h3>

        <label>
          Minimum Purchase Quantity
        </label>

        <input
          type="number"
          min="1"
          value={
            inventory.minPurchase
          }
          onChange={(e) =>
            setInventory(
              (prev) => ({
                ...prev,

                minPurchase:
                  e.target.value,
              })
            )
          }
          required
        />


        <label>
          Maximum Purchase Quantity
        </label>

        <input
          type="number"
          min="1"
          value={
            inventory.maxPurchase
          }
          onChange={(e) => {

            const value =
              e.target.value;

            const stocks =
              variantSelections
                .flatMap(
                  (variant) =>
                    variant.colors ||
                    []
                )
                .map((color) =>
                  Number(
                    color.stock
                  )
                )
                .filter(
                  (stock) =>
                    Number.isFinite(
                      stock
                    ) &&
                    stock > 0
                );

            const maxAllowed =
              stocks.length >
              0
                ? Math.min(
                    ...stocks
                  )
                : null;

            if (
              maxAllowed !==
                null &&
              Number(value) >
                maxAllowed
            ) {

              setInventory(
                (prev) => ({
                  ...prev,

                  maxPurchase:
                    String(
                      maxAllowed
                    ),
                })
              );

              return;
            }

            setInventory(
              (prev) => ({
                ...prev,

                maxPurchase:
                  value,
              })
            );

          }}
          required
        />


        {/* ==================================================
            CONDITION
        ================================================== */}

        <h3>
          Product Condition
        </h3>

        <label>
          Warranty
        </label>

        <input
          type="text"
          placeholder="Example: 1 Year"
          value={
            inventory.warranty
          }
          onChange={(e) =>
            setInventory(
              (prev) => ({
                ...prev,

                warranty:
                  e.target.value,
              })
            )
          }
          required
        />


        <label>
          Condition
        </label>

        <select
          value={
            inventory.condition
          }
          onChange={(e) =>
            setInventory(
              (prev) => ({
                ...prev,

                condition:
                  e.target.value,
              })
            )
          }
          required
        >

          <option value="">
            Select Condition
          </option>

          <option value="NEW">
            New
          </option>

          <option value="REFURBISHED">
            Refurbished
          </option>

        </select>


        {/* ==================================================
            DELIVERY
        ================================================== */}

        <h3>
          Delivery Details
        </h3>

        <label>
          Delivery Time
        </label>

        <input
          type="text"
          placeholder="Example: 3-5 days"
          value={
            inventory.deliveryTime
          }
          onChange={(e) =>
            setInventory(
              (prev) => ({
                ...prev,

                deliveryTime:
                  e.target.value,
              })
            )
          }
          required
        />


        {/* ==================================================
            SERVICES
        ================================================== */}

        <h3>
          Services
        </h3>

        <label>

          <input
            type="checkbox"
            checked={
              inventory.homeDelivery
            }
            onChange={(e) =>
              setInventory(
                (prev) => ({
                  ...prev,

                  homeDelivery:
                    e.target.checked,
                })
              )
            }
          />

          Home Delivery

        </label>


        <label>

          <input
            type="checkbox"
            checked={
              inventory.storePickup
            }
            onChange={(e) =>
              setInventory(
                (prev) => ({
                  ...prev,

                  storePickup:
                    e.target.checked,
                })
              )
            }
          />

          Store Pickup

        </label>


        {/* ==================================================
            PAYMENT
        ================================================== */}

        <h3>
          Payment Options
        </h3>

        <label>

          <input
            type="checkbox"
            checked={
              inventory.cod
            }
            onChange={(e) =>
              setInventory(
                (prev) => ({
                  ...prev,

                  cod: e.target.checked,
                })
              )
            }
          />

          Cash On Delivery

        </label>


        <label>

          <input
            type="checkbox"
            checked={
              inventory.emi
            }
            onChange={(e) =>
              setInventory(
                (prev) => ({
                  ...prev,

                  emi: e.target.checked,
                })
              )
            }
          />

          EMI

        </label>


        <label>

          <input
            type="checkbox"
            checked={
              inventory.exchange
            }
            onChange={(e) =>
              setInventory(
                (prev) => ({
                  ...prev,

                  exchange:
                    e.target.checked,
                })
              )
            }
          />

          Exchange

        </label>


        {/* ==================================================
            OFFERS
        ================================================== */}

        <h3>
          Offers
        </h3>

        <label>
          Offer Title
        </label>

        <input
          type="text"
          value={
            inventory.offerTitle
          }
          onChange={(e) =>
            setInventory(
              (prev) => ({
                ...prev,

                offerTitle:
                  e.target.value,
              })
            )
          }
          required
        />


        <label>
          Offer Description
        </label>

        <textarea
          value={
            inventory.offerDescription
          }
          onChange={(e) =>
            setInventory(
              (prev) => ({
                ...prev,

                offerDescription:
                  e.target.value,
              })
            )
          }
          maxLength={1000}
          required
        />


        {/* ==================================================
            RETURN POLICY
        ================================================== */}

        <h3>
          Return Policy
        </h3>

        <textarea
          value={
            inventory.returnPolicy
          }
          onChange={(e) =>
            setInventory(
              (prev) => ({
                ...prev,

                returnPolicy:
                  e.target.value,
              })
            )
          }
          required
        />


        {/* ==================================================
            SUBMIT
        ================================================== */}

        <button
          type="submit"
          className="add-product-btn"
          disabled={
            !isProductReady() ||
            submitting ||
            loadingProductDetails
          }
        >

          {submitting
            ? isEditMode
              ? "Saving Changes..."
              : "Adding Product..."
            : isEditMode
            ? "Save Changes"
            : "Add Product"}

        </button>

      </form>


      {/* ====================================================
          RIGHT PREVIEW
      ==================================================== */}

      <div className="master-preview-section">

        {!productInfo ? (

          /* =================================================
             NO PRODUCT SELECTED
          ================================================= */

          <div className="master-empty-preview">

            <img
              src="/images/select-product-reference.png"
              alt="Loading...."
              className="master-empty-preview-image"
            />

            <h2>
              Hey, How are you doing?
            </h2>

          </div>

        ) : (

          /* =================================================
             PRODUCT SELECTED
          ================================================= */

          <>

            <h2>
              Live Product Preview
            </h2>

            <div className="master-preview-card">

              {/* PRODUCT NAME */}

              {productInfo?.name && (

                <div className="preview-item">

                  <label>
                    Product Name
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      productInfo.name
                    }
                  />

                </div>

              )}


              {/* =================================================
                  SPECIFICATIONS
              ================================================= */}

              {attributes.map(
                (attribute) => {

                  const value =
                    attributeValues[
                      attribute.id
                    ];

                  if (!isFilled(value)) {
                    return null;
                  }

                  return (

                    <div
                      className="preview-item"
                      key={`preview-spec-${attribute.id}`}
                    >

                      <label>

                        {attribute.label ||
                          attribute.name}

                        {attribute.unit
                          ? ` (${attribute.unit})`
                          : ""}

                      </label>

                      <input
                        type="text"
                        readOnly
                        value={value}
                      />

                    </div>

                  );

                }
              )}


              {/* =================================================
                  VARIANT / COLOR / PRICE
              ================================================= */}

              {previewPriceRows.map(
                (row, index) => (

                  <div
                    key={`preview-row-${index}`}
                  >

                    <div className="preview-item">

                      <label>
                        Variant
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={
                          row.variant
                        }
                      />

                    </div>


                    <div className="preview-item">

                      <label>
                        Color
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={
                          row.color
                        }
                      />

                    </div>


                    {isFilled(row.stock) && (

                      <div className="preview-item">

                        <label>
                          Stock
                        </label>

                        <input
                          type="text"
                          readOnly
                          value={
                            row.stock
                          }
                        />

                      </div>

                    )}


                    <div className="preview-item">

                      <label>
                        Original Price
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={
                          productPrice > 0
                            ? `₹${productPrice.toFixed(2)}`
                            : ""
                        }
                      />

                    </div>


                    <div className="preview-item">

                      <label>
                        Discount
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={`${row.discount}%`}
                      />

                    </div>


                    <div className="preview-item">

                      <label>
                        Vendor Price
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={
                          productPrice > 0
                            ? `₹${row.vendorPrice.toFixed(2)}`
                            : ""
                        }
                      />

                    </div>


                    <div className="preview-item">

                      <label>
                        Final Price
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={
                          productPrice > 0
                            ? `₹${row.vendorPrice.toFixed(2)}`
                            : ""
                        }
                      />

                    </div>

                  </div>

                )
              )}


              {/* =================================================
                  PURCHASE
              ================================================= */}

              {isFilled(inventory.minPurchase) && (

                <div className="preview-item">

                  <label>
                    Min Purchase
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      inventory.minPurchase
                    }
                  />

                </div>

              )}


              {isFilled(inventory.maxPurchase) && (

                <div className="preview-item">

                  <label>
                    Max Purchase
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      inventory.maxPurchase
                    }
                  />

                </div>

              )}


              {/* WARRANTY */}

              {isFilled(inventory.warranty) && (

                <div className="preview-item">

                  <label>
                    Warranty
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      inventory.warranty
                    }
                  />

                </div>

              )}


              {/* CONDITION */}

              {isFilled(inventory.condition) && (

                <div className="preview-item">

                  <label>
                    Condition
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      inventory.condition
                    }
                  />

                </div>

              )}


              {/* DELIVERY */}

              {isFilled(inventory.deliveryTime) && (

                <div className="preview-item">

                  <label>
                    Delivery
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      inventory.deliveryTime
                    }
                  />

                </div>

              )}


              {/* SERVICES */}

              {selectedServices.length > 0 && (

                <div className="preview-item">

                  <label>
                    Services
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      selectedServices.join(", ")
                    }
                  />

                </div>

              )}


              {/* PAYMENT */}

              {selectedPayments.length > 0 && (

                <div className="preview-item">

                  <label>
                    Payment Options
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      selectedPayments.join(", ")
                    }
                  />

                </div>

              )}


              {/* OFFER */}

              {isFilled(inventory.offerTitle) && (

                <div className="preview-item">

                  <label>
                    Offer
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      inventory.offerTitle
                    }
                  />

                </div>

              )}


              {/* OFFER DESCRIPTION */}

              {isFilled(inventory.offerDescription) && (

                <div className="preview-item">

                  <label>
                    Offer Description
                  </label>

                  <textarea
                    readOnly
                    value={
                      inventory.offerDescription
                    }
                  />

                </div>

              )}


              {/* RETURN POLICY */}

              {isFilled(inventory.returnPolicy) && (

                <div className="preview-item">

                  <label>
                    Return Policy
                  </label>

                  <textarea
                    readOnly
                    value={
                      inventory.returnPolicy
                    }
                  />

                </div>

              )}

            </div>

          </>

        )}

      </div>

    </div>
  </>
);
}

export default VendorProductPage;