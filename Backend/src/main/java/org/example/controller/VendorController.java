package org.example.controller;

import java.net.URI;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.example.dto.LoginRequest;
import org.example.dto.LoginResponse;
import org.example.dto.VendorDetailsDTO;
import org.example.dto.VendorProductDTO;
import org.example.entity.Vendor;
import org.example.repository.InventoryRepository;
import org.example.repository.VendorRepository;
import org.example.security.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.WaitUntilState;

@RestController
@RequestMapping("/vendor")
public class VendorController {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private JWTUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    // ============================================================
    // HTTP CLIENT
    // ============================================================

    private final HttpClient httpClient =
            HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .connectTimeout(Duration.ofSeconds(15))
                    .build();

    // ============================================================
    // GOOGLE MAPS PATTERNS
    // ============================================================

    private static final Pattern AT_COORDINATES =
            Pattern.compile(
                    "@(-?\\d+(?:\\.\\d+)?),\\s*(-?\\d+(?:\\.\\d+)?)"
            );

    private static final Pattern GOOGLE_DATA_COORDINATES =
            Pattern.compile(
                    "!3d(-?\\d+(?:\\.\\d+)?)!4d(-?\\d+(?:\\.\\d+)?)"
            );

    private static final Pattern GOOGLE_LNG_LAT_COORDINATES =
            Pattern.compile(
                    "!2d(-?\\d+(?:\\.\\d+)?)!3d(-?\\d+(?:\\.\\d+)?)"
            );

    private static final Pattern QUERY_COORDINATES =
            Pattern.compile(
                    "[?&#](?:q|query|destination|center)="
                            + "(-?\\d+(?:\\.\\d+)?)(?:%2C|,)"
                            + "\\s*(-?\\d+(?:\\.\\d+)?)",
                    Pattern.CASE_INSENSITIVE
            );

    private static final Pattern HASH_COORDINATES =
            Pattern.compile(
                    "(?:^|[#&])(?:center|ll|location)="
                            + "(-?\\d+(?:\\.\\d+)?)(?:%2C|,)"
                            + "\\s*(-?\\d+(?:\\.\\d+)?)",
                    Pattern.CASE_INSENSITIVE
            );

    private static final Pattern GOOGLE_PLACE_ID =
            Pattern.compile(
                    "!1s([^!&]+)!",
                    Pattern.CASE_INSENSITIVE
            );

    private static final Pattern GOOGLE_PLACE_ID_DATA =
            Pattern.compile(
                    "!1s([^!&]+)",
                    Pattern.CASE_INSENSITIVE
            );

    private static final Pattern GOOGLE_PLACE_PATH =
            Pattern.compile(
                    "/maps/place/([^/?#]+)",
                    Pattern.CASE_INSENSITIVE
            );


    // ============================================================
    // GOOGLE MAPS LOCATION RESOLVER
    // ============================================================

