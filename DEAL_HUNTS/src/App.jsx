import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./components/Settings";

// ============================================================
// USER
// ============================================================

import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ProductDetails from "./pages/user/ProductOverview";
import Products from "./pages/user/Products";
import ProductComparison from "./pages/user/ProductComparison";
import ShopDetails from "./pages/user/ShopDetails";
import USettings from "./pages/user/USettings";
import Wishlist from "./pages/user/Wishlist";
import Cart from "./pages/user/Cart";
import PlaceOrder from "./pages/user/PlaceOrder";
import OrderSuccess from "./pages/user/OrderSuccess";
import UserOrders from "./pages/user/Orders";
import Layout from "./components/Layout";

// ============================================================
// VENDOR
// ============================================================

import VendorLogin from "./pages/vendor/VLogin";
import VendorRegister from "./pages/vendor/VRegister";
import VendorHome from "./pages/vendor/VHome";
import VendorProductPage from "./pages/vendor/VProduct";
import VendorProductManage from "./pages/vendor/VProductManage";
import RequestStatus from "./pages/vendor/VRequest";


// ============================================================
// ADMIN
// ============================================================

import AdminHome from "./pages/admin/AHome";
import AdminDashboard from "./pages/admin/ADashboard";
import AdminProducts from "./pages/admin/AProduct";
import AdminLogin from "./pages/admin/ALogin";
import Payments from "./pages/admin/APayments";
import UsersDetails from "./pages/admin/AUser";
import AdminOrders from "./pages/admin/AOrders";
import Sales from "./pages/admin/ASales";
import VendorsDetails from "./pages/admin/AVendor";
import AdminVendorRequest from "./pages/admin/ARequest";
import AdminAddProduct from "./pages/admin/AAddProduct";
import AdminMasterData from "./pages/admin/AMasterData";
import AdminImportProducts from "./pages/admin/AImportProducts";


// ============================================================
// ADMIN MANAGEMENT
// ============================================================

import AdminManageProduct from "./pages/admin/AManageProduct";
import AdminManagePromotions from "./pages/admin/AManagePromotions";
import AdminManageCarousel from "./pages/admin/AManageCarousel";
import AdminManageTrendingDeals from "./pages/admin/AManageTrendingDeals";
import AdminManageTrendingCategories from "./pages/admin/AManageTrendingCategories";


function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* ====================================================
                    USER PUBLIC ROUTES
                ==================================================== */}

                <Route
                    path="/"
                    element={
                        <Layout>
                            <Home />
                        </Layout>
                    }
                />

                <Route
                    path="/home"
                    element={
                        <Layout>
                            <Home />
                        </Layout>
                    }
                />


                {/* USER LOGIN */}

                <Route
                    path="/login"
                    element={
                        <Layout>
                            <Login />
                        </Layout>
                    }
                />


                {/* USER REGISTER */}

                <Route
                    path="/register"
                    element={
                        <Layout>
                            <Register />
                        </Layout>
                    }
                />


                {/* PRODUCTS */}

                <Route
                    path="/products"
                    element={
                        <Layout>
                            <Products />
                        </Layout>
                    }
                />


                <Route
                    path="/products/:productId"
                    element={
                        <Layout>
                            <ProductComparison />
                        </Layout>
                    }
                />


                <Route
                    path="/product/:id"
                    element={
                        <Layout>
                            <ProductDetails />
                        </Layout>
                    }
                />


                <Route
                    path="/shop/:vendorId"
                    element={
                        <Layout>
                            <ShopDetails />
                        </Layout>
                    }
                />


                {/* ====================================================
                    USER PROTECTED ROUTES
                ==================================================== */}

                {/* CART */}

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_USER"]}
                        >
                            <Layout>
                                <Cart />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* ====================================================
    COMMON SETTINGS
    USER + VENDOR + ADMIN
==================================================== */}

<Route
    path="/settings"
    element={
        <ProtectedRoute
            allowedRoles={[
                "ROLE_USER",
                "ROLE_VENDOR",
                "ROLE_ADMIN",
            ]}
        >
            <Layout>
                <Settings />
            </Layout>
        </ProtectedRoute>
    }
