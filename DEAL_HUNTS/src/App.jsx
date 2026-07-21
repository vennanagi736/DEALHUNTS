import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";


// ---------------- USER ----------------
import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ProductDetails from "./pages/user/ProductOverview";


// ---------------- VENDOR ----------------
import VendorLogin from "./pages/vendor/VLogin";
import VendorRegister from "./pages/vendor/VRegister";
import VendorHome from "./pages/vendor/VHome";
import VendorProductPage from "./pages/vendor/VProduct";
import VendorManage from "./pages/vendor/VManage";
import RequestStatus from "./pages/vendor/VRequest";


// ---------------- ADMIN ----------------
import AdminDashboard from "./pages/admin/AHome";
import AdminProducts from "./pages/admin/AProduct";
import AdminLogin from "./pages/admin/ALogin";
import Payments from "./pages/admin/APayments";
import UsersDetails from "./pages/admin/AUser";
import Orders from "./pages/admin/AOrders";
import Sales from "./pages/admin/ASales";
import VendorsDetails from "./pages/admin/AVendor";
import AdminVendorRequest from "./pages/admin/ARequest";
import AdminAddProduct from "./pages/admin/AAddProduct";
import AdminMasterData from "./pages/admin/AMasterData";
import AdminImportProducts from "./pages/admin/AImportProducts";

function App() {
return (
<BrowserRouter>
<Routes>

{/* ================= USER ================= */}
<Route path="/" element={<Home />} />
<Route path="/home" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />


{/* ================= VENDOR ================= */}
<Route path="/vendorLogin" element={<VendorLogin />} />
<Route path="/vendorRegister" element={<VendorRegister />} />
<Route
path="/vendorHome"
element={
<ProtectedRoute allowedRoles={["ROLE_VENDOR"]}>
<VendorHome />
</ProtectedRoute>
}
/>
<Route
path="/vendorProductPage"
element={
<ProtectedRoute allowedRoles={["ROLE_VENDOR"]}>
<VendorProductPage />
</ProtectedRoute>
}
/>
<Route
path="/vendor"
element={
<ProtectedRoute allowedRoles={["ROLE_VENDOR"]}>
<VendorManage />
</ProtectedRoute>
}
/>
<Route
path="/request-status/:email"
element={<RequestStatus />}
/>
{/* ================= ADMIN ================= */}
<Route path="/adminLogin" element={<AdminLogin />} />

<Route
path="/adminDashboard"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<AdminDashboard />
</ProtectedRoute>
}
/>
<Route
path="/adminProducts"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<AdminProducts />
</ProtectedRoute>
}
/>

<Route
path="/manage-users"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<UsersDetails />
</ProtectedRoute>
}
/>

<Route
path="/manage-vendors"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<VendorsDetails />
</ProtectedRoute>
}
/>
<Route
path="/manage-orders"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<Orders />
</ProtectedRoute>
}
/>
<Route
path="/manage-payments"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<Payments />
</ProtectedRoute>
}
/>
<Route
path="/manage-sales"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<Sales />
</ProtectedRoute>
}
/>
<Route
path="/manage-request"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<AdminVendorRequest />
</ProtectedRoute>
}
/>
<Route
path="/admin/vendor-requests"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<AdminVendorRequest />
</ProtectedRoute>
}
/>
{/* ADD PRODUCT */}

<Route
path="/adminAddProduct"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<AdminAddProduct/>
</ProtectedRoute>
}
/>

<Route
path="/admin/add-product"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<AdminAddProduct />
</ProtectedRoute>
}
/>
<Route
path="/admin/master-data"
element={
<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
<AdminMasterData />
</ProtectedRoute>
}
/>
<Route
 path="/admin/import-products"
 element={
 <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
    <AdminImportProducts />
    </ProtectedRoute>}
/>

{/* ================= PRODUCT ================= */}

<Route
path="/product/:id"
element={<ProductDetails />}
/>
</Routes>
</BrowserRouter>
);
}
export default App;