    @GetMapping("/resolve-location")
    public ResponseEntity<?> resolveGoogleMapsLocation(
            @RequestParam String url) {

        System.out.println();
        System.out.println("==================================================");
        System.out.println("GOOGLE MAPS LOCATION RESOLVER");
        System.out.println("==================================================");

        if (url == null || url.trim().isEmpty()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success",
                            false,
                            "message",
                            "Google Maps link is required."
                    )
            );
        }

        String originalUrl = url.trim();

        URI originalUri;

        try {

            originalUri = URI.create(originalUrl);

        } catch (Exception exception) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success",
                            false,
                            "message",
                            "The Google Maps link is invalid."
                    )
            );
        }

        String scheme = originalUri.getScheme();
        String host = originalUri.getHost();

        if (!"http".equalsIgnoreCase(scheme)
                && !"https".equalsIgnoreCase(scheme)) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success",
                            false,
                            "message",
                            "Only HTTP and HTTPS links are supported."
                    )
            );
        }

        if (host == null || !isGoogleMapsHost(host)) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success",
                            false,
                            "message",
                            "Please provide a valid Google Maps link."
                    )
            );
        }

        System.out.println("Original Google Maps URL:");
        System.out.println(originalUrl);


        // ========================================================
        // STEP 1
        //
        // TRY TO RESOLVE REDIRECT FIRST
        //
        // This is important for:
        //
        // https://maps.app.goo.gl/xxxxx
        //
        // ========================================================

        String finalUrl = originalUrl;

        try {

            finalUrl =
                    resolveGoogleRedirectChain(
                            originalUrl
                    );

            System.out.println();
            System.out.println("Resolved Google Maps URL:");
            System.out.println(finalUrl);

        } catch (Exception exception) {

            System.out.println(
                    "Google redirect resolution failed: "
                            + exception.getMessage()
            );

            /*
             * This is not fatal.
             *
             * Playwright can still open the original short link.
             */
        }


        // ========================================================
        // STEP 2
        //
        // EXTRACT PLACE ID / PLACE NAME FROM RESOLVED URL
        // ========================================================

        String placeId =
                extractGooglePlaceId(
                        finalUrl
                );

        String urlPlaceName =
                extractGooglePlaceName(
                        finalUrl
                );

        System.out.println();
        System.out.println(
                "Google Place ID: "
                        + (placeId == null
                        ? "NOT FOUND"
                        : placeId)
        );

        System.out.println(
                "Google Place Name from URL: "
                        + (urlPlaceName == null
                        ? "NOT FOUND"
                        : urlPlaceName)
        );


        // ========================================================
        // STEP 3
        //
        // OPEN GOOGLE MAPS WITH PLAYWRIGHT
        //
        // IMPORTANT:
        //
        // Playwright is now used even if coordinates are already
        // present in the resolved URL.
        //
        // Why?
        //
        // Because we also need:
        //
        // - shop name
        // - shop address
        // - exact coordinates
        //
        // ========================================================

        System.out.println();
        System.out.println(
                "Opening Google Maps in Chromium..."
        );

        GoogleMapsResolution googleResult =
                null;

        try {

            googleResult =
                    extractGoogleMapsDetailsWithPlaywright(
                            originalUrl,
                            finalUrl,
                            placeId,
                            urlPlaceName
                    );

        } catch (Exception exception) {

            System.out.println();
            System.out.println(
                    "Playwright Google Maps extraction failed:"
            );

            System.out.println(
                    exception.getMessage()
            );
        }


        // ========================================================
        // STEP 4
        //
        // IF PLAYWRIGHT FOUND EXACT COORDINATES
        // ========================================================

        if (
                googleResult != null
                        && googleResult.hasCoordinates()
        ) {

            System.out.println();
            System.out.println(
                    "=================================================="
            );

            System.out.println(
                    "EXACT GOOGLE MAPS LOCATION FOUND"
            );

            System.out.println(
                    "=================================================="
            );

            printCoordinates(
                    new double[]{
                            googleResult.latitude,
                            googleResult.longitude
                    }
            );

            System.out.println(
                    "Place Name: "
                            + googleResult.placeName
            );

            System.out.println(
                    "Address: "
                            + googleResult.address
            );


            return successResponse(
                    googleResult,
                    originalUrl,
                    finalUrl
            );
        }


        // ========================================================
        // STEP 5
        //
        // FALLBACK:
        //
        // If Playwright did not find coordinates but the URL
        // itself contains exact coordinates, use those exact
        // coordinates.
        //
        // NO GEOCODING.
        // NO CITY FALLBACK.
        // ========================================================

        double[] coordinates =
                extractExplicitGoogleCoordinates(
                        finalUrl
                );

        if (coordinates != null) {

            System.out.println();
            System.out.println(
                    "Exact coordinates found in resolved URL."
            );

            printCoordinates(
                    coordinates
            );


            GoogleMapsResolution fallbackResult =
                    new GoogleMapsResolution();

            fallbackResult.latitude =
                    coordinates[0];

            fallbackResult.longitude =
                    coordinates[1];

            fallbackResult.placeName =
                    urlPlaceName == null
                            ? ""
                            : urlPlaceName;

            fallbackResult.address =
                    "";

            fallbackResult.source =
                    "Google Maps explicit URL coordinates";


            return successResponse(
                    fallbackResult,
                    originalUrl,
                    finalUrl
            );
        }


        // ========================================================
        // STEP 6
        //
        // FINAL FAILURE
        //
        // IMPORTANT:
        //
        // We DO NOT:
        //
        // - geocode address
        // - use Nominatim
        // - use Tenali
        // - use Guntur
        // - use city center
        // - guess coordinates
        //
        // ========================================================

        System.out.println();
        System.out.println(
                "=================================================="
        );

        System.out.println(
                "EXACT GOOGLE PLACE COORDINATES NOT FOUND"
        );

        System.out.println(
                "NO APPROXIMATE LOCATION USED"
        );

        System.out.println(
                "NO ADDRESS GEOCODING USED"
        );

        System.out.println(
                "NO CITY FALLBACK USED"
        );

        System.out.println(
                "=================================================="
        );


        String failurePlaceName =
                googleResult != null
                        ? safeString(
                                googleResult.placeName
                        )
                        : safeString(
                                urlPlaceName
                        );


        String failureAddress =
                googleResult != null
                        ? safeString(
                                googleResult.address
                        )
                        : "";


        Map<String, Object> failureResponse =
                new HashMap<>();

        failureResponse.put(
                "success",
                false
        );

        failureResponse.put(
                "message",
                "Google Maps found the place, but exact "
                        + "shop coordinates could not be extracted. "
                        + "No approximate location was used."
        );

        failureResponse.put(
                "locationLink",
                originalUrl
        );

        failureResponse.put(
                "resolvedUrl",
                finalUrl
        );

        failureResponse.put(
                "placeName",
                failurePlaceName
        );

        failureResponse.put(
                "name",
                failurePlaceName
        );

        failureResponse.put(
                "resolvedAddress",
                failureAddress
        );

        failureResponse.put(
                "address",
                failureAddress
        );

        failureResponse.put(
                "placeId",
                placeId == null
                        ? ""
                        : placeId
        );

        failureResponse.put(
                "source",
                "google-maps"
        );


        return ResponseEntity.ok(
                failureResponse
        );
    }


    // ============================================================
    // PLAYWRIGHT GOOGLE MAPS RESOLVER
    // ============================================================

    private GoogleMapsResolution
    extractGoogleMapsDetailsWithPlaywright(
            String originalUrl,
            String resolvedUrl,
            String placeId,
            String urlPlaceName) {

        String browserUrl =
                resolvedUrl;

        if (
                browserUrl == null
                        || browserUrl.isBlank()
        ) {

            browserUrl =
                    originalUrl;
        }


        System.out.println();
        System.out.println(
                "Playwright opening:"
        );

        System.out.println(
                browserUrl
        );


        GoogleMapsResolution result =
                new GoogleMapsResolution();


        if (
                urlPlaceName != null
                        && !urlPlaceName.isBlank()
        ) {

            result.placeName =
                    urlPlaceName;
        }


        try (
                Playwright playwright =
                        Playwright.create()
        ) {

            Browser browser =
                    playwright.chromium().launch(
                            new BrowserType.LaunchOptions()
                                    .setHeadless(true)
                                    .setArgs(
                                            List.of(
                                                    "--disable-blink-features=AutomationControlled",
                                                    "--disable-dev-shm-usage",
                                                    "--no-sandbox"
                                            )
                                    )
                    );


            try {

                Browser.NewContextOptions
                        contextOptions =
                        new Browser.NewContextOptions()
                                .setUserAgent(
                                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                                + "AppleWebKit/537.36 "
                                                + "(KHTML, like Gecko) "
                                                + "Chrome/153.0.0.0 "
                                                + "Safari/537.36"
                                )
                                .setLocale(
                                        "en-US"
                                )
                                .setViewportSize(
                                        1440,
                                        900
                                );


                BrowserContext context =
                        browser.newContext(
                                contextOptions
                        );


                try {

                    Page page =
                            context.newPage();


                    page.setDefaultTimeout(
                            8000
                    );


                    // ====================================================
                    // NAVIGATE
                    // ====================================================

                    System.out.println(
                            "Navigating Google Maps..."
                    );


                    page.navigate(
                            browserUrl,
                            new Page.NavigateOptions()
                                    .setWaitUntil(
                                            WaitUntilState.DOMCONTENTLOADED
                                    )
                                    .setTimeout(
                                            30000
                                    )
                    );


                    // ====================================================
                    // WAIT FOR GOOGLE MAPS JS
                    // ====================================================

                    page.waitForTimeout(
                            5000
                    );


                    // ====================================================
                    // FINAL BROWSER URL
                    // ====================================================

                    String currentBrowserUrl =
                            page.url();


                    System.out.println();
                    System.out.println(
                            "Playwright final URL:"
                    );

                    System.out.println(
                            currentBrowserUrl
                    );


                    // ====================================================
                    // EXTRACT PLACE NAME
                    // ====================================================

                    String pagePlaceName =
                            extractPlaceNameFromPage(
                                    page
                            );


                    if (
                            pagePlaceName != null
                                    && !pagePlaceName.isBlank()
                    ) {

                        result.placeName =
                                pagePlaceName;
                    }


                    // ====================================================
                    // FALLBACK:
                    //
                    // Extract place name from final browser URL.
                    // ====================================================

                    if (
                            result.placeName == null
                                    || result.placeName.isBlank()
                    ) {

                        String browserUrlPlaceName =
                                extractGooglePlaceName(
                                        currentBrowserUrl
                                );


                        if (
                                browserUrlPlaceName != null
                                        && !browserUrlPlaceName.isBlank()
                        ) {

                            result.placeName =
                                    browserUrlPlaceName;
                        }
                    }


                    // ====================================================
                    // EXTRACT ADDRESS
                    // ====================================================

                    String pageAddress =
                            extractAddressFromGoogleMapsPage(
                                    page
                            );


                    if (
                            pageAddress != null
                                    && !pageAddress.isBlank()
                    ) {

                        result.address =
                                pageAddress;
                    }


                    // ====================================================
                    // COLLECT CANDIDATE URLS
                    // ====================================================

                    List<String> candidateUrls =
                            new ArrayList<>();


                    candidateUrls.add(
                            currentBrowserUrl
                    );


                    if (
                            browserUrl != null
                                    && !browserUrl.isBlank()
                    ) {

                        candidateUrls.add(
                                browserUrl
                        );
                    }


                    // ====================================================
                    // CANONICAL URL
                    // ====================================================

                    try {

                        Locator canonicalLocator =
                                page.locator(
                                        "link[rel='canonical']"
                                );


                        if (
                                canonicalLocator.count()
                                        > 0
                        ) {

                            String canonicalUrl =
                                    canonicalLocator
                                            .first()
                                            .getAttribute(
                                                    "href"
                                            );


                            if (
                                    canonicalUrl != null
                                            && !canonicalUrl.isBlank()
                            ) {

                                candidateUrls.add(
                                        canonicalUrl
                                );


                                System.out.println(
                                        "Canonical URL:"
                                );

                                System.out.println(
                                        canonicalUrl
                                );
                            }
                        }

                    } catch (Exception exception) {

                        System.out.println(
                                "Canonical URL unavailable."
                        );
                    }


                    // ====================================================
                    // OG URL
                    // ====================================================

                    try {

                        Locator ogLocator =
                                page.locator(
                                        "meta[property='og:url']"
                                );


                        if (
                                ogLocator.count()
                                        > 0
                        ) {

                            String ogUrl =
                                    ogLocator
                                            .first()
                                            .getAttribute(
                                                    "content"
                                            );


                            if (
                                    ogUrl != null
                                            && !ogUrl.isBlank()
                            ) {

                                candidateUrls.add(
                                        ogUrl
                                );


                                System.out.println(
                                        "OG URL:"
                                );

                                System.out.println(
                                        ogUrl
                                );
                            }
                        }

                    } catch (Exception exception) {

                        System.out.println(
                                "OG URL unavailable."
                        );
                    }


                    // ====================================================
                    // RENDERED GOOGLE MAPS LINKS
                    // ====================================================

                    try {

                        Object hrefResult =
                                page.locator(
                                        "a[href]"
                                ).evaluateAll(
                                        "elements => "
                                                + "elements.map(e => e.href)"
                                );


                        if (
                                hrefResult instanceof List<?> links
                        ) {

                            for (
                                    Object link :
                                    links
                            ) {

                                if (link == null) {
                                    continue;
                                }


                                String linkValue =
                                        link.toString();


                                if (
                                        linkValue.contains(
                                                "google.com/maps"
                                        )
                                ) {

                                    candidateUrls.add(
                                            linkValue
                                    );
                                }
                            }
                        }

                    } catch (Exception exception) {

                        System.out.println(
                                "Could not collect rendered "
                                        + "Google Maps links."
                        );
                    }


                    // ====================================================
                    // UNIQUE URLS
                    // ====================================================

                    candidateUrls =
                            candidateUrls.stream()
                                    .filter(
                                            value ->
                                                    value != null
                                                            && !value.isBlank()
                                    )
                                    .distinct()
                                    .toList();


                    System.out.println();
                    System.out.println(
                            "Google Maps candidate URLs: "
                                    + candidateUrls.size()
                    );


                    // ====================================================
                    // EXACT COORDINATES
                    //
                    // PRIORITY 1:
                    // SAME PLACE ID
                    // ====================================================

                    if (
                            placeId != null
                                    && !placeId.isBlank()
                    ) {

                        for (
                                String candidate :
                                candidateUrls
                        ) {

                            if (
                                    !candidate.contains(
                                            placeId
                                    )
                            ) {

                                continue;
                            }


                            double[] found =
                                    extractPlaceSpecificCoordinates(
                                            candidate
                                    );


                            if (
                                    found != null
                            ) {

                                result.latitude =
                                        found[0];

                                result.longitude =
                                        found[1];

                                result.source =
                                        "Google Maps rendered place coordinates";


                                System.out.println(
                                        "Exact coordinates found using Place ID URL."
                                );


                                return result;
                            }
                        }
                    }


                    // ====================================================
                    // PRIORITY 2:
                    // /maps/place/
                    // ====================================================

                    for (
                            String candidate :
                            candidateUrls
                    ) {

                        if (
                                !candidate.contains(
                                        "/maps/place/"
                                )
                        ) {

                            continue;
                        }


                        double[] found =
                                extractPlaceSpecificCoordinates(
                                        candidate
                                );


                        if (
                                found != null
                        ) {

                            result.latitude =
                                    found[0];

                            result.longitude =
                                    found[1];

                            result.source =
                                    "Google Maps rendered place coordinates";


                            System.out.println(
                                    "Exact coordinates found in rendered place URL."
                            );


                            return result;
                        }
                    }


                    // ====================================================
                    // PRIORITY 3:
                    // QUERY / DESTINATION
                    // ====================================================

                    for (
                            String candidate :
                            candidateUrls
                    ) {

                        double[] found =
                                extractQueryCoordinatesOnly(
                                        candidate
                                );


                        if (
                                found != null
                        ) {

                            result.latitude =
                                    found[0];

                            result.longitude =
                                    found[1];

                            result.source =
                                    "Google Maps rendered query coordinates";


                            System.out.println(
                                    "Exact coordinates found in rendered query URL."
                            );


                            return result;
                        }
                    }


                    // ====================================================
                    // PRIORITY 4:
                    // FINAL BROWSER URL
                    // ====================================================

                    double[] currentUrlCoordinates =
                            extractExplicitGoogleCoordinates(
                                    currentBrowserUrl
                            );


                    if (
                            currentUrlCoordinates != null
                    ) {

                        result.latitude =
                                currentUrlCoordinates[0];

                        result.longitude =
                                currentUrlCoordinates[1];

                        result.source =
                                "Google Maps final browser URL";


                        System.out.println(
                                "Exact coordinates found in final browser URL."
                        );


                        return result;
                    }


                    // ====================================================
                    // NO COORDINATES
                    // BUT PLACE DETAILS MAY STILL EXIST
                    // ====================================================

                    System.out.println();
                    System.out.println(
                            "Google Maps page details:"
                    );

                    System.out.println(
                            "Place Name = "
                                    + result.placeName
                    );

                    System.out.println(
                            "Address = "
                                    + result.address
                    );

                    System.out.println(
                            "Exact coordinates were not exposed."
                    );


                    return result;


                } finally {

                    context.close();
                }


            } finally {

                browser.close();
            }


        } catch (Exception exception) {

            System.out.println(
                    "Playwright error: "
                            + exception.getMessage()
            );

            throw exception;
        }
    }


    // ============================================================
    // EXTRACT SHOP NAME FROM GOOGLE MAPS PAGE
    // ============================================================

    private String extractPlaceNameFromPage(
            Page page) {

        // --------------------------------------------------------
        // 1. Google Maps h1
        // --------------------------------------------------------

        try {

            Locator h1 =
                    page.locator(
                            "h1"
                    );


            if (
                    h1.count()
                            > 0
            ) {

                String text =
                        h1.first().innerText();


                text =
                        cleanGoogleMapsText(
                                text
                        );


                if (
                        isUsablePlaceName(
                                text
                        )
                ) {

                    System.out.println(
                            "Place name from H1: "
                                    + text
                    );

                    return text;
                }
            }

        } catch (Exception exception) {

            System.out.println(
                    "H1 place name unavailable."
            );
        }


        // --------------------------------------------------------
        // 2. OG title
        // --------------------------------------------------------

        try {

            Locator ogTitle =
                    page.locator(
                            "meta[property='og:title']"
                    );


            if (
                    ogTitle.count()
                            > 0
            ) {

                String title =
                        ogTitle.first()
                                .getAttribute(
                                        "content"
                                );


                title =
                        cleanGoogleMapsText(
                                title
                        );


                if (
                        isUsablePlaceName(
                                title
                        )
                ) {

                    System.out.println(
                            "Place name from OG title: "
                                    + title
                    );

                    return title;
                }
            }

        } catch (Exception exception) {

            System.out.println(
                    "OG title unavailable."
            );
        }


        // --------------------------------------------------------
        // 3. Page title
        // --------------------------------------------------------

        try {

            String title =
                    page.title();


            title =
                    cleanGoogleMapsText(
                            title
                    );


            if (
                    title != null
                            && !title.isBlank()
            ) {

                title =
                        removeGoogleMapsTitleSuffix(
                                title
                        );


                if (
                        isUsablePlaceName(
                                title
                        )
                ) {

                    System.out.println(
                            "Place name from page title: "
                                    + title
                    );

                    return title;
                }
            }

        } catch (Exception exception) {

            System.out.println(
                    "Page title unavailable."
            );
        }


        return "";
    }


    // ============================================================
    // EXTRACT ADDRESS FROM GOOGLE MAPS PAGE
    // ============================================================

    private String extractAddressFromGoogleMapsPage(
            Page page) {

        // --------------------------------------------------------
        // Google Maps address button
        // --------------------------------------------------------

        String[] selectors = {

                "button[data-item-id='address']",

                "[data-item-id='address']",

                "button[aria-label*='Address']",

                "[aria-label*='Address']"

        };


        for (
                String selector :
                selectors
        ) {

            try {

                Locator locator =
                        page.locator(
                                selector
                        );


                if (
                        locator.count()
                                == 0
                ) {

                    continue;
                }


                // ------------------------------------------------
                // Try inner text first
                // ------------------------------------------------

                String text =
                        locator.first()
                                .innerText();


                text =
                        cleanGoogleMapsText(
                                text
                        );


                if (
                        isUsableAddress(
                                text
                        )
                ) {

                    System.out.println(
                            "Address found: "
                                    + text
                    );

                    return text;
                }


                // ------------------------------------------------
                // Try aria-label
                // ------------------------------------------------

                String ariaLabel =
                        locator.first()
                                .getAttribute(
                                        "aria-label"
                                );


                ariaLabel =
                        cleanGoogleMapsText(
                                ariaLabel
                        );


                if (
                        isUsableAddress(
                                ariaLabel
                        )
                ) {

                    // Remove "Address:" prefix.
                    ariaLabel =
                            ariaLabel.replaceFirst(
                                    "(?i)^address\\s*:\\s*",
                                    ""
                            ).trim();


                    if (
                            isUsableAddress(
                                    ariaLabel
                            )
                    ) {

                        System.out.println(
                                "Address found from aria-label: "
                                        + ariaLabel
                        );

                        return ariaLabel;
                    }
                }


            } catch (Exception exception) {

                System.out.println(
                        "Address selector failed: "
                                + selector
                );
            }
        }


        // --------------------------------------------------------
        // Try common Google Maps text container
        // --------------------------------------------------------

        try {

            Locator addressText =
                    page.locator(
                            ".Io6YTe.fontBodyMedium"
                    );


            int count =
                    addressText.count();


            for (
                    int i = 0;
                    i < count;
                    i++
            ) {

                String text =
                        addressText
                                .nth(i)
                                .innerText();


                text =
                        cleanGoogleMapsText(
                                text
                        );


                if (
                        isUsableAddress(
                                text
                        )
                ) {

                    /*
                     * This selector may contain several Google Maps
                     * metadata values. We only use a reasonably
                     * address-looking value.
                     */

                    if (
                            looksLikeAddress(
                                    text
                            )
                    ) {

                        System.out.println(
                                "Address found from Google Maps text: "
                                        + text
                        );

                        return text;
                    }
                }
            }

        } catch (Exception exception) {

            System.out.println(
                    "Google Maps address text unavailable."
            );
        }


        return "";
    }


    // ============================================================
    // GOOGLE MAPS PLACE NAME FROM URL
    // ============================================================

    private String extractGooglePlaceName(
            String value) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return "";
        }


        try {

            String decoded =
                    decodeSafely(
                            value
                    );


            Matcher matcher =
                    GOOGLE_PLACE_PATH.matcher(
                            decoded
                    );


            if (
                    !matcher.find()
            ) {

                return "";
            }


            String placePart =
                    matcher.group(1);


            if (
                    placePart == null
                            || placePart.isBlank()
            ) {

                return "";
            }


            String placeName =
                    URLDecoder.decode(
                            placePart,
                            StandardCharsets.UTF_8
                    );


            placeName =
                    placeName.replace(
                            '+',
                            ' '
                    );


            return cleanGoogleMapsText(
                    placeName
            );


        } catch (Exception exception) {

            return "";
        }
    }


    // ============================================================
    // CLEAN GOOGLE MAPS TEXT
    // ============================================================

    private String cleanGoogleMapsText(
            String value) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return "";
        }


        String cleaned =
                value
                        .replace(
                                "\u00A0",
                                " "
                        )
                        .replaceAll(
                                "\\s+",
                                " "
                        )
                        .trim();


        cleaned =
                cleaned.replaceFirst(
                        "(?i)^address\\s*:\\s*",
                        ""
                ).trim();


        return cleaned;
    }


    // ============================================================
    // REMOVE GOOGLE MAPS TITLE SUFFIX
    // ============================================================

    private String removeGoogleMapsTitleSuffix(
            String title) {

        if (
                title == null
                        || title.isBlank()
        ) {

            return "";
        }


        String result =
                title.trim();


        result =
                result.replaceFirst(
                        "(?i)\\s*[-|]\\s*Google Maps\\s*$",
                        ""
                ).trim();


        return result;
    }


    // ============================================================
    // VALIDATE PLACE NAME
    // ============================================================

    private boolean isUsablePlaceName(
            String value) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return false;
        }


        String text =
                value.trim();


        if (
                text.equalsIgnoreCase(
                        "Google Maps"
                )
        ) {

            return false;
        }


        if (
                text.equalsIgnoreCase(
                        "Directions"
                )
        ) {

            return false;
        }


        if (
                text.equalsIgnoreCase(
                        "Maps"
                )
        ) {

            return false;
        }


        return text.length() >= 2;
    }


    // ============================================================
    // VALIDATE ADDRESS
    // ============================================================

    private boolean isUsableAddress(
            String value) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return false;
        }


        String text =
                value.trim();


        if (
                text.length() < 5
        ) {

            return false;
        }


        if (
                text.equalsIgnoreCase(
                        "Directions"
                )
        ) {

            return false;
        }


        if (
                text.equalsIgnoreCase(
                        "Share"
                )
        ) {

            return false;
        }


        return true;
    }


    // ============================================================
    // ADDRESS-LIKE TEXT
    // ============================================================

    private boolean looksLikeAddress(
            String value) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return false;
        }


        String text =
                value.trim();


        /*
         * We are NOT geocoding this.
         *
         * This is only used to identify which text on the already
         * opened Google Maps page looks like an address.
         */

        return text.matches(
                ".*\\d+.*"
        )
                || text.contains(",")
                || text.contains("-")
                || text.length() > 20;
    }


    // ============================================================
    // PLACE-SPECIFIC COORDINATE EXTRACTION
    // ============================================================

    private double[] extractPlaceSpecificCoordinates(
            String value) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return null;
        }


        String decoded =
                decodeSafely(
                        value
                );


        // --------------------------------------------------------
        // !3dLAT!4dLNG
        // --------------------------------------------------------

        Matcher matcher =
                GOOGLE_DATA_COORDINATES.matcher(
                        decoded
                );


        while (
                matcher.find()
        ) {

            double latitude =
                    parseDouble(
                            matcher.group(1)
                    );


            double longitude =
                    parseDouble(
                            matcher.group(2)
                    );


            if (
                    isValidCoordinates(
                            latitude,
                            longitude
                    )
            ) {

                return new double[]{
                        latitude,
                        longitude
                };
            }
        }


        // --------------------------------------------------------
        // !2dLNG!3dLAT
        // --------------------------------------------------------

        matcher =
                GOOGLE_LNG_LAT_COORDINATES.matcher(
                        decoded
                );


        while (
                matcher.find()
        ) {

            double longitude =
                    parseDouble(
                            matcher.group(1)
                    );


            double latitude =
                    parseDouble(
                            matcher.group(2)
                    );


            if (
                    isValidCoordinates(
                            latitude,
                            longitude
                    )
            ) {

                return new double[]{
                        latitude,
                        longitude
                };
            }
        }


        // --------------------------------------------------------
        // @LAT,LNG
        // --------------------------------------------------------

        if (
                decoded.contains(
                        "/maps/place/"
                )
        ) {

            matcher =
                    AT_COORDINATES.matcher(
                            decoded
                    );


            while (
                    matcher.find()
            ) {

                double latitude =
                        parseDouble(
                                matcher.group(1)
                        );


                double longitude =
                        parseDouble(
                                matcher.group(2)
                        );


                if (
                        isValidCoordinates(
                                latitude,
                                longitude
                        )
                ) {

                    return new double[]{
                            latitude,
                            longitude
                    };
                }
            }
        }


        return null;
    }


    // ============================================================
    // QUERY COORDINATES ONLY
    // ============================================================

    private double[] extractQueryCoordinatesOnly(
            String value) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return null;
        }


        Matcher matcher =
                QUERY_COORDINATES.matcher(
                        value
                );


        while (
                matcher.find()
        ) {

            double latitude =
                    parseDouble(
                            matcher.group(1)
                    );


            double longitude =
                    parseDouble(
                            matcher.group(2)
                    );


            if (
                    isValidCoordinates(
                            latitude,
                            longitude
                    )
            ) {

                return new double[]{
                        latitude,
                        longitude
                };
            }
        }


        matcher =
                HASH_COORDINATES.matcher(
                        value
                );


        while (
                matcher.find()
        ) {

            double latitude =
                    parseDouble(
                            matcher.group(1)
                    );


            double longitude =
                    parseDouble(
                            matcher.group(2)
                    );


            if (
                    isValidCoordinates(
                            latitude,
                            longitude
                    )
            ) {

                return new double[]{
                        latitude,
                        longitude
                };
            }
        }


        return null;
    }


    // ============================================================
    // FOLLOW GOOGLE REDIRECT CHAIN
    // ============================================================

    private String resolveGoogleRedirectChain(
            String startUrl)
            throws Exception {

        String currentUrl =
                startUrl;


        for (
                int i = 0;
                i < 8;
                i++
        ) {

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(
                                    URI.create(
                                            currentUrl
                                    )
                            )
                            .timeout(
                                    Duration.ofSeconds(20)
                            )
                            .header(
                                    "User-Agent",
                                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                            + "AppleWebKit/537.36 "
                                            + "(KHTML, like Gecko) "
                                            + "Chrome/153.0 Safari/537.36"
                            )
                            .header(
                                    "Accept-Language",
                                    "en-US,en;q=0.9"
                            )
                            .GET()
                            .build();


            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );


            int status =
                    response.statusCode();


            System.out.println(
                    "Redirect step "
                            + (i + 1)
                            + " status = "
                            + status
            );


            if (
                    status >= 300
                            && status < 400
            ) {

                String location =
                        response.headers()
                                .firstValue(
                                        "location"
                                )
                                .orElse(null);


                if (
                        location == null
                                || location.isBlank()
                ) {

                    if (
                            response.uri() != null
                    ) {

                        return response.uri()
                                .toString();
                    }


                    return currentUrl;
                }


                URI nextUri =
                        URI.create(
                                location
                        );


                URI resolvedUri =
                        URI.create(
                                currentUrl
                        ).resolve(
                                nextUri
                        );


                String nextUrl =
                        resolvedUri.toString();


                if (
                        nextUrl.equals(
                                currentUrl
                        )
                ) {

                    return currentUrl;
                }


                currentUrl =
                        nextUrl;


                continue;
            }


            if (
                    response.uri() != null
            ) {

                return response.uri()
                        .toString();
            }


            return currentUrl;
        }


        return currentUrl;
    }


    // ============================================================
    // GOOGLE HOST VALIDATION
    // ============================================================

    private boolean isGoogleMapsHost(
            String host) {

        String normalized =
                host.toLowerCase();


        return normalized.equals(
                "maps.app.goo.gl"
        )
                || normalized.equals(
                "goo.gl"
        )
                || normalized.equals(
                "maps.google.com"
        )
                || normalized.equals(
                "google.com"
        )
                || normalized.equals(
                "www.google.com"
        )
                || normalized.endsWith(
                ".google.com"
        );
    }


    // ============================================================
    // EXPLICIT GOOGLE COORDINATES
    // ============================================================

    private double[] extractExplicitGoogleCoordinates(
            String text) {

        if (
                text == null
                        || text.isBlank()
        ) {

            return null;
        }


        String decoded =
                decodeSafely(
                        text
                );


        // --------------------------------------------------------
        // !3dLAT!4dLNG
        // --------------------------------------------------------

        Matcher matcher =
                GOOGLE_DATA_COORDINATES.matcher(
                        decoded
                );


        while (
                matcher.find()
        ) {

            double latitude =
                    parseDouble(
                            matcher.group(1)
                    );


            double longitude =
                    parseDouble(
                            matcher.group(2)
                    );


            if (
                    isValidCoordinates(
                            latitude,
                            longitude
                    )
            ) {

                return new double[]{
                        latitude,
                        longitude
                };
            }
        }


        // --------------------------------------------------------
        // !2dLNG!3dLAT
        // --------------------------------------------------------

        matcher =
                GOOGLE_LNG_LAT_COORDINATES.matcher(
                        decoded
                );


        while (
                matcher.find()
        ) {

            double longitude =
                    parseDouble(
                            matcher.group(1)
                    );


            double latitude =
                    parseDouble(
                            matcher.group(2)
                    );


            if (
                    isValidCoordinates(
                            latitude,
                            longitude
                    )
            ) {

                return new double[]{
                        latitude,
                        longitude
                };
            }
        }


        // --------------------------------------------------------
        // @LAT,LNG
        // --------------------------------------------------------

        matcher =
                AT_COORDINATES.matcher(
                        decoded
                );


        while (
                matcher.find()
        ) {

            double latitude =
                    parseDouble(
                            matcher.group(1)
                    );


            double longitude =
                    parseDouble(
                            matcher.group(2)
                    );


            if (
                    isValidCoordinates(
                            latitude,
                            longitude
                    )
            ) {

                return new double[]{
                        latitude,
                        longitude
                };
            }
        }


        // --------------------------------------------------------
        // query coordinates
        // --------------------------------------------------------

        matcher =
                QUERY_COORDINATES.matcher(
                        text
                );


        while (
                matcher.find()
        ) {

            double latitude =
                    parseDouble(
                            matcher.group(1)
                    );


            double longitude =
                    parseDouble(
                            matcher.group(2)
                    );


            if (
                    isValidCoordinates(
                            latitude,
                            longitude
                    )
            ) {

                return new double[]{
                        latitude,
                        longitude
                };
            }
        }


        // --------------------------------------------------------
        // hash coordinates
        // --------------------------------------------------------

        matcher =
                HASH_COORDINATES.matcher(
                        text
                );


        while (
                matcher.find()
        ) {

            double latitude =
                    parseDouble(
                            matcher.group(1)
                    );


            double longitude =
                    parseDouble(
                            matcher.group(2)
                    );


            if (
                    isValidCoordinates(
                            latitude,
                            longitude
                    )
            ) {

                return new double[]{
                        latitude,
                        longitude
                };
            }
        }


        return null;
    }


    // ============================================================
    // GOOGLE PLACE ID
    // ============================================================

    private String extractGooglePlaceId(
            String value) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return null;
        }


        String decoded =
                decodeSafely(
                        value
                );


        Matcher matcher =
                GOOGLE_PLACE_ID.matcher(
                        decoded
                );


        if (
                matcher.find()
        ) {

            String placeId =
                    matcher.group(1);


            if (
                    placeId != null
                            && !placeId.isBlank()
            ) {

                return placeId.trim();
            }
        }


        matcher =
                GOOGLE_PLACE_ID_DATA.matcher(
                        decoded
                );


        if (
                matcher.find()
        ) {

            String placeId =
                    matcher.group(1);


            if (
                    placeId != null
                            && !placeId.isBlank()
            ) {

                return placeId.trim();
            }
        }


        return null;
    }


    // ============================================================
    // SAFE URL DECODING
    // ============================================================

    private String decodeSafely(
            String value) {

        if (
                value == null
        ) {

            return "";
        }


        String result =
                value;


        for (
                int i = 0;
                i < 3;
                i++
        ) {

            try {

                String decoded =
                        URLDecoder.decode(
                                result,
                                StandardCharsets.UTF_8
                        );


                if (
                        decoded.equals(
                                result
                        )
                ) {

                    break;
                }


                result =
                        decoded;


            } catch (Exception exception) {

                break;
            }
        }


        return result.replace(
                "&amp;",
                "&"
        );
    }


    // ============================================================
    // PARSE DOUBLE
    // ============================================================

    private double parseDouble(
            String value) {

        try {

            return Double.parseDouble(
                    value
            );

        } catch (Exception exception) {

            return Double.NaN;
        }
    }


    // ============================================================
    // VALIDATE COORDINATES
    // ============================================================

    private boolean isValidCoordinates(
            double latitude,
            double longitude) {

        return Double.isFinite(
                latitude
        )
                && Double.isFinite(
                longitude
        )
                && latitude >= -90
                && latitude <= 90
                && longitude >= -180
                && longitude <= 180;
    }


    // ============================================================
    // SAFE STRING
    // ============================================================

    private String safeString(
            String value) {

        return value == null
                ? ""
                : value.trim();
    }


    // ============================================================
    // PRINT COORDINATES
    // ============================================================

    private void printCoordinates(
            double[] coordinates) {

        if (
                coordinates == null
                        || coordinates.length < 2
        ) {

            return;
        }


        System.out.println(
                "Latitude  = "
                        + coordinates[0]
        );


        System.out.println(
                "Longitude = "
                        + coordinates[1]
        );
    }


    // ============================================================
    // SUCCESS RESPONSE
    //
    // THIS IS THE IMPORTANT FIX.
    //
    // Previously this response contained ONLY coordinates.
    //
    // Now React receives:
    //
    // placeName
    // name
    // resolvedAddress
    // googleAddress
    // address
    // latitude
    // longitude
    // source
    // resolvedUrl
    // locationLink
    // ============================================================

    private ResponseEntity<?> successResponse(
            GoogleMapsResolution result,
            String originalUrl,
            String resolvedUrl) {

        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "success",
                true
        );


        response.put(
                "latitude",
                result.latitude
        );


        response.put(
                "longitude",
                result.longitude
        );


        response.put(
                "placeName",
                safeString(
                        result.placeName
                )
        );


        response.put(
                "name",
                safeString(
                        result.placeName
                )
        );


        response.put(
                "resolvedAddress",
                safeString(
                        result.address
                )
        );


        response.put(
                "googleAddress",
                safeString(
                        result.address
                )
        );


        response.put(
                "address",
                safeString(
                        result.address
                )
        );


        response.put(
                "locationLink",
                originalUrl
        );


        response.put(
                "resolvedUrl",
                resolvedUrl == null
                        ? originalUrl
                        : resolvedUrl
        );


        response.put(
                "source",
                safeString(
                        result.source
                )
        );


        response.put(
                "message",
                "Google Maps shop location resolved successfully."
        );


        return ResponseEntity.ok(
                response
        );
    }


    // ============================================================
    // INTERNAL GOOGLE MAPS RESULT
    // ============================================================

    private static class GoogleMapsResolution {

        private double latitude =
                Double.NaN;

        private double longitude =
                Double.NaN;

        private String placeName =
                "";

        private String address =
                "";

        private String source =
                "google-maps";


        private boolean hasCoordinates() {

            return Double.isFinite(
                    latitude
            )
                    && Double.isFinite(
                    longitude
            )
                    && latitude >= -90
                    && latitude <= 90
                    && longitude >= -180
                    && longitude <= 180;
        }
    }


    // ============================================================
    // MY PROFILE
    // ============================================================

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(
            Authentication authentication) {

        String email =
                authentication.getName();


        Vendor vendor =
                vendorRepository.findByEmail(
                        email
                );


        if (
                vendor == null
        ) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        VendorDetailsDTO dto =
                new VendorDetailsDTO(
                        vendor.getId(),
                        vendor.getFullName(),
                        vendor.getShopName(),
                        vendor.getPhoneNo(),
                        vendor.getState(),
                        vendor.getCity(),
                        vendor.getPincode(),
                        vendor.getLatitude(),
                        vendor.getLongitude(),
                        vendor.getAddress(),
                        vendor.getEmail(),
                        vendor.getRole(),
                        vendor.getStatus(),
                        vendor.getLocationLink()
                );


        return ResponseEntity.ok(
                dto
        );
    }


   // ============================================================
