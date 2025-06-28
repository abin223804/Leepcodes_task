import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

export default function ProductForm() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '' });
  const [role, setRole] = useState('');
  const navigate = useNavigate();
useEffect(() => {
  const fetchProductAndRole = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }

    if (id) {
      try {
        const res = await api.get('/products');
        const product = res.data.find(p => p.id == id);
        if (product) setForm(product);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      }
    }
  };

  fetchProductAndRole();
}, [id]);

  const handleSubmit = async () => {
    if (id) await api.put(`/products/${id}`, form);
    else await api.post('/products', form);
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.delete(`/products/${id}`);
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <h2>{id ? 'Edit' : 'Add'} Product</h2>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
      <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
      <button onClick={handleSubmit}>{id ? 'Update' : 'Create'} Product</button>
      {id && role === 'superadmin' && (
        <button onClick={handleDelete} style={{ marginLeft: '1rem', color: 'red' }}>
          Delete Product
        </button>
      )}
    </div>
  );
}
