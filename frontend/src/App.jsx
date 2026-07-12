import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "/api/products";

function App() {
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: ""
  });

  const [editingId, setEditingId] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    const response = await axios.get(API_URL);
    setProducts(response.data);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
    };
    loadData();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Add or Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, form);
      setEditingId(null);
    } else {
      await axios.post(API_URL, form);
    }

    setForm({
      name: "",
      category: "",
      price: "",
      stock: ""
    });

    fetchProducts();
  };

  // Delete
  const deleteProduct = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchProducts();
  };

  // Edit
  const editProduct = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock
    });
  };

  return (
    <div className="container">

      <h1>Product Catalog</h1>

      <form onSubmit={handleSubmit}>

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          required
        />

        <button type="submit">
          {editingId ? "Update Product" : "Add Product"}
        </button>

      </form>

      <table>

        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {products.map((product) => (

            <tr key={product.id}>

              <td>{product.name}</td>

              <td>{product.category}</td>

              <td>{product.price}</td>

              <td>{product.stock}</td>

              <td>

                <button onClick={() => editProduct(product)}>
                  Edit
                </button>

                <button onClick={() => deleteProduct(product.id)}>
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default App;
