import React, { useState, useEffect } from "react";

import Popup from "../../components/Popup";

import "../../styles/AManageWhyDealHunts.css";


function AdminManageWhyDealHunts() {

    // =====================================================
    // STATE
    // =====================================================

    const [benefits, setBenefits] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("⭐");

    const [showPopup, setShowPopup] = useState(false);


    // =====================================================
    // PREDEFINED WHY DEALHUNTS BENEFITS
    // =====================================================

    const predefinedBenefits = [
        {
            title: "Customer Satisfaction",
            description:
                "We help customers find suitable products, compare available options, and make confident purchasing decisions.",
            icon: "😊"
        },
        {
            title: "Easy Access",
            description:
                "Access products, prices, offers, and availability from one convenient platform.",
            icon: "⚡"
        },
        {
            title: "Vendor Availability",
            description:
                "Find products available from nearby vendors and discover where you can purchase them locally.",
            icon: "🏪"
        },
        {
            title: "Local & Online Comparison",
            description:
                "Compare prices and product options from local shops alongside standard online listings.",
            icon: "🔍"
        },
        {
            title: "Better Deals",
            description:
                "Discover attractive offers and compare prices to find deals that provide better value.",
            icon: "🏷️"
        },
        {
            title: "Product Availability",
            description:
                "Check whether products are available before visiting a local shop or making a purchase.",
            icon: "📦"
        }
    ];


    // =====================================================
    // FETCH WHY DEALHUNTS
    // =====================================================

    const fetchBenefits = async () => {

        try {

            const res = await fetch(
                "http://localhost:8080/admin/why-dealhunts/all"
            );

            if (!res.ok) {

                throw new Error(
                    "Failed to fetch Why DEALHUNTS"
                );

            }

            const data = await res.json();

            const benefitList =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : Array.isArray(data?.benefits)
                            ? data.benefits
                            : [];

            setBenefits(benefitList);

        } catch (error) {

            console.error(
                "Failed to fetch Why DEALHUNTS:",
                error
            );

            setBenefits([]);

        }

    };


    useEffect(() => {

        fetchBenefits();

    }, []);


    // =====================================================
    // OPEN BLANK POPUP
    // FOR CUSTOM BENEFIT
    // =====================================================

    const handleOpenPopup = () => {

        setTitle("");
        setDescription("");
        setIcon("⭐");

        setShowPopup(true);

    };


    // =====================================================
    // OPEN POPUP WITH PREDEFINED BENEFIT
    // =====================================================

    const handleSelectRecommendedBenefit = (benefit) => {

        if (!benefit) return;

        if (benefits.length >= 6) {

            alert(
                "You can add maximum 6 benefits."
            );

            return;

        }

        if (isBenefitAdded(benefit.title)) {

            return;

        }

        setTitle(benefit.title);

        setDescription(
            benefit.description
        );

        setIcon(benefit.icon);

        setShowPopup(true);

    };


    // =====================================================
    // CLOSE POPUP
    // =====================================================

    const handleClosePopup = () => {

        setTitle("");
        setDescription("");
        setIcon("⭐");

        setShowPopup(false);

    };


    // =====================================================
    // SELECT FROM DROPDOWN
    // =====================================================

    const handleBenefitTypeChange = (e) => {

        const selectedTitle = e.target.value;

        if (!selectedTitle) {

            setTitle("");
            setDescription("");
            setIcon("⭐");

            return;

        }

        const selectedBenefit =
            predefinedBenefits.find(
                (benefit) =>
                    benefit.title === selectedTitle
            );

        if (!selectedBenefit) return;

        setTitle(
            selectedBenefit.title
        );

        setDescription(
            selectedBenefit.description
        );

        setIcon(
            selectedBenefit.icon
        );

    };


    // =====================================================
    // ADD BENEFIT
    // =====================================================

    const handleAddBenefit = async () => {

        if (!title.trim()) {

            alert(
                "Please select or enter a title."
            );

            return;

        }


        if (!description.trim()) {

            alert(
                "Please enter a description."
            );

            return;

        }


        if (benefits.length >= 6) {

            alert(
                "You can add maximum 6 benefits."
            );

            return;

        }


        // -------------------------------------------------
        // PREVENT DUPLICATE TITLE
        // -------------------------------------------------

        const alreadyExists =
            benefits.some(
                (benefit) =>
                    benefit.title?.trim().toLowerCase() ===
                    title.trim().toLowerCase()
            );


        if (alreadyExists) {

            alert(
                "This Why DEALHUNTS benefit is already added."
            );

            return;

        }


        try {

            const res = await fetch(
                "http://localhost:8080/admin/why-dealhunts/add",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title: title.trim(),

                        description:
                            description.trim(),

                        icon:
                            icon.trim() || "⭐"
                    })
                }
            );


            if (!res.ok) {

                let message =
                    "Failed to add benefit.";

                try {

                    const errorData =
                        await res.json();

                    if (errorData?.message) {

                        message =
                            errorData.message;

                    }

                } catch {
                    // Ignore invalid error response
                }

                throw new Error(message);

            }


            await fetchBenefits();

            handleClosePopup();

        } catch (error) {

            console.error(
                "Failed to add benefit:",
                error
            );

            alert(
                error.message ||
                "Failed to add benefit."
            );

        }

    };


    // =====================================================
    // REMOVE BENEFIT
    // =====================================================

    const handleRemoveBenefit = async (id) => {

        if (!id) {

            alert(
                "Invalid benefit selected."
            );

            return;

        }


        const confirmed =
            window.confirm(
                "Remove this benefit from Why DEALHUNTS?"
            );


        if (!confirmed) return;


        try {

            const res = await fetch(
                `http://localhost:8080/admin/why-dealhunts/${id}`,
                {
                    method: "DELETE"
                }
            );


            if (!res.ok) {

                throw new Error(
                    "Failed to remove benefit"
                );

            }


            await fetchBenefits();

        } catch (error) {

            console.error(
                "Failed to remove benefit:",
                error
            );

            alert(
                "Failed to remove benefit."
            );

        }

    };


    // =====================================================
    // CHECK WHETHER BENEFIT IS ALREADY ADDED
    // =====================================================

    const isBenefitAdded = (benefitTitle) => {

        return benefits.some(
            (benefit) =>
                benefit.title?.trim().toLowerCase() ===
                benefitTitle.trim().toLowerCase()
        );

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="adminhome-container-wd">

            <main className="manage-why-dealhunts-main-wd">

                {/* =====================================================
                    PAGE HEADER
                   ===================================================== */}

                <h2>
                    Manage Benefits
                </h2>

                <p>
                    Manage the benefits and highlights displayed
                    in the Why DEALHUNTS section.
                </p>


                {/* =====================================================
                    WHY DEALHUNTS SECTION
                   ===================================================== */}

                <section className="why-dealhunts-section-wd">

                    {/* =================================================
                        SECTION HEADER
                       ================================================= */}

                    <div className="why-dealhunts-header-wd">

                        <div>

                            <h2>
                                Why DEALHUNTS ?
                            </h2>

                            <p>
                                Highlight the key reasons customers
                                should choose DEALHUNTS.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        ADDED BENEFITS
                       ================================================= */}

                    <div className="why-dealhunts-container-wd">

                        {benefits.length === 0 ? (

                            <div className="empty-why-dealhunts-wd">

                                <div className="empty-icon-wd">
                                    ⭐
                                </div>

                                <h3>
                                    No Benefits Added
                                </h3>

                                <p>
                                    Select a recommended benefit below
                                    or add your own custom benefit.
                                </p>

                            </div>

                        ) : (

                            benefits.map(
                                (benefit) => (

                                    <div
                                        key={benefit.id}
                                        className="why-dealhunts-item-wd"
                                    >

                                        {/* ICON */}

                                        <div className="why-dealhunts-icon-wd">

                                            {benefit.icon || "⭐"}

                                        </div>


                                        {/* INFORMATION */}

                                        <div className="why-dealhunts-info-wd">

                                            <h3>
                                                {benefit.title}
                                            </h3>

                                            <p>
                                                {benefit.description}
                                            </p>


                                            {/* REMOVE */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveBenefit(
                                                        benefit.id
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>


                    {/* =================================================
                        ADD BUTTON

                        Kept outside header so mobile/tablet can
                        place it after all benefit cards.
                       ================================================= */}

                    <button
                        type="button"
                        className="add-why-dealhunts-btn-wd"
                        onClick={handleOpenPopup}
                        disabled={
                            benefits.length >= 6
                        }
                    >

                        {benefits.length >= 6
                            ? "Maximum Added"
                            : "+ Add Benefit"}

                    </button>

                </section>


                {/* =====================================================
                    RECOMMENDED BENEFITS
                   ===================================================== */}

                <section className="why-dealhunts-available-wd">

                    <div className="why-dealhunts-available-header-wd">

                        <div>

                            <h3>
                                Recommended Benefits
                            </h3>

                            <p>
                                Select an available benefit to add it
                                to Why DEALHUNTS.
                            </p>

                        </div>

                        <span>
                            {benefits.length} / 6 Added
                        </span>

                    </div>


                    <div className="why-dealhunts-available-grid-wd">

                        {predefinedBenefits.map(
                            (benefit) => {

                                const added =
                                    isBenefitAdded(
                                        benefit.title
                                    );

                                return (

                                    <button
                                        key={benefit.title}
                                        type="button"
                                        className={`why-dealhunts-available-card-wd ${
                                            added
                                                ? "added"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleSelectRecommendedBenefit(
                                                benefit
                                            )
                                        }
                                        disabled={added}
                                    >

                                        {/* ICON */}

                                        <div className="why-dealhunts-available-icon-wd">

                                            {benefit.icon}

                                        </div>


                                        {/* TEXT */}

                                        <div>

                                            <h4>
                                                {benefit.title}
                                            </h4>

                                            <p>
                                                {benefit.description}
                                            </p>

                                        </div>


                                        {/* STATUS */}

                                        <span className="why-dealhunts-available-status-wd">

                                            {added
                                                ? "Added"
                                                : "Select"}

                                        </span>

                                    </button>

                                );

                            }
                        )}

                    </div>

                </section>

            </main>


            {/* =====================================================
                ADD BENEFIT POPUP
               ===================================================== */}

            <Popup
                open={showPopup}
                onClose={handleClosePopup}
                title="Add Why DEALHUNTS Benefit"
                className="why-dealhunts-popup-wd"
            >

                <div className="why-dealhunts-popup-wrapper-wd">

                    {/* =================================================
                        BENEFIT TYPE
                       ================================================= */}

                    <div className="why-dealhunts-form-group-wd">

                        <label htmlFor="whyDealHuntsBenefitType">
                            Benefit Type
                        </label>

                        <select
                            id="whyDealHuntsBenefitType"
                            value={
                                predefinedBenefits.some(
                                    (benefit) =>
                                        benefit.title === title
                                )
                                    ? title
                                    : ""
                            }
                            onChange={
                                handleBenefitTypeChange
                            }
                        >

                            <option value="">
                                Select a benefit or enter your own
                            </option>

                            {predefinedBenefits.map(
                                (benefit) => (

                                    <option
                                        key={benefit.title}
                                        value={benefit.title}
                                        disabled={
                                            isBenefitAdded(
                                                benefit.title
                                            )
                                        }
                                    >

                                        {benefit.title}

                                        {isBenefitAdded(
                                            benefit.title
                                        )
                                            ? " — Added"
                                            : ""}

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* =================================================
                        ICON
                       ================================================= */}

                    <div className="why-dealhunts-form-group-wd">

                        <label htmlFor="whyDealHuntsIcon">
                            Icon
                        </label>

                        <input
                            id="whyDealHuntsIcon"
                            type="text"
                            value={icon}
                            maxLength={2}
                            onChange={(e) =>
                                setIcon(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* =================================================
                        TITLE
                       ================================================= */}

                    <div className="why-dealhunts-form-group-wd">

                        <label htmlFor="whyDealHuntsTitle">
                            Title
                        </label>

                        <input
                            id="whyDealHuntsTitle"
                            type="text"
                            value={title}
                            placeholder="Example: Fast & Easy Shopping"
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* =================================================
                        DESCRIPTION
                       ================================================= */}

                    <div className="why-dealhunts-form-group-wd">

                        <label htmlFor="whyDealHuntsDescription">
                            Description
                        </label>

                        <textarea
                            id="whyDealHuntsDescription"
                            value={description}
                            placeholder="Explain this benefit..."
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* =================================================
                        ACTIONS
                       ================================================= */}

                    <div className="why-dealhunts-popup-content-wd">

                        <button
                            type="button"
                            onClick={
                                handleClosePopup
                            }
                        >
                            Cancel
                        </button>


                        <button
                            type="button"
                            onClick={
                                handleAddBenefit
                            }
                            disabled={
                                !title.trim() ||
                                !description.trim() ||
                                benefits.length >= 6
                            }
                        >
                            Add Benefit
                        </button>

                    </div>

                </div>

            </Popup>


            {/* =====================================================
                FOOTER
               ===================================================== */}

            <footer className="footer-wd">

                <p>
                    © 2026 Website. All rights reserved.
                </p>

            </footer>

        </div>

    );

}


export default AdminManageWhyDealHunts;
