import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.brandSection}>
                    <h2>eMart</h2>
                    <p>Your one-stop shop for everything you need. Quality products, best prices, and widely trusted service.</p>
                </div>

                <div className={styles.column}>
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Electronics</a></li>
                        <li><a href="#">Fashion</a></li>
                        <li><a href="#">Grocery</a></li>
                        <li><a href="#">Offers</a></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h3>Customer Service</h3>
                    <ul>
                        <li><a href="#">Help & FAQ</a></li>
                        <li><a href="#">Returns & Refunds</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms & Conditions</a></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h3>Follow Us</h3>
                    <div className={styles.socialIcons}>
                        <div className={styles.socialIcon}>F</div>
                        <div className={styles.socialIcon}>T</div>
                        <div className={styles.socialIcon}>I</div>
                        <div className={styles.socialIcon}>L</div>
                    </div>
                </div>
            </div>

            <div className={styles.copyright}>
                &copy; 2026 eMart. All Rights Reserved.
            </div>
        </footer>
    );
};

export default Footer;
