import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ FETCH CART FROM DB
  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/api/cartitem/my');
      // Backend returns: cartItemId, productId, productName, quantity, priceSnapshot, totalPrice
      // Frontend expects: id (productId), name, price, image, quantity
      // Wait, we need the cartItemId for updates/deletes. 
      // Let's store both.
      const formattedItems = response.data.map(item => ({
        id: item.productId,
        cartItemId: item.cartItemId,
        name: item.productName,
        price: item.priceSnapshot,
        quantity: item.quantity,
        // image is missing from response, but we might need it for UI.
        // The BrowseCategory provides it. If we fetch from DB, we might need a better backend response or a default.
        image: `/images/products/${item.productId}.jpg` // Fallback
      }));
      setCartItems(formattedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ ADD TO CART
  const addToCart = async (product) => {
    try {
      const response = await api.post('/api/cartitem/add', {
        productId: product.id,
        quantity: 1
      });

      // Re-fetch to get the updated list from DB (simplest way to sync)
      await fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Please login to add items to cart");
      }
    }
  };

  // ✅ UPDATE QUANTITY
  const updateQuantity = async (productId, delta) => {
    const item = cartItems.find(i => i.id === productId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);

    try {
      await api.put(`/api/cartitem/update/${item.cartItemId}`, {
        quantity: newQuantity
      });

      setCartItems(prev =>
        prev.map(i =>
          i.id === productId
            ? { ...i, quantity: newQuantity }
            : i
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // ✅ REMOVE ITEM
  const removeFromCart = async (productId) => {
    const item = cartItems.find(i => i.id === productId);
    if (!item) return;

    try {
      await api.delete(`/api/cartitem/delete/${item.cartItemId}`);
      setCartItems(prev => prev.filter(i => i.id !== productId));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => useContext(CartContext);
