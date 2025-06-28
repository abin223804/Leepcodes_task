// // // import React from 'react';
// // // import ReactDOM from 'react-dom/client';
// // // import { BrowserRouter, Routes, Route } from 'react-router-dom';
// // // import App from './App';
// // // import Login from './pages/Login';
// // // import Dashboard from './pages/Dashboard';
// // // import ProductForm from './pages/ProductForm';
// // // import CartPage from './pages/CartPage';
// // // import UserList from './pages/UserList';
// // // import './index.css';

// // // ReactDOM.createRoot(document.getElementById('root')).render(
// // //   <React.StrictMode>
// // //     <BrowserRouter>
// // //       <Routes>
// // //         <Route path="/" element={<Login />} />
// // //         <Route path="/dashboard" element={<App />}/>
// // //         <Route path="/add-product" element={<ProductForm />} />
// // //         <Route path="/edit-product/:id" element={<ProductForm />} />
// // //         <Route path="/cart" element={<CartPage />} />
// // //         <Route path="/users" element={<UserList />} />
// // //       </Routes>
// // //     </BrowserRouter>
// // //   </React.StrictMode>
// // // );


// // import React from 'react';
// // import ReactDOM from 'react-dom/client';
// // import { BrowserRouter, Routes, Route } from 'react-router-dom';
// // import Login from './pages/Login';
// // import App from './App';
// // import ProductForm from './pages/ProductForm';
// // import CartPage from './pages/CartPage';
// // import UserList from './pages/UserList';

// // ReactDOM.createRoot(document.getElementById('root')).render(
// //   <React.StrictMode>
// //     <BrowserRouter>
// //       <Routes>
// //         <Route path="/" element={<Login />} />
// //         <Route path="/dashboard" element={<App />} />
// //         <Route path="/add-product" element={<ProductForm />} />
// //         <Route path="/edit-product/:id" element={<ProductForm />} />
// //         <Route path="/cart" element={<CartPage />} />
// //         <Route path="/users" element={<UserList />} />
// //       </Routes>
// //     </BrowserRouter>
// //   </React.StrictMode>
// // );

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import App from './App';
// import Login from './pages/Login';
// import RegisterSuperadmin from './pages/RegisterSuperadmin';
// import Dashboard from './pages/Dashboard';
// import ProductForm from './pages/ProductForm';
// import CartPage from './pages/CartPage';
// import UserList from './pages/UserList';
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<RegisterSuperadmin />} />
//         <Route path="/register-superadmin" element={<RegisterSuperadmin />} />
//         <Route path="/dashboard" element={<App />}/>
//         <Route path="/add-product" element={<ProductForm />} />
//         <Route path="/edit-product/:id" element={<ProductForm />} />
//         <Route path="/cart" element={<CartPage />} />
//         <Route path="/users" element={<UserList />} />
//       </Routes>
//     </BrowserRouter>
//   </React.StrictMode>
// );
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import RegisterSuperadmin from './pages/RegisterSuperadmin';
import ProductForm from './pages/ProductForm';
import CartPage from './pages/CartPage';
import UserList from './pages/UserList';
import Dashboard from './pages/Dashboard';
import api from './utils/api';
import './index.css';

function Root() {
  const [loading, setLoading] = useState(true);
  const [superadminExists, setSuperadminExists] = useState(false);

  useEffect(() => {
    api.get('/auth/superadmin-exists').then((res) => {
      setSuperadminExists(res.data.exists);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={
        superadminExists ? <Navigate to="/login" /> : <RegisterSuperadmin />
      } />
      <Route path="/register-superadmin" element={<RegisterSuperadmin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-product" element={<ProductForm />} />
      <Route path="/edit-product/:id" element={<ProductForm />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/users" element={<UserList />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);