import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CategoryBar from '../components/CategoryBar';
import AdBanner from '../components/AdBanner';
import ProductCard from '../components/ProductCard';
import styles from '../styles/HomePage.module.css';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const HomePage = () => {

    const { t ,i18n} = useTranslation();

    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
                            <h2 className={styles.sectionTitle}>{t("homepage.topCategories")}</h2>
                        </div>
                        <button className={styles.viewAllBtn}>
                            <span>{t("homepage.viewAll")}</span>
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
                            <h2 className={styles.sectionTitle}>{t("homepage.featuredProducts")}</h2>
                        </div>
                        <button className={styles.viewAllBtn} onClick={() => navigate('/browse/C101')}>
                            <span>{t("homepage.viewAll")}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>

                    <div className={styles.productGrid}>
                        {loading ? (
                            <p>{t("homepage.loadingFeaturedProducts")}</p>
                        ) : (
                            featuredProducts.map(prod => (
                                <ProductCard key={prod.id} product={prod} />
                            ))
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default HomePage;
