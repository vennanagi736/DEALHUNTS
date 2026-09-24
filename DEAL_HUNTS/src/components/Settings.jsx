import { useMemo, useState } from "react";
import {
  User,
  Shield,
  Bell,
  Lock,
  ShoppingBag,
  Palette,
  LifeBuoy,
  MapPin,
  CreditCard,
  Package,
  Store,
  Boxes,
  Truck,
  Wallet,
  Users,
  Settings as SettingsIcon,
  Database,
  SlidersHorizontal,
  Activity,
  FileText,
  UserCog,
  Building2,
} from "lucide-react";

import "../styles/Settings.css";
import { useRole } from "../context/UseRole";

/* =========================================================
   TOGGLE
========================================================= */

function SettingsToggle({ checked, onChange, label }) {
  return (
    <div className="dh-settings-toggle">
      <div className="dh-settings-toggle__text">
        <span>{label}</span>
      </div>

      <button
        type="button"
        className={`dh-settings-toggle__switch${
          checked
            ? " dh-settings-toggle__switch--active"
            : ""
        }`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span className="dh-settings-toggle__knob" />
      </button>
    </div>
  );
}

/* =========================================================
   SECTION CONFIGURATION
========================================================= */

const USER_SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "account",
    label: "Account & Security",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    icon: Lock,
  },
  {
    id: "shopping",
    label: "Shopping Preferences",
    icon: ShoppingBag,
  },
  {
    id: "addresses",
    label: "Addresses",
    icon: MapPin,
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    id: "orders",
    label: "Orders",
    icon: Package,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
  },
  {
    id: "help",
    label: "Help & Support",
    icon: LifeBuoy,
  },
];

const VENDOR_SECTIONS = [
  {
    id: "profile",
    label: "Business Profile",
    icon: Store,
  },
  {
    id: "account",
    label: "Account & Security",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "store",
    label: "Store Settings",
    icon: Building2,
  },
  {
    id: "inventory",
    label: "Inventory & Products",
    icon: Boxes,
  },
  {
    id: "orders",
    label: "Orders & Fulfillment",
    icon: Truck,
  },
  {
    id: "payouts",
    label: "Payments & Payouts",
    icon: Wallet,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
  },
  {
    id: "help",
    label: "Help & Support",
    icon: LifeBuoy,
  },
];

const ADMIN_SECTIONS = [
  {
    id: "profile",
    label: "Admin Profile",
    icon: UserCog,
  },
  {
    id: "account",
    label: "Account & Security",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "platform",
    label: "Platform Settings",
    icon: SettingsIcon,
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
  },
  {
    id: "vendors",
    label: "Vendor Management",
    icon: Store,
  },
  {
    id: "orders",
    label: "Order Management",
    icon: Package,
  },
  {
    id: "payments",
    label: "Payments & Finance",
    icon: Wallet,
  },
  {
    id: "system",
    label: "System & Data",
    icon: Database,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
  },
  {
    id: "help",
    label: "Help & Support",
    icon: LifeBuoy,
  },
];

/* =========================================================
   MAIN SETTINGS
========================================================= */