/>


                {/* WISHLIST */}

                <Route
                    path="/wishlist"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_USER"]}
                        >
                            <Layout>
                                <Wishlist />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* USER ORDERS */}

                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_USER"]}
                        >
                            <Layout>
                                <UserOrders />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* PLACE ORDER */}

                <Route
                    path="/place-order"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_USER"]}
                        >
                            <Layout>
                                <PlaceOrder />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ORDER SUCCESS */}

                <Route
                    path="/order-success"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_USER"]}
                        >
                            <Layout>
                                <OrderSuccess />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    VENDOR PUBLIC ROUTES
                ==================================================== */}

                <Route
                    path="/vendorLogin"
                    element={
                        <Layout>
                            <VendorLogin />
                        </Layout>
                    }
                />


                <Route
                    path="/vendorRegister"
                    element={
                        <Layout>
                            <VendorRegister />
                        </Layout>
                    }
                />


                <Route
                    path="/request-status/:email"
                    element={
                        <Layout>
                            <RequestStatus />
                        </Layout>
                    }
                />


                {/* ====================================================
                    VENDOR PROTECTED ROUTES
                ==================================================== */}

                {/* VENDOR HOME */}

                <Route
                    path="/vendorHome"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_VENDOR"]}
                        >
                            <Layout>
                                <VendorHome />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* VENDOR PRODUCT PAGE */}

                <Route
                    path="/vendorProductPage"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_VENDOR"]}
                        >
                            <Layout>
                                <VendorProductPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* VENDOR EDIT PRODUCT */}

                <Route
                    path="/vendor/edit-product/:inventoryId"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_VENDOR"]}
                        >
                            <Layout>
                                <VendorProductPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* VENDOR MANAGE PRODUCTS */}

                <Route
                    path="/vendor/manage-products"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_VENDOR"]}
                        >
                            <Layout>
                                <VendorProductManage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    ADMIN PUBLIC ROUTE
                ==================================================== */}

                <Route
                    path="/adminLogin"
                    element={
                        <Layout>
                            <AdminLogin />
                        </Layout>
                    }
                />


                {/* ====================================================
                    ADMIN PROTECTED ROUTES
                ==================================================== */}

                {/* ADMIN HOME */}

                <Route
                    path="/adminHome"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminHome />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ADMIN DASHBOARD */}

                <Route
                    path="/adminDashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ADMIN PRODUCTS */}

                <Route
                    path="/adminProducts"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminProducts />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* MANAGE USERS */}

                <Route
                    path="/manage-users"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <UsersDetails />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* MANAGE VENDORS */}

                <Route
                    path="/manage-vendors"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <VendorsDetails />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* MANAGE ORDERS */}

                <Route
                    path="/manage-orders"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminOrders />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* MANAGE PAYMENTS */}

                <Route
                    path="/manage-payments"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <Payments />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* MANAGE SALES */}

                <Route
                    path="/manage-sales"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <Sales />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* MANAGE VENDOR REQUEST */}

                <Route
                    path="/manage-request"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminVendorRequest />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ADMIN VENDOR REQUEST */}

                <Route
                    path="/admin/vendor-requests"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminVendorRequest />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    ADMIN ADD PRODUCT
                ==================================================== */}

                <Route
                    path="/adminAddProduct"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminAddProduct />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/admin/add-product"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminAddProduct />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    ADMIN MASTER DATA
                ==================================================== */}

                <Route
                    path="/admin/master-data"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminMasterData />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    ADMIN IMPORT PRODUCTS
                ==================================================== */}

                <Route
                    path="/admin/import-products"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminImportProducts />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    ADMIN PRODUCT MANAGEMENT
                ==================================================== */}

                <Route
                    path="/admin/manage-product"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminManageProduct />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    ADMIN PROMOTIONS
                ==================================================== */}

                <Route
                    path="/admin/manage-promotions"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminManagePromotions />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    ADMIN CAROUSEL
                ==================================================== */}

                <Route
                    path="/admin/manage-carousel"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminManageCarousel />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    ADMIN TRENDING DEALS
                ==================================================== */}

                <Route
                    path="/admin/manage-trending-deals"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminManageTrendingDeals />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* ====================================================
                    ADMIN TRENDING CATEGORIES
                ==================================================== */}

                <Route
                    path="/admin/manage-trending-categories"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ROLE_ADMIN"]}
                        >
                            <Layout>
                                <AdminManageTrendingCategories />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;