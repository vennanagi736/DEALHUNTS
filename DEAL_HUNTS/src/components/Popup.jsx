import "../styles/Popup.css";

function Popup({
    open,
    title,
    children,
    onClose,
    width = "500px"
}) {

    if (!open) return null;

    return (
        <div className="popup-overlay">

            <div
                className="popup-container"
                style={{ width }}
            >

                <div className="popup-header">

                    <h2>{title}</h2>

                    <button
                        className="popup-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>

                <div className="popup-body">
                    {children}
                </div>

            </div>

        </div>
    );
}

export default Popup;