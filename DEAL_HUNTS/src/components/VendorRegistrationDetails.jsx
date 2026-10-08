import React, {
    useEffect,
    useState,
} from "react";

import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import {
    checkVendorEmail,
    resolveVendorMapLink,
} from "../api/VendorApi";

import "leaflet/dist/leaflet.css";


// ============================================================
// LEAFLET DEFAULT MARKER FIX
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
// DEFAULT MAP LOCATION
//
// ONLY the initial map view.
// It is NEVER automatically saved as shop location.
// ============================================================

const DEFAULT_MAP_CENTER = {
    lat: 16.3067,
    lon: 80.4365,
};


// ============================================================
// COORDINATE VALIDATION
// ============================================================

const isValidCoordinates = (
    latitude,
    longitude
) => {

    const lat = Number(latitude);
    const lon = Number(longitude);

    return (
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
    );
};


// ============================================================
// EXTRACT COORDINATES FROM GOOGLE MAPS URL
// ============================================================

const extractCoordinatesFromGoogleMapsUrl = (
    value
) => {

    if (
        typeof value !== "string" ||
        !value.trim()
    ) {
        return null;
    }

    let url;

    try {

        url = decodeURIComponent(
            value.trim()
        );

    } catch {

        url = value.trim();
    }


    // --------------------------------------------------------
    // 1. ?q=LAT,LON
    // --------------------------------------------------------

    const queryMatch = url.match(
        /[?&](?:q|query|destination|center)=(-?\d+(?:\.\d+)?)(?:%2C|,)\s*(-?\d+(?:\.\d+)?)/i
    );

    if (queryMatch) {

        const latitude =
            Number(queryMatch[1]);

        const longitude =
            Number(queryMatch[2]);

        if (
            isValidCoordinates(
                latitude,
                longitude
            )
        ) {

            return {
                lat: latitude,
                lon: longitude,
            };
        }
    }


    // --------------------------------------------------------
    // 2. /@LAT,LON
    // --------------------------------------------------------

    const atMatch = url.match(
        /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i
    );

    if (atMatch) {

        const latitude =
            Number(atMatch[1]);

        const longitude =
            Number(atMatch[2]);

        if (
            isValidCoordinates(
                latitude,
                longitude
            )
        ) {

            return {
                lat: latitude,
                lon: longitude,
            };
        }
    }


    // --------------------------------------------------------
    // 3. !3dLAT!4dLON
    // --------------------------------------------------------

    const googleCoordinateMatch =
        url.match(
            /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i
        );

    if (googleCoordinateMatch) {

        const latitude =
            Number(
                googleCoordinateMatch[1]
            );

        const longitude =
            Number(
                googleCoordinateMatch[2]
            );

        if (
            isValidCoordinates(
                latitude,
                longitude
            )
        ) {

            return {
                lat: latitude,
                lon: longitude,
            };
        }
    }


    // --------------------------------------------------------
    // 4. !2dLON!3dLAT
    // --------------------------------------------------------

    const googleLngLatMatch =
        url.match(
            /!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/i
        );

    if (googleLngLatMatch) {

        const longitude =
            Number(
                googleLngLatMatch[1]
            );

        const latitude =
            Number(
                googleLngLatMatch[2]
            );

        if (
            isValidCoordinates(
                latitude,
                longitude
            )
        ) {

            return {
                lat: latitude,
                lon: longitude,
            };
        }
    }

    return null;
};


// ============================================================
// CREATE GOOGLE MAPS URL
// ============================================================

const createGoogleMapsUrl = (
    latitude,
    longitude
) => {

    return (
        `https://www.google.com/maps?q=${latitude},${longitude}`
    );
};


// ============================================================
// MAP CENTER CONTROLLER
// ============================================================

function MapCenterUpdater({
    location,
}) {

    const map = useMap();

    useEffect(() => {

        if (
            !location ||
            !isValidCoordinates(
                location.lat,
                location.lon
            )
        ) {
            return;
        }

        map.setView(
            [
                Number(location.lat),
                Number(location.lon),
            ],
            17,
            {
                animate: true,
            }
        );

    }, [
        location,
        map,
    ]);

    return null;
}


// ============================================================
// MAP SIZE FIX
// ============================================================

function MapSizeUpdater() {

    const map = useMap();

    useEffect(() => {

        const timer =
            setTimeout(() => {

                map.invalidateSize();

            }, 200);

        return () => {

            clearTimeout(timer);

        };

    }, [map]);

    return null;
}


// ============================================================
// MAP CLICK SELECTOR
// ============================================================

function MapLocationSelector({
    onSelect,
}) {

    useMapEvents({

        click(event) {

            const latitude =
                Number(
                    event.latlng.lat
                );

            const longitude =
                Number(
                    event.latlng.lng
                );

            if (
                !isValidCoordinates(
                    latitude,
                    longitude
                )
            ) {
                return;
            }

            onSelect({

                lat: latitude,

                lon: longitude,

                source: "map",

            });
        },

    });

    return null;
}


// ============================================================
// VENDOR REGISTRATION DETAILS
// ============================================================

