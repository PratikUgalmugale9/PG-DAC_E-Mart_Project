import React from 'react';
import AdBanner from '../components/AdBanner';
import styles from '../styles/HomePage.module.css';
import Header from '../components/Header';
import styles from '../styles//HomePage.module.css';

const HomePage = () => {
    const categories = [
        { id: 1, name: 'Electronics', img: 'https://placehold.co/300x200?text=Electronics' },
        { id: 2, name: 'Fashion', img: 'https://placehold.co/300x200?text=Fashion' },
        { id: 3, name: 'Home & Living', img: 'https://placehold.co/300x200?text=Home' },
        { id: 4, name: 'Beauty', img: 'https://placehold.co/300x200?text=Beauty' }
    ];

    const products = [
        { id: 1, name: 'Wireless Headphones', price: '$99.99', img: 'https://placehold.co/300x300?text=Headphones' },
        { id: 2, name: 'Smart Watch', price: '$149.99', img: 'https://placehold.co/300x300?text=Watch' },
        { id: 3, name: 'Running Shoes', price: '$79.99', img: 'https://placehold.co/300x300?text=Shoes' },
        { id: 4, name: 'Laptop Backpack', price: '$45.00', img: 'https://placehold.co/300x300?text=Backpack' },
        { id: 5, name: 'Gaming Mouse', price: '$59.99', img: 'https://placehold.co/300x300?text=Mouse' }
    ];

    return (
        <div>
            <AdBanner />

            <div className={styles.homeContainer}>
                {/* Categories Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Top Categories</h2>
                    <div className={styles.categoryGrid}>
                        {categories.map(cat => (
                            <div key={cat.id} className={styles.categoryCard}>
                                <div className={styles.catImageContainer}>
                                    <img src={cat.img} alt={cat.name} className={styles.catImage} />
                                </div>
                                <div className={styles.catName}>{cat.name}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Featured Products Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Featured Products</h2>
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
        </div>
    );
};

export default HomePage;
