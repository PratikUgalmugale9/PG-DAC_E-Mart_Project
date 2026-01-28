import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Navbar.module.css';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

const Navbar = ({ onCartClick, onLogoClick }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems } = useCart();

    // Check login status
    useEffect(() => {
        const checkLogin = () => {
            const user = localStorage.getItem('user');
            setIsLoggedIn(!!user);
        };

        checkLogin();
        window.addEventListener('storage', checkLogin);
        return () => window.removeEventListener('storage', checkLogin);
    }, [location]);

    // Handle scroll for glassmorphism effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setShowDropdown(false);
        navigate('/login');
    };

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.navContainer}>
                <div className={styles.logo} onClick={onLogoClick}>
                    e<span>Mart</span>
                </div>

                <div className={styles.searchContainer}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.hamburger} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                </div>

                <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.active : ''}`}>
                    <button className={styles.navItem} onClick={onCartClick}>
                        <div className={styles.iconWrapper}>
                            <FiShoppingCart />
                            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                        </div>
                        <span className={styles.navText}>Cart</span>
                    </button>

                    {isLoggedIn ? (
                        <div className={styles.profileContainer} ref={dropdownRef}>
                            <button
                                className={styles.profileBtn}
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <FiUser />
                                <span className={styles.navText}>Profile</span>
                                <FiChevronDown className={`${styles.chevron} ${showDropdown ? styles.open : ''}`} />
                            </button>

                            <div className={`${styles.dropdownMenu} ${showDropdown ? styles.show : ''}`}>
                                <button className={styles.dropdownItem} onClick={() => { setShowDropdown(false); navigate('/profile'); }}>
                                    <FiUser /> My Profile
                                </button>
                                <div className={styles.divider}></div>
                                <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                                    <FiLogOut /> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button className={styles.loginBtn} onClick={() => navigate('/login')}>
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
