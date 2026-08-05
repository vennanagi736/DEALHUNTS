import axios from "axios";
import SideWindow from "../../components/SideBar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/TrendingCarousel.css";
import Popup from "../../components/Popup";
import BannerCropPopup from "../../components/BannerCropPopup";
import getCroppedImg from "../../utils/cropImage";


function AdminManageTrending() {

  const navigate = useNavigate();

  const [image, setImage] = useState([]);
  const [preview, setPreview] = useState([]);

  const [cropImage,setCropImage] = useState(null);
  const [showCropPopup,setShowCropPopup] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);  

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [query, setQuery] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [showPromotionsPanel, setShowPromotionsPanel] = useState(false);

  const fetchPromotions = async()=>{
    try{
      const res = await axios.get(
        "http://localhost:8080/admin/promotions/all"
      );
      setPromotions(res.data);
    }catch(error){
      console.log(error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadPromotions = async () => {
        try {
            const res = await axios.get(
                "http://localhost:8080/admin/promotions/all"
            );
            if(mounted){
                setPromotions(res.data);
            }
        } catch(error) {
            console.log(error);
        }
    };
    loadPromotions();
    return () => {
        mounted = false;
    };
}, []);

  
  useEffect(() => {

    if (promotions.length <= 1) return;

    const interval = setInterval(() => {

        setCurrentIndex(prev =>
            (prev + 1) % promotions.length
        );
    },3000);
    return () => clearInterval(interval);
}, [promotions]);

  const handleSearch = () => {
    console.log(query);
  };

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

        console.log(error);
        console.error("Status:",error.response?.status);
        console.error("Response:",error.response?.data);
        console.error("Error:",error);
        alert("Operation Failed");

    }

};

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

const handleEdit = (promotion) => {

  setIsEdit(true);

  setSelectedPromotionId(promotion.id);

  setTitle(promotion.title);
  setPriority(promotion.priority);
  setStartDate(promotion.startDate);
  setEndDate(promotion.endDate);

  setImage([]);
  setPreview([promotion.imageUrl]);

  setShowPopup(true);

};

const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
        "Are you sure you want to delete this promotion?"
    );

    if (!confirmDelete) return;

    try {

        await axios.delete(
            `http://localhost:8080/admin/promotions/${id}`
        );

        setPromotions(prev => 
          prev.filter(item => item.id !== id)
        );

        setCurrentIndex(0);
        alert("Promotion deleted successfully.");
    } catch (error) {
        console.error(error);
        alert("Failed to delete promotion.");
    }
};

useEffect(() => {
    console.log("showPromotionsPanel changed:", showPromotionsPanel);
}, [showPromotionsPanel]);

console.log("promotion count:",promotions.length);

