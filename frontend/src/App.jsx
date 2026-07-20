import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: ""
  });

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Add or Update handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post(API_URL, form);
      }
      
      setForm({ name: "", category: "", price: "", stock: "" });
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  // Delete product with confirmation
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // Populate form for editing
  const startEdit = (product) => {
    const id = product.id || product._id;
    setEditingId(id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock
    });
  };

  // Cancel active edit state
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", category: "", price: "", stock: "" });
  };

  return (
    <div className="app-container">
      {/* Header Panel */}
      <header className="dashboard-header">
        <h1>Product Management Console</h1>
        <p>Manage, track, and optimize your inventory data seamlessly.</p>
      </header>

      {/* Grid Dashboard Content */}
      <main className="dashboard-content">
        
        {/* Left Side: Product Form Entry */}
        <section className="form-section">
          <div className="card">
            <h2>{editingId ? "Modify Product Details" : "Register New Product"}</h2>
            
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g., Wireless Mechanical Keyboard"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  name="category"
                  type="text"
                  placeholder="e.g., Electronics"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Available Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Save Updates" : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Right Side: Data Inventory Table */}
        <section className="table-section">
          <div className="card">
            <div className="card-header">
              <h2>Inventory Status</h2>
              <span className="badge">{products.length} Total Items</span>
            </div>

            {loading ? (
              <div className="spinner-container">
                <div className="spinner"></div>
                <p>Retrieving inventory catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p>No products found in the catalog.</p>
                <span className="subtext">Use the registration panel to populate your list.</span>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Availability</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const id = product.id || product._id;
                      const isOutOfStock = Number(product.stock) === 0;

                      return (
                        <tr key={id}>
                          <td className="fw-medium">{product.name}</td>
                          <td><span className="category-tag">{product.category}</span></td>
                          <td className="fw-semibold">
                            ${Number(product.price).toLocaleString(undefined, { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </td>
                          <td>
                            <span className={`status-pill ${isOutOfStock ? "out-of-stock" : "in-stock"}`}>
                              {isOutOfStock ? "Out of Stock" : `${product.stock} Units`}
                            </span>
                          </td>
                          <td className="text-right actions-cell">
                            <button onClick={() => startEdit(product)} className="btn-icon btn-edit">
                              Edit
                            </button>
                            <button onClick={() => deleteProduct(id)} className="btn-icon btn-delete">
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
