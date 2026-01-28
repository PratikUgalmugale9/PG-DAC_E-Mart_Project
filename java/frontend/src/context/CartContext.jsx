import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper for API header
    const getAuthHeader = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // ✅ REFRESH FROM DB
    const refreshCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCartItems([]);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get("http://localhost:8080/api/cartitem/my", {
                headers: getAuthHeader()
            });

            // Map backend DTO to frontend format
            const mapped = res.data.map(item => ({
                id: item.productId,
                cartItemId: item.cartItemId, // 🛠️ Critical for update/delete
                name: item.productName,
                price: item.cardholderPrice, // Use cardholder price as primary
                mrpPrice: item.mrpPrice,
                cardholderPrice: item.cardholderPrice,
                pointsToBeRedeem: item.pointsToBeRedeem,
                image: `/${item.prodImagePath}`,
                quantity: item.quantity
            }));

            setCartItems(mapped);
        } catch (err) {
            console.error("❌ Error refreshing cart:", err);
        } finally {
            setLoading(false);
        }
    };

    // Trigger on mount
    useEffect(() => {
        refreshCart();
    }, []);

    // ✅ ADD TO CART
    const addToCart = async (product) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to add items to cart");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/cartitem/add", {
                productId: product.id,
                quantity: 1
            }, {
                headers: getAuthHeader()
            });
            refreshCart(); // Get fresh data
        } catch (err) {
            console.error("❌ Error adding to cart:", err);
            alert("Failed to add to cart");
        }
    };

    // ✅ UPDATE QUANTITY
    const updateQuantity = async (productId, delta) => {
        const item = cartItems.find(i => i.id === productId);
        if (!item || !item.cartItemId) return;

        try {
            await axios.put(`http://localhost:8080/api/cartitem/update/${item.cartItemId}`, {
                productId: item.id,
                quantity: Math.max(1, item.quantity + delta)
            }, {
                headers: getAuthHeader()
            });
            refreshCart();
        } catch (err) {
            console.error("❌ Error updating quantity:", err);
        }
    };

    // ✅ REMOVE ITEM
    const removeFromCart = async (productId) => {
        const item = cartItems.find(i => i.id === productId);
        if (!item || !item.cartItemId) return;

        try {
            await axios.delete(`http://localhost:8080/api/cartitem/delete/${item.cartItemId}`, {
                headers: getAuthHeader()
            });
            refreshCart();
        } catch (err) {
            console.error("❌ Error removing from cart:", err);
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            loading,
            addToCart,
            updateQuantity,
            removeFromCart,
            refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook
export const useCart = () => useContext(CartContext);