export default function Settings() {
  const { role } = useRole();

  /* =======================================================
     ROLE
  ======================================================= */

  const cleanRole = role
    ?.replace("ROLE_", "")
    .toLowerCase();

  const currentRole =
    cleanRole === "admin"
      ? "admin"
      : cleanRole === "vendor"
      ? "vendor"
      : "user";

  /* =======================================================
     ROLE SECTIONS
  ======================================================= */

  const sections = useMemo(() => {
    if (currentRole === "admin") {
      return ADMIN_SECTIONS;
    }

    if (currentRole === "vendor") {
      return VENDOR_SECTIONS;
    }

    return USER_SECTIONS;
  }, [currentRole]);

  /* =======================================================
     GENERAL STATE
  ======================================================= */

  const [activeSection, setActiveSection] = useState("account");
  const [theme, setTheme] = useState("light");

  /* =======================================================
     USER
  ======================================================= */

  const [userNotifications, setUserNotifications] =
    useState({
      priceDrops: true,
      orderUpdates: true,
      wishlistUpdates: false,
      promotions: false,
      email: true,
      nearbyDeals: true,
    });

  const [shoppingPrefs, setShoppingPrefs] =
    useState({
      verifiedOnly: true,
      availableOnly: false,
      localStores: true,
      onlineListings: true,
    });

  /* =======================================================
     VENDOR
  ======================================================= */

  const [vendorNotifications, setVendorNotifications] =
    useState({
      newOrders: true,
      lowStock: true,
      orderUpdates: true,
      customerMessages: true,
      promotions: false,
      email: true,
    });

  const [vendorPrefs, setVendorPrefs] =
    useState({
      autoUpdateInventory: true,
      lowStockAlerts: true,
      acceptOrders: true,
      showStoreOnline: true,
    });

  /* =======================================================
     ADMIN
  ======================================================= */

  const [adminNotifications, setAdminNotifications] =
    useState({
      vendorRequests: true,
      newUsers: true,
      newOrders: true,
      paymentIssues: true,
      systemAlerts: true,
      email: true,
    });

  const [adminPrefs, setAdminPrefs] =
    useState({
      maintenanceMode: false,
      vendorApprovalRequired: true,
      userRegistration: true,
      auditLogging: true,
    });

  /* =======================================================
     TOGGLES
  ======================================================= */

  const toggleUserNotification = (key) => {
    setUserNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleVendorNotification = (key) => {
    setVendorNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAdminNotification = (key) => {
    setAdminNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /* =======================================================
     ROLE TITLE
  ======================================================= */

  const roleTitle =
    currentRole === "admin"
      ? "Administrator"
      : currentRole === "vendor"
      ? "Vendor"
      : "Customer";

  const roleDescription =
    currentRole === "admin"
      ? "Manage platform configuration, security and operations."
      : currentRole === "vendor"
      ? "Manage your store, inventory, orders and payouts."
      : "Manage your account, preferences and shopping experience.";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dh-settings-root">
      <main className="dh-settings-page">

        {/* =================================================
            SETTINGS HEADER
        ================================================= */}

        <div className="dh-settings-heading">
          <div className="dh-settings-heading__content">

            <div className="dh-settings-heading__title-row">
              <h1>Settings</h1>

              <span className="dh-settings-heading__role">
                {roleTitle}
              </span>
            </div>

            <p>
              {roleDescription}
            </p>

          </div>
        </div>

        {/* =================================================
            SETTINGS LAYOUT
        ================================================= */}

        <div className="dh-settings-layout">

          {/* =================================================
              SETTINGS NAVIGATION - LEFT
          ================================================= */}

          <aside className="dh-settings-nav">

            <div className="dh-settings-nav__header">
              <span>Settings</span>
            </div>

            <div className="dh-settings-nav__list">

              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`dh-settings-nav__item${
                      activeSection === section.id
                        ? " dh-settings-nav__item--active"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveSection(section.id)
                    }
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                    />

                    <span>
                      {section.label}
                    </span>
                  </button>
                );
              })}

            </div>

          </aside>

          {/* =================================================
              SETTINGS CONTENT - RIGHT
          ================================================= */}

          <div className="dh-settings-content">

            {/* =================================================
                PROFILE
            ================================================= */}

            {activeSection === "profile" && (
              <section className="dh-settings-card">

                <div className="dh-settings-card__header">
                  <div>
                    <h2>
                      {currentRole === "admin"
                        ? "Administrator Profile"
                        : currentRole === "vendor"
                        ? "Business Profile"
                        : "Profile"}
                    </h2>

                    <p>
                      {currentRole === "admin"
                        ? "Manage administrator identity and account information."
                        : currentRole === "vendor"
                        ? "Manage the business information displayed across DealHunts."
                        : "Manage the personal information associated with your account."}
                    </p>
                  </div>
                </div>

                <div className="dh-settings-fields">

                  <div className="dh-settings-field">
                    <span>
                      {currentRole === "vendor"
                        ? "Business Name"
                        : "Full Name"}
                    </span>

                    <strong>
                      {currentRole === "admin"
                        ? "Administrator"
                        : currentRole === "vendor"
                        ? "Your Store"
                        : "Your Name"}
                    </strong>
                  </div>

                  <div className="dh-settings-field">
                    <span>Email Address</span>
                    <strong>Account Email</strong>
                  </div>

                  <div className="dh-settings-field">
                    <span>Phone Number</span>
                    <strong>Account Phone</strong>
                  </div>

                  {currentRole === "vendor" && (
                    <>
                      <div className="dh-settings-field">
                        <span>Business Category</span>
                        <strong>Store Category</strong>
                      </div>

                      <div className="dh-settings-field">
                        <span>Store Location</span>
                        <strong>Business Address</strong>
                      </div>

                      <div className="dh-settings-field">
                        <span>Vendor Status</span>
                        <strong>Account Status</strong>
                      </div>
                    </>
                  )}

                  {currentRole === "admin" && (
                    <>
                      <div className="dh-settings-field">
                        <span>Role</span>
                        <strong>Administrator</strong>
                      </div>

                      <div className="dh-settings-field">
                        <span>Access Level</span>
                        <strong>
                          Full Platform Access
                        </strong>
                      </div>

                      <div className="dh-settings-field">
                        <span>Last Login</span>
                        <strong>Recent Login</strong>
                      </div>
                    </>
                  )}

                </div>

                <div className="dh-settings-card__footer">
                  <button
                    type="button"
                    className="dh-settings-primary"
                  >
                    {currentRole === "vendor"
                      ? "Edit Business Profile"
                      : "Edit Profile"}
                  </button>
                </div>

              </section>
            )}

            {/* =================================================
                ACCOUNT
            ================================================= */}

            {activeSection === "account" && (
              <div className="dh-settings-stack">

                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Account Information</h2>

                      <p>
                        Manage the basic information associated
                        with your DealHunts account.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-fields">

                    <div className="dh-settings-field">
                      <span>Account Type</span>
                      <strong>{roleTitle}</strong>
                    </div>

                    <div className="dh-settings-field">
                      <span>Email Address</span>
                      <strong>Account Email</strong>
                    </div>

                    <div className="dh-settings-field">
                      <span>Phone Number</span>
                      <strong>Account Phone</strong>
                    </div>

                  </div>

                  <div className="dh-settings-card__footer">
                    <button
                      type="button"
                      className="dh-settings-primary"
                    >
                      Edit Account
                    </button>
                  </div>

                </section>

                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Security</h2>

                      <p>
                        Protect your account and manage active
                        sessions.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Change Password",
                      "Two-Factor Authentication",
                      "Login Activity",
                      "Logout From All Devices",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>

              </div>
            )}

            {/* =================================================
                USER NOTIFICATIONS
            ================================================= */}

            {currentRole === "user" &&
              activeSection === "notifications" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Notifications</h2>

                      <p>
                        Choose which shopping and DealHunts
                        updates you want to receive.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-toggle-list">

                    <SettingsToggle
                      label="Price drop alerts"
                      checked={
                        userNotifications.priceDrops
                      }
                      onChange={() =>
                        toggleUserNotification(
                          "priceDrops"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Order updates"
                      checked={
                        userNotifications.orderUpdates
                      }
                      onChange={() =>
                        toggleUserNotification(
                          "orderUpdates"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Wishlist updates"
                      checked={
                        userNotifications.wishlistUpdates
                      }
                      onChange={() =>
                        toggleUserNotification(
                          "wishlistUpdates"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Promotional offers"
                      checked={
                        userNotifications.promotions
                      }
                      onChange={() =>
                        toggleUserNotification(
                          "promotions"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Nearby deal alerts"
                      checked={
                        userNotifications.nearbyDeals
                      }
                      onChange={() =>
                        toggleUserNotification(
                          "nearbyDeals"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Email notifications"
                      checked={
                        userNotifications.email
                      }
                      onChange={() =>
                        toggleUserNotification(
                          "email"
                        )
                      }
                    />

                  </div>

                </section>
              )}

            {/* =================================================
                VENDOR NOTIFICATIONS
            ================================================= */}

            {currentRole === "vendor" &&
              activeSection === "notifications" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Notifications</h2>

                      <p>
                        Control alerts related to your store,
                        products and orders.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-toggle-list">

                    <SettingsToggle
                      label="New order alerts"
                      checked={
                        vendorNotifications.newOrders
                      }
                      onChange={() =>
                        toggleVendorNotification(
                          "newOrders"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Low stock alerts"
                      checked={
                        vendorNotifications.lowStock
                      }
                      onChange={() =>
                        toggleVendorNotification(
                          "lowStock"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Order status updates"
                      checked={
                        vendorNotifications.orderUpdates
                      }
                      onChange={() =>
                        toggleVendorNotification(
                          "orderUpdates"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Customer messages"
                      checked={
                        vendorNotifications.customerMessages
                      }
                      onChange={() =>
                        toggleVendorNotification(
                          "customerMessages"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Promotional opportunities"
                      checked={
                        vendorNotifications.promotions
                      }
                      onChange={() =>
                        toggleVendorNotification(
                          "promotions"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Email notifications"
                      checked={
                        vendorNotifications.email
                      }
                      onChange={() =>
                        toggleVendorNotification(
                          "email"
                        )
                      }
                    />

                  </div>

                </section>
              )}

            {/* =================================================
                ADMIN NOTIFICATIONS
            ================================================= */}

            {currentRole === "admin" &&
              activeSection === "notifications" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>System Notifications</h2>

                      <p>
                        Control operational alerts for the
                        DealHunts platform.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-toggle-list">

                    <SettingsToggle
                      label="Vendor registration requests"
                      checked={
                        adminNotifications.vendorRequests
                      }
                      onChange={() =>
                        toggleAdminNotification(
                          "vendorRequests"
                        )
                      }
                    />

                    <SettingsToggle
                      label="New user registrations"
                      checked={
                        adminNotifications.newUsers
                      }
                      onChange={() =>
                        toggleAdminNotification(
                          "newUsers"
                        )
                      }
                    />

                    <SettingsToggle
                      label="New order alerts"
                      checked={
                        adminNotifications.newOrders
                      }
                      onChange={() =>
                        toggleAdminNotification(
                          "newOrders"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Payment issue alerts"
                      checked={
                        adminNotifications.paymentIssues
                      }
                      onChange={() =>
                        toggleAdminNotification(
                          "paymentIssues"
                        )
                      }
                    />

                    <SettingsToggle
                      label="System alerts"
                      checked={
                        adminNotifications.systemAlerts
                      }
                      onChange={() =>
                        toggleAdminNotification(
                          "systemAlerts"
                        )
                      }
                    />

                    <SettingsToggle
                      label="Email notifications"
                      checked={
                        adminNotifications.email
                      }
                      onChange={() =>
                        toggleAdminNotification(
                          "email"
                        )
                      }
                    />

                  </div>

                </section>
              )}

            {/* =================================================
                USER PRIVACY
            ================================================= */}

            {currentRole === "user" &&
              activeSection === "privacy" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Privacy & Security</h2>

                      <p>
                        Control your personal data and account
                        privacy.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Manage Personal Data",
                      "Clear Search History",
                      "Manage Saved Addresses",
                      "Download Account Data",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                  <div className="dh-settings-danger-area">

                    <div>
                      <strong>
                        Delete Account
                      </strong>

                      <span>
                        Permanently remove your DealHunts
                        account.
                      </span>
                    </div>

                    <button
                      type="button"
                      className="dh-settings-danger"
                    >
                      Delete Account
                    </button>

                  </div>

                </section>
              )}

            {/* =================================================
                USER SHOPPING
            ================================================= */}

            {currentRole === "user" &&
              activeSection === "shopping" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Shopping Preferences</h2>

                      <p>
                        Personalize how products and deals are
                        presented to you.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-fields">

                    <div className="dh-settings-field">
                      <span>Preferred Currency</span>
                      <strong>INR ₹</strong>
                    </div>

                    <div className="dh-settings-field">
                      <span>Delivery Location</span>
                      <strong>Saved Address</strong>
                    </div>

                  </div>

                  <div className="dh-settings-toggle-list dh-settings-toggle-list--spaced">

                    <SettingsToggle
                      label="Show only verified vendors"
                      checked={
                        shoppingPrefs.verifiedOnly
                      }
                      onChange={() =>
                        setShoppingPrefs((prev) => ({
                          ...prev,
                          verifiedOnly:
                            !prev.verifiedOnly,
                        }))
                      }
                    />

                    <SettingsToggle
                      label="Show available products only"
                      checked={
                        shoppingPrefs.availableOnly
                      }
                      onChange={() =>
                        setShoppingPrefs((prev) => ({
                          ...prev,
                          availableOnly:
                            !prev.availableOnly,
                        }))
                      }
                    />

                    <SettingsToggle
                      label="Include nearby local stores"
                      checked={
                        shoppingPrefs.localStores
                      }
                      onChange={() =>
                        setShoppingPrefs((prev) => ({
                          ...prev,
                          localStores:
                            !prev.localStores,
                        }))
                      }
                    />

                    <SettingsToggle
                      label="Include online listings"
                      checked={
                        shoppingPrefs.onlineListings
                      }
                      onChange={() =>
                        setShoppingPrefs((prev) => ({
                          ...prev,
                          onlineListings:
                            !prev.onlineListings,
                        }))
                      }
                    />

                  </div>

                </section>
              )}

            {/* =================================================
                USER ADDRESSES
            ================================================= */}

            {currentRole === "user" &&
              activeSection === "addresses" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Addresses</h2>

                      <p>
                        Manage delivery addresses used for
                        your orders.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Manage Delivery Addresses",
                      "Add New Address",
                      "Default Delivery Address",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                USER PAYMENTS
            ================================================= */}

            {currentRole === "user" &&
              activeSection === "payments" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Payments</h2>

                      <p>
                        Manage saved payment methods and
                        payment preferences.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Saved Payment Methods",
                      "Payment History",
                      "Refund Preferences",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                USER ORDERS
            ================================================= */}

            {currentRole === "user" &&
              activeSection === "orders" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Order Preferences</h2>

                      <p>
                        Manage your order-related preferences.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Order History",
                      "Saved Orders",
                      "Returns & Refunds",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                VENDOR STORE
            ================================================= */}

            {currentRole === "vendor" &&
              activeSection === "store" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Store Settings</h2>

                      <p>
                        Configure how your store operates
                        on DealHunts.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-toggle-list">

                    <SettingsToggle
                      label="Store visible to customers"
                      checked={
                        vendorPrefs.showStoreOnline
                      }
                      onChange={() =>
                        setVendorPrefs((prev) => ({
                          ...prev,
                          showStoreOnline:
                            !prev.showStoreOnline,
                        }))
                      }
                    />

                    <SettingsToggle
                      label="Accept new orders"
                      checked={
                        vendorPrefs.acceptOrders
                      }
                      onChange={() =>
                        setVendorPrefs((prev) => ({
                          ...prev,
                          acceptOrders:
                            !prev.acceptOrders,
                        }))
                      }
                    />

                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Business Hours",
                      "Store Address",
                      "Delivery Settings",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                VENDOR INVENTORY
            ================================================= */}

            {currentRole === "vendor" &&
              activeSection === "inventory" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Inventory & Products</h2>

                      <p>
                        Configure product and inventory
                        management behavior.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-toggle-list">

                    <SettingsToggle
                      label="Automatic inventory updates"
                      checked={
                        vendorPrefs.autoUpdateInventory
                      }
                      onChange={() =>
                        setVendorPrefs((prev) => ({
                          ...prev,
                          autoUpdateInventory:
                            !prev.autoUpdateInventory,
                        }))
                      }
                    />

                    <SettingsToggle
                      label="Low stock alerts"
                      checked={
                        vendorPrefs.lowStockAlerts
                      }
                      onChange={() =>
                        setVendorPrefs((prev) => ({
                          ...prev,
                          lowStockAlerts:
                            !prev.lowStockAlerts,
                        }))
                      }
                    />

                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Product Visibility",
                      "Low Stock Thresholds",
                      "Inventory History",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                VENDOR ORDERS
            ================================================= */}

            {currentRole === "vendor" &&
              activeSection === "orders" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Orders & Fulfillment</h2>

                      <p>
                        Configure how customer orders are
                        processed and fulfilled.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Order Processing Time",
                      "Shipping & Delivery",
                      "Returns & Cancellations",
                      "Order History",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                VENDOR PAYOUTS
            ================================================= */}

            {currentRole === "vendor" &&
              activeSection === "payouts" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Payments & Payouts</h2>

                      <p>
                        Manage vendor payment and settlement
                        information.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Bank Account Details",
                      "Payout Schedule",
                      "Payout History",
                      "Transaction Statements",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                ADMIN PLATFORM
            ================================================= */}

            {currentRole === "admin" &&
              activeSection === "platform" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Platform Settings</h2>

                      <p>
                        Configure global DealHunts platform
                        behavior.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-toggle-list">

                    <SettingsToggle
                      label="Maintenance mode"
                      checked={
                        adminPrefs.maintenanceMode
                      }
                      onChange={() =>
                        setAdminPrefs((prev) => ({
                          ...prev,
                          maintenanceMode:
                            !prev.maintenanceMode,
                        }))
                      }
                    />

                    <SettingsToggle
                      label="Require vendor approval"
                      checked={
                        adminPrefs.vendorApprovalRequired
                      }
                      onChange={() =>
                        setAdminPrefs((prev) => ({
                          ...prev,
                          vendorApprovalRequired:
                            !prev.vendorApprovalRequired,
                        }))
                      }
                    />

                    <SettingsToggle
                      label="Allow new user registration"
                      checked={
                        adminPrefs.userRegistration
                      }
                      onChange={() =>
                        setAdminPrefs((prev) => ({
                          ...prev,
                          userRegistration:
                            !prev.userRegistration,
                        }))
                      }
                    />

                    <SettingsToggle
                      label="Audit logging"
                      checked={
                        adminPrefs.auditLogging
                      }
                      onChange={() =>
                        setAdminPrefs((prev) => ({
                          ...prev,
                          auditLogging:
                            !prev.auditLogging,
                        }))
                      }
                    />

                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "General Platform Configuration",
                      "Commission Configuration",
                      "Tax & Currency Settings",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                ADMIN USERS
            ================================================= */}

            {currentRole === "admin" &&
              activeSection === "users" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>User Management</h2>

                      <p>
                        Configure how customer accounts are
                        managed across DealHunts.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "User Registration Settings",
                      "User Account Controls",
                      "Blocked & Suspended Users",
                      "User Activity Logs",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                ADMIN VENDORS
            ================================================= */}

            {currentRole === "admin" &&
              activeSection === "vendors" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Vendor Management</h2>

                      <p>
                        Configure vendor onboarding and
                        marketplace controls.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Vendor Approval Rules",
                      "Vendor Verification",
                      "Vendor Account Controls",
                      "Vendor Activity Logs",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                ADMIN ORDERS
            ================================================= */}

            {currentRole === "admin" &&
              activeSection === "orders" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Order Management</h2>

                      <p>
                        Configure platform-wide order
                        management rules.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Order Processing Rules",
                      "Cancellation Rules",
                      "Return & Refund Rules",
                      "Order Audit Logs",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                ADMIN PAYMENTS
            ================================================= */}

            {currentRole === "admin" &&
              activeSection === "payments" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>Payments & Finance</h2>

                      <p>
                        Manage platform payment and financial
                        configuration.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    {[
                      "Payment Gateway Settings",
                      "Vendor Settlement Settings",
                      "Refund Configuration",
                      "Financial Reports",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="dh-settings-action-row"
                      >
                        <span>{item}</span>
                        <span>›</span>
                      </button>
                    ))}

                  </div>

                </section>
              )}

            {/* =================================================
                ADMIN SYSTEM
            ================================================= */}

            {currentRole === "admin" &&
              activeSection === "system" && (
                <section className="dh-settings-card">

                  <div className="dh-settings-card__header">
                    <div>
                      <h2>System & Data</h2>

                      <p>
                        Monitor and configure core platform
                        infrastructure and data.
                      </p>
                    </div>
                  </div>

                  <div className="dh-settings-action-list">

                    <button
                      type="button"
                      className="dh-settings-action-row"
                    >
                      <span className="dh-settings-action-row__label">
                        <Activity size={16} />
                        System Activity
                      </span>

                      <span>›</span>
                    </button>

                    <button
                      type="button"
                      className="dh-settings-action-row"
                    >
                      <span className="dh-settings-action-row__label">
                        <Database size={16} />
                        Database Status
                      </span>

                      <span>›</span>
                    </button>

                    <button
                      type="button"
                      className="dh-settings-action-row"
                    >
                      <span className="dh-settings-action-row__label">
                        <FileText size={16} />
                        Audit Logs
                      </span>

                      <span>›</span>
                    </button>

                    <button
                      type="button"
                      className="dh-settings-action-row"
                    >
                      <span className="dh-settings-action-row__label">
                        <SlidersHorizontal size={16} />
                        System Configuration
                      </span>

                      <span>›</span>
                    </button>

                  </div>

                </section>
              )}

            {/* =================================================
                APPEARANCE
            ================================================= */}

            {activeSection === "appearance" && (
              <section className="dh-settings-card">

                <div className="dh-settings-card__header">
                  <div>
                    <h2>Appearance</h2>

                    <p>
                      Choose how DealHunts should look on
                      your device.
                    </p>
                  </div>
                </div>

                <div className="dh-settings-theme-grid">

                  {["light", "dark", "system"].map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        className={`dh-settings-theme-option${
                          theme === option
                            ? " dh-settings-theme-option--selected"
                            : ""
                        }`}
                        onClick={() =>
                          setTheme(option)
                        }
                      >
                        <span
                          className={`dh-settings-theme-preview dh-settings-theme-preview--${option}`}
                        />

                        <span className="dh-settings-theme-name">
                          {option === "system"
                            ? "System default"
                            : option
                                .charAt(0)
                                .toUpperCase() +
                              option.slice(1)}
                        </span>
                      </button>
                    )
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                HELP
            ================================================= */}

            {activeSection === "help" && (
              <section className="dh-settings-card">

                <div className="dh-settings-card__header">
                  <div>
                    <h2>Help & Support</h2>

                    <p>
                      Get help with your DealHunts account
                      and platform experience.
                    </p>
                  </div>
                </div>

                <div className="dh-settings-action-list">

                  {[
                    "Help Center",
                    "Contact Support",
                    "Report a Problem",
                    "Terms & Conditions",
                    "Privacy Policy",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="dh-settings-action-row"
                    >
                      <span>{item}</span>
                      <span>›</span>
                    </button>
                  ))}

                </div>

              </section>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}