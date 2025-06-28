// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import App from './App';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import ProductForm from './pages/ProductForm';
// import CartPage from './pages/CartPage';
// import UserList from './pages/UserList';
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/dashboard" element={<App />}/>
//         <Route path="/add-product" element={<ProductForm />} />
//         <Route path="/edit-product/:id" element={<ProductForm />} />
//         <Route path="/cart" element={<CartPage />} />
//         <Route path="/users" element={<UserList />} />
//       </Routes>
//     </BrowserRouter>
//   </React.StrictMode>
// );


import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import App from './App';
import ProductForm from './pages/ProductForm';
import CartPage from './pages/CartPage';
import UserList from './pages/UserList';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/add-product" element={<ProductForm />} />
        <Route path="/edit-product/:id" element={<ProductForm />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/users" element={<UserList />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
