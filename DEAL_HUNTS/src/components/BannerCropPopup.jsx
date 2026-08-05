import Cropper from "react-easy-crop";
import { useState } from "react";
import Popup from "./Popup";
import "../styles/TrendingCarousel.css";

function BannerCropPopup({
    open,
    image,
    onClose,
    onCropComplete
}){

    const [crop,setCrop] = useState({ x:0,y:0});
    const [zoom,setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
        
    return(
       <Popup
            open={open}
            onClose={onClose}
            title="Crop Banner"
            width="900px"
        >

            <div className="crop-popup">

            <div className="crop-container">

    <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={16 / 5}
        objectFit="contain"
        showGrid={true}
        minZoom={0.8}
        maxZoom={5}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={(croppedArea, croppedPixels)=>{
            setCroppedAreaPixels(croppedPixels);
        }}
    />

</div>

                <div className="crop-controls">

                    <label>
                        Zoom
                    </label>

                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) =>
                            setZoom(Number(e.target.value))
                        }
                    />
                    <div className="crop-tip">
    <h4>Crop Instructions</h4>

    <ul>
        <li>Adjust the image to fit inside the banner frame.</li>
        <li>The crop area is fixed to a <strong>16:5</strong> aspect ratio.</li>
        <li>Drag the image to reposition it.</li>
        <li>Use the zoom slider to zoom in or out.</li>
        <li>Keep important content (logo, text, product) inside the crop area.</li>
        <li>Recommended output: <strong>1600 × 500 pixels</strong>.</li>
    </ul>
</div>

                    <div className="crop-btn">

                        <button
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            className="save-banner-btn"
                            onClick={() => onCropComplete(croppedAreaPixels)}
                        >
                            Crop Image
                        </button>

                    </div>

                </div>

            </div>

        </Popup>

    );
}

export default BannerCropPopup;