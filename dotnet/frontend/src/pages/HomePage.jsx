import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CategoryBar from '../components/CategoryBar';
import AdBanner from '../components/AdBanner';
import styles from '../styles/HomePage.module.css';
import { useNavigate } from "react-router-dom";
import { useCart } from '../context/CartContext';

const HomePage = () => {

    const navigate = useNavigate();
    const { addToCart, removeFromCart, cartItems } = useCart();

    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check if product is in cart
    const isInCart = (productId) => {
        return cartItems.some(item => item.id === productId);
    };

    // Fetch data on page load
    useEffect(() => {
        setLoading(true);

        // Fetch Categories
        const fetchCategories = axios.get('http://localhost:8080/api/catalog/categories');

        // Fetch All Products (for featured section)
        const fetchProducts = axios.get('http://localhost:8080/api/Products');

        Promise.all([fetchCategories, fetchProducts])
            .then(([resCat, resProd]) => {
                setCategories(resCat.data);

                // Randomly select 6-8 products for "Featured" section
                const allProds = resProd.data;
                const shuffled = [...allProds].sort(() => 0.5 - Math.random());
                setFeaturedProducts(shuffled.slice(0, 8));

                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching homepage data:', error);
                setLoading(false);
            });
    }, []);

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
                        <button className={styles.viewAllBtn} onClick={() => navigate('/browse/C101')}>
                            <span>View All</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>

                    <div className={styles.productGrid}>
                        {loading ? (
                            <p>Loading featured products...</p>
                        ) : (
                            featuredProducts.map(prod => (
                                <div key={prod.id} className={styles.productCard}>
                                    <button className={styles.wishlistBtn}>
                                        <svg className={styles.wishlistIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                    </button>

                                    <div
                                        className={styles.prodImageContainer}
                                        onClick={() => navigate(`/product/${prod.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={`${prod.prodImagePath}`}
                                            alt={prod.prodName}
                                            className={styles.prodImage}
                                            onError={(e) => e.target.src = '/images/default.jpg'}
                                        />
                                    </div>
                                    <div className={styles.prodInfo}>
                                        <h3
                                            className={styles.prodName}
                                            onClick={() => navigate(`/product/${prod.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >{prod.prodName}</h3>
                                        <div className={styles.prodPriceRow}>
                                            <div className={styles.prodPrice}>₹{prod.cardholderPrice}</div>
                                            {/* Rating Placeholder */}
                                            <div className={styles.rating}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                </svg>
                                                <span>4.8</span>
                                            </div>
                                        </div>

                                        {/* 🔥 ADD TO CART */}
                                        <button
                                            className={styles.addToCartBtn}
                                            onClick={() => {
                                                if (isInCart(prod.id)) {
                                                    removeFromCart(prod.id);
                                                } else {
                                                    addToCart({
                                                        id: prod.id,
                                                        name: prod.prodName,
                                                        price: prod.cardholderPrice,
                                                        mrpPrice: prod.mrpPrice,
                                                        cardholderPrice: prod.cardholderPrice,
                                                        pointsToBeRedeem: prod.pointsToBeRedeem,
                                                        image: `/${prod.prodImagePath}`,
                                                        quantity: 1
                                                    });
                                                }
                                            }}
                                            style={{
                                                background: isInCart(prod.id) ? '#22c55e' : '',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {isInCart(prod.id) ? 'Added' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default HomePage;
