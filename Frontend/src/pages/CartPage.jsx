import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function CartPage() {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    api.get('/cart').then(res => setCart(res.data));
  }, []);

  const remove = async (productId) => {
    await api.delete(`/cart/remove/${productId}`);
    const updated = { ...cart };
    updated.Products = updated.Products.filter(p => p.CartItem.ProductId !== productId);
    setCart(updated);
  };

  if (!cart) return <div>Loading cart...</div>;
  return (
    <div>
      <h2>Your Cart</h2>
      {cart.Products?.map(p => (
        <div key={p.id}>
          {p.name} - Quantity: {p.CartItem.quantity}
          <button onClick={() => remove(p.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}