
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [normalUsers, setNormalUsers] = useState([]);
  const [role, setRole] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', description: '' });
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    } catch (err) {
      console.error('Invalid token');
      return navigate('/login');
    }

    fetchProducts();
    if (role === 'superadmin') fetchUsers();
    if (role === 'user') fetchCart();
  }, [navigate, role]);

  const fetchProducts = async () => {
    const res = await api.get('/products');
    setProducts(res.data);
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
      setAdmins(res.data.filter(u => u.role === 'admin'));
      setNormalUsers(res.data.filter(u => u.role === 'user'));
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      const items = res.data.Products || [];
      const qtyMap = {};
      let total = 0;
      items.forEach(item => {
        qtyMap[item.id] = item.CartItem.quantity;
        item.totalPrice = item.price * item.CartItem.quantity;
        total += item.totalPrice;
      });
      setQuantities(qtyMap);
      setCart(items);
      setGrandTotal(total);
    } catch (err) {
      console.error('Cart fetch failed', err);
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/auth/createUser', newUser);
      setNewUser({ username: '', password: '', role: 'user' });
      setShowUserForm(false);
      fetchUsers();
    } catch (err) {
      alert('User creation failed');
    }
  };

  const handleCreateOrUpdateProduct = async () => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, newProduct);
      } else {
        await api.post('/products', newProduct);
      }
      setNewProduct({ name: '', price: '', stock: '', description: '' });
      setShowProductForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Product operation failed');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({ name: product.name, price: product.price, stock: product.stock, description: product.description });
    setShowProductForm(true);
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Are you sure to delete this user?')) {
      try {
        await api.delete(`/auth/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (role !== 'superadmin') return alert('Only superadmin can delete products');
    if (confirm('Are you sure to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      fetchCart();
    } catch (err) {
      alert('Add to cart failed');
    }
  };

  const changeQuantity = (productId, delta) => {
    const current = quantities[productId] || 1;
    const updated = Math.max(1, current + delta);
    const newQuantities = { ...quantities, [productId]: updated };
    setQuantities(newQuantities);

    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        const newTotalPrice = item.price * updated;
        return { ...item, CartItem: { ...item.CartItem, quantity: updated }, totalPrice: newTotalPrice };
      }
      return item;
    });

    setCart(updatedCart);
    const total = updatedCart.reduce((sum, item) => sum + item.totalPrice, 0);
    setGrandTotal(total);
  };

  const updateCartItem = async (productId) => {
    try {
      await api.put('/cart/update', { productId, quantity: quantities[productId] });
      fetchCart();
    } catch (err) {
      alert('Cart update failed');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      fetchCart();
    } catch (err) {
      alert('Remove failed');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard ({role})</h2>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <h2>Dashboard ({role})</h2>
  <button onClick={() => {
    localStorage.removeItem('token');
    navigate('/login');
  }} style={{ background: 'none', border: 'none', fontSize: '.8rem', cursor: 'pointer' }} title="Logout">
    🔒 Logout
  </button>
</div>

      {(role === 'superadmin' || role === 'admin') && (
        <button onClick={() => {
          setShowProductForm(!showProductForm);
          setEditingProduct(null);
        }}>
          {showProductForm ? 'Cancel' : 'Add Product'}
        </button>
      )}

      {showProductForm && (
        <div>
          <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input placeholder="Stock" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
          <input placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
          <button onClick={handleCreateOrUpdateProduct}>{editingProduct ? 'Update' : 'Submit'}</button>
        </div>
      )}

      {role === 'superadmin' && (
        <button onClick={() => setShowUserForm(!showUserForm)}>
          {showUserForm ? 'Cancel' : 'Create Admin/User'}
        </button>
      )}

      {showUserForm && (
        <div style={{ marginTop: '1rem' }}>
          <input placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
          <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleCreateUser}>Submit</button>
        </div>
      )}

      <h3>Product List</h3>
      <ul>
        {products.map(p => (
          <li key={p.id} style={{ marginBottom: '1rem' }}>
            <strong>{p.name}</strong><br />
            ₹{p.price}<br />
            <small>{p.description}</small><br />
            Stock: {p.stock}<br />
            {role === 'user' && (
              <button onClick={() => addToCart(p.id)} style={{ marginTop: '0.5rem' }}>
                Add to Cart
              </button>
            )}
            {(role === 'superadmin' || role === 'admin') && (
              <button onClick={() => handleEditProduct(p)} style={{ marginLeft: '1rem' }}>Edit</button>
            )}
            {role === 'superadmin' && (
              <button onClick={() => handleDeleteProduct(p.id)} style={{ marginLeft: '1rem' }}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {role === 'user' && (
        <div>
          <h3>Your Cart</h3>
          {cart.length > 0 ? (
            <ul>
              {cart.map((item) => (
                <li key={item.id}>
                  {item.name} – ₹{item.price} x {quantities[item.id] || item.CartItem.quantity} = ₹{item.totalPrice}
                  <div>
                    <button onClick={() => changeQuantity(item.id, -1)}>-</button>
                    <button onClick={() => changeQuantity(item.id, 1)}>+</button>
                    <button onClick={() => updateCartItem(item.id)}>Update</button>
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Your cart is empty.</p>
          )}
          <h4>Grand Total: ₹{grandTotal}</h4>
        </div>
      )}

      {role === 'superadmin' && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <h3>Admins</h3>
            <ul>
              {admins.map((u) => (
                <li key={u.id}>{u.username} <button onClick={() => handleDeleteUser(u.id)}>Delete</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Users</h3>
            <ul>
              {normalUsers.map((u) => (
                <li key={u.id}>{u.username} <button onClick={() => handleDeleteUser(u.id)}>Delete</button></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}