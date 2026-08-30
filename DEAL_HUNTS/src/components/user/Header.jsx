import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search } from 'lucide-react';
import '../../styles/Header.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/wishlist', label: 'Wishlist' },
];

export default function Header({ cartCount = 0, wishlistCount = 0, active }) {
  const navigate = useNavigate();

  return (
    <header className="dh-header">
      <div className="dh-header__left">
        <button
          className="dh-header__logo"
          onClick={() => navigate('/')}
          aria-label="DealHunts home"
        >
          <span className="dh-header__logo-mark">D</span>
          DEALHUNTS
        </button>

        <nav className="dh-header__nav">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `dh-header__link${isActive || active === link.label ? ' dh-header__link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="dh-header__right">
        <div className="dh-header__search">
          <Search size={16} strokeWidth={2} />
          <input type="text" placeholder="Search products, brands, vendors" />
        </div>

        <button
          className={`dh-header__icon-btn${active === 'Wishlist' ? ' dh-header__icon-btn--active' : ''}`}
          onClick={() => navigate('/wishlist')}
          aria-label="Wishlist"
        >
          <Heart size={19} strokeWidth={1.8} />
          {wishlistCount > 0 && <span className="dh-header__badge">{wishlistCount}</span>}
        </button>

        <button
          className={`dh-header__icon-btn${active === 'Cart' ? ' dh-header__icon-btn--active' : ''}`}
          onClick={() => navigate('/cart')}
          aria-label="Cart"
        >
          <ShoppingCart size={19} strokeWidth={1.8} />
          {cartCount > 0 && <span className="dh-header__badge">{cartCount}</span>}
        </button>

        <button
          className="dh-header__profile"
          onClick={() => navigate('/settings')}
          aria-label="Profile"
        >
          <User size={17} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
