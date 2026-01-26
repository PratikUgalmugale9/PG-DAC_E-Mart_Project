import React from 'react';
import Navbar from '../components/Navbar';
import CategoryBar from '../components/CategoryBar';
import AdBanner from '../components/AdBanner';
import Footer from '../components/Footer';
import styles from '../styles/HomePage.module.css';

const HomePage = () => {
    // Dummy Data for Product Sections (kept from previous version or enhanced)
    const topCategories = [
        { id: 1, name: 'Mobiles', img: 'https://placehold.co/150x150?text=Mobiles' },
        { id: 2, name: 'Fashion', img: 'https://placehold.co/150x150?text=Fashion' },
        { id: 3, name: 'Electronics', img: 'https://placehold.co/150x150?text=Electronics' },
        { id: 4, name: 'Home', img: 'https://placehold.co/150x150?text=Home' },
        { id: 5, name: 'Beauty', img: 'https://placehold.co/150x150?text=Beauty' },
        { id: 6, name: 'Appliances', img: 'https://placehold.co/150x150?text=Appliances' }
    ];

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
            <Navbar />
            <CategoryBar />

            <div className={styles.mainContent}>
                <AdBanner />

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Top Selection</h2>
                        <button className={styles.viewAllBtn}>View All</button>
                    </div>
                    <div className={styles.categoryGrid}>
                        {topCategories.map(cat => (
                            <div key={cat.id} className={styles.categoryCard}>
                                <div className={styles.catImageContainer}>
                                    <img src={cat.img} alt={cat.name} className={styles.catImage} />
                                </div>
                                <div className={styles.catName}>{cat.name}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Featured Products</h2>
                        <button className={styles.viewAllBtn}>View All</button>
                    </div>
                    <div className={styles.productGrid}>
                        {products.map(prod => (
                            <div key={prod.id} className={styles.productCard}>
                                <div className={styles.prodImageContainer}>
                                    <img src={prod.img} alt={prod.name} className={styles.prodImage} />
                                </div>
                                <div className={styles.prodInfo}>
                                    <h3 className={styles.prodName}>{prod.name}</h3>
                                    <div className={styles.prodPrice}>{prod.price}</div>
                                    <button className={styles.addToCartBtn}>Add to Cart</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default HomePage;
