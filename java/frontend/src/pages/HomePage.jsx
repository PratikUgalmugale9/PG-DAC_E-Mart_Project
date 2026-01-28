import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CategoryBar from '../components/CategoryBar';
import AdBanner from '../components/AdBanner';
import styles from '../styles/HomePage.module.css';
import { useNavigate } from "react-router-dom";
import { useCart } from '../context/CartContext';

const HomePage = () => {

    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();

    const [categories, setCategories] = useState([]);

    // Check if product is in cart
    const isInCart = (productId) => {
        return cartItems.some(item => item.id === productId);
    };

    // Fetch categories on page load
    useEffect(() => {
        axios
            .get('http://localhost:8080/api/catalog/categories')
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }, []);

    // Featured products
    const products = [
        { id: 1, name: 'Wireless Headphones', price: '$99.99', img: '/images/wireless_headphones.png' },
        { id: 2, name: 'Smart Watch', price: '$149.99', img: '/images/smart_watch.png' },
        { id: 3, name: 'Running Shoes', price: '$79.99', img: '/images/running_shoes.png' },
        { id: 4, name: 'Laptop Backpack', price: '$45.00', img: '/images/laptop_backpack.png' },
        { id: 5, name: 'Gaming Mouse', price: '$59.99', img: '/images/gaming_mouse.png' },
        { id: 6, name: 'Bluetooth Speaker', price: '$39.99', img: '/images/bluetooth_speaker.png' }
    ];

    return (
        <div className={styles.pageWrapper}>
            <CategoryBar />

            <div className={styles.mainContent}>
                <AdBanner />

                {/* TOP CATEGORIES */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.headerLeft}>
                            {/* Icon */}
                            <svg className={styles.sectionIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <h2 className={styles.sectionTitle}>Top Categories</h2>
                        </div>
                        <button className={styles.viewAllBtn}>
                            <span>View All</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>

                    <div className={styles.categoryGrid}>
                        {categories
                            .filter(cat => {
                                if (!cat.catImagePath || cat.catImagePath.trim() === '') return false;
                                if (cat.catName === 'Products' || cat.catName === 'Product') return false;
                                if (cat.catImagePath.includes('placeholder') ||
                                    cat.catImagePath.includes('default.jpg')) return false;
                                return true;
                            })
                            .map(cat => (
                                <div
                                    key={cat.id}
                                    className={styles.categoryCard}
                                    onClick={() => navigate(`/browse/${cat.catId}`)}
                                >
                                    <div className={styles.catImageContainer}>
                                        <img
                                            src={cat.catImagePath}
                                            alt={cat.catName}
                                            className={styles.catImage}
                                            onError={(e) => {
                                                e.target.src = '/images/default.jpg';
                                            }}
                                        />
                                        <div className={styles.categoryOverlay}>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className={styles.catName}>
                                        <span>{cat.catName}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>

                {/* FEATURED PRODUCTS */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.headerLeft}>
                            {/* Star Icon */}
                            <svg className={styles.sectionIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <h2 className={styles.sectionTitle}>Featured Products</h2>
                        </div>
                        <button className={styles.viewAllBtn}>
                            <span>View All</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>

                    <div className={styles.productGrid}>
                        {products.map(prod => (
                            <div key={prod.id} className={styles.productCard}>
                                {/* Wishlist Badge */}
                                <button className={styles.wishlistBtn}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>

                                <div className={styles.prodImageContainer}>
                                    <img
                                        src={prod.img}
                                        alt={prod.name}
                                        className={styles.prodImage}
                                    />
                                </div>
                                <div className={styles.prodInfo}>
                                    <h3 className={styles.prodName}>{prod.name}</h3>
                                    <div className={styles.prodPriceRow}>
                                        <div className={styles.prodPrice}>{prod.price}</div>
                                        {/* Rating */}
                                        <div className={styles.rating}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                            </svg>
                                            <span>4.5</span>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.addToCartBtn}
                                        onClick={() => addToCart({
                                            id: prod.id,
                                            name: prod.name,
                                            price: parseFloat(prod.price.replace('$', '')),
                                            image: prod.img,
                                            quantity: 1
                                        })}
                                        disabled={isInCart(prod.id)}
                                    >
                                        {isInCart(prod.id) ? (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>Added to Cart</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="9" cy="21" r="1"></circle>
                                                    <circle cx="20" cy="21" r="1"></circle>
                                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                                </svg>
                                                <span>Add to Cart</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default HomePage;