console.log("Rendering :",showPromotionsPanel);


  return (

    <div className="home-container">
      <header className="header">

        <div className="left-section">
          <SideWindow />
        </div>
        <div className="logo">

          <span className="Gold">DEAL</span>
          <span className="Black">HUNTS</span>
          <span className="Admin">Admin</span>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />

          <span 
            className="icon"
            onClick={handleSearch}
          >
            🔍
          </span>
        </div>
        <div
          className="back-btn"
          onClick={()=>navigate(-1)}
        >
          &#8592;
        </div>

      </header>

      <main className="manage-main">
{/* 
        <h1 className="main-title">
          Homepage Promotions
        </h1> */}
        <section className="live-preview-section">

          <h2>
            Trending Carousel
          </h2> 

        <div className="banner-preview">

{
promotions.length > 0 ? (

    <img
        src={promotions[currentIndex].imageUrl}
        className="banner-preview-image"
        alt={promotions[currentIndex].title}
    />

) : (

    <>
        <div className="upload-icon">📷</div>
        <h3>Upload Banners</h3>
        <p>Select carousel images</p>
    </>

)

}

</div> 
<div className="admin-dots-container">
{
    promotions.map((_, index) => (
        <span
            key={index}
            className={
                currentIndex === index
                ? "admin-dot active"
                : "admin-dot"
            }
            onClick={() =>
                setCurrentIndex(index)
            }
        >
        </span>
    ))
}
</div>
        </section>
        
   <div className="quick-stats">

<div className="stat-card">
<h3>Total Banners</h3>
<p>{promotions.length}</p>
</div>


<div className="stat-card">
<h3>Active</h3>
<p>
{promotions.filter(
 item => item.active
).length}
</p>
</div>


<div className="stat-card">
<h3>High Priority</h3>
<p>
{promotions.filter(
 item => item.priority >= 5
).length}
</p>
</div>

</div>    
<div className="main-actions">
    {promotions.length <7 && ( 
<button
 className="add-banner-btn"
 onClick={openAddPopup}
>
Add Promotion  
</button>
  )}
  <button
  className="view-promotions-btn"
  onClick={() => setShowPromotionsPanel(true)}
>
    View Promotions →
</button>     
</div> 

      </main>
      <Popup
      open={showPopup}
      onClose={closePopup}
      title={isEdit ? "Edit Promotion" : "Add Promotion"}
      width="850px"
      >
  <div className="promotion-popup">

    {/* LEFT SIDE */}
    <div className="popup-left">
      <h3>Banner Preview</h3>

      <div
        className="popup-image-box"
        onClick={() => {
          const input = document.getElementById("popupBanner");
          if(input) input.click();
        }}
      >

        {preview.length > 0 ? (
          <img
            src={preview[0]}
            className="banner-preview-image"
            alt="Banner"
          />
        ) : (
          <>
            <div className="upload-icon">
              📷
              <div>
             Choose Banner
             </div>
            </div>

            <p>Upload Banner</p>
          </>
        )}

      </div>
      <div className="instructions">
        <div className="banner-note">
          <h4>
            📌 Banner Requirements
        </h4>

        <p>
            • Recommended ratio: 
            <span> 16:5 (1600 × 500 px)</span>
        </p>

        <p>
            • Maximum file size:
            <span> 2MB</span>
        </p>

        <p>
            • Supported formats:
            <span> JPG, PNG, WEBP</span>
        </p>
          
      </div>
      </div>

      {/* ONLY ONE INPUT */}
     <input
 id="popupBanner"
 type="file"
 hidden
 accept="image/*"
 onChange={(e) => {

    const file = e.target.files[0];

    if (!file) return;

    if(file.size > 2 * 1024 * 1024){

        alert("Image size should be below 2MB");
        return;
    }

    const imageUrl = URL.createObjectURL(file);

    setCropImage(imageUrl);

    setShowCropPopup(true);

}}
/>
    </div>

    {/* RIGHT SIDE */}
    <div className="popup-right">

      <div className="form-group">
        <label>Promotion Title</label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Priority</label>

        <input
          type="number"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Start Date</label>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>End Date</label>

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="popup-footer">
        <button
          className="cancel-btn"
          onClick={closePopup}
        >
          Cancel
        </button>

        <button
          className="save-banner-btn"
          onClick={handleSavePromotion}
        >
          {isEdit ? "Update Promotion" : "Save Promotion"}
        </button>
      </div>

    </div>

  </div>
</Popup>

<BannerCropPopup
    open={showCropPopup}
    image={cropImage}
    onClose={() => setShowCropPopup(false)}
    onCropComplete={async (croppedPixels) => {

        const croppedFile = await getCroppedImg(
            cropImage,
            croppedPixels
        );

        setImage([croppedFile]);

        setPreview([
            URL.createObjectURL(croppedFile)
        ]);
        setShowCropPopup(false);
    }}
/>
{console.log("Inside jsx:",showPromotionsPanel)}
{

showPromotionsPanel && (  

 <div className="promotion-drawer">

     <button
         className="close-drawer"
         onClick={()=>setShowPromotionsPanel(false)}
     >
         ✕
     </button>

     <h2>
         Current Promotions
     </h2>
     {
     promotions.map((item)=>(

         <div
             className="promotion-card"
             key={item.id}
        >

             <img
                 src={item.imageUrl}
                 className="small-banner"
             />

             <h3>
                 {item.title}
             </h3>
             <button
                 onClick={()=>handleEdit(item)}
             >
                 Edit
             </button>
             <button
                 onClick={()=>handleDelete(item.id)}
             >
                 Delete
             </button>
         </div>
     ))
     }
 </div>
)
}

</div>

      );
      
}

export default AdminManageTrending;