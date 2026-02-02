import React from 'react';
import styles from '../styles/Footer.module.css';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                {/* <div className={styles.newsletter}>
                    <div className={styles.newsletterText}>
                        <h3>Join our newsletter</h3>
                        <p>Subscribe to get special offers and once-in-a-lifetime deals.</p>
                    </div>
                    <div className={styles.subscriberBox}>
                        <input type="email" placeholder="Enter your email" />
                        <button><FiSend /></button>
                    </div>
                </div> */}

                <div className={styles.footerMain}>
                    <div className={styles.brandInfo}>
                        <div className={styles.logo}>e<span>Mart</span></div>
                        <p className={styles.description}>
                            Premium shopping experience with a focus on quality and customer satisfaction. Explore our wide range of categories.
                        </p>
                        <div className={styles.socialLinks}>
                            <a href="#" className={styles.socialIcon}><FiFacebook /></a>
                            <a href="#" className={styles.socialIcon}><FiTwitter /></a>
                            <a href="#" className={styles.socialIcon}><FiInstagram /></a>
                            <a href="#" className={styles.socialIcon}><FiLinkedin /></a>
                        </div>
                    </div>

                    <div className={styles.linksGrid}>
                        <div className={styles.linkColumn}>
                            <h4>Shop</h4>
                            <a href="/browse/C001">Electronics</a>
                            <a href="/browse/C002">Fashion</a>
                            <a href="/browse/C003">Home & Appliances</a>
                            <a href="/browse/C005">Sports</a>
                        </div>
                        <div className={styles.linkColumn}>
                            <h4>Support</h4>
                            <a href="#">Help Center</a>
                            <a href="#">Track Order</a>
                            <a href="#">Returns</a>
                            <a href="#">Shipping Info</a>
                        </div>
                        <div className={styles.linkColumn}>
                            <h4>Company</h4>
                            <a href="#">About Us</a>
                            <a href="#">Careers</a>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                        <div className={styles.linkColumn}>
                            <h4>Contact</h4>
                            <div className={styles.contactItem}><FiMapPin /> 123 Street, City, Country</div>
                            <div className={styles.contactItem}><FiPhone /> +1 234 567 890</div>
                            <div className={styles.contactItem}><FiMail /> support@emart.com</div>
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p>&copy; 2026 eMart. Designed for excellence.</p>
                    <div className={styles.footerBottomLinks}>
                        <a href="#">Sitemap</a>
                        <a href="#">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;