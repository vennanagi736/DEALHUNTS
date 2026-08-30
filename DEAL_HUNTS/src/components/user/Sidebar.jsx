import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Heart,
  ShoppingCart,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';
import '../../styles/Sidebar.css';

/*
  Slim icon sidebar used across every DealHunts page.
  If your Product Comparison page already has its own Sidebar
  component, drop this file and import that one instead — the
  pages in this delivery only expect a fixed-width rail on desktop
  and no rail on mobile, wired to React Router's NavLink.
*/

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/products', label: 'Products', icon: LayoutGrid },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="dh-sidebar">
      <nav className="dh-sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `dh-sidebar__item${isActive ? ' dh-sidebar__item--active' : ''}`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `dh-sidebar__item dh-sidebar__item--profile${isActive ? ' dh-sidebar__item--active' : ''}`
        }
      >
        <User size={20} strokeWidth={1.8} />
        <span>Profile</span>
      </NavLink>
    </aside>
  );
}
