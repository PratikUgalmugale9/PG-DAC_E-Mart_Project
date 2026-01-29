import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // ===============================
    // AUTH HEADER
    // ===============================
    const getAuthHeader = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // ===============================
    // REFRESH CART FROM BACKEND
    // ===============================
    const refreshCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCartItems([]);
            return;
        }

        try {
            setLoading(true);

            const res = await axios.get(
                "http://localhost:8080/api/cartitem/my",
                { headers: getAuthHeader() }
            );

            const mapped = res.data.map(item => ({
                id: item.productId,
                cartItemId: item.cartItemId,
                name: item.productName,
                price: item.cardholderPrice,
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

    // ===============================
    // CLEAR CART (🔥 MISSING PIECE)
    // ===============================
    const clearCart = () => {
        setCartItems([]);
    };

    // ===============================
    // INIT LOAD
    // ===============================
    useEffect(() => {
        refreshCart();
    }, []);

    // ===============================
    // ADD TO CART
    // ===============================
    const addToCart = async (product) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to add items to cart");
            return;
        }

        try {
            await axios.post(
                "http://localhost:8080/api/cartitem/add",
                { productId: product.id, quantity: 1 },
                { headers: getAuthHeader() }
            );

            refreshCart();
        } catch (err) {
            console.error("❌ Error adding to cart:", err);
            alert("Failed to add to cart");
        }
    };

    // ===============================
    // UPDATE QUANTITY
    // ===============================
    const updateQuantity = async (productId, delta) => {
        const item = cartItems.find(i => i.id === productId);
        if (!item || !item.cartItemId) return;

        try {
            await axios.put(
                `http://localhost:8080/api/cartitem/update/${item.cartItemId}`,
                {
                    productId: item.id,
                    quantity: Math.max(1, item.quantity + delta)
                },
                { headers: getAuthHeader() }
            );

            refreshCart();
        } catch (err) {
            console.error("❌ Error updating quantity:", err);
        }
    };

    // ===============================
    // REMOVE ITEM
    // ===============================
    const removeFromCart = async (productId) => {
        const item = cartItems.find(i => i.id === productId);
        if (!item || !item.cartItemId) return;

        try {
            await axios.delete(
                `http://localhost:8080/api/cartitem/delete/${item.cartItemId}`,
                { headers: getAuthHeader() }
            );

            refreshCart();
        } catch (err) {
            console.error("❌ Error removing from cart:", err);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                loading,
                addToCart,
                updateQuantity,
                removeFromCart,
                refreshCart,
                clearCart   // ✅ EXPOSE THIS
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// ===============================
// HOOK
// ===============================
export const useCart = () => useContext(CartContext);
