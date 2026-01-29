import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import CartPage from './pages/CartPage';
import BrowseCategory from './pages/BrowseCategory';
import CheckoutAddress from './pages/CheckoutAddress';

// 🔥 CART CONTEXT
import { CartProvider } from './context/CartContext';

// Wrapper component to provide navigation capability to Navbar
const NavigationWrapper = () => {
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  return (
    <Navbar
      onCartClick={handleCartClick}
      onLogoClick={handleLogoClick}
    />
  );
};

function App() {
  return (
    <CartProvider>   {/* 🔥 GLOBAL CART STATE */}
      <div className="App">
        <BrowserRouter>

          <NavigationWrapper />

          <Routes>
            {/* AUTH */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />

            {/* HOME */}
            <Route path="/home" element={<HomePage />} />

            {/* checkoutaddress */}
            <Route path="/checkout/address" element={<CheckoutAddress />} />


            {/* CATEGORY BROWSE */}
            <Route path="/browse/:catId" element={<BrowseCategory />} />

            {/* CART */}
            <Route path="/cart" element={<CartPage />} />
          </Routes>

          <Footer />

        </BrowserRouter>
      </div>
    </CartProvider>
  );
}

export default App;