// REGISTER
// ============================================================

@PostMapping("/register")
public ResponseEntity<?> register(
        @RequestBody Vendor vendor) {

    // ========================================================
    // CHECK DUPLICATE EMAIL
    // ========================================================

    String email = vendor.getEmail();

    if (email == null || email.trim().isEmpty()) {

        return ResponseEntity.ok(
                Map.of(
                        "success",
                        false,

                        "message",
                        "Email is required"
                )
        );
    }

    email = email.trim().toLowerCase();

    if (vendorRepository.findByEmail(email) != null) {

        return ResponseEntity.ok(
                Map.of(
                        "success",
                        false,

                        "message",
                        "Email already exists"
                )
        );
    }

    // ========================================================
    // NORMALIZE EMAIL
    // ========================================================

    vendor.setEmail(email);

    // ========================================================
    // DEFAULT STATUS
    // ========================================================

    vendor.setStatus(
            "PENDING"
    );

    // ========================================================
    // ENCODE PASSWORD
    // ========================================================

    vendor.setPassword(
            passwordEncoder.encode(
                    vendor.getPassword()
            )
    );

    // ========================================================
    // ROLE
    // ========================================================

    vendor.setRole(
            "ROLE_VENDOR"
    );

    // ========================================================
    // SAVE
    // ========================================================

    vendorRepository.save(
            vendor
    );

    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    return ResponseEntity.ok(
            Map.of(
                    "success",
                    true,

                    "message",
                    "Registration request submitted successfully"
            )
    );
}

