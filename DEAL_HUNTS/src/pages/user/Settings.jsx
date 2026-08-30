import { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Lock,
  ShoppingBag,
  Palette,
  LifeBuoy,
} from 'lucide-react';
import PageShell from '../../components/user/PageShell';
import '../../styles/Settings.css';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Lock },
  { id: 'shopping', label: 'Shopping Preferences', icon: ShoppingBag },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'help', label: 'Help & Support', icon: LifeBuoy },
];

function Toggle({ checked, onChange, label }) {
  return (
    <label className="settings-toggle">
      <span>{label}</span>
      <span
        className={`settings-toggle__switch${checked ? ' settings-toggle__switch--on' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
      >
        <span className="settings-toggle__knob" />
      </span>
    </label>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('account');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    priceDrops: true,
    orderUpdates: true,
    wishlistUpdates: false,
    promotions: false,
    email: true,
  });
  const [prefs, setPrefs] = useState({
    verifiedOnly: true,
    availableOnly: false,
  });

  const toggleNotif = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <PageShell active="Settings">
      <div className="settings-page">
        <div className="settings-page__heading">
          <h1>Settings</h1>
          <p>Manage your account, preferences and shopping experience.</p>
        </div>

        <div className="settings-layout">
          <nav className="settings-nav">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`settings-nav__item${
                  activeSection === id ? ' settings-nav__item--active' : ''
                }`}
                onClick={() => setActiveSection(id)}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {/* Profile */}
            {activeSection === 'profile' && (
              <section className="settings-card">
                <h2>Profile</h2>
                <p className="settings-card__desc">
                  This is how vendors and other DealHunts features see your account.
                </p>
                <div className="settings-field-grid">
                  <div className="settings-field">
                    <span className="settings-field__label">Full Name</span>
                    <span className="settings-field__value">Aarav Sharma</span>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field__label">Email</span>
                    <span className="settings-field__value">aarav.sharma@email.com</span>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field__label">Phone Number</span>
                    <span className="settings-field__value">+91 98765 43210</span>
                  </div>
                </div>
                <button className="btn-primary settings-card__cta">Edit Profile</button>
              </section>
            )}

            {/* Account (default) */}
            {activeSection === 'account' && (
              <>
                <section className="settings-card">
                  <h2>Personal Information</h2>
                  <div className="settings-field-grid">
                    <div className="settings-field">
                      <span className="settings-field__label">Full Name</span>
                      <span className="settings-field__value">Aarav Sharma</span>
                    </div>
                    <div className="settings-field">
                      <span className="settings-field__label">Email</span>
                      <span className="settings-field__value">aarav.sharma@email.com</span>
                    </div>
                    <div className="settings-field">
                      <span className="settings-field__label">Phone Number</span>
                      <span className="settings-field__value">+91 98765 43210</span>
                    </div>
                  </div>
                  <button className="btn-primary settings-card__cta">Edit Profile</button>
                </section>

                <section className="settings-card">
                  <h2>Account Security</h2>
                  <div className="settings-list">
                    <button className="settings-list__row">
                      <span>Change Password</span>
                      <span className="settings-list__chevron">&rsaquo;</span>
                    </button>
                    <button className="settings-list__row">
                      <span>Login Activity</span>
                      <span className="settings-list__chevron">&rsaquo;</span>
                    </button>
                    <button className="settings-list__row">
                      <span>Logout From All Devices</span>
                      <span className="settings-list__chevron">&rsaquo;</span>
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <section className="settings-card">
                <h2>Notifications</h2>
                <div className="settings-toggles">
                  <Toggle
                    label="Price drop alerts"
                    checked={notifications.priceDrops}
                    onChange={() => toggleNotif('priceDrops')}
                  />
                  <Toggle
                    label="Order updates"
                    checked={notifications.orderUpdates}
                    onChange={() => toggleNotif('orderUpdates')}
                  />
                  <Toggle
                    label="Wishlist updates"
                    checked={notifications.wishlistUpdates}
                    onChange={() => toggleNotif('wishlistUpdates')}
                  />
                  <Toggle
                    label="Promotional offers"
                    checked={notifications.promotions}
                    onChange={() => toggleNotif('promotions')}
                  />
                  <Toggle
                    label="Email notifications"
                    checked={notifications.email}
                    onChange={() => toggleNotif('email')}
                  />
                </div>
              </section>
            )}

            {/* Shopping Preferences */}
            {activeSection === 'shopping' && (
              <section className="settings-card">
                <h2>Shopping Preferences</h2>
                <div className="settings-field-grid">
                  <div className="settings-field">
                    <span className="settings-field__label">Preferred Currency</span>
                    <span className="settings-field__value">INR &#8377;</span>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field__label">Preferred Delivery Location</span>
                    <span className="settings-field__value">Hyderabad, Telangana</span>
                  </div>
                </div>
                <div className="settings-toggles settings-toggles--spaced">
                  <Toggle
                    label="Show only verified vendors"
                    checked={prefs.verifiedOnly}
                    onChange={() =>
                      setPrefs((p) => ({ ...p, verifiedOnly: !p.verifiedOnly }))
                    }
                  />
                  <Toggle
                    label="Show available products only"
                    checked={prefs.availableOnly}
                    onChange={() =>
                      setPrefs((p) => ({ ...p, availableOnly: !p.availableOnly }))
                    }
                  />
                </div>
              </section>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <section className="settings-card">
                <h2>Appearance</h2>
                <div className="settings-theme-options">
                  {['light', 'dark', 'system'].map((option) => (
                    <button
                      key={option}
                      className={`settings-theme-option${
                        theme === option ? ' settings-theme-option--selected' : ''
                      }`}
                      onClick={() => setTheme(option)}
                    >
                      <span className={`settings-theme-preview settings-theme-preview--${option}`} />
                      <span style={{ textTransform: 'capitalize' }}>
                        {option === 'system' ? 'System default' : option}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Privacy & Security */}
            {activeSection === 'privacy' && (
              <section className="settings-card">
                <h2>Privacy & Security</h2>
                <div className="settings-list">
                  <button className="settings-list__row">
                    <span>Manage Personal Data</span>
                    <span className="settings-list__chevron">&rsaquo;</span>
                  </button>
                  <button className="settings-list__row">
                    <span>Clear Search History</span>
                    <span className="settings-list__chevron">&rsaquo;</span>
                  </button>
                </div>
                <button className="settings-danger-btn">Delete Account</button>
              </section>
            )}

            {/* Help & Support */}
            {activeSection === 'help' && (
              <section className="settings-card">
                <h2>Help & Support</h2>
                <div className="settings-list">
                  <button className="settings-list__row">
                    <span>Help Center</span>
                    <span className="settings-list__chevron">&rsaquo;</span>
                  </button>
                  <button className="settings-list__row">
                    <span>Contact Support</span>
                    <span className="settings-list__chevron">&rsaquo;</span>
                  </button>
                  <button className="settings-list__row">
                    <span>Report a Problem</span>
                    <span className="settings-list__chevron">&rsaquo;</span>
                  </button>
                  <button className="settings-list__row">
                    <span>Terms & Conditions</span>
                    <span className="settings-list__chevron">&rsaquo;</span>
                  </button>
                  <button className="settings-list__row">
                    <span>Privacy Policy</span>
                    <span className="settings-list__chevron">&rsaquo;</span>
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
