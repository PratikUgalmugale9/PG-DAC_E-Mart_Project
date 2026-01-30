import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import CartPage from './pages/CartPage';
import BrowseCategory from './pages/BrowseCategory';
import CheckoutAddress from './pages/CheckoutAddress';
import Payment from './pages/Payment'; // 🔥 NEW IMPORT
import ProfilePage from './pages/ProfilePage';
import ProductDetails from './pages/ProductDetails';

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
          <ScrollToTop />
          <NavigationWrapper />

          <div className="main-layout">
            <Routes>
              {/* AUTH */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />

              {/* HOME */}
              <Route path="/home" element={<HomePage />} />

              {/* checkoutaddress */}
              <Route path="/checkout/address" element={<CheckoutAddress />} />

              {/* PAYMENT 🔥 NEW ROUTE */}
              <Route path="/payment" element={<Payment />} />


              {/* CATEGORY BROWSE */}
              <Route path="/browse/:catId" element={<BrowseCategory />} />

              {/* PRODUCT DETAILS */}
              <Route path="/product/:id" element={<ProductDetails />} />

              {/* PROFILE */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* CART */}
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </div>

          <Footer />

        </BrowserRouter>
      </div>
    </CartProvider>
  );
}

export default App;
