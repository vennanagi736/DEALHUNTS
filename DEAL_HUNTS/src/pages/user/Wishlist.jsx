import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Star,
  ShoppingCart,
  User,
  Settings,
} from 'lucide-react';
import{
  FiArrowLeft,
} from "react-icons/fi";

import Sidebar from '../../components/Sidebar';
import { wishlistItems as initialWishlist } from "../../data/mockData";
import "../../styles/Wishlist.css";

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialWishlist);

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = (id) => {
    // Wire up to real cart state / API later.
    console.log('Add to cart:', id);
  };

  // ============================================================
  // LOGIN CHECK
  // ============================================================

  const isLoggedIn =
    !!localStorage.getItem("userJwtToken");

  return (
    <div className="pc-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="pc-header">

        {/* ====================================================
            LEFT SIDE
        ==================================================== */}

        <div className="pc-header-left">

          {/* SIDEBAR */}

          <div className="pc-header-sidebar">
            <Sidebar />
          </div>

          {/* DEALHUNTS */}

          <div
            className="pc-brand"
            onClick={() => navigate("/")}
          >
            <div className="pc-logo">

              <span className="pc-logo-deal">
                DEAL
              </span>

              <span className="pc-logo-hunts">
                HUNTS
              </span>

            </div>

            <div className="pc-header-tagline">
              Hunt deals, save money
            </div>
          </div>

        </div>

        {/* ====================================================
            RIGHT SIDE
        ==================================================== */}

        <div className="pc-header-right">

          <nav className="pc-header-nav">

            <button
              type="button"
              onClick={() => navigate("/home")}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/products")}
            >
              Products
            </button> 
            <button
              type="button"
              onClick={() => navigate("/wishlist")}
            >
              Wishlist
            </button>

          </nav>

          {/* HEADER ACTIONS */}

          <div className="pc-header-actions">

            {/* CART */}

            <button
              type="button"
              className="pc-header-icon"
              onClick={() => navigate("/cart")}
              aria-label="Cart"
            >
              <ShoppingCart />
            </button>

            {/* LOGGED-IN USER */}

            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  className="pc-header-icon"
                  onClick={() => navigate("/profile")}
                  aria-label="Profile"
                >
                  <User />
                </button>

                <button
                  type="button"
                  className="pc-header-icon"
                  onClick={() => navigate("/settings")}
                  aria-label="Settings"
                >
                  <Settings />
                </button>
              </>
            ) : (

              /* LOGIN */

              <button
                type="button"
                className="pc-header-login"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

            )}

          </div>

        </div>

      </header>


      {/* ======================================================
          WISHLIST CONTENT
          NOTHING CHANGED BELOW
      ====================================================== */}

      <div className="wishlist-page">
         {/* BACK BUTTON */}
        
                <button
                  type="button"
                  className="products-back"
                  onClick={() => navigate("/")}
                >
                  <FiArrowLeft />
                  Back to Home
                </button>

        <div className="wishlist-page__heading">
          <h1>My Wishlist</h1>
          <p>
            Save products and keep an eye on their prices.
          </p>
        </div>

        {items.length === 0 ? (

          <div className="wishlist-empty">

            <div className="wishlist-empty__icon">
              <Heart
                size={40}
                strokeWidth={1.4}
              />
            </div>

            <h2>Your wishlist is empty</h2>

            <p>
              Save products here to compare prices and
              track your favorite deals.
            </p>

            <button
              className="btn-primary"
              onClick={() => navigate('/products')}
            >
              Explore Products
            </button>

          </div>

        ) : (

          <div className="wishlist-grid">

            {items.map((item) => {

              const discountAmount =
                item.originalPrice - item.price;

              return (

                <div
                  className="wishlist-card"
                  key={item.id}
                >

                  <div className="wishlist-card__image-wrap">

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <button
                      className="wishlist-card__remove"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      aria-label="Remove from wishlist"
                    >
                      <Heart
                        size={16}
                        strokeWidth={2}
                        fill="currentColor"
                      />
                    </button>

                  </div>


                  <div className="wishlist-card__body">

                    <span className="wishlist-card__brand">
                      {item.brand}
                    </span>

                    <h3 className="wishlist-card__name">
                      {item.name}
                    </h3>


                    {item.rating && (

                      <div className="wishlist-card__rating">

                        <Star
                          size={13}
                          fill="currentColor"
                          strokeWidth={0}
                        />

                        <span>
                          {item.rating}
                        </span>

                      </div>

                    )}


                    <div className="wishlist-card__price-row">

                      <span className="wishlist-card__price">
                        &#8377;
                        {item.price.toLocaleString('en-IN')}
                      </span>

                      {item.originalPrice > item.price && (

                        <span className="wishlist-card__price-original">
                          &#8377;
                          {item.originalPrice.toLocaleString('en-IN')}
                        </span>

                      )}

                    </div>


                    {discountAmount > 0 && (

                      <span className="wishlist-card__savings">
                        Save &#8377;
                        {discountAmount.toLocaleString('en-IN')}
                      </span>

                    )}


                    <span className="wishlist-card__vendors">
                      Compare across {item.vendorCount} vendors
                    </span>


                    <div className="wishlist-card__actions">

                      <button
                        className="btn-secondary"
                        onClick={() =>
                          navigate(
                            '/compare/' + item.id
                          )
                        }
                      >
                        View Comparison
                      </button>

                      <button
                        className="btn-primary"
                        onClick={() =>
                          addToCart(item.id)
                        }
                      >
                        <ShoppingCart
                          size={14}
                          strokeWidth={2}
                        />

                        Add to Cart
                      </button>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="pc-footer">

        <strong>
          DEALHUNTS
        </strong>

        <span>
          © 2026 DealHunts. All rights reserved.
        </span>

      </footer>

    </div>
  );
}