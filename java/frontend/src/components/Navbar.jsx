import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Navbar.module.css";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

import { useTranslation } from "react-i18next"; // ✅ i18n import

const Navbar = ({ onCartClick, onLogoClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();

  // ✅ i18n hook
  const { t, i18n } = useTranslation();

  // Check login status
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);

    return () => window.removeEventListener("storage", checkLogin);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/login");
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.navContainer}>
        
        {/* Logo */}
        <div className={styles.logo} onClick={onLogoClick}>
          e<span>Mart</span>
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t("searchPlaceholder")} // ✅ translated
            className={styles.searchInput}
          />
        </div>

        {/* Language Switch */}
        <div className={styles.langSwitcher}>
          <button onClick={() => i18n.changeLanguage("en")}>EN</button>
          <button onClick={() => i18n.changeLanguage("hi")}>HI</button>
        </div>

        {/* Mobile Menu */}
        <div
          className={styles.hamburger}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </div>

        {/* Nav Links */}
        <div
          className={`${styles.navLinks} ${
            isMobileMenuOpen ? styles.active : ""
          }`}
        >
          {/* Cart Button */}
          <button
            className={styles.navItem}
            onClick={() => {
              const token = localStorage.getItem("token");

              if (!token) {
                alert(t("cartLoginAlert")); // ✅ translated alert
                navigate("/login", {
                  state: { from: "/cart" },
                });
                return;
              }

              onCartClick();
            }}
          >
            <div className={styles.iconWrapper}>
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </div>
            <span className={styles.navText}>{t("cart")}</span>
          </button>

          {/* Profile/Login */}
          {isLoggedIn ? (
            <div className={styles.profileContainer} ref={dropdownRef}>
              <button
                className={styles.profileBtn}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FiUser />
                <span className={styles.navText}>{t("profile")}</span>
                <FiChevronDown
                  className={`${styles.chevron} ${
                    showDropdown ? styles.open : ""
                  }`}
                />
              </button>

              <div
                className={`${styles.dropdownMenu} ${
                  showDropdown ? styles.show : ""
                }`}
              >
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/profile");
                  }}
                >
                  <FiUser /> {t("myProfile")}
                </button>

                <div className={styles.divider}></div>

                <button
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={handleLogout}
                >
                  <FiLogOut /> {t("logout")}
                </button>
              </div>
            </div>
          ) : (
            <button
              className={styles.loginBtn}
              onClick={() => navigate("/login")}
            >
              {t("login")}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
