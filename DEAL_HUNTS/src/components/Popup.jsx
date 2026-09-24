import "../styles/Popup.css";

function Popup({
    open,
    title,
    children,
    onClose,
    width = "500px",
    className = ""
}) {
    if (!open) return null;

    return (
        <div className="dh-popup-overlay">

            <div
                className={`dh-popup-container ${className}`}
                style={{ width }}
            >

                <div className="dh-popup-header">

                    <h2>{title}</h2>

                    <button
                        type="button"
                        className="dh-popup-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>

                <div className="dh-popup-body">
                    {children}
                </div>

            </div>

        </div>
    );
}

export default Popup;