function VendorRegistrationDetails({

    fullName,
    setFullName,

    state,
    setState,

    city,
    setCity,

    pincode,
    setPincode,

    email,
    setEmail,

    shopName,
    setShopName,

    address,
    setAddress,

    phone,
    setPhone,

    location,
    setLocation,

    password,
    setPassword,

    confirmPassword,
    setConfirmPassword,

    showLocationPopup,
    setShowLocationPopup,

}) {

    // ========================================================
    // FIELD VALIDATION STATE
    // ========================================================

    const [
        touchedFields,
        setTouchedFields,
    ] = useState({});


    // ========================================================
    // DUPLICATE EMAIL STATE
    // ========================================================

    const [
        emailExists,
        setEmailExists,
    ] = useState(false);

    const [
        checkingEmail,
        setCheckingEmail,
    ] = useState(false);


    // ========================================================
    // VALIDATION HELPERS
    // ========================================================

    const markTouched = (field) => {

        setTouchedFields((previous) => ({

            ...previous,

            [field]: true,

        }));
    };


    // ========================================================
    // CHECK WHETHER EMAIL IS VALID
    // ========================================================

    const isValidEmailFormat = (
        value
    ) => {

        const text =
            typeof value === "string"
                ? value.trim()
                : "";

        if (!text) {
            return false;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            text
        );
    };


    // ========================================================
    // CHECK DUPLICATE EMAIL
    //
    // Runs automatically after the user stops typing.
    // ========================================================

    useEffect(() => {

        const normalizedEmail =
            typeof email === "string"
                ? email.trim().toLowerCase()
                : "";

        // ----------------------------------------------------
        // Empty / invalid email
        // ----------------------------------------------------

        if (
            !normalizedEmail ||
            !isValidEmailFormat(
                normalizedEmail
            )
        ) {

            setEmailExists(false);

            setCheckingEmail(false);

            return;
        }


        // ----------------------------------------------------
        // Wait briefly before calling backend
        // ----------------------------------------------------

        const timer =
            setTimeout(async () => {

                try {

                    setCheckingEmail(true);

                    const response =
                        await checkVendorEmail(
                            normalizedEmail
                        );

                    const exists =
                        response?.data?.exists === true;

                    setEmailExists(
                        exists
                    );

                } catch (error) {

                    console.error(
                        "Vendor email check error:",
                        error
                    );

                    // Do not block registration
                    // because of a temporary check error.
                    setEmailExists(false);

                } finally {

                    setCheckingEmail(false);

                }

            }, 500);


        return () => {

            clearTimeout(timer);

        };

    }, [email]);


    // ========================================================
    // VALIDATION ERRORS
    // ========================================================

    const getFieldError = (
        field,
        value
    ) => {

        if (!touchedFields[field]) {
            return "";
        }

        const text =
            typeof value === "string"
                ? value.trim()
                : "";

        switch (field) {

            // ------------------------------------------------
            // FULL NAME
            // ------------------------------------------------

            case "fullName":

                if (!text) {
                    return "Enter full name";
                }

                return "";


            // ------------------------------------------------
            // SHOP NAME
            // ------------------------------------------------

            case "shopName":

                if (!text) {
                    return "Enter shop name";
                }

                return "";


            // ------------------------------------------------
            // STATE
            // ------------------------------------------------

            case "state":

                if (!text) {
                    return "Enter state";
                }

                return "";


            // ------------------------------------------------
            // CITY
            // ------------------------------------------------

            case "city":

                if (!text) {
                    return "Enter city";
                }

                return "";


            // ------------------------------------------------
            // PINCODE
            // ------------------------------------------------

            case "pincode":

                if (!text) {
                    return "Enter pincode";
                }

                if (!/^\d{6}$/.test(text)) {
                    return "Pincode must be exactly 6 digits";
                }

                return "";


            // ------------------------------------------------
            // ADDRESS
            // ------------------------------------------------

            case "address":

                if (!text) {
                    return "Enter shop address";
                }

                return "";


            // ------------------------------------------------
            // PHONE
            // ------------------------------------------------

            case "phone":

                if (!text) {
                    return "Enter phone number";
                }

                if (!/^\d{10}$/.test(text)) {
                    return "Phone number must be exactly 10 digits";
                }

                return "";


            // ------------------------------------------------
            // EMAIL
            // ------------------------------------------------

            case "email":

                if (!text) {
                    return "Enter email";
                }

                if (
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        text
                    )
                ) {

                    return "Invalid email format";

                }

                if (emailExists) {

                    return "Email already exists";

                }

                return "";


            // ------------------------------------------------
            // PASSWORD
            // ------------------------------------------------

            case "password":

                if (!value) {
                    return "Enter password";
                }

                if (value.length < 8) {
                    return "Password must be at least 8 characters";
                }

                return "";


            // ------------------------------------------------
            // CONFIRM PASSWORD
            // ------------------------------------------------

            case "confirmPassword":

                if (!value) {
                    return "Confirm your password";
                }

                if (
                    value !== password
                ) {

                    return "Passwords do not match";

                }

                return "";


            default:
                return "";
        }
    };


    // ========================================================
    // LIVE VALIDATION ERRORS
    // ========================================================

    const fullNameError =
        getFieldError(
            "fullName",
            fullName
        );

    const shopNameError =
        getFieldError(
            "shopName",
            shopName
        );

    const stateError =
        getFieldError(
            "state",
            state
        );

    const cityError =
        getFieldError(
            "city",
            city
        );

    const pincodeError =
        getFieldError(
            "pincode",
            pincode
        );

    const addressError =
        getFieldError(
            "address",
            address
        );

    const phoneError =
        getFieldError(
            "phone",
            phone
        );

    const emailError =
        getFieldError(
            "email",
            email
        );

    const passwordError =
        getFieldError(
            "password",
            password
        );

    const confirmPasswordError =
        getFieldError(
            "confirmPassword",
            confirmPassword
        );


    // ========================================================
    // LOCATION POPUP STATE
    // ========================================================

    const [
        draftLocation,
        setDraftLocation,
    ] = useState(null);


    const [
        mapLinkInput,
        setMapLinkInput,
    ] = useState("");


    const [
        locationMessage,
        setLocationMessage,
    ] = useState("");


    const [
        locationError,
        setLocationError,
    ] = useState("");


    const [
        resolvingMapLink,
        setResolvingMapLink,
    ] = useState(false);


    const [
        gettingGpsLocation,
        setGettingGpsLocation,
    ] = useState(false);


    // ========================================================
    // GOOGLE MAPS PLACE DETAILS
    // ========================================================

    const [
        resolvedPlaceName,
        setResolvedPlaceName,
    ] = useState("");


    const [
        resolvedPlaceAddress,
        setResolvedPlaceAddress,
    ] = useState("");


    const [
        resolvedLocationSource,
        setResolvedLocationSource,
    ] = useState("");


    // ========================================================
    // OPEN LOCATION POPUP
    // ========================================================

    useEffect(() => {

        if (!showLocationPopup) {
            return;
        }


        // ----------------------------------------------------
        // Existing confirmed location
        // ----------------------------------------------------

        if (
            location &&
            isValidCoordinates(
                location.lat,
                location.lon
            )
        ) {

            setDraftLocation({

                lat:
                    Number(
                        location.lat
                    ),

                lon:
                    Number(
                        location.lon
                    ),

                mapUrl:
                    location.mapUrl ||
                    createGoogleMapsUrl(
                        location.lat,
                        location.lon
                    ),

                source:
                    location.source ||
                    "existing",

            });

            setMapLinkInput(
                location.mapUrl || ""
            );

        }


        // ----------------------------------------------------
        // No confirmed location
        // ----------------------------------------------------

        else {

            setDraftLocation(null);

            setMapLinkInput("");

        }


        setLocationMessage("");

        setLocationError("");

        setResolvedPlaceName("");

        setResolvedPlaceAddress("");

        setResolvedLocationSource("");

        setResolvingMapLink(false);

        setGettingGpsLocation(false);

    }, [
        showLocationPopup,
    ]);


    // ========================================================
    // CLOSE LOCATION POPUP
    // ========================================================

    const handleCloseLocationPopup = () => {

        if (
            resolvingMapLink ||
            gettingGpsLocation
        ) {
            return;
        }

        setDraftLocation(null);

        setMapLinkInput("");

        setLocationMessage("");

        setLocationError("");

        setResolvedPlaceName("");

        setResolvedPlaceAddress("");

        setResolvedLocationSource("");

        setShowLocationPopup(false);
    };


    // ========================================================
    // CONFIRM LOCATION
    // ========================================================

    const handleConfirmLocation = () => {

        if (
            !draftLocation ||
            !isValidCoordinates(
                draftLocation.lat,
                draftLocation.lon
            )
        ) {

            setLocationError(
                "Please select the exact shop location on the map before confirming."
            );

            setLocationMessage("");

            return;
        }


        const latitude =
            Number(
                draftLocation.lat
            );

        const longitude =
            Number(
                draftLocation.lon
            );


        let mapUrl =
            typeof draftLocation.mapUrl === "string"
                ? draftLocation.mapUrl.trim()
                : "";


        if (!mapUrl) {

            mapUrl =
                createGoogleMapsUrl(
                    latitude,
                    longitude
                );
        }


        // ----------------------------------------------------
        // ONLY NOW update parent location
        // ----------------------------------------------------

        setLocation({

            lat: latitude,

            lon: longitude,

            mapUrl,

            source:
                draftLocation.source ||
                "map",

        });


        setLocationMessage("");

        setLocationError("");

        setShowLocationPopup(false);
    };


    // ========================================================
    // MAP LOCATION CHANGE
    // ========================================================

    const handleMapLocationChange = (
        selectedLocation
    ) => {

        if (
            !selectedLocation ||
            !isValidCoordinates(
                selectedLocation.lat,
                selectedLocation.lon
            )
        ) {
            return;
        }


        const latitude =
            Number(
                selectedLocation.lat
            );

        const longitude =
            Number(
                selectedLocation.lon
            );


        setDraftLocation({

            lat: latitude,

            lon: longitude,

            mapUrl:
                createGoogleMapsUrl(
                    latitude,
                    longitude
                ),

            source:
                selectedLocation.source ||
                "map",

        });


        setLocationError("");


        setLocationMessage(
            "Location selected. Verify the marker and click Confirm Location to save it."
        );
    };


    // ========================================================
    // MARKER DRAG END
    // ========================================================

    const handleMarkerDragEnd = (
        event
    ) => {

        const marker =
            event.target;

        const position =
            marker.getLatLng();


        const latitude =
            Number(
                position.lat
            );

        const longitude =
            Number(
                position.lng
            );


        if (
            !isValidCoordinates(
                latitude,
                longitude
            )
        ) {
            return;
        }


        handleMapLocationChange({

            lat: latitude,

            lon: longitude,

            source: "map",

        });
    };


    // ========================================================
    // USE GOOGLE MAPS LINK
    // ========================================================

    const handleUseGoogleMapsLink =
        async () => {

            const value =
                mapLinkInput.trim();


            if (!value) {

                setLocationError(
                    "Please paste a Google Maps link."
                );

                setLocationMessage("");

                return;
            }


            // ------------------------------------------------
            // Validate URL
            // ------------------------------------------------

            let parsedUrl;

            try {

                parsedUrl =
                    new URL(value);

            } catch {

                setLocationError(
                    "Please enter a valid Google Maps link."
                );

                setLocationMessage("");

                return;
            }


            if (
                parsedUrl.protocol !== "http:" &&
                parsedUrl.protocol !== "https:"
            ) {

                setLocationError(
                    "Please enter a valid Google Maps link."
                );

                setLocationMessage("");

                return;
            }


            // ------------------------------------------------
            // Validate Google Maps domain
            // ------------------------------------------------

            const hostname =
                parsedUrl.hostname.toLowerCase();


            const isGoogleMapsHost =
                hostname === "google.com" ||
                hostname.endsWith(".google.com") ||
                hostname === "maps.app.goo.gl" ||
                hostname === "goo.gl";


            if (!isGoogleMapsHost) {

                setLocationError(
                    "Please paste a Google Maps link."
                );

                setLocationMessage("");

                return;
            }


            setResolvingMapLink(true);

            setLocationError("");

            setLocationMessage(
                "Checking Google Maps location..."
            );

            setResolvedPlaceName("");

            setResolvedPlaceAddress("");

            setResolvedLocationSource("");


            try {

                // ============================================
                // FIRST:
                // Check URL itself for coordinates.
                // ============================================

                const directCoordinates =
                    extractCoordinatesFromGoogleMapsUrl(
                        value
                    );


                if (directCoordinates) {

                    setDraftLocation({

                        lat:
                            directCoordinates.lat,

                        lon:
                            directCoordinates.lon,

                        mapUrl: value,

                        source: "google-maps",

                    });


                    setResolvedPlaceName("");

                    setResolvedPlaceAddress("");

                    setResolvedLocationSource(
                        "google-maps-url"
                    );

                    setLocationError("");

                    setLocationMessage(
                        "Google Maps coordinates found in the link. The marker has been moved to that location. Verify the shop marker before confirming."
                    );


                    return;
                }


                // ============================================
                // SECOND:
                // Backend resolves Google Maps page.
                // ============================================

                const response =
                    await resolveVendorMapLink(
                        value
                    );


                const data =
                    response?.data;


                // ============================================
                // BACKEND FOUND EXACT COORDINATES
                // ============================================

                if (
                    data?.success &&
                    isValidCoordinates(
                        data.latitude,
                        data.longitude
                    )
                ) {

                    const latitude =
                        Number(
                            data.latitude
                        );

                    const longitude =
                        Number(
                            data.longitude
                        );


                    setDraftLocation({

                        lat: latitude,

                        lon: longitude,

                        mapUrl:
                            data.resolvedUrl ||
                            data.mapUrl ||
                            value,

                        source:
                            data.source ||
                            "google-maps",

                    });


                    const placeName =
                        String(
                            data.placeName ||
                            data.name ||
                            ""
                        ).trim();


                    const placeAddress =
                        String(
                            data.resolvedAddress ||
                            data.googleAddress ||
                            data.address ||
                            ""
                        ).trim();


                    setResolvedPlaceName(
                        placeName
                    );

                    setResolvedPlaceAddress(
                        placeAddress
                    );

                    setResolvedLocationSource(
                        String(
                            data.source ||
                            "google-maps"
                        ).trim()
                    );

                    setLocationError("");


                    if (
                        placeName &&
                        placeAddress
                    ) {

                        setLocationMessage(
                            "Google Maps shop found and the exact location was loaded. Verify the marker and shop details before confirming."
                        );

                    } else if (
                        placeName
                    ) {

                        setLocationMessage(
                            "Google Maps shop found and the exact location was loaded. Verify the marker before confirming."
                        );

                    } else {

                        setLocationMessage(
                            "Google Maps location loaded. Verify the marker before confirming."
                        );
                    }


                    return;
                }


                // ============================================
                // GOOGLE PLACE FOUND BUT EXACT COORDINATES FAILED
                // ============================================

                const placeName =
                    String(
                        data?.placeName ||
                        data?.name ||
                        ""
                    ).trim();


                const placeAddress =
                    String(
                        data?.resolvedAddress ||
                        data?.googleAddress ||
                        data?.address ||
                        ""
                    ).trim();


                const backendMessage =
                    String(
                        data?.message ||
                        ""
                    ).trim();


                setResolvedPlaceName(
                    placeName
                );

                setResolvedPlaceAddress(
                    placeAddress
                );

                setResolvedLocationSource(
                    String(
                        data?.source ||
                        "google-maps"
                    ).trim()
                );

                setLocationError("");


                // ------------------------------------------------
                // IMPORTANT:
                // Do NOT create a fake marker.
                // Do NOT use city coordinates.
                // Do NOT geocode the address.
                // ------------------------------------------------

                if (
                    placeName &&
                    placeAddress
                ) {

                    setLocationMessage(
                        `Google Maps found "${placeName}" at "${placeAddress}", but the exact coordinates could not be read automatically. No marker was created.`
                    );

                } else if (
                    placeName
                ) {

                    setLocationMessage(
                        `Google Maps found "${placeName}", but the exact coordinates could not be read automatically. No marker was created.`
                    );

                } else {

                    setLocationMessage(
                        backendMessage ||
                        "Google Maps was opened, but the exact shop coordinates could not be read automatically. No marker was created."
                    );
                }

            } catch (error) {

                console.error(
                    "Google Maps link resolve error:",
                    error
                );


                const backendError =
                    error?.response?.data?.message ||
                    "";


                setLocationError(
                    backendError ||
                    "Unable to resolve this Google Maps link. No shop location was selected."
                );


                setLocationMessage("");

                setResolvedPlaceName("");

                setResolvedPlaceAddress("");

                setResolvedLocationSource("");

            } finally {

                setResolvingMapLink(false);

            }
        };


    // ========================================================
    // GET MY LOCATION
    // ========================================================

    const handleGetMyLocation = () => {

        if (
            !navigator.geolocation
        ) {

            setLocationError(
                "Location services are not supported by this browser."
            );

            setLocationMessage("");

            return;
        }


        setGettingGpsLocation(true);

        setLocationError("");

        setLocationMessage(
            "Getting your current location..."
        );


        navigator.geolocation.getCurrentPosition(

            (position) => {

                const latitude =
                    Number(
                        position.coords.latitude
                    );

                const longitude =
                    Number(
                        position.coords.longitude
                    );


                if (
                    !isValidCoordinates(
                        latitude,
                        longitude
                    )
                ) {

                    setLocationError(
                        "Unable to read a valid location."
                    );

                    setLocationMessage("");

                    setGettingGpsLocation(false);

                    return;
                }


                const mapUrl =
                    createGoogleMapsUrl(
                        latitude,
                        longitude
                    );


                setDraftLocation({

                    lat: latitude,

                    lon: longitude,

                    mapUrl,

                    source: "gps",

                });


                setMapLinkInput(
                    mapUrl
                );


                setResolvedPlaceName("");

                setResolvedPlaceAddress("");

                setResolvedLocationSource(
                    "gps"
                );

                setLocationError("");

                setLocationMessage(
                    "Your current location has been loaded. Verify the marker and click Confirm Location."
                );

                setGettingGpsLocation(false);

            },


            (error) => {

                console.error(
                    "Vendor GPS location error:",
                    error
                );


                let message =
                    "Unable to get your location. Please try again.";


                if (
                    error.code === 1
                ) {

                    message =
                        "Location permission was denied. You can select the shop manually on the map.";

                } else if (
                    error.code === 2
                ) {

                    message =
                        "Your location could not be determined. You can select the shop manually on the map.";

                } else if (
                    error.code === 3
                ) {

                    message =
                        "Location request timed out. Please try again or select the shop manually on the map.";
                }


                setLocationError(
                    message
                );

                setLocationMessage("");

                setGettingGpsLocation(false);

            },


            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };


    // ========================================================
    // MAP CENTER
    // ========================================================

    const hasDraftLocation =
        draftLocation &&
        isValidCoordinates(
            draftLocation.lat,
            draftLocation.lon
        );


    const mapCenter =
        hasDraftLocation

            ? [
                Number(
                    draftLocation.lat
                ),

                Number(
                    draftLocation.lon
                ),
            ]

            : [
                DEFAULT_MAP_CENTER.lat,
                DEFAULT_MAP_CENTER.lon,
            ];


    const mapZoom =
        hasDraftLocation
            ? 17
            : 13;


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <>

            {/* ==================================================
                BASIC REGISTRATION DETAILS
            ================================================== */}

            <div className="vendor-register-fields">


                {/* ==================================================
                    FULL NAME
                ================================================== */}

                <div
                    className={`form-group ${
                        fullNameError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        Full Name
                    </label>

                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {

                            setFullName(
                                e.target.value
                            );

                            markTouched(
                                "fullName"
                            );

                        }}
                        onBlur={() =>
                            markTouched(
                                "fullName"
                            )
                        }
                        placeholder="Enter full name"
                        aria-invalid={
                            !!fullNameError
                        }
                    />

                    {fullNameError && (
                        <div className="field-error">
                            {fullNameError}
                        </div>
                    )}

                </div>


                {/* ==================================================
                    SHOP NAME
                ================================================== */}

                <div
                    className={`form-group ${
                        shopNameError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        Shop Name
                    </label>

                    <input
                        type="text"
                        value={shopName}
                        onChange={(e) => {

                            setShopName(
                                e.target.value
                            );

                            markTouched(
                                "shopName"
                            );

                        }}
                        onBlur={() =>
                            markTouched(
                                "shopName"
                            )
                        }
                        placeholder="Enter shop name"
                        aria-invalid={
                            !!shopNameError
                        }
                    />

                    {shopNameError && (
                        <div className="field-error">
                            {shopNameError}
                        </div>
                    )}

                </div>


                {/* ==================================================
                    STATE
                ================================================== */}

                <div
                    className={`form-group ${
                        stateError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        State
                    </label>

                    <input
                        type="text"
                        value={state}
                        onChange={(e) => {

                            setState(
                                e.target.value
                            );

                            markTouched(
                                "state"
                            );

                        }}
                        onBlur={() =>
                            markTouched(
                                "state"
                            )
                        }
                        placeholder="Enter state"
                        aria-invalid={
                            !!stateError
                        }
                    />

                    {stateError && (
                        <div className="field-error">
                            {stateError}
                        </div>
                    )}

                </div>


                {/* ==================================================
                    CITY
                ================================================== */}

                <div
                    className={`form-group ${
                        cityError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        City
                    </label>

                    <input
                        type="text"
                        value={city}
                        onChange={(e) => {

                            setCity(
                                e.target.value
                            );

                            markTouched(
                                "city"
                            );

                        }}
                        onBlur={() =>
                            markTouched(
                                "city"
                            )
                        }
                        placeholder="Enter city"
                        aria-invalid={
                            !!cityError
                        }
                    />

                    {cityError && (
                        <div className="field-error">
                            {cityError}
                        </div>
                    )}

                </div>


                {/* ==================================================
                    PINCODE
                ================================================== */}

                <div
                    className={`form-group ${
                        pincodeError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        Pincode
                    </label>

                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => {

                            const value =
                                e.target.value
                                    .replace(
                                        /\D/g,
                                        ""
                                    )
                                    .slice(
                                        0,
                                        6
                                    );

                            setPincode(
                                value
                            );

                            markTouched(
                                "pincode"
                            );

                        }}
                        onBlur={() =>
                            markTouched(
                                "pincode"
                            )
                        }
                        placeholder="Enter pincode"
                        aria-invalid={
                            !!pincodeError
                        }
                    />

                    {pincodeError && (
                        <div className="field-error">
                            {pincodeError}
                        </div>
                    )}

                </div>


                {/* ==================================================
                    ADDRESS
                ================================================== */}

                <div
                    className={`form-group ${
                        addressError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        Shop Address
                    </label>

                    <textarea
                        value={address}
                        onChange={(e) => {

                            setAddress(
                                e.target.value
                            );

                            markTouched(
                                "address"
                            );

                        }}
                        onBlur={() =>
                            markTouched(
                                "address"
                            )
                        }
                        placeholder="Enter complete shop address"
                        rows="3"
                        aria-invalid={
                            !!addressError
                        }
                    />

                    {addressError && (
                        <div className="field-error">
                            {addressError}
                        </div>
                    )}

                </div>


                {/* ==================================================
                    PHONE
                ================================================== */}

                <div
                    className={`form-group ${
                        phoneError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        Phone Number
                    </label>

                    <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {

                            const value =
                                e.target.value
                                    .replace(
                                        /\D/g,
                                        ""
                                    )
                                    .slice(
                                        0,
                                        10
                                    );

                            setPhone(
                                value
                            );

                            markTouched(
                                "phone"
                            );

                        }}
                        onBlur={() =>
                            markTouched(
                                "phone"
                            )
                        }
                        placeholder="Enter 10-digit phone number"
                        aria-invalid={
                            !!phoneError
                        }
                    />

                    {phoneError && (
                        <div className="field-error">
                            {phoneError}
                        </div>
                    )}

                </div>


                {/* ==================================================
                    EMAIL
                ================================================== */}

                <div
                    className={`form-group ${
                        emailError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {

                            setEmail(
                                e.target.value
                            );

                            markTouched(
                                "email"
                            );

                            // Clear old duplicate
                            // state immediately.
                            setEmailExists(
                                false
                            );

                        }}
                        onBlur={() =>
                            markTouched(
                                "email"
                            )
                        }
                        placeholder="Enter email"
                        aria-invalid={
                            !!emailError
                        }
                    />


                    {/* ==================================================
                        EMAIL CHECKING
                    ================================================== */}

                    {checkingEmail && (
                        <div className="field-error">
                            Checking email...
                        </div>
                    )}


                    {/* ==================================================
                        EMAIL ERROR
                    ================================================== */}

                    {!checkingEmail &&
                        emailError && (
                            <div className="field-error">
                                {emailError}
                            </div>
                        )}

                </div>


                {/* ==================================================
                    PASSWORD
                ================================================== */}

                <div
                    className={`form-group ${
                        passwordError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        Password
                    </label>

                    <div className="password-field">

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {

                                setPassword(
                                    e.target.value
                                );

                                markTouched(
                                    "password"
                                );

                                if (
                                    confirmPassword
                                ) {

                                    markTouched(
                                        "confirmPassword"
                                    );

                                }

                            }}
                            onBlur={() =>
                                markTouched(
                                    "password"
                                )
                            }
                            placeholder="Enter password"
                            aria-invalid={
                                !!passwordError
                            }
                        />

                    </div>

                    {passwordError && (
                        <div className="field-error">
                            {passwordError}
                        </div>
                    )}

                </div>


                {/* ==================================================
                    CONFIRM PASSWORD
                ================================================== */}

                <div
                    className={`form-group ${
                        confirmPasswordError
                            ? "has-error"
                            : ""
                    }`}
                >

                    <label>
                        Confirm Password
                    </label>

                    <div className="password-field">

                        <input
                            type="password"
                            value={
                                confirmPassword
                            }
                            onChange={(e) => {

                                setConfirmPassword(
                                    e.target.value
                                );

                                markTouched(
                                    "confirmPassword"
                                );

                            }}
                            onBlur={() =>
                                markTouched(
                                    "confirmPassword"
                                )
                            }
                            placeholder="Confirm password"
                            aria-invalid={
                                !!confirmPasswordError
                            }
                        />

                    </div>

                    {confirmPasswordError && (
                        <div className="field-error">
                            {confirmPasswordError}
                        </div>
                    )}

                </div>


                {/* ==================================================
                    SHOP LOCATION
                ================================================== */}

                <div className="vendor-location-section">

                    <label>
                        Shop Location
                    </label>

                    <button
                        type="button"
                        className="vendor-location-open-button"
                        onClick={() =>
                            setShowLocationPopup(
                                true
                            )
                        }
                    >
                        {location
                            ? "Change Shop Location"
                            : "Set Shop Location"}
                    </button>


                    {location &&
                        isValidCoordinates(
                            location.lat,
                            location.lon
                        ) && (

                            <div className="vendor-location-confirmed">

                                <span>
                                    ✓ Shop location selected
                                </span>

                            </div>

                        )}

                </div>

            </div>


            {/* ======================================================
                LOCATION POPUP
            ====================================================== */}

            {showLocationPopup && (

                <div
                    className="vendor-location-popup-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            handleCloseLocationPopup();

                        }

                    }}
                >

                    <div
                        className="vendor-location-popup"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="vendor-location-popup-title"
                    >


                        {/* ==================================================
                            POPUP HEADER
                        ================================================== */}

                        <div className="vendor-location-popup-header">

                            <div>

                                <h3
                                    id="vendor-location-popup-title"
                                >
                                    Set Shop Location
                                </h3>

                                <p>
                                    Select the exact location
                                    of your physical shop.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="vendor-location-popup-close"
                                onClick={
                                    handleCloseLocationPopup
                                }
                                disabled={
                                    resolvingMapLink ||
                                    gettingGpsLocation
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        {/* ==================================================
                            SCROLLABLE POPUP CONTENT
                        ================================================== */}

                        <div className="vendor-location-popup-scroll">


                            {/* ==========================================
                                GOOGLE MAPS LINK
                            ========================================== */}

                            <div className="vendor-location-link-section">

                                <label>
                                    Google Maps Link
                                </label>


                                <div className="vendor-location-link-row">

                                    <input
                                        type="url"
                                        value={
                                            mapLinkInput
                                        }
                                        onChange={(e) => {

                                            setMapLinkInput(
                                                e.target.value
                                            );

                                            setLocationError("");

                                            setLocationMessage("");

                                            setResolvedPlaceName("");

                                            setResolvedPlaceAddress("");

                                            setResolvedLocationSource("");

                                        }}
                                        placeholder="Paste Google Maps link"
                                        disabled={
                                            resolvingMapLink
                                        }
                                    />


                                    <button
                                        type="button"
                                        className="vendor-location-use-link"
                                        onClick={
                                            handleUseGoogleMapsLink
                                        }
                                        disabled={
                                            resolvingMapLink ||
                                            !mapLinkInput.trim()
                                        }
                                    >

                                        {resolvingMapLink
                                            ? "Loading..."
                                            : "Use Link"}

                                    </button>

                                </div>


                                <div className="vendor-location-link-note">

                                    Paste the Google Maps link of the
                                    <b>
                                        {" "}exact shop you want to register
                                    </b>.
                                    If you are physically at the shop, you can
                                    use Get My Location instead. After using a
                                    link, always verify the marker before
                                    confirming.

                                </div>

                            </div>


                            {/* ==========================================
                                GPS BUTTON
                            ========================================== */}

                            <div className="vendor-location-actions">

                                <button
                                    type="button"
                                    className="vendor-location-gps-button"
                                    onClick={
                                        handleGetMyLocation
                                    }
                                    disabled={
                                        gettingGpsLocation ||
                                        resolvingMapLink
                                    }
                                >

                                    {gettingGpsLocation
                                        ? "Getting Location..."
                                        : "Get My Location"}

                                </button>

                            </div>


                            <div className="vendor-location-gps-note">

                                Get My Location uses this device's current GPS
                                position. It does not search for the shop from
                                the Google Maps link.

                            </div>


                            {/* ==========================================
                                RESOLVED GOOGLE MAPS PLACE
                            ========================================== */}

                            {(resolvedPlaceName ||
                                resolvedPlaceAddress ||
                                hasDraftLocation) && (

                                <div className="vendor-location-place">

                                    <strong>
                                        Google Maps place found
                                    </strong>


                                    {resolvedPlaceName && (

                                        <div className="vendor-location-place-name">

                                            <span>
                                                Shop / Place
                                            </span>

                                            <strong>
                                                {resolvedPlaceName}
                                            </strong>

                                        </div>

                                    )}


                                    {resolvedPlaceAddress && (

                                        <div className="vendor-location-place-address">

                                            <span>
                                                Address
                                            </span>

                                            <strong>
                                                {resolvedPlaceAddress}
                                            </strong>

                                        </div>

                                    )}


                                    {hasDraftLocation && (

                                        <div className="vendor-location-coordinates">

                                            <div>

                                                <span>
                                                    Latitude
                                                </span>

                                                <strong>
                                                    {Number(
                                                        draftLocation.lat
                                                    ).toFixed(7)}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Longitude
                                                </span>

                                                <strong>
                                                    {Number(
                                                        draftLocation.lon
                                                    ).toFixed(7)}
                                                </strong>

                                            </div>

                                        </div>

                                    )}


                                    {resolvedLocationSource &&
                                        resolvedLocationSource !== "gps" && (

                                            <small>

                                                Location details and
                                                coordinates were resolved
                                                from the Google Maps link.

                                            </small>

                                        )}

                                </div>

                            )}


                            {/* ==========================================
                                ERROR
                            ========================================== */}

                            {locationError && (

                                <div className="vendor-location-error">

                                    {locationError}

                                </div>

                            )}


                            {/* ==========================================
                                MESSAGE
                            ========================================== */}

                            {locationMessage && (

                                <div className="vendor-location-message">

                                    {locationMessage}

                                </div>

                            )}


                            {/* ==========================================
                                MAP
                            ========================================== */}

                            <div className="vendor-location-map-wrapper">

                                <MapContainer

                                    key={
                                        showLocationPopup
                                            ? "location-map-open"
                                            : "location-map-closed"
                                    }

                                    center={
                                        mapCenter
                                    }

                                    zoom={
                                        mapZoom
                                    }

                                    scrollWheelZoom={
                                        true
                                    }

                                    className="vendor-location-map"
                                >

                                    <TileLayer
                                        attribution="© OpenStreetMap contributors"
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <MapSizeUpdater />

                                    <MapCenterUpdater
                                        location={
                                            draftLocation
                                        }
                                    />

                                    <MapLocationSelector
                                        onSelect={
                                            handleMapLocationChange
                                        }
                                    />


                                    {/* ==================================
                                        MARKER
                                    ================================== */}

                                    {hasDraftLocation && (

                                        <Marker

                                            key={
                                                `${draftLocation.lat}-${draftLocation.lon}`
                                            }

                                            position={[
                                                Number(
                                                    draftLocation.lat
                                                ),

                                                Number(
                                                    draftLocation.lon
                                                ),
                                            ]}

                                            draggable={
                                                true
                                            }

                                            eventHandlers={{
                                                dragend:
                                                    handleMarkerDragEnd,
                                            }}

                                        />

                                    )}

                                </MapContainer>


                                <div className="vendor-location-map-hint">

                                    {hasDraftLocation

                                        ? "Verify the marker is on the exact shop. Drag it or click another point if needed."

                                        : "No shop location selected. The map is only centered around Guntur as a starting view."}

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            POPUP FOOTER
                        ================================================== */}

                        <div className="vendor-location-popup-footer">

                            <button
                                type="button"
                                className="vendor-location-cancel-button"
                                onClick={
                                    handleCloseLocationPopup
                                }
                                disabled={
                                    resolvingMapLink ||
                                    gettingGpsLocation
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="vendor-location-confirm-button"
                                onClick={
                                    handleConfirmLocation
                                }
                                disabled={
                                    resolvingMapLink ||
                                    gettingGpsLocation ||
                                    !hasDraftLocation
                                }
                            >
                                Confirm Location
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}


export default VendorRegistrationDetails;