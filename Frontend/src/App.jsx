import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './utils/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => navigate('/add-product')}>Add Product</button>
      <ul>
        {products.map((p) => (
          <li key={p.id}>{p.name} - ${p.price} <button onClick={() => navigate(`/edit-product/${p.id}`)}>Edit</button></li>
        ))}
      </ul>
    </div>
  );
}
