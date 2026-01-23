import React, { useState } from 'react';
import styles from './Navbar.module.css';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock login state

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                e<span className={styles.highlight}>Mart</span>
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search for products, brands and more..."
                    className={styles.searchInput}
                />
                <button className={styles.searchBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>

            <div className={styles.hamburger} onClick={toggleMenu}>
                <span className={styles.line}></span>
                <span className={styles.line}></span>
                <span className={styles.line}></span>
            </div>

            <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.active : ''}`}>
                <a href="#" className={styles.navItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Cart
                </a>

                {isLoggedIn && (
                    <a href="#" className={styles.navItem}>Products</a>
                )}

                <button
                    className={styles.loginBtn}
                    onClick={() => setIsLoggedIn(!isLoggedIn)}
                >
                    {isLoggedIn ? 'Profile' : 'Login'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
