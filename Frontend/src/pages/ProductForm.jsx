import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function ProductForm() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/products`).then(res => {
        const prod = res.data.find(p => p.id == id);
        if (prod) setForm(prod);
      });
    }
  }, [id]);

  const handleSubmit = async () => {
    if (id) await api.put(`/products/${id}`, form);
    else await api.post('/products', form);
    navigate('/dashboard');
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
    </div>
  );
}
