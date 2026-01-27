import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CategoryBar from '../components/CategoryBar';
import AdBanner from '../components/AdBanner';
import styles from '../styles/HomePage.module.css';

const HomePage = () => {

    // 🔥 Categories from backend
    const [categories, setCategories] = useState([]);

    // 🔥 Fetch categories on page load
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

    // 🔹 Dummy products (unchanged)
    const products = [
        { id: 1, name: 'Wireless Headphones', price: '$99.99', img: 'https://placehold.co/200x200?text=Headphones' },
        { id: 2, name: 'Smart Watch', price: '$149.99', img: 'https://placehold.co/200x200?text=Watch' },
        { id: 3, name: 'Running Shoes', price: '$79.99', img: 'https://placehold.co/200x200?text=Shoes' },
        { id: 4, name: 'Laptop Backpack', price: '$45.00', img: 'https://placehold.co/200x200?text=Backpack' },
        { id: 5, name: 'Gaming Mouse', price: '$59.99', img: 'https://placehold.co/200x200?text=Mouse' },
        { id: 6, name: 'Bluetooth Speaker', price: '$39.99', img: 'https://placehold.co/200x200?text=Speaker' }
    ];

    return (
        <div className={styles.pageWrapper}>
            {/* Navbar already handled in App.jsx */}
            <CategoryBar />

            <div className={styles.mainContent}>
                <AdBanner />

                {/* 🔥 TOP CATEGORIES – FROM API */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Top Categories</h2>
                        <button className={styles.viewAllBtn}>View All</button>
                    </div>

                    <div className={styles.categoryGrid}>
                        {categories.map(cat => (
                            <div key={cat.id} className={styles.categoryCard}>
                                <div className={styles.catImageContainer}>
                                    <img
                                        src={cat.catImagePath}   // 🔥 DIRECT FROM DB
                                        alt={cat.catName}
                                        className={styles.catImage}
                                        onError={(e) => {
                                            e.target.src = '/images/default.jpg';
                                        }}
                                    />
                                </div>
                                <div className={styles.catName}>
                                    {cat.catName}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 🔹 FEATURED PRODUCTS – UNCHANGED */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Featured Products</h2>
                        <button className={styles.viewAllBtn}>View All</button>
                    </div>

                    <div className={styles.productGrid}>
                        {products.map(prod => (
                            <div key={prod.id} className={styles.productCard}>
                                <div className={styles.prodImageContainer}>
                                    <img
                                        src={prod.img}
                                        alt={prod.name}
                                        className={styles.prodImage}
                                    />
                                </div>
                                <div className={styles.prodInfo}>
                                    <h3 className={styles.prodName}>{prod.name}</h3>
                                    <div className={styles.prodPrice}>{prod.price}</div>
                                    <button className={styles.addToCartBtn}>
                                        Add to Cart
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
