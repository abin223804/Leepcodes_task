import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./pages/Login";
import SuperadminRegistration from "./pages/superadminRegistration.jsx";
import ProductForm from "./pages/ProductForm";
import CartPage from "./pages/CartPage";
import UserList from "./pages/UserList";
import Dashboard from "./pages/Dashboard";
import api from "./utils/api";
import "./index.css";

function AppRoutes() {
    const [loading, setLoading] = useState(true);
    const [superadminExists, setSuperadminExists] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const checkSuperadmin = async () => {
            try {
                const res = await api.get("/auth/superadmin-exists");
                setSuperadminExists(res.data.exists);
            } catch (err) {
                console.error("Error checking superadmin:", err);
                setSuperadminExists(false);
            } finally {
                setLoading(false);
            }
        };
        checkSuperadmin();
    }, []);

    if (loading || superadminExists === null) return <div>Loading...</div>;

    return (
        <Routes>
            {}
            <Route
                path="/"
                element={
                    !superadminExists ? (
                        <Navigate to="/register-superadmin" replace />
                    ) : token ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />

            {}
            <Route
                path="/register-superadmin"
                element={!superadminExists ? <SuperadminRegistration /> : <Navigate to="/login" replace />}
            />

            {}
            <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />

            {}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-product" element={<ProductForm />} />
            <Route path="/edit-product/:id" element={<ProductForm />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/users" element={<UserList />} />

            {}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    </React.StrictMode>
);
