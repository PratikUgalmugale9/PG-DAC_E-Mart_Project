import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import ScrollToTop from "./components/ScrollToTop";

/* LAYOUT */
import Navbar from './components/Navbar';
import Footer from './components/Footer';

/* PAGES */
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import CartPage from './pages/CartPage';
import BrowseCategory from './pages/BrowseCategory';
import CheckoutAddress from './pages/CheckoutAddress';
import Payment from './pages/CheckoutPayment';

/* CONTEXT */
import { CartProvider } from './context/CartContext';

/* 🔁 Navbar Wrapper */
const NavigationWrapper = () => {
  const navigate = useNavigate();

  return (
    <Navbar
      onCartClick={() => navigate('/cart')}
      onLogoClick={() => navigate('/home')}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <CartProvider>

        {/* ✅ SCROLL RESET ON ROUTE CHANGE */}
        <ScrollToTop />

        <div className="App">

          {/* NAVBAR */}
          <NavigationWrapper />

          {/* ROUTES */}
          <Routes>

            {/* AUTH */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />

            {/* HOME */}
            <Route path="/home" element={<HomePage />} />

            {/* CHECKOUT */}
            <Route path="/checkout/address" element={<CheckoutAddress />} />

            {/* PAYMENT */}
            <Route path="/payment" element={<Payment />} />

            {/* CATEGORY */}
            <Route path="/browse/:catId" element={<BrowseCategory />} />

            {/* CART */}
            <Route path="/cart" element={<CartPage />} />

          </Routes>

          {/* FOOTER */}
          <Footer />

        </div>

      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
