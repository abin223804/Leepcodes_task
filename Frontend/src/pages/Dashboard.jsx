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
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
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

    api.get('/products').then((res) => setProducts(res.data));

    if (role === 'superadmin') {
      fetchUsers();
    }

    if (role === 'user') {
      api.get('/cart').then((res) => {
        setCart(res.data.Products || []);
        const qtyMap = {};
        (res.data.Products || []).forEach(item => {
          qtyMap[item.id] = item.CartItem.quantity;
        });
        setQuantities(qtyMap);
      });
    }
  }, [navigate, role]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
      setAdmins(res.data.filter((u) => u.role === 'admin'));
      setNormalUsers(res.data.filter((u) => u.role === 'user'));
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Delete failed', err);
        alert('Failed to delete product');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/auth/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error('User delete failed', err);
        alert('Failed to delete user');
      }
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/auth/createUser', newUser);
      setNewUser({ username: '', password: '', role: 'user' });
      setShowUserForm(false);
      fetchUsers();
    } catch (err) {
      alert('Failed to create user');
      console.error(err);
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      const res = await api.get('/cart');
      setCart(res.data.Products || []);
    } catch (err) {
      alert('Failed to add to cart');
      console.error(err);
    }
  };

  const updateCartItem = async (productId) => {
    try {
      await api.put('/cart/update', { productId, quantity: quantities[productId] });
      const res = await api.get('/cart');
      setCart(res.data.Products || []);
    } catch (err) {
      alert('Failed to update cart');
      console.error(err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      const res = await api.get('/cart');
      setCart(res.data.Products || []);
    } catch (err) {
      alert('Failed to remove item');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Dashboard ({role})</h2>

      {(role === 'admin' || role === 'superadmin') && !showUserForm && (
        <button style={buttonStyle} onClick={() => navigate('/add-product')}>Add Product</button>
      )}

      {role === 'superadmin' && (
        <button style={buttonStyle} onClick={() => setShowUserForm(!showUserForm)}>
          {showUserForm ? 'Cancel' : 'Create Admin/User'}
        </button>
      )}

      {showUserForm && (
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '0.5rem', marginTop: '1rem' }}>
          <h4>Create New User</h4>
          <input
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            style={inputStyle}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            style={inputStyle}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleCreateUser} style={{ ...buttonStyle, backgroundColor: 'green' }}>Submit</button>
        </div>
      )}

      {!showUserForm && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Products</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {products.map((p) => (
              <li key={p.id} style={productItemStyle}>
                <strong>{p.name}</strong><br />
                Price: ${p.price}<br />
                Stock: {p.stock}<br />
                Description: {p.description}<br />
                Image: <a href={p.imageUrl} target="_blank" rel="noopener noreferrer">View</a><br />
                {(role === 'admin' || role === 'superadmin') && (
                  <button onClick={() => navigate(`/edit-product/${p.id}`)}>Edit</button>
                )}
                {role === 'superadmin' && (
                  <button onClick={() => handleDeleteProduct(p.id)} style={deleteButtonStyle}>
                    Delete
                  </button>
                )}
                {role === 'user' && (
                  <button onClick={() => addToCart(p.id)} style={{ ...buttonStyle, marginTop: '0.5rem' }}>
                    Add to Cart
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {role === 'user' && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Your Cart</h3>
          {Array.isArray(cart) && cart.length > 0 ? (
            <ul>
              {cart.map((item) => (
                <li key={item.id} style={{ marginBottom: '1rem' }}>
                    
                    
                  <strong>{item.name}</strong> – ₹{item.price} 
                  <button onClick={() => removeFromCart(item.id)} style={deleteButtonStyle}>Remove</button>
                  <br />
                  
                  <img src={item.imageUrl} alt={item.name} width="80" /> <br />
                  Quantity:
                  <input
                    type="number"
                    value={quantities[item.id] || item.CartItem.quantity}
                    min="1"
                    onChange={(e) => setQuantities({ ...quantities, [item.id]: parseInt(e.target.value) })}
                    style={{ marginLeft: '0.5rem', width: '60px' }}
                  />
                  <button onClick={() => updateCartItem(item.id)} style={buttonStyle}>Update</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
      )}

      {role === 'superadmin' && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <h3>Registered Admins</h3>
            <ul>
              {admins.map((u) => (
                <li key={u.id}>
                  {u.username} - <strong>{u.role}</strong>
                  <button onClick={() => handleDeleteUser(u.id)} style={deleteButtonStyle}>Delete</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Registered Users</h3>
            <ul>
              {normalUsers.map((u) => (
                <li key={u.id}>
                  {u.username} - <strong>{u.role}</strong>
                  <button onClick={() => handleDeleteUser(u.id)} style={deleteButtonStyle}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  backgroundColor: '#2d72d9',
  color: 'white',
  border: 'none',
  padding: '0.5rem 1rem',
  marginBottom: '1rem',
  cursor: 'pointer',
  borderRadius: '4px',
  marginRight: '10px'
};

const inputStyle = {
  padding: '0.4rem',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

const productItemStyle = {
  border: '1px solid #ddd',
  padding: '1rem',
  borderRadius: '5px',
  marginBottom: '1rem'
};

const deleteButtonStyle = {
  backgroundColor: 'crimson',
  color: 'white',
  border: 'none',
  padding: '0.3rem 0.6rem',
  marginLeft: '0.5rem',
  borderRadius: '4px',
  cursor: 'pointer'
};
