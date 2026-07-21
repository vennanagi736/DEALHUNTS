import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AProduct.css";
import SideWindow from "../../components/SideBar";
import {getAllProducts} from "../../api/ProductApi";

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
 
  useEffect(() => {

    const fetchProducts = async () => {

        try {

            const res = await getAllProducts();

            setProducts(res.data);

        } catch(err) {

            console.error(err);

        }

    };


    fetchProducts();

}, []);

  return (
    <div className="adminhome-container">
      {/* HEADER */}
      <header className="header">
        <div className="left-section">
          <SideWindow />
        </div>
  <div className="logo-container">
       <div className="logo">
      <span className="Gold">DEAL</span>
      <span className="Black">HUNTS</span>
      <span className="Admin">Admin</span>
    </div>
  </div>

  <div className="admin-actions">
    <button className="import-btn"
      onClick={() => navigate("/admin/import-products")}>
      Import Products
    </button>
    <button
      className="admin-button1"
      onClick={() => navigate("/adminAddProduct")}
    >
      Add Product
    </button>
    <div className="search-box">
              <input
                type="text"
                placeholder="Search"
              />
              <span className="icon">🔍</span>
            </div>
    <div className="back-btn" onClick={() => navigate(-1)}>
      &#8592;
      </div>
  </div>
</header>

      {/* MAIN SECTION */}
      <main className="main">
        <h1>Product List</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Variant</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>

{products.map((product) => (

<tr key={product.id}>
    <td>{product.id}</td>
    <td>{product.name}</td>
    <td>{product.brand}</td>
    <td>{product.category}</td>
    <td>{product.variant}</td>
    <td>
        <button>Edit</button>
        <button>Delete</button>
    </td>
</tr>

))}

</tbody>
        </table>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 Website. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AdminProducts;