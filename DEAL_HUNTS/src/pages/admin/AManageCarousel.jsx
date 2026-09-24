import axios from "axios";
import { useState, useEffect } from "react";

import "../../styles/TrendingCarousel.css";

import Popup from "../../components/Popup";
import BannerCropPopup from "../../components/BannerCropPopup";
import getCroppedImg from "../../utils/cropImage";


function AdminManageCarousel() {

  const [image, setImage] = useState([]);
  const [preview, setPreview] = useState([]);

  const [cropImage, setCropImage] = useState(null);
  const [showCropPopup, setShowCropPopup] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [promotions, setPromotions] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);

  const [showPromotionsPanel, setShowPromotionsPanel] =
    useState(false);


  /* ============================================================
     FETCH PROMOTIONS
  ============================================================ */

  const fetchPromotions = async () => {

    try {

      const res = await axios.get(
        "http://localhost:8080/admin/promotions/all"
      );

      setPromotions(res.data);

    } catch (error) {

      console.error(
        "Failed to fetch promotions:",
        error
      );

    }

  };


  /* ============================================================
     LOAD PROMOTIONS
  ============================================================ */

  useEffect(() => {

    let mounted = true;

    const loadPromotions = async () => {

      try {

        const res = await axios.get(
          "http://localhost:8080/admin/promotions/all"
        );

        if (mounted) {

          setPromotions(res.data);

        }

      } catch (error) {

        console.error(
          "Failed to load promotions:",
          error
        );

      }

    };

    loadPromotions();

    return () => {

      mounted = false;

    };

  }, []);


  /* ============================================================
     AUTO CAROUSEL
  ============================================================ */

  useEffect(() => {

    if (promotions.length <= 1) {
      return;
    }

    const interval = setInterval(() => {

      setCurrentIndex(
        (prev) =>
          (prev + 1) % promotions.length
      );

    }, 3000);

    return () => clearInterval(interval);

  }, [promotions]);


  /* ============================================================
     SAVE / UPDATE PROMOTION
  ============================================================ */

  const handleSavePromotion = async () => {

    if (image.length === 0 && !isEdit) {

      alert("Select banner image");

      return;

    }

    const formData = new FormData();

    image.forEach((img) => {

      formData.append("images", img);

    });

    formData.append("title", title);
    formData.append("priority", priority);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);

    try {

      if (isEdit) {

        await axios.put(
          `http://localhost:8080/admin/promotions/${selectedPromotionId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );

        alert("Promotion Updated");

      } else {

        await axios.post(
          "http://localhost:8080/admin/promotions/add",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );

        alert("Promotion Added");

      }

      await fetchPromotions();

      closePopup();

    } catch (error) {

      console.error(
        "Promotion operation failed:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      alert(
        error.response?.data ||
        "Operation Failed"
      );

    }

  };


  /* ============================================================
     OPEN ADD POPUP
  ============================================================ */

  const openAddPopup = () => {

    setIsEdit(false);
    setSelectedPromotionId(null);

    setImage([]);
    setPreview([]);

    setTitle("");
    setPriority(1);
    setStartDate("");
    setEndDate("");

    setShowPopup(true);

  };


  /* ============================================================
     CLOSE POPUP
  ============================================================ */

  const closePopup = () => {

    setShowPopup(false);

    setIsEdit(false);
    setSelectedPromotionId(null);

    setImage([]);
    setPreview([]);

    setTitle("");
    setPriority(1);
    setStartDate("");
    setEndDate("");

    setCurrentIndex(0);

  };


  /* ============================================================
     EDIT PROMOTION
  ============================================================ */

  const handleEdit = (promotion) => {

    setIsEdit(true);

    setSelectedPromotionId(
      promotion.id
    );

    setTitle(
      promotion.title
    );

    setPriority(
      promotion.priority
    );

    setStartDate(
      promotion.startDate
    );

    setEndDate(
      promotion.endDate
    );

    setImage([]);

    setPreview([
      promotion.imageUrl
    ]);

    setShowPopup(true);

  };


  /* ============================================================
     DELETE PROMOTION
  ============================================================ */

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this promotion?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await axios.delete(
        `http://localhost:8080/admin/promotions/${id}`
      );

      setPromotions((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

      setCurrentIndex(0);

      alert(
        "Promotion deleted successfully."
      );

    } catch (error) {

      console.error(
        "Failed to delete promotion:",
        error
      );

      alert(
        "Failed to delete promotion."
      );

    }

  };


  /* ============================================================
     JSX
  ============================================================ */

  return (

    <div className="home-container-ca">


      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <main className="manage-main-ca">


        {/* ======================================================
            TRENDING CAROUSEL PREVIEW
        ====================================================== */}

        <section className="live-preview-section-ca">

          <h2>
            Trending Carousel
          </h2>


          <div className="banner-preview-ca">

            {promotions.length > 0 ? (

              <img
                src={
                  promotions[currentIndex].imageUrl
                }
                className="banner-preview-image-ca"
                alt={
                  promotions[currentIndex].title
                }
              />

            ) : (

              <>

                <div className="upload-icon-ca">
                  📷
                </div>

                <h3>
                  Upload Banners
                </h3>

                <p>
                  Select carousel images
                </p>

              </>

            )}

          </div>


          {/* ====================================================
              CAROUSEL DOTS
          ==================================================== */}

          <div className="admin-dots-container-ca">

            {promotions.map(
              (_, index) => (

                <span
                  key={index}
                  className={
                    currentIndex === index
                      ? "admin-dot-ca active"
                      : "admin-dot-ca"
                  }
                  onClick={() =>
                    setCurrentIndex(index)
                  }
                />

              )
            )}

          </div>

        </section>


        {/* ======================================================
            QUICK STATS
        ====================================================== */}

        <div className="quick-stats-ca">


          <div className="stat-card-ca">

            <h3>
              Total Banners
            </h3>

            <p>
              {promotions.length}
            </p>

          </div>


          <div className="stat-card-ca">

            <h3>
              Active
            </h3>

            <p>
              {
                promotions.filter(
                  (item) => item.active
                ).length
              }
            </p>

          </div>


          <div className="stat-card-ca">

            <h3>
              High Priority
            </h3>

            <p>
              {
                promotions.filter(
                  (item) => item.priority >= 5
                ).length
              }
            </p>

          </div>


        </div>


        {/* ======================================================
            ACTION BUTTONS
        ====================================================== */}

        <div className="main-actions-ca">


          {promotions.length < 7 && (

            <button
              className="add-banner-btn-ca"
              onClick={openAddPopup}
            >
              Add Promotion
            </button>

          )}


          <button
            className="view-promotions-btn-ca"
            onClick={() =>
              setShowPromotionsPanel(true)
            }
          >
            View Promotions →
          </button>


        </div>


      </main>


      {/* ========================================================
          ADD / EDIT PROMOTION POPUP
      ======================================================== */}

      <Popup
        open={showPopup}
        onClose={closePopup}
        title={
          isEdit
            ? "Edit Promotion"
            : "Add Promotion"
        }
        width="850px"
      >

        <div className="promotion-popup-ca">


          {/* ====================================================
              LEFT SIDE
          ==================================================== */}

          <div className="popup-left-ca">

            <h3>
              Banner Preview
            </h3>


            <div
              className="popup-image-box-ca"
              onClick={() => {

                const input =
                  document.getElementById(
                    "popupBanner"
                  );

                if (input) {
                  input.click();
                }

              }}
            >

              {preview.length > 0 ? (

                <img
                  src={preview[0]}
                  className="banner-preview-image-ca"
                  alt="Banner"
                />

              ) : (

                <>

                  <div className="upload-icon-ca">

                    📷

                    <div>
                      Choose Banner
                    </div>

                  </div>


                  <p>
                    Upload Banner
                  </p>

                </>

              )}

            </div>


            {/* ==================================================
                BANNER REQUIREMENTS
            ================================================== */}

            <div className="instructions-ca">

              <div className="banner-note-ca">

                <h4>
                  📌 Banner Requirements
                </h4>


                <p>
                  • Recommended ratio:
                  <span>
                    {" "}16:5 (1600 × 500 px)
                  </span>
                </p>


                <p>
                  • Maximum file size:
                  <span>
                    {" "}2MB
                  </span>
                </p>


                <p>
                  • Supported formats:
                  <span>
                    {" "}JPG, PNG, WEBP
                  </span>
                </p>

              </div>

            </div>


            {/* ==================================================
                IMAGE INPUT
            ================================================== */}

            <input
              id="popupBanner"
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {

                const file =
                  e.target.files[0];

                if (!file) {
                  return;
                }

                if (
                  file.size >
                  2 * 1024 * 1024
                ) {

                  alert(
                    "Image size should be below 2MB"
                  );

                  return;

                }

                const imageUrl =
                  URL.createObjectURL(
                    file
                  );

                setCropImage(
                  imageUrl
                );

                setShowCropPopup(
                  true
                );

              }}
            />

          </div>


          {/* ====================================================
              RIGHT SIDE
          ==================================================== */}

          <div className="popup-right-ca">


            <div className="form-group-ca">

              <label>
                Promotion Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="form-group-ca">

              <label>
                Priority
              </label>

              <input
                type="number"
                value={priority}
                onChange={(e) =>
                  setPriority(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

            </div>


            <div className="form-group-ca">

              <label>
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="form-group-ca">

              <label>
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ==================================================
                POPUP FOOTER
            ================================================== */}

            <div className="popup-footer-ca">

              <button
                className="cancel-btn-ca"
                onClick={closePopup}
              >
                Cancel
              </button>


              <button
                className="save-banner-btn-ca"
                onClick={handleSavePromotion}
              >
                {
                  isEdit
                    ? "Update Promotion"
                    : "Save Promotion"
                }
              </button>

            </div>


          </div>

        </div>

      </Popup>


      {/* ========================================================
          IMAGE CROP POPUP
      ======================================================== */}

      <BannerCropPopup

        open={showCropPopup}

        image={cropImage}

        onClose={() =>
          setShowCropPopup(false)
        }

        onCropComplete={async (
          croppedPixels
        ) => {

          const croppedFile =
            await getCroppedImg(
              cropImage,
              croppedPixels
            );

          setImage([
            croppedFile
          ]);

          setPreview([
            URL.createObjectURL(
              croppedFile
            )
          ]);

          setShowCropPopup(
            false
          );

        }}

      />


      {/* ========================================================
          PROMOTIONS DRAWER
      ======================================================== */}

      {showPromotionsPanel && (

        <div className="promotion-drawer-ca">


          <button
            className="close-drawer-ca"
            onClick={() =>
              setShowPromotionsPanel(false)
            }
          >
            ✕
          </button>


          <h2>
            Current Promotions
          </h2>


          {promotions.map(
            (item) => (

              <div
                className="promotion-card-ca"
                key={item.id}
              >

                <img
                  src={item.imageUrl}
                  className="small-banner-ca"
                  alt={item.title}
                />


                <h3>
                  {item.title}
                </h3>


                <button
                  onClick={() =>
                    handleEdit(item)
                  }
                  className="promotions-edit-btn-ca"
                >
                  Edit
                </button>


                <button
                  onClick={() =>
                    handleDelete(item.id)
                  }
                >
                  Delete
                </button>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

}


export default AdminManageCarousel;