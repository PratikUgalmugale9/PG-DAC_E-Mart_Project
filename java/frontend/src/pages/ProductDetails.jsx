import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import styles from './ProductDetails.module.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, removeFromCart, cartItems } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Calculate if the product is currently in the cart
    // Using loose equality for ID check to be safe (string vs number)
    const isInCart = product && cartItems.some(item => item.id == product.id);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleCartToggle = () => {
        if (!product) return;

        if (isInCart) {
            removeFromCart(product.id);
        } else {
            addToCart({
                id: product.id,
                name: product.prodName,
                price: product.cardholderPrice,
                mrpPrice: product.mrpPrice,
                cardholderPrice: product.cardholderPrice,
                pointsToBeRedeem: product.pointsToBeRedeem,
                image: `/${product.prodImagePath}`,
                quantity: 1
            });
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!product) {
        return (
            <div className={styles.loading}>
                <h2>Product not found</h2>
                <button className={styles.goBackBtn} onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    // Extract valid data from entity fields (Product.java)
    const mrp = Number(product.mrpPrice) || 0;
    const cardPrice = Number(product.cardholderPrice) || 0;
    const points = product.pointsToBeRedeem || 0;

    // Choose the best description available
    const description = product.prodLongDesc || product.prodShortDesc || 'Experience premium quality with this exceptional product.';

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>

                {/* Left Side - Image */}
                <div className={styles.imageSection}>
                    <img
                        src={`/${product.prodImagePath}`}
                        alt={product.prodName}
                        className={styles.productImage}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default.jpg';
                        }}
                    />
                </div>

                {/* Right Side - Details */}
                <div className={styles.detailsSection}>
                    <div className={styles.brand}>Premium Brand</div>
                    <h1 className={styles.title}>{product.prodName}</h1>
                    <p className={styles.description}>{description}</p>

                    <div className={styles.pricingCard}>
                        <div className={styles.priceRow}>
                            <span className={styles.mrpLabel}>Type</span>
                            <span className={styles.mrpLabel} style={{ color: '#333' }}>General</span>
                        </div>

                        <div className={styles.priceRow}>
                            <span className={styles.mrpLabel}>MRP</span>
                            <span className={styles.mrpPrice}>₹{mrp.toFixed(2)}</span>
                        </div>

                        <div className={styles.cardholderRow}>
                            <div className={styles.cardholderLabel}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                                Cardholder Price
                            </div>
                            <span className={styles.cardholderPrice}>₹{cardPrice.toFixed(2)}</span>
                        </div>

                        {points > 0 && (
                            <div className={styles.pointsInfo}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none"></path>
                                </svg>
                                Redeem using {points} e-Points
                            </div>
                        )}
                    </div>

                    <div className={styles.actionButtons}>
                        <button
                            className={`${styles.addToCartBtn} ${isInCart ? styles.addedBtn : ''}`}
                            onClick={handleCartToggle}
                            style={{
                                background: isInCart ? '#22c55e' : '',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isInCart ? (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Added
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                        </button>

                        <button className={styles.goBackBtn} onClick={() => navigate(-1)}>
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