@GetMapping("/check-email")
public ResponseEntity<?> checkEmail(
        @RequestParam String email) {

    String normalizedEmail =
            email.trim().toLowerCase();

    boolean exists =
            vendorRepository.findByEmail(normalizedEmail) != null;

    return ResponseEntity.ok(
            Map.of(
                    "exists",
                    exists
            )
    );
}

    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        System.out.println(
                "STEP 1"
        );


        Vendor vendor =
                vendorRepository.findByEmail(
                        request.getEmail().trim()
                );


        System.out.println(
                "STEP 2"
        );


        System.out.println(
                "Vendor found: "
                        + (vendor != null)
        );


        if (
                vendor == null
        ) {

            System.out.println(
                    "VENDOR NOT FOUND"
            );


            return new LoginResponse(
                    false,
                    "Vendor not found",
                    null,
                    null,
                    null,
                    null
            );
        }


        System.out.println(
                "STATUS = "
                        + vendor.getStatus()
        );


        if (
                "PENDING".equalsIgnoreCase(
                        vendor.getStatus()
                )
        ) {

            return new LoginResponse(
                    false,
                    "PENDING",
                    null,
                    vendor.getEmail(),
                    null,
                    null
            );
        }


        if (
                "REJECTED".equalsIgnoreCase(
                        vendor.getStatus()
                )
        ) {

            return new LoginResponse(
                    false,
                    "Vendor Request Rejected",
                    null,
                    vendor.getEmail(),
                    null,
                    null
            );
        }


        System.out.println(
                "STEP 3"
        );


        if (
                !passwordEncoder.matches(
                        request.getPassword(),
                        vendor.getPassword()
                )
        ) {

            System.out.println(
                    "WRONG PASSWORD"
            );


            return new LoginResponse(
                    false,
                    "Invalid password",
                    null,
                    null,
                    null,
                    null
            );
        }


        System.out.println(
                "STEP 4"
        );


        String token =
                jwtUtil.generateToken(
                        vendor.getEmail(),
                        vendor.getRole()
                );


        System.out.println(
                "STEP 5"
        );


        return new LoginResponse(
                true,
                "Login successful",
                token,
                vendor.getEmail(),
                vendor.getRole(),
                vendor.getId()
        );
    }


    // ============================================================
    // STATUS
    // ============================================================

    @GetMapping("/status")
    public String getStatus(
            @RequestParam String email) {

        System.out.println(
                "Status api hit"
        );


        Vendor vendor =
                vendorRepository.findByEmail(
                        email
                );


        if (
                vendor == null
        ) {

            return "NOT_FOUND";
        }


        return vendor.getStatus();
    }


    // ============================================================
    // COUNT
    // ============================================================

    @GetMapping("/count")
    public ResponseEntity<Long> getVendorCount() {

        return ResponseEntity.ok(
                vendorRepository.count()
        );
    }


    // ============================================================
    // ACTIVE PRODUCTS
    // ============================================================

    @GetMapping("/products/active")
    public ResponseEntity<List<VendorProductDTO>>
    getActiveProducts(
            @RequestParam(name = "vendorId")
            Long vendorId) {

        System.out.println(
                "========== ACTIVE VENDOR PRODUCTS =========="
        );


        System.out.println(
                "Vendor ID: "
                        + vendorId
        );


        List<VendorProductDTO> products =
                inventoryRepository
                        .findActiveProductsByVendorId(
                                vendorId
                        );


        products.forEach(
                product ->
                        System.out.println(
                                "Product: "
                                        + product.getName()
                                        + " | ID: "
                                        + product.getProductId()
                                        + " | Base Price: "
                                        + product.getBasePrice()
                                        + " | Discount: "
                                        + product.getDiscount()
                                        + " | Final Price: "
                                        + product.getBasePrice()
                                        + " | Stock: "
                                        + product.getStock()
                        )
        );


        System.out.println(
                "============================================"
        );


        return ResponseEntity.ok(
                products
        );
    }


    // ============================================================
    // MY PRODUCTS
    // ============================================================

    @GetMapping("/myProducts")
    public ResponseEntity<List<VendorProductDTO>>
    getMyProducts(
            Authentication authentication) {

        System.out.println(
                "========== MY PRODUCTS =========="
        );


        String email =
                authentication.getName();


        System.out.println(
                "Logged-in Vendor Email: "
                        + email
        );


        Vendor vendor =
                vendorRepository.findByEmail(
                        email
                );


        if (
                vendor == null
        ) {

            System.out.println(
                    "Vendor not found for email: "
                            + email
            );


            return ResponseEntity
                    .notFound()
                    .build();
        }


        Integer vendorId =
                vendor.getId();


        System.out.println(
                "Vendor ID: "
                        + vendorId
        );


        Long inventoryVendorId =
                vendorId.longValue();


        List<VendorProductDTO> products =
                inventoryRepository
                        .findActiveProductsByVendorId(
                                inventoryVendorId
                        );


        products.forEach(
                product ->
                        System.out.println(
                                "Product: "
                                        + product.getName()
                                        + " | ID: "
                                        + product.getProductId()
                                        + " | Base Price: "
                                        + product.getBasePrice()
                                        + " | Discount: "
                                        + product.getDiscount()
                                        + " | Final Price: "
                                        + product.getBasePrice()
                                        + " | Stock: "
                                        + product.getStock()
                        )
        );


        System.out.println(
                "================================"
        );


        return ResponseEntity.ok(
                products
        );
    }


    // ============================================================
    // VENDOR DETAILS
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getVendorById(
            @PathVariable Integer id) {

        Vendor vendor =
                vendorRepository.findById(
                                id
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Vendor not found with id: "
                                                        + id
                                        )
                        );


        VendorDetailsDTO dto =
                new VendorDetailsDTO(
                        vendor.getId(),
                        vendor.getFullName(),
                        vendor.getShopName(),
                        vendor.getPhoneNo(),
                        vendor.getState(),
                        vendor.getCity(),
                        vendor.getPincode(),
                        vendor.getLatitude(),
                        vendor.getLongitude(),
                        vendor.getAddress(),
                        vendor.getEmail(),
                        vendor.getRole(),
                        vendor.getStatus(),
                        vendor.getLocationLink()
                );


        return ResponseEntity.ok(
                dto
        );
    }


    // ============================================================
    // ALL APPROVED VENDORS
    // ============================================================

    @GetMapping("/all")
    public ResponseEntity<List<VendorDetailsDTO>>
    getAllVendors() {

        List<VendorDetailsDTO> vendors =
                vendorRepository.findAll()
                        .stream()
                        .filter(
                                vendor ->
                                        "APPROVED"
                                                .equalsIgnoreCase(
                                                        vendor.getStatus()
                                                )
                        )
                        .map(
                                vendor ->
                                        new VendorDetailsDTO(
                                                vendor.getId(),
                                                vendor.getFullName(),
                                                vendor.getShopName(),
                                                vendor.getPhoneNo(),
                                                vendor.getState(),
                                                vendor.getCity(),
                                                vendor.getPincode(),
                                                vendor.getLatitude(),
                                                vendor.getLongitude(),
                                                vendor.getAddress(),
                                                vendor.getEmail(),
                                                vendor.getRole(),
                                                vendor.getStatus(),
                                                vendor.getLocationLink()
                                        )
                        )
                        .toList();


        return ResponseEntity.ok(
                vendors
        );
    }
}