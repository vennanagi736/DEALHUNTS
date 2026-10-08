import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    MapContainer,
    Marker,
    Popup as LeafletPopup,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";

import {
    useNavigate,
} from "react-router-dom";

import L from "leaflet";

import Header from "../../components/Header";
import Popup from "../../components/Popup";

import "../../styles/AvailableShopNearMe.css";

import "leaflet/dist/leaflet.css";


// ============================================================
// API
// ============================================================

const API_BASE_URL =
    "http://localhost:8080";


// ============================================================
// CONSTANTS
// ============================================================

const SHOPS_PER_PAGE =
    5;

const DEFAULT_MAP_LOCATION = {
    latitude: 16.5062,
    longitude: 80.6480,
};


// ============================================================
// LEAFLET DEFAULT ICON FIX
// ============================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// ============================================================
// NUMBERED SHOP MARKER
// ============================================================

const createShopMarkerIcon =
    (number) =>
        L.divIcon({
            className:
                "dh-available-numbered-marker-wrapper",

            html: `
                <div class="dh-available-numbered-marker">
                    <span>${number}</span>
                </div>
            `,

            iconSize: [
                38,
                46,
            ],

            iconAnchor: [
                19,
                46,
            ],

            popupAnchor: [
                0,
                -42,
            ],
        });


const createSelectedShopMarkerIcon =
    (number) =>
        L.divIcon({
            className:
                "dh-available-selected-marker-wrapper",

            html: `
                <div class="dh-available-selected-marker">
                    <span>${number}</span>
                </div>
            `,

            iconSize: [
                46,
                54,
            ],

            iconAnchor: [
                23,
                54,
            ],

            popupAnchor: [
                0,
                -50,
            ],
        });


// ============================================================
// DISTANCE
// ============================================================

const calculateDistanceKm =
    (
        latitude1,
        longitude1,
        latitude2,
        longitude2
    ) => {

        const lat1 =
            Number(latitude1);

        const lon1 =
            Number(longitude1);

        const lat2 =
            Number(latitude2);

        const lon2 =
            Number(longitude2);


        if (
            !Number.isFinite(lat1) ||
            !Number.isFinite(lon1) ||
            !Number.isFinite(lat2) ||
            !Number.isFinite(lon2)
        ) {
            return null;
        }


        const earthRadius =
            6371;


        const latitudeDifference =
            (
                (lat2 - lat1) *
                Math.PI
            ) /
            180;


        const longitudeDifference =
            (
                (lon2 - lon1) *
                Math.PI
            ) /
            180;


        const a =
            Math.sin(
                latitudeDifference / 2
            ) *
            Math.sin(
                latitudeDifference / 2
            ) +
            Math.cos(
                lat1 * Math.PI / 180
            ) *
            Math.cos(
                lat2 * Math.PI / 180
            ) *
            Math.sin(
                longitudeDifference / 2
            ) *
            Math.sin(
                longitudeDifference / 2
            );


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return (
            earthRadius *
            c
        );
    };


// ============================================================
// LOCATION CLEANER
// ============================================================

const cleanLocationPart =
    (value) => {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
            .trim()
            .replace(
                /\s+/g,
                " "
            );
    };


// ============================================================
// HUMAN READABLE ADDRESS
// ============================================================

const getHumanReadableAddress =
    (address) => {

        if (!address) {
            return "";
        }


        const parts = [];


        const road =
            cleanLocationPart(
                address.road
            );

        const neighbourhood =
            cleanLocationPart(
                address.neighbourhood
            );

        const suburb =
            cleanLocationPart(
                address.suburb
            );

        const village =
            cleanLocationPart(
                address.village
            );

        const town =
            cleanLocationPart(
                address.town
            );

        const city =
            cleanLocationPart(
                address.city
            );

        const district =
            cleanLocationPart(
                address.state_district
            );

        const state =
            cleanLocationPart(
                address.state
            );


        if (road) {
            parts.push(road);
        }


        if (
            neighbourhood &&
            !parts.includes(
                neighbourhood
            )
        ) {
            parts.push(
                neighbourhood
            );
        }


        if (
            suburb &&
            !parts.includes(
                suburb
            )
        ) {
            parts.push(
                suburb
            );
        }


        const locality =
            village ||
            town ||
            city;


        if (
            locality &&
            !parts.includes(
                locality
            )
        ) {
            parts.push(
                locality
            );
        }


        if (
            district &&
            !parts.includes(
                district
            )
        ) {
            parts.push(
                district
            );
        }


        if (
            state &&
            !parts.includes(
                state
            )
        ) {
            parts.push(
                state
            );
        }


        return parts.join(
            ", "
        );
    };


// ============================================================
// REVERSE GEOCODING
// ============================================================

const reverseGeocode =
    async (
        latitude,
        longitude
    ) => {

        try {

            const response =
                await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
                        latitude
                    )}&lon=${encodeURIComponent(
                        longitude
                    )}&zoom=18&addressdetails=1`,
                    {
                        headers: {
                            Accept:
                                "application/json",
                        },
                    }
                );


            if (!response.ok) {
                return "";
            }


            const data =
                await response.json();


            return (
                getHumanReadableAddress(
                    data?.address
                ) ||
                cleanLocationPart(
                    data?.display_name
                ) ||
                ""
            );

        } catch (error) {

            console.warn(
                "Reverse geocoding failed:",
                error
            );

            return "";
        }
    };


// ============================================================
// GOOGLE MAPS COORDINATE EXTRACTION
// ============================================================

const extractGoogleMapsCoordinates =
    (url) => {

        if (!url) {
            return null;
        }


        const value =
            String(url).trim();


        const patterns = [

            /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,

            /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,

            /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,

            /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i,

            /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
        ];


        for (
            const pattern of patterns
        ) {

            const match =
                value.match(
                    pattern
                );


            if (
                match &&
                match[1] !== undefined &&
                match[2] !== undefined
            ) {

                const latitude =
                    Number(
                        match[1]
                    );

                const longitude =
                    Number(
                        match[2]
                    );


                if (
                    Number.isFinite(
                        latitude
                    ) &&
                    Number.isFinite(
                        longitude
                    ) &&
                    Math.abs(latitude) <= 90 &&
                    Math.abs(longitude) <= 180
                ) {

                    return {
                        latitude,
                        longitude,
                    };
                }
            }
        }


        return null;
    };


// ============================================================
// GOOGLE MAPS LINK
// ============================================================

const getVendorGoogleMapsLink =
    (vendor) => {

        return (
            vendor?.googleMapsLink ||
            vendor?.locationLink ||
            vendor?.googleMapLink ||
            vendor?.mapsLink ||
            vendor?.googleMapsUrl ||
            ""
        );
    };


// ============================================================
// MAP CENTER UPDATER
// ============================================================

function MapCenterUpdater({
    position,
}) {

    const map =
        useMap();


    useEffect(() => {

        if (
            position &&
            Number.isFinite(
                Number(
                    position.latitude
                )
            ) &&
            Number.isFinite(
                Number(
                    position.longitude
                )
            )
        ) {

            map.setView(
                [
                    Number(
                        position.latitude
                    ),

                    Number(
                        position.longitude
                    ),
                ],
                map.getZoom()
            );
        }

    }, [
        position,
        map,
    ]);


    return null;
}


// ============================================================
// LOCATION MAP CLICK HANDLER
// ============================================================

function MapClickHandler({
    onLocationSelect,
}) {

    useMapEvents({

        click(event) {

            onLocationSelect({
                latitude:
                    event.latlng.lat,

                longitude:
                    event.latlng.lng,
            });
        },

    });


    return null;
}


// ============================================================
// SHOP MAP FITTER
// ============================================================

function ShopMapController({
    shops,
    userLocation,
    selectedShop,
}) {

    const map =
        useMap();


    useEffect(() => {

        const validShops =
            Array.isArray(shops)
                ? shops.filter(
                      (shop) =>
                          Number.isFinite(
                              Number(shop.latitude)
                          ) &&
                          Number.isFinite(
                              Number(shop.longitude)
                          )
                  )
                : [];


        if (
            selectedShop &&
            Number.isFinite(Number(selectedShop.latitude)) &&
            Number.isFinite(Number(selectedShop.longitude))
        ) {
            map.flyTo(
                [
                    Number(selectedShop.latitude),
                    Number(selectedShop.longitude),
                ],
                Math.max(map.getZoom(), 14),
                { duration: 0.65 }
            );

            return;
        }


        if (validShops.length === 0) {

            if (
                userLocation &&
                Number.isFinite(
                    Number(userLocation.latitude)
                ) &&
                Number.isFinite(
                    Number(userLocation.longitude)
                )
            ) {

                map.setView(
                    [
                        Number(userLocation.latitude),
                        Number(userLocation.longitude),
                    ],
                    13
                );

            } else {

                map.setView(
                    [
                        DEFAULT_MAP_LOCATION.latitude,
                        DEFAULT_MAP_LOCATION.longitude,
                    ],
                    12
                );
            }

            return;
        }


        if (validShops.length === 1) {

            map.setView(
                [
                    Number(validShops[0].latitude),
                    Number(validShops[0].longitude),
                ],
                14
            );

            return;
        }


        const bounds =
            L.latLngBounds(
                validShops.map(
                    (shop) => [
                        Number(shop.latitude),
                        Number(shop.longitude),
                    ]
                )
            );


        map.fitBounds(
            bounds,
            {
                padding: [
                    55,
                    55,
                ],
                maxZoom: 15,
            }
        );

    }, [
        shops,
        userLocation,
        selectedShop,
        map,
    ]);


    return null;
}

// ============================================================
// COMPONENT
// ============================================================

function AvailableShopNearYou() {

    const navigate =
        useNavigate();


    // ========================================================
    // STATE
    // ========================================================

    const [
        vendors,
        setVendors,
    ] =
        useState([]);


    const [
        results,
        setResults,
    ] =
        useState([]);


    const [
        searchText,
        setSearchText,
    ] =
        useState("");


    const [
        loading,
        setLoading,
    ] =
        useState(false);


    const [
        vendorsLoading,
        setVendorsLoading,
    ] =
        useState(true);


    const [
        locationLoading,
        setLocationLoading,
    ] =
        useState(false);


    const [
        userLocation,
        setUserLocation,
    ] =
        useState(null);


    const [
        userLocationName,
        setUserLocationName,
    ] =
        useState("");


    const [
        pendingLocation,
        setPendingLocation,
    ] =
        useState(
            DEFAULT_MAP_LOCATION
        );


    const [
        pendingLocationName,
        setPendingLocationName,
    ] =
        useState("");


    const [
        locationDetected,
        setLocationDetected,
    ] =
        useState(false);


    const [
        locationError,
        setLocationError,
    ] =
        useState("");


    const [
        showLocationMethodChooser,
        setShowLocationMethodChooser,
    ] =
        useState(false);


    const [
        showLocationChooser,
        setShowLocationChooser,
    ] =
        useState(false);


    const [
        mapSearch,
        setMapSearch,
    ] =
        useState("");


    const [
        mapSearchLoading,
        setMapSearchLoading,
    ] =
        useState(false);


    const [
        mapSearchError,
        setMapSearchError,
    ] =
        useState("");


    const [
        showGoogleMapsConfirm,
        setShowGoogleMapsConfirm,
    ] =
        useState(false);


    const [
        selectedShopForMap,
        setSelectedShopForMap,
    ] =
        useState(null);


    const [
        selectedShop,
        setSelectedShop,
    ] =
        useState(null);


    const [
        currentPage,
        setCurrentPage,
    ] =
        useState(1);


    const [
        sortBy,
        setSortBy,
    ] =
        useState("nearest");


    // ========================================================
    // AUTH
    // ========================================================

    const getUserToken =
        () => {

            return (
                localStorage.getItem(
                    "userJwtToken"
                ) ||
                localStorage.getItem(
                    "jwtToken"
                ) ||
                localStorage.getItem(
                    "token"
                )
            );
        };


    const getHeaders =
        () => {

            const token =
                getUserToken();


            return token
                ? {
                      Authorization:
                          `Bearer ${token}`,

                      "Content-Type":
                          "application/json",
                  }
                : {
                      "Content-Type":
                          "application/json",
                  };
        };


    // ========================================================
    // VENDOR ADDRESS
    // ========================================================

    const getVendorAddress =
        (vendor) => {

            return (
                cleanLocationPart(
                    vendor?.address
                ) ||
                cleanLocationPart(
                    vendor?.shopAddress
                ) ||
                cleanLocationPart(
                    vendor?.locationName
                ) ||
                ""
            );
        };


    const getVendorPhone =
        (vendor) => {

            return (
                cleanLocationPart(vendor?.phone) ||
                cleanLocationPart(vendor?.mobile) ||
                cleanLocationPart(vendor?.phoneNumber) ||
                cleanLocationPart(vendor?.contactNumber) ||
                ""
            );
        };


    const getVendorHours =
        (vendor) => {

            return (
                cleanLocationPart(vendor?.openingHours) ||
                cleanLocationPart(vendor?.businessHours) ||
                cleanLocationPart(vendor?.workingHours) ||
                cleanLocationPart(vendor?.timings) ||
                ""
            );
        };


    const getVendorDescription =
        (vendor) => {

            return (
                cleanLocationPart(vendor?.description) ||
                cleanLocationPart(vendor?.shopDescription) ||
                cleanLocationPart(vendor?.businessDescription) ||
                ""
            );
        };


    // ========================================================
    // NORMALIZE VENDOR
    // ========================================================

    const normalizeVendor =
        (vendor) => {

            const vendorId =
                vendor?.vendorId ??
                vendor?.id;


            const vendorName =
                cleanLocationPart(
                    vendor?.vendorName
                ) ||
                cleanLocationPart(
                    vendor?.shopName
                ) ||
                cleanLocationPart(
                    vendor?.name
                ) ||
                `Shop ${vendorId || ""}`;


            let latitude =
                Number(
                    vendor?.latitude
                );

            let longitude =
                Number(
                    vendor?.longitude
                );


            const googleMapsLink =
                getVendorGoogleMapsLink(
                    vendor
                );


            /*
             * IMPORTANT:
             *
             * 1. Backend latitude/longitude is always preferred.
             * 2. Google Maps coordinates are only a fallback.
             * 3. Reverse geocoding is NEVER used to create
             *    vendor marker coordinates.
             */

            if (
                !Number.isFinite(
                    latitude
                ) ||
                !Number.isFinite(
                    longitude
                )
            ) {

                const extracted =
                    extractGoogleMapsCoordinates(
                        googleMapsLink
                    );


                if (extracted) {

                    latitude =
                        extracted.latitude;

                    longitude =
                        extracted.longitude;
                }
            }


            return {

                ...vendor,

                vendorId,

                vendorName,

                address:
                    getVendorAddress(
                        vendor
                    ),

                latitude:
                    Number.isFinite(
                        latitude
                    )
                        ? latitude
                        : null,

                longitude:
                    Number.isFinite(
                        longitude
                    )
                        ? longitude
                        : null,

                googleMapsLink,
            };
        };


    // ========================================================
    // LOAD VENDORS
    // ========================================================

    const loadAllVendors =
        async () => {

            setVendorsLoading(
                true
            );


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/vendor/all`,
                        {
                            method:
                                "GET",

                            headers:
                                getHeaders(),
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `Vendor request failed: ${response.status}`
                    );
                }


                const data =
                    await response.json();


                const vendorArray =
                    Array.isArray(
                        data
                    )
                        ? data
                        : Array.isArray(
                              data?.vendors
                          )
                        ? data.vendors
                        : [];


                const normalizedVendors =
                    vendorArray
                        .map(
                            normalizeVendor
                        )
                        .filter(
                            (vendor) =>
                                vendor.vendorId !=
                                null
                        );


                setVendors(
                    normalizedVendors
                );


                return normalizedVendors;

            } catch (error) {

                console.error(
                    "Unable to load vendors:",
                    error
                );


                setVendors([]);


                setLocationError(
                    "Unable to load local shops."
                );


                return [];

            } finally {

                setVendorsLoading(
                    false
                );
            }
        };


    // ========================================================
    // NORMALIZE PRODUCT
    // ========================================================

    const normalizeProduct =
        (product) => {

            return {

                ...product,

                productId:
                    product?.productId ??
                    product?.id,

                productName:
                    cleanLocationPart(
                        product?.productName
                    ) ||
                    cleanLocationPart(
                        product?.name
                    ) ||
                    "Product",

                brand:
                    cleanLocationPart(
                        product?.brand
                    ) ||
                    cleanLocationPart(
                        product?.brandName
                    ),

                category:
                    cleanLocationPart(
                        product?.category
                    ) ||
                    cleanLocationPart(
                        product?.categoryName
                    ),

                stock:
                    product?.stock ??
                    product?.quantity ??
                    0,

                availability:
                    cleanLocationPart(
                        product?.availability
                    ) ||
                    "IN STOCK",
            };
        };


    // ========================================================
    // LOAD PRODUCTS
    // ========================================================

    const loadNearbyProducts =
        async (
            latitude,
            longitude,
            search = "",
            suppliedVendors = null
        ) => {

            const trimmedSearch =
                String(
                    search || ""
                ).trim();


            if (!trimmedSearch) {

                setResults([]);

                setLoading(false);

                return [];
            }


            if (
                latitude == null ||
                longitude == null
            ) {

                setResults([]);

                setLoading(false);

                return [];
            }


            setLoading(
                true
            );

            setLocationError(
                ""
            );


            try {

                const vendorList =
                    Array.isArray(
                        suppliedVendors
                    ) &&
                    suppliedVendors.length > 0
                        ? suppliedVendors
                        : vendors;


                if (
                    vendorList.length ===
                    0
                ) {

                    setResults([]);

                    return [];
                }


                const productRequests =
                    vendorList.map(
                        async (
                            vendor
                        ) => {

                            try {

                                const response =
                                    await fetch(
                                        `${API_BASE_URL}/vendor/products/active?vendorId=${encodeURIComponent(
                                            vendor.vendorId
                                        )}`,
                                        {
                                            method:
                                                "GET",

                                            headers:
                                                getHeaders(),
                                        }
                                    );


                                if (!response.ok) {
                                    return [];
                                }


                                const data =
                                    await response.json();


                                const products =
                                    Array.isArray(
                                        data
                                    )
                                        ? data
                                        : Array.isArray(
                                              data?.products
                                          )
                                        ? data.products
                                        : [];


                                return products.map(
                                    (
                                        product
                                    ) => ({
                                        ...normalizeProduct(
                                            product
                                        ),

                                        vendorId:
                                            vendor.vendorId,

                                        vendorName:
                                            vendor.vendorName,
                                    })
                                );

                            } catch (error) {

                                console.warn(
                                    `Product loading failed for vendor ${vendor.vendorId}:`,
                                    error
                                );


                                return [];
                            }
                        }
                    );


                const productGroups =
                    await Promise.all(
                        productRequests
                    );


                const allProducts =
                    productGroups.flat();


                const normalizedSearch =
                    trimmedSearch.toLowerCase();


                const matchingProducts =
                    allProducts.filter(
                        (product) => {

                            const productName =
                                String(
                                    product.productName ||
                                    ""
                                ).toLowerCase();


                            const brand =
                                String(
                                    product.brand ||
                                    ""
                                ).toLowerCase();


                            const category =
                                String(
                                    product.category ||
                                    ""
                                ).toLowerCase();


                            return (
                                productName.includes(
                                    normalizedSearch
                                ) ||
                                brand.includes(
                                    normalizedSearch
                                ) ||
                                category.includes(
                                    normalizedSearch
                                )
                            );
                        }
                    );


                setResults(
                    matchingProducts
                );


                return matchingProducts;

            } catch (error) {

                console.error(
                    "Product search failed:",
                    error
                );


                setResults([]);

                return [];

            } finally {

                setLoading(
                    false
                );
            }
        };


    // ========================================================
    // GROUP SHOPS
    // ========================================================

    const groupedShops =
        useMemo(() => {

            const shopMap =
                new Map();


            vendors.forEach(
                (vendor) => {

                    const distance =
                        userLocation &&
                        vendor.latitude !=
                            null &&
                        vendor.longitude !=
                            null
                            ? calculateDistanceKm(
                                  userLocation.latitude,
                                  userLocation.longitude,
                                  vendor.latitude,
                                  vendor.longitude
                              )
                            : null;


                    shopMap.set(
                        vendor.vendorId,
                        {
                            ...vendor,

                            products: [],

                            distanceKm:
                                distance,
                        }
                    );
                }
            );


            if (
                searchText.trim()
            ) {

                results.forEach(
                    (product) => {

                        const shop =
                            shopMap.get(
                                product.vendorId
                            );


                        if (shop) {

                            shop.products.push(
                                product
                            );
                        }
                    }
                );
            }


            let shops =
                Array.from(
                    shopMap.values()
                );


            const normalizedSearch =
                searchText
                    .trim()
                    .toLowerCase();


            if (
                normalizedSearch
            ) {

                shops =
                    shops.filter(
                        (shop) => {

                            const shopName =
                                String(
                                    shop.vendorName ||
                                    ""
                                ).toLowerCase();


                            const shopAddress =
                                String(
                                    shop.address ||
                                    ""
                                ).toLowerCase();


                            const matchingShop =
                                shopName.includes(
                                    normalizedSearch
                                ) ||
                                shopAddress.includes(
                                    normalizedSearch
                                );


                            const matchingProducts =
                                shop.products.length >
                                0;


                            return (
                                matchingShop ||
                                matchingProducts
                            );
                        }
                    );
            }


            // ------------------------------------------------
            // SORT / FILTER
            // ------------------------------------------------

            if (
                sortBy ===
                "name"
            ) {

                shops.sort(
                    (a, b) =>
                        String(
                            a.vendorName ||
                            ""
                        ).localeCompare(
                            String(
                                b.vendorName ||
                                ""
                            )
                        )
                );

            } else {

                shops.sort(
                    (a, b) => {

                        const distanceA =
                            a.distanceKm ??
                            Number.MAX_SAFE_INTEGER;


                        const distanceB =
                            b.distanceKm ??
                            Number.MAX_SAFE_INTEGER;


                        return (
                            distanceA -
                            distanceB
                        );
                    }
                );


                const maxDistance =
                    {
                        within10:
                            10,

                        within20:
                            20,

                        within30:
                            30,
                    }[
                        sortBy
                    ];


                if (
                    maxDistance
                ) {

                    shops =
                        shops.filter(
                            (shop) =>
                                shop.distanceKm !=
                                    null &&
                                shop.distanceKm <=
                                    maxDistance
                        );
                }
            }


            return shops;

        }, [
            vendors,
            results,
            searchText,
            userLocation,
            sortBy,
        ]);


    // ========================================================
    // MAP-READY SHOPS
    //
    // Only coordinate-valid shops are displayed because every
    // displayed shop MUST have a corresponding map marker.
    // ========================================================

    const mapReadyShops =
        useMemo(() => {

            return groupedShops.filter(
                (shop) =>
                    Number.isFinite(
                        Number(
                            shop.latitude
                        )
                    ) &&
                    Number.isFinite(
                        Number(
                            shop.longitude
                        )
                    )
            );

        }, [
            groupedShops,
        ]);


    // ========================================================
    // PAGINATION
    // ========================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                mapReadyShops.length /
                SHOPS_PER_PAGE
            )
        );


    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages
        );


    const visibleShops =
        useMemo(() => {

            const startIndex =
                (
                    safeCurrentPage -
                    1
                ) *
                SHOPS_PER_PAGE;


            return mapReadyShops.slice(
                startIndex,
                startIndex +
                    SHOPS_PER_PAGE
            );

        }, [
            mapReadyShops,
            safeCurrentPage,
        ]);


    // ========================================================
    // RESET PAGE WHEN FILTERS CHANGE
    // ========================================================

    useEffect(() => {

        setCurrentPage(1);

    }, [
        searchText,
        sortBy,
        userLocation,
    ]);


    // ========================================================
    // LOCATION METHOD CHOOSER
    // ========================================================

    const openLocationMethodChooser =
        () => {

            setLocationError(
                ""
            );

            setShowLocationMethodChooser(
                true
            );
        };


    // ========================================================
    // AUTOMATIC LOCATION
    // ========================================================

    const detectLocationAutomatically =
        () => {

            if (
                !navigator.geolocation
            ) {

                setLocationError(
                    "Geolocation is not supported by this browser."
                );

                return;
            }


            setShowLocationMethodChooser(
                false
            );

            setLocationLoading(
                true
            );

            setLocationError(
                ""
            );


            navigator.geolocation.getCurrentPosition(
                async (
                    position
                ) => {

                    try {

                        const latitude =
                            position.coords.latitude;

                        const longitude =
                            position.coords.longitude;


                        const locationName =
                            await reverseGeocode(
                                latitude,
                                longitude
                            );


                        const selectedLocation =
                            {
                                latitude,
                                longitude,
                            };


                        setUserLocation(
                            selectedLocation
                        );

                        setUserLocationName(
                            locationName ||
                            "Current location"
                        );

                        setPendingLocation(
                            selectedLocation
                        );

                        setPendingLocationName(
                            locationName ||
                            "Current location"
                        );

                        setLocationDetected(
                            true
                        );


                        setShowLocationChooser(
                            false
                        );

                    } catch (error) {

                        console.error(
                            "Location processing error:",
                            error
                        );


                        setLocationError(
                            "Unable to process your location."
                        );

                    } finally {

                        setLocationLoading(
                            false
                        );
                    }

                },
                (error) => {

                    console.warn(
                        "Geolocation error:",
                        error
                    );


                    setLocationError(
                        "Unable to detect your location. Please choose your location on the map."
                    );


                    setLocationLoading(
                        false
                    );
                },
                {
                    enableHighAccuracy:
                        true,

                    timeout:
                        15000,

                    maximumAge:
                        0,
                }
            );
        };


    // ========================================================
    // OPEN MAP LOCATION CHOOSER
    // ========================================================

    const openMapLocationChooser =
        () => {

            setShowLocationMethodChooser(
                false
            );


            setMapSearchError(
                ""
            );


            setShowLocationChooser(
                true
            );
        };


    // ========================================================
    // MAP LOCATION CHANGE
    // ========================================================

    const handleMapLocationChange =
        async (
            location
        ) => {

            if (!location) {
                return;
            }


            const latitude =
                Number(
                    location.latitude
                );

            const longitude =
                Number(
                    location.longitude
                );


            if (
                !Number.isFinite(
                    latitude
                ) ||
                !Number.isFinite(
                    longitude
                )
            ) {
                return;
            }


            const selectedLocation =
                {
                    latitude,
                    longitude,
                };


            setPendingLocation(
                selectedLocation
            );


            setPendingLocationName(
                "Loading location..."
            );


            const locationName =
                await reverseGeocode(
                    latitude,
                    longitude
                );


            setPendingLocationName(
                locationName ||
                "Selected location"
            );
        };


    // ========================================================
    // SEARCH MAP LOCATION
    // ========================================================

    const searchMapLocation =
        async () => {

            const query =
                mapSearch.trim();


            if (!query) {
                return;
            }


            setMapSearchLoading(
                true
            );

            setMapSearchError(
                ""
            );


            try {

                const response =
                    await fetch(
                        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(
                            query
                        )}`,
                        {
                            headers: {
                                Accept:
                                    "application/json",
                            },
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Map search failed"
                    );
                }


                const data =
                    await response.json();


                if (
                    !Array.isArray(
                        data
                    ) ||
                    data.length ===
                        0
                ) {

                    setMapSearchError(
                        "Location not found. Try another search."
                    );

                    return;
                }


                const result =
                    data[0];


                const latitude =
                    Number(
                        result.lat
                    );

                const longitude =
                    Number(
                        result.lon
                    );


                await handleMapLocationChange({
                    latitude,
                    longitude,
                });

            } catch (error) {

                console.error(
                    "Map location search error:",
                    error
                );


                setMapSearchError(
                    "Unable to search this location."
                );

            } finally {

                setMapSearchLoading(
                    false
                );
            }
        };


    // ========================================================
    // MAP SEARCH ENTER
    // ========================================================

    const handleMapSearchKeyDown =
        (event) => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                searchMapLocation();
            }
        };


    // ========================================================
    // USE SELECTED MAP LOCATION
    // ========================================================

    const useSelectedMapLocation =
        async () => {

            if (
                !pendingLocation
            ) {
                return;
            }


            setLocationLoading(
                true
            );

            setLocationError(
                ""
            );


            try {

                const selectedLocation =
                    {
                        latitude:
                            Number(
                                pendingLocation.latitude
                            ),

                        longitude:
                            Number(
                                pendingLocation.longitude
                            ),
                    };


                const selectedName =
                    pendingLocationName ||
                    "Selected location";


                setUserLocation(
                    selectedLocation
                );

                setUserLocationName(
                    selectedName
                );

                setLocationDetected(
                    true
                );


                setShowLocationChooser(
                    false
                );

            } catch (error) {

                console.error(
                    "Selected location error:",
                    error
                );


                setLocationError(
                    "Unable to use the selected location."
                );

            } finally {

                setLocationLoading(
                    false
                );
            }
        };


    // ========================================================
    // SEARCH
    // ========================================================

    const handleSearch =
        async () => {

            if (!userLocation) {

                setLocationError(
                    "Please select your location first."
                );

                return;
            }


            const trimmedSearch =
                searchText.trim();


            setCurrentPage(
                1
            );


            if (!trimmedSearch) {

                setResults([]);

                setLoading(false);

                return;
            }


            await loadNearbyProducts(
                userLocation.latitude,
                userLocation.longitude,
                trimmedSearch,
                vendors
            );
        };


    // ========================================================
    // CLEAR SEARCH
    // ========================================================

    const clearSearch =
        () => {

            setSearchText("");

            setResults([]);

            setLoading(false);

            setCurrentPage(
                1
            );
        };


    // ========================================================
    // SEARCH ENTER
    // ========================================================

    const handleSearchKeyDown =
        (event) => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                handleSearch();
            }
        };


    // ========================================================
    // AUTOMATIC SEARCH
    // ========================================================

    useEffect(() => {

        if (!userLocation) {
            return undefined;
        }


        const trimmedSearch =
            searchText.trim();


        if (!trimmedSearch) {

            setResults([]);

            setLoading(false);

            return undefined;
        }


        const timer =
            setTimeout(
                () => {

                    loadNearbyProducts(
                        userLocation.latitude,
                        userLocation.longitude,
                        trimmedSearch,
                        vendors
                    );

                },
                450
            );


        return () =>
            clearTimeout(
                timer
            );

    }, [
        searchText,
        userLocation,
        vendors,
    ]);


    // ========================================================
    // SELECT SHOP
    // ========================================================

    const handleShopSelect =
        (shop) => {

            if (!shop) {
                return;
            }

            setSelectedShop(shop);
        };


    // Keep the selected shop valid when search/filter/page changes.
    useEffect(() => {

        if (!selectedShop) {
            return;
        }

        const stillVisible =
            visibleShops.some(
                (shop) =>
                    String(shop.vendorId) ===
                    String(selectedShop.vendorId)
            );

        if (!stillVisible) {
            setSelectedShop(null);
        }

    }, [
        visibleShops,
        selectedShop,
    ]);


    // ========================================================
    // BOOK VISIT
    // ========================================================

    const handleBookVisit =
        (shop) => {

            if (!shop) {
                return;
            }

            const firstProduct =
                Array.isArray(shop.products)
                    ? shop.products.find(
                          (product) =>
                              product?.productId != null
                      )
                    : null;

            if (!firstProduct?.productId) {
                setLocationError(
                    "Search for a product available at this shop before booking a visit."
                );
                return;
            }

            navigate(
                `/book-visit/${firstProduct.productId}?vendorId=${encodeURIComponent(
                    shop.vendorId
                )}`
            );
        };


    // ========================================================
    // PRODUCT CLICK
    // ========================================================

    const handleProductClick =
        (product) => {

            if (
                !product?.productId
            ) {
                return;
            }


            navigate(
                `/products/${product.productId}`
            );
        };


    // ========================================================
    // OPEN VENDOR MAP
    // ========================================================

    const openVendorMap =
        (shop) => {

            if (!shop) {
                return;
            }


            const latitude =
                Number(
                    shop.latitude
                );

            const longitude =
                Number(
                    shop.longitude
                );


            const hasCoordinates =
                Number.isFinite(
                    latitude
                ) &&
                Number.isFinite(
                    longitude
                );


            const savedGoogleMapsLink =
                shop.googleMapsLink
                    ? String(
                          shop.googleMapsLink
                      ).trim()
                    : "";


            if (
                !hasCoordinates &&
                !savedGoogleMapsLink
            ) {

                setLocationError(
                    "This shop does not have a Google Maps location available."
                );

                return;
            }


            setSelectedShopForMap(
                shop
            );

            setShowGoogleMapsConfirm(
                true
            );
        };


    // ========================================================
    // CONFIRM GOOGLE MAPS
    // ========================================================

    const confirmGoogleMaps =
        () => {

            if (
                !selectedShopForMap
            ) {
                return;
            }


            const latitude =
                Number(
                    selectedShopForMap.latitude
                );

            const longitude =
                Number(
                    selectedShopForMap.longitude
                );


            let googleMapsUrl =
                "";


            if (
                Number.isFinite(
                    latitude
                ) &&
                Number.isFinite(
                    longitude
                )
            ) {

                googleMapsUrl =
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${latitude},${longitude}`
                    )}`;
            }


            if (
                !googleMapsUrl &&
                selectedShopForMap.googleMapsLink
            ) {

                googleMapsUrl =
                    String(
                        selectedShopForMap.googleMapsLink
                    ).trim();
            }


            if (!googleMapsUrl) {

                setLocationError(
                    "Unable to open this shop's map location."
                );

                return;
            }


            window.open(
                googleMapsUrl,
                "_blank",
                "noopener,noreferrer"
            );


            setShowGoogleMapsConfirm(
                false
            );

            setSelectedShopForMap(
                null
            );
        };


    // ========================================================
    // CLOSE GOOGLE MAPS
    // ========================================================

    const closeGoogleMapsConfirm =
        () => {

            setShowGoogleMapsConfirm(
                false
            );

            setSelectedShopForMap(
                null
            );
        };


    // ========================================================
    // LOAD INITIAL DATA
    // ========================================================

    useEffect(() => {

        let cancelled =
            false;


        const loadInitialData =
            async () => {

                const token =
                    getUserToken();


                /*
                 * Load vendors exactly once.
                 */
                await loadAllVendors();


                if (
                    cancelled
                ) {
                    return;
                }


                /*
                 * Load saved user location if the user
                 * is authenticated.
                 */
                if (!token) {
                    return;
                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/user/address`,
                            {
                                method:
                                    "GET",

                                headers:
                                    getHeaders(),
                            }
                        );


                    if (
                        cancelled ||
                        !response.ok
                    ) {
                        return;
                    }


                    const data =
                        await response.json();


                    const hasSavedFlag =
                        data?.saved === true ||
                        (
                            data?.saved === undefined &&
                            data?.latitude != null &&
                            data?.longitude != null
                        );


                    if (
                        !hasSavedFlag ||
                        data.latitude ==
                            null ||
                        data.longitude ==
                            null
                    ) {
                        return;
                    }


                    const latitude =
                        Number(
                            data.latitude
                        );

                    const longitude =
                        Number(
                            data.longitude
                        );


                    if (
                        !Number.isFinite(
                            latitude
                        ) ||
                        !Number.isFinite(
                            longitude
                        )
                    ) {
                        return;
                    }


                    const savedLocation =
                        {
                            latitude,
                            longitude,
                        };


                    const savedName =
                        cleanLocationPart(
                            data.address
                        ) ||
                        "Saved location";


                    if (
                        cancelled
                    ) {
                        return;
                    }


                    setUserLocation(
                        savedLocation
                    );

                    setUserLocationName(
                        savedName
                    );

                    setPendingLocation(
                        savedLocation
                    );

                    setPendingLocationName(
                        savedName
                    );

                    setLocationDetected(
                        true
                    );

                } catch (error) {

                    if (!cancelled) {

                        console.warn(
                            "Saved address loading error:",
                            error
                        );
                    }
                }
            };


        loadInitialData();


        return () => {

            cancelled =
                true;

        };

    }, []);


    // ========================================================
    // PAGINATION HELPERS
    // ========================================================

    const goToPreviousPage =
        () => {

            setCurrentPage(
                (previous) =>
                    Math.max(
                        1,
                        previous - 1
                    )
            );
        };


    const goToNextPage =
        () => {

            setCurrentPage(
                (previous) =>
                    Math.min(
                        totalPages,
                        previous + 1
                    )
            );
        };


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="dh-available-page">

            <Header />

            <main className="dh-available-main">

                <section className="dh-available-three-column-layout">

                    {/* ==================================================
                        COLUMN 1 — 48% MAP
                    ================================================== */}
                    <section className="dh-available-column dh-available-map-column">

                        <div className="dh-available-column-intro">
                            <div className="dh-available-intro-copy">
                                <span className="dh-available-eyebrow">LOCAL AVAILABILITY</span>
                                <h1>Find available shops near you</h1>
                                <p>Explore nearby stores and check product availability before you visit.</p>
                            </div>
                        </div>

                        {locationError && (
                            <div className="dh-available-location-error compact">
                                <div className="dh-location-message-icon">!</div>
                                <div className="dh-available-location-error-content">
                                    <strong>Location unavailable</strong>
                                    <span>{locationError}</span>
                                </div>
                                <button type="button" onClick={openLocationMethodChooser}>
                                    Try Again
                                </button>
                            </div>
                        )}

                        <div className="dh-available-map-shell">
                            <div className="dh-available-map-heading">
                                <div>
                                    <span className="dh-available-section-label">MAP</span>
                                    <strong>
                                        {visibleShops.length} {visibleShops.length === 1 ? "shop" : "shops"}
                                    </strong>
                                </div>
                                <span>Click a shop to focus the map</span>
                            </div>

                            <div className="dh-available-main-map-wrapper">
                                <MapContainer
                                    center={[
                                        userLocation?.latitude ?? DEFAULT_MAP_LOCATION.latitude,
                                        userLocation?.longitude ?? DEFAULT_MAP_LOCATION.longitude,
                                    ]}
                                    zoom={12}
                                    scrollWheelZoom={true}
                                    className="dh-available-main-map"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <ShopMapController
                                        shops={visibleShops}
                                        userLocation={userLocation}
                                        selectedShop={selectedShop}
                                    />

                                    {visibleShops.map((shop, index) => {
                                        const isSelected =
                                            String(selectedShop?.vendorId) ===
                                            String(shop.vendorId);

                                        return (
                                            <Marker
                                                key={shop.vendorId}
                                                position={[
                                                    Number(shop.latitude),
                                                    Number(shop.longitude),
                                                ]}
                                                icon={
                                                    isSelected
                                                        ? createSelectedShopMarkerIcon(index + 1)
                                                        : createShopMarkerIcon(index + 1)
                                                }
                                                eventHandlers={{
                                                    click: () => handleShopSelect(shop),
                                                }}
                                            >
                                                <LeafletPopup>
                                                    <div className="dh-available-marker-popup">
                                                        <strong>
                                                            {index + 1}. {shop.vendorName}
                                                        </strong>
                                                        {shop.address && <span>{shop.address}</span>}
                                                        {shop.distanceKm != null && (
                                                            <small>
                                                                {Number(shop.distanceKm).toFixed(1)} km away
                                                            </small>
                                                        )}
                                                    </div>
                                                </LeafletPopup>
                                            </Marker>
                                        );
                                    })}
                                </MapContainer>

                                {!vendorsLoading && visibleShops.length === 0 && (
                                    <div className="dh-available-map-empty">
                                        <span>📍</span>
                                        <strong>No shops to display</strong>
                                        <p>Choose a different location or search.</p>
                                    </div>
                                )}
                            </div>

                            <div className="dh-available-map-legend">
                                <span>
                                    <i className="dh-available-legend-marker">1</i>
                                    Shop marker
                                </span>
                                <span>Selected shop is highlighted</span>
                            </div>

                            <div className="dh-available-map-tagline">
                                Hunt Deals, Save Money
                            </div>
                        </div>

                    </section>


                    {/* ==================================================
                        COLUMN 2 — 30% SHOP LIST
                    ================================================== */}
                    <section className="dh-available-column dh-available-shops-column">

                        <div className="dh-available-shops-header">
                            <div>
                                <span className="dh-available-section-label">NEARBY SHOPS</span>
                                <h2>{searchText.trim() ? "Search Results" : "Shops Near You"}</h2>
                            </div>

                            {!vendorsLoading && (
                                <div className="dh-available-result-summary">
                                    <strong>{mapReadyShops.length}</strong>
                                    <span>{mapReadyShops.length === 1 ? "shop" : "shops"}</span>
                                </div>
                            )}
                        </div>

                        <div className="dh-available-controls">
                            <div className="dh-available-search-wrapper">
                                <span className="dh-available-search-icon">⌕</span>
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(event) => {
                                        setSearchText(event.target.value);
                                        setCurrentPage(1);
                                        if (!event.target.value.trim()) {
                                            setResults([]);
                                            setLoading(false);
                                        }
                                    }}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder={
                                        userLocation
                                            ? "Search shops or products..."
                                            : "Choose a location to search..."
                                    }
                                    disabled={!userLocation}
                                    autoComplete="off"
                                />
                                {loading && searchText.trim() && (
                                    <span className="dh-available-search-spinner" />
                                )}
                                {searchText && !loading && (
                                    <button
                                        type="button"
                                        className="dh-available-search-clear"
                                        onClick={clearSearch}
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <select
                                id="dh-available-sort"
                                className="dh-available-filter-select"
                                value={sortBy}
                                onChange={(event) => {
                                    setSortBy(event.target.value);
                                    setCurrentPage(1);
                                }}
                                aria-label="Sort shops"
                            >
                                <option value="nearest">Nearest</option>
                                <option value="within10">Within 10 km</option>
                                <option value="within20">Within 20 km</option>
                                <option value="within30">Within 30 km</option>
                                <option value="name">A–Z</option>
                            </select>
                        </div>

                        <div className="dh-available-shop-list-scroll">

                            {vendorsLoading && (
                                <section className="dh-available-shop-list">
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <article key={item} className="dh-available-shop-skeleton">
                                            <div className="dh-skeleton-top">
                                                <div className="dh-skeleton-icon" />
                                                <div className="dh-skeleton-heading">
                                                    <div className="dh-skeleton-line large" />
                                                    <div className="dh-skeleton-line" />
                                                </div>
                                            </div>
                                            <div className="dh-skeleton-line" />
                                            <div className="dh-skeleton-line short" />
                                        </article>
                                    ))}
                                </section>
                            )}

                            {!vendorsLoading && visibleShops.length > 0 && (
                                <div className="dh-available-shop-list">
                                    {visibleShops.map((shop, index) => {
                                        const isSelected =
                                            String(selectedShop?.vendorId) ===
                                            String(shop.vendorId);

                                        return (
                                            <article
                                                key={shop.vendorId}
                                                className={`dh-available-shop-card ${isSelected ? "selected" : ""}`}
                                                onClick={() => handleShopSelect(shop)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" || event.key === " ") {
                                                        event.preventDefault();
                                                        handleShopSelect(shop);
                                                    }
                                                }}
                                            >
                                                <div className="dh-available-shop-card-top">
                                                    <div className="dh-available-shop-number">
                                                        {index + 1}
                                                    </div>

                                                    <div className="dh-available-shop-icon">🏪</div>

                                                    <div className="dh-available-shop-info">
                                                        <h3>{shop.vendorName}</h3>
                                                        {shop.address && (
                                                            <span className="dh-available-shop-address">
                                                                {shop.address}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span className="dh-available-shop-distance">
                                                        {shop.distanceKm != null
                                                            ? `${Number(shop.distanceKm).toFixed(1)} km`
                                                            : "—"}
                                                    </span>
                                                </div>

                                                {searchText.trim() && shop.products.length > 0 && (
                                                    <div className="dh-available-shop-meta">
                                                        <span>
                                                            {shop.products.length} product{shop.products.length === 1 ? "" : "s"} found
                                                        </span>
                                                    </div>
                                                )}

                                                {searchText.trim() && shop.products.length > 0 && (
                                                    <div className="dh-available-products-list">
                                                        {shop.products.slice(0, 3).map((product, productIndex) => (
                                                            <article
                                                                key={`${product.productId}-${productIndex}`}
                                                                className="dh-available-product-row"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleProductClick(product);
                                                                }}
                                                            >
                                                                <div className="dh-available-product-icon">📦</div>
                                                                <div className="dh-available-product-details">
                                                                    <h4>{product.productName}</h4>
                                                                    <span>
                                                                        {product.brand ||
                                                                            product.category ||
                                                                            `Product ID: ${product.productId}`}
                                                                    </span>
                                                                </div>
                                                                <div className="dh-available-product-stock">
                                                                    <strong>{product.stock}</strong>
                                                                    <span>in stock</span>
                                                                </div>
                                                            </article>
                                                        ))}
                                                    </div>
                                                )}

                                            </article>
                                        );
                                    })}
                                </div>
                            )}

                            {!vendorsLoading && visibleShops.length === 0 && (
                                <section className="dh-available-empty">
                                    <div className="dh-available-empty-icon">{searchText.trim() ? "⌕" : "🏪"}</div>
                                    <span className="dh-available-section-label">
                                        {searchText.trim() ? "NO MATCHES" : "NO SHOPS"}
                                    </span>
                                    <h3>
                                        {searchText.trim()
                                            ? "Nothing found"
                                            : "No local shops available"}
                                    </h3>
                                    <p>
                                        {searchText.trim()
                                            ? `No shop or product matches "${searchText.trim()}" near your selected location.`
                                            : "There are currently no shops with a valid map location available to display."}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={
                                            searchText.trim()
                                                ? clearSearch
                                                : openLocationMethodChooser
                                        }
                                    >
                                        {searchText.trim() ? "Clear Search" : "Change Location"}
                                    </button>
                                </section>
                            )}

                        </div>

                        {!vendorsLoading && totalPages > 1 && (
                            <nav className="dh-available-pagination" aria-label="Nearby shop pages">
                                <button
                                    type="button"
                                    className="dh-available-pagination-arrow"
                                    onClick={goToPreviousPage}
                                    disabled={safeCurrentPage === 1}
                                    aria-label="Previous page"
                                >
                                    ←
                                </button>

                                <div className="dh-available-pagination-pages">
                                    {Array.from({ length: totalPages }, (_, index) => {
                                        const page = index + 1;

                                        return (
                                            <button
                                                type="button"
                                                key={page}
                                                className={`dh-available-pagination-page ${
                                                    page === safeCurrentPage ? "active" : ""
                                                }`}
                                                onClick={() => setCurrentPage(page)}
                                                aria-current={
                                                    page === safeCurrentPage
                                                        ? "page"
                                                        : undefined
                                                }
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    className="dh-available-pagination-arrow"
                                    onClick={goToNextPage}
                                    disabled={safeCurrentPage === totalPages}
                                    aria-label="Next page"
                                >
                                    →
                                </button>
                            </nav>
                        )}

                    </section>


                    {/* ==================================================
                        COLUMN 3 — 20% SELECTED SHOP
                    ================================================== */}
                    <aside className="dh-available-column dh-available-details-column">

                        <div className="dh-available-details-header">
                            <div>
                                <span className="dh-available-section-label">DEAL HUNTS</span>
                                <strong>Nearby availability</strong>
                            </div>

                            <button
                                type="button"
                                className="dh-available-location-button"
                                onClick={openLocationMethodChooser}
                                disabled={locationLoading}
                            >
                                <span className="dh-available-location-button-icon">📍</span>
                                <span className="dh-available-location-button-content">
                                    <small>YOUR LOCATION</small>
                                    <strong>
                                        {locationLoading
                                            ? "Updating..."
                                            : userLocationName || "Choose location"}
                                    </strong>
                                </span>
                                <span className="dh-available-location-button-arrow">→</span>
                            </button>
                        </div>

                        <div className="dh-available-details-scroll">

                            {!selectedShop ? (
                                <div className="dh-available-details-empty">
                                    <div className="dh-available-details-empty-icon">⌖</div>
                                    <span className="dh-available-section-label">SELECT A SHOP</span>
                                    <h3>Select a shop</h3>
                                    <p>
                                        Choose a nearby shop to see its availability, location and visit options.
                                    </p>

                                    <div className="dh-available-benefits">
                                        <span className="dh-available-detail-label">WHY DEAL HUNTS?</span>
                                        <div className="dh-available-benefit-item">
                                            <span>✓</span>
                                            <strong>Check local availability first</strong>
                                        </div>
                                        <div className="dh-available-benefit-item">
                                            <span>✓</span>
                                            <strong>Save time before you visit</strong>
                                        </div>
                                        <div className="dh-available-benefit-item">
                                            <span>✓</span>
                                            <strong>Find deals from nearby shops</strong>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="dh-available-selected-shop">
                                    <div className="dh-available-selected-shop-top">
                                        <div className="dh-available-selected-shop-icon">🏪</div>
                                        <div>
                                            <span>SHOP {
                                                visibleShops.findIndex(
                                                    (shop) =>
                                                        String(shop.vendorId) ===
                                                        String(selectedShop.vendorId)
                                                ) + 1
                                            }</span>
                                            <h2>{selectedShop.vendorName}</h2>
                                        </div>
                                    </div>

                                    <div className="dh-available-detail-block">
                                        <span className="dh-available-detail-label">ADDRESS</span>
                                        <strong>
                                            {selectedShop.address || "Address not available"}
                                        </strong>
                                    </div>

                                    <div className="dh-available-detail-grid">
                                        <div className="dh-available-detail-stat">
                                            <span>DISTANCE</span>
                                            <strong>
                                                {selectedShop.distanceKm != null
                                                    ? `${Number(selectedShop.distanceKm).toFixed(1)} km`
                                                    : "—"}
                                            </strong>
                                        </div>

                                        <div className="dh-available-detail-stat">
                                            <span>PRODUCTS</span>
                                            <strong>
                                                {Array.isArray(selectedShop.products)
                                                    ? selectedShop.products.length
                                                    : 0}
                                            </strong>
                                        </div>
                                    </div>

                                    {getVendorPhone(selectedShop) && (
                                        <div className="dh-available-detail-block">
                                            <span className="dh-available-detail-label">CONTACT</span>
                                            <a
                                                href={`tel:${getVendorPhone(selectedShop)}`}
                                                className="dh-available-detail-link"
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                {getVendorPhone(selectedShop)}
                                            </a>
                                        </div>
                                    )}

                                    {getVendorHours(selectedShop) && (
                                        <div className="dh-available-detail-block">
                                            <span className="dh-available-detail-label">OPENING HOURS</span>
                                            <strong>{getVendorHours(selectedShop)}</strong>
                                        </div>
                                    )}

                                    {getVendorDescription(selectedShop) && (
                                        <div className="dh-available-detail-block">
                                            <span className="dh-available-detail-label">ABOUT THE SHOP</span>
                                            <p>{getVendorDescription(selectedShop)}</p>
                                        </div>
                                    )}

                                    {searchText.trim() && selectedShop.products.length > 0 && (
                                        <div className="dh-available-detail-products">
                                            <span className="dh-available-detail-label">AVAILABLE PRODUCTS</span>

                                            {selectedShop.products.slice(0, 5).map((product, index) => (
                                                <button
                                                    type="button"
                                                    key={`${product.productId}-${index}`}
                                                    className="dh-available-detail-product"
                                                    onClick={() => handleProductClick(product)}
                                                >
                                                    <span>📦</span>
                                                    <span>
                                                        <strong>{product.productName}</strong>
                                                        <small>
                                                            {product.stock} in stock
                                                        </small>
                                                    </span>
                                                    <b>→</b>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="dh-available-detail-actions">
                                        <button
                                            type="button"
                                            className="dh-available-book-button"
                                            onClick={() => handleBookVisit(selectedShop)}
                                        >
                                            <span>Book Visit</span>
                                            <span>→</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="dh-available-map-button"
                                            onClick={() => openVendorMap(selectedShop)}
                                        >
                                            <span>↗</span>
                                            Open Maps
                                        </button>
                                    </div>

                                    <div className="dh-available-benefits dh-available-benefits-selected">
                                        <span className="dh-available-detail-label">WHY DEAL HUNTS?</span>
                                        <div className="dh-available-benefit-item">
                                            <span>✓</span>
                                            <strong>Know availability before travelling</strong>
                                        </div>
                                        <div className="dh-available-benefit-item">
                                            <span>✓</span>
                                            <strong>Compare nearby options</strong>
                                        </div>
                                        <div className="dh-available-benefit-item">
                                            <span>✓</span>
                                            <strong>Hunt deals, save money</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </aside>

                </section>
            </main>


            {/* ====================================================
                LOCATION METHOD POPUP
            ==================================================== */}

            <Popup
                open={showLocationMethodChooser}
                title="Choose Your Location"
                onClose={() => setShowLocationMethodChooser(false)}
                width="520px"
                className="dh-available-location-method-popup"
            >
                <div className="dh-location-method-content">
                    <p className="dh-location-method-description">
                        Choose how you want to set your location.
                    </p>

                    <button
                        type="button"
                        className="dh-location-method-card"
                        onClick={detectLocationAutomatically}
                        disabled={locationLoading}
                    >
                        <div className="dh-location-method-icon">📍</div>
                        <div className="dh-location-method-card-content">
                            <strong>Detect Automatically</strong>
                            <span>Use your browser's location to find your current area.</span>
                        </div>
                        <span className="dh-location-method-arrow">→</span>
                    </button>

                    <button
                        type="button"
                        className="dh-location-method-card"
                        onClick={openMapLocationChooser}
                        disabled={locationLoading}
                    >
                        <div className="dh-location-method-icon">🗺</div>
                        <div className="dh-location-method-card-content">
                            <strong>Choose on Map</strong>
                            <span>Search for a city, area, landmark or address on the map.</span>
                        </div>
                        <span className="dh-location-method-arrow">→</span>
                    </button>

                    <div className="dh-location-method-note">
                        <span>🔒</span>
                        <p>
                            Your exact coordinates are used only internally for distance calculation and are never displayed.
                        </p>
                    </div>
                </div>
            </Popup>


            {/* ====================================================
                LOCATION MAP POPUP
            ==================================================== */}

            <Popup
                open={showLocationChooser}
                title="Choose Your Location"
                onClose={() => setShowLocationChooser(false)}
                width="900px"
                className="dh-available-map-popup"
            >
                <div className="dh-location-map-content">
                    <p className="dh-location-map-description">
                        Search for a place or click anywhere on the map to select your location.
                    </p>

                    <div className="dh-location-map-search">
                        <input
                            type="text"
                            value={mapSearch}
                            onChange={(event) => setMapSearch(event.target.value)}
                            onKeyDown={handleMapSearchKeyDown}
                            placeholder="Search city, area, landmark or address"
                            aria-label="Search city, area, landmark or address"
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={searchMapLocation}
                            disabled={mapSearchLoading}
                        >
                            {mapSearchLoading ? "Searching..." : "Search"}
                        </button>
                    </div>

                    {mapSearchError && (
                        <div className="dh-location-map-error">
                            {mapSearchError}
                        </div>
                    )}

                    <div className="dh-location-map-wrapper">
                        {pendingLocation && (
                            <MapContainer
                                center={[
                                    pendingLocation.latitude,
                                    pendingLocation.longitude,
                                ]}
                                zoom={14}
                                scrollWheelZoom={true}
                                className="dh-location-map"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <MapCenterUpdater position={pendingLocation} />

                                <MapClickHandler onLocationSelect={handleMapLocationChange} />

                                <Marker
                                    position={[
                                        pendingLocation.latitude,
                                        pendingLocation.longitude,
                                    ]}
                                    draggable={true}
                                    eventHandlers={{
                                        dragend: (event) => {
                                            const marker = event.target;
                                            const position = marker.getLatLng();

                                            handleMapLocationChange({
                                                latitude: position.lat,
                                                longitude: position.lng,
                                            });
                                        },
                                    }}
                                >
                                    <LeafletPopup>Selected location</LeafletPopup>
                                </Marker>
                            </MapContainer>
                        )}
                    </div>

                    {pendingLocation && (
                        <div className="dh-location-selected-info">
                            <div>
                                <span>SELECTED LOCATION</span>
                                <strong>
                                    {pendingLocationName || "Selected location"}
                                </strong>
                            </div>
                            <span>
                                Drag the marker or click the map to adjust the location.
                            </span>
                        </div>
                    )}

                    <div className="dh-location-modal-actions">
                        <button
                            type="button"
                            className="dh-location-modal-secondary"
                            onClick={() => setShowLocationChooser(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="dh-location-modal-primary"
                            onClick={useSelectedMapLocation}
                            disabled={!pendingLocation || locationLoading}
                        >
                            {locationLoading ? "Updating..." : "Use This Location"}
                        </button>
                    </div>
                </div>
            </Popup>


            {/* ====================================================
                GOOGLE MAPS CONFIRMATION
            ==================================================== */}

            <Popup
                open={showGoogleMapsConfirm}
                title="Open Google Maps?"
                onClose={closeGoogleMapsConfirm}
                width="460px"
                className="dh-available-google-maps-popup"
            >
                <div className="dh-google-maps-confirm-content">
                    <div className="dh-google-maps-confirm-icon">📍</div>
                    <h3>View this shop on Google Maps</h3>
                    <p>
                        Would you like to move to Google Maps to view{" "}
                        <strong>
                            {selectedShopForMap?.vendorName || "this shop"}
                        </strong>?
                    </p>

                    <div className="dh-google-maps-confirm-actions">
                        <button
                            type="button"
                            onClick={closeGoogleMapsConfirm}
                            className="dh-google-maps-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmGoogleMaps}
                            className="dh-google-maps-open"
                        >
                            Open Google Maps
                        </button>
                    </div>
                </div>
            </Popup>

        </div>
    );
}


export default AvailableShopNearYou;