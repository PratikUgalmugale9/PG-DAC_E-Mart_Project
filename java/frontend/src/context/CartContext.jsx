import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
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
            setCartId(null);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get("http://localhost:8080/api/cartitem/my", {
                headers: getAuthHeader()
            });

            // Extract cartId from the first item if exists
            if (res.data && res.data.length > 0) {
                setCartId(res.data[0].cartId);
            } else {
                // If cart is empty, we might still want to fetch the cart ID 
                // but for now, we'll rely on the proactive creation ensuring 
                // that at least one fetch happens successfully or use a dedicated endpoint
                try {
                    const cartRes = await axios.get("http://localhost:8080/api/cart/my", {
                        headers: getAuthHeader()
                    });
                    setCartId(cartRes.data.id);
                } catch (e) {
                    console.warn("Could not fetch empty cart ID:", e);
                }
            }

            // Map backend DTO to frontend format
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
            cartId,
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
