import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import styles from './ProductDetails.module.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, removeFromCart, cartItems, totalPointsUsed } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Loyalty card state
    const [loyaltyCard, setLoyaltyCard] = useState(null);
    const [isLoyaltyUser, setIsLoyaltyUser] = useState(false);
    
    // Pricing selection state - checkbox for opt-in (default: unchecked = MRP)
    const [useLoyaltyBenefit, setUseLoyaltyBenefit] = useState(false);

    // Calculate if the product is currently in the cart
    const isInCart = product && cartItems.some(item => item.id == product.id);

    // ===============================
    // FETCH PRODUCT
    // ===============================
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/Products/${id}`);
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

    // ===============================
    // FETCH LOYALTY CARD
    // ===============================
    useEffect(() => {
        const fetchLoyaltyCard = async () => {
            try {
                const token = localStorage.getItem("token");
                const userJson = localStorage.getItem("user");
                
                if (!token || !userJson) {
                    setIsLoyaltyUser(false);
                    return;
                }

                const user = JSON.parse(userJson);
                const userId = user.id || user.userId;

                const response = await axios.get(
                    `http://localhost:8080/api/LoyaltyCard/user/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        validateStatus: (status) => status < 500
                    }
                );

                if (response.status === 200 && response.data) {
                    const card = response.data;
                    const isActive = card.isActive === 'Y' || card.isActive === 'y';
                    setLoyaltyCard(card);
                    setIsLoyaltyUser(isActive);
                }
            } catch (error) {
                console.error("Error fetching loyalty card:", error);
                setIsLoyaltyUser(false);
            }
        };

        fetchLoyaltyCard();
    }, []);

    // ===============================
    // DETERMINE PRICING CASE
    // ===============================
    const hasCardholderPrice = product?.cardholderPrice != null;
    const hasPoints = (product?.pointsToBeRedeem || 0) > 0;
    const mrp = Number(product?.mrpPrice) || 0;
    const cardPrice = Number(product?.cardholderPrice) || 0;
    const points = product?.pointsToBeRedeem || 0;

    // Calculate available points
    const pointsBalance = loyaltyCard?.pointsBalance || 0;
    const availablePoints = pointsBalance - totalPointsUsed;

    // Determine which case applies
    let pricingCase = 'MRP_ONLY'; // Default for non-loyalty users

    if (isLoyaltyUser) {
        if (hasCardholderPrice && hasPoints) {
            pricingCase = 'CASE_1'; // cardholderPrice + points > 0 → checkbox opt-in
        } else if (hasCardholderPrice && !hasPoints) {
            pricingCase = 'CASE_2'; // cardholderPrice + points = 0 → checkbox opt-in
        } else if (!hasCardholderPrice && hasPoints) {
            pricingCase = 'CASE_3'; // no cardholderPrice + points > 0 → checkbox opt-in
        } else {
            pricingCase = 'MRP_ONLY'; // No special pricing available
        }
    }

    // Reset checkbox when product changes
    useEffect(() => {
        setUseLoyaltyBenefit(false);
    }, [product?.id]);

    // ===============================
    // HANDLE ADD TO CART
    // ===============================
    const handleAddToCart = () => {
        if (!product) return;

        // Determine priceType and pointsToUse based on checkbox state
        let priceType = 'MRP';
        let pointsToUse = 0;

        if (useLoyaltyBenefit) {
            // Check points availability for points-based selections
            if (hasPoints && points > availablePoints) {
                alert("You have insufficient loyalty points. Please remove items from cart to continue.");
                return;
            }

            if (pricingCase === 'CASE_1') {
                // Cardholder price + points
                priceType = 'LOYALTY';
                pointsToUse = points;
            } else if (pricingCase === 'CASE_2') {
                // Cardholder price only
                priceType = 'LOYALTY';
                pointsToUse = 0;
            } else if (pricingCase === 'CASE_3') {
                // Points only
                priceType = 'POINTS';
                pointsToUse = points;
            }
        }

        addToCart({
            id: product.id,
            name: product.prodName,
            price: priceType === 'MRP' ? mrp : (priceType === 'LOYALTY' ? cardPrice : mrp),
            mrpPrice: mrp,
            cardholderPrice: cardPrice,
            pointsToBeRedeem: points,
            image: `/${product.prodImagePath}`,
            quantity: 1
        }, priceType, pointsToUse);
    };

    const handleCartToggle = () => {
        if (isInCart) {
            removeFromCart(product.id);
        } else {
            handleAddToCart();
        }
    };

    const handleCheckboxChange = (e) => {
        const isChecked = e.target.checked;

        // If trying to check, validate points availability
        if (isChecked && hasPoints) {
            if (points > availablePoints) {
                alert("You have insufficient loyalty points. Please remove items from cart to continue.");
                return;
            }
        }

        setUseLoyaltyBenefit(isChecked);
    };

    // ===============================
    // RENDER
    // ===============================
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

    const description = product.prodLongDesc || product.prodShortDesc || 'Experience premium quality with this exceptional product.';

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>

                {/* Left Side - Image */}
                <div className={styles.imageSection}>
                    <img
                        src={`${product.prodImagePath}`}
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
                        {/* NON-LOYALTY USER: Show only MRP */}
                        {!isLoyaltyUser && (
                            <>
                                <div className={styles.priceRow}>
                                    <span className={styles.mrpLabel}>Price</span>
                                    <span className={styles.mrpPrice}>₹{mrp.toFixed(2)}</span>
                                </div>
                            </>
                        )}

                        {/* LOYALTY USER - CASE 1: cardholderPrice + points > 0 */}
                        {isLoyaltyUser && pricingCase === 'CASE_1' && (
                            <>
                                <div className={styles.loyaltyBadge}>
                                    <span>🎖️ Loyalty Member</span>
                                    <span>{availablePoints} points available</span>
                                </div>
                                
                                <div className={styles.priceRow}>
                                    <span className={styles.mrpLabel}>MRP</span>
                                    <span className={useLoyaltyBenefit ? styles.strikethrough : styles.mrpPrice}>
                                        ₹{mrp.toFixed(2)}
                                    </span>
                                </div>

                                {/* Checkbox for opt-in */}
                                <label className={`${styles.checkboxOption} ${points > availablePoints ? styles.disabled : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={useLoyaltyBenefit}
                                        onChange={handleCheckboxChange}
                                        disabled={points > availablePoints}
                                    />
                                    <div className={styles.checkboxContent}>
                                        <span className={styles.checkboxLabel}>
                                            Use loyalty benefits (Save ₹{(mrp - cardPrice).toFixed(2)} + Redeem {points} points)
                                        </span>
                                        {useLoyaltyBenefit && (
                                            <div className={styles.selectedPricing}>
                                                <span className={styles.cardholderPrice}>₹{cardPrice.toFixed(2)}</span>
                                                <span className={styles.pointsUsage}>+ {points} pts</span>
                                            </div>
                                        )}
                                    </div>
                                </label>

                                {points > availablePoints && (
                                    <div className={styles.insufficientPoints}>
                                        ⚠️ Insufficient points. Remove items from cart to use this option.
                                    </div>
                                )}
                            </>
                        )}

                        {/* LOYALTY USER - CASE 2: cardholderPrice only (checkbox opt-in) */}
                        {isLoyaltyUser && pricingCase === 'CASE_2' && (
                            <>
                                <div className={styles.loyaltyBadge}>
                                    <span>🎖️ Loyalty Member</span>
                                </div>
                                
                                <div className={styles.priceRow}>
                                    <span className={styles.mrpLabel}>MRP</span>
                                    <span className={useLoyaltyBenefit ? styles.strikethrough : styles.mrpPrice}>
                                        ₹{mrp.toFixed(2)}
                                    </span>
                                </div>

                                {/* Checkbox for opt-in */}
                                <label className={styles.checkboxOption}>
                                    <input
                                        type="checkbox"
                                        checked={useLoyaltyBenefit}
                                        onChange={handleCheckboxChange}
                                    />
                                    <div className={styles.checkboxContent}>
                                        <span className={styles.checkboxLabel}>
                                            Use cardholder price (Save ₹{(mrp - cardPrice).toFixed(2)})
                                        </span>
                                        {useLoyaltyBenefit && (
                                            <div className={styles.selectedPricing}>
                                                <span className={styles.cardholderPrice}>₹{cardPrice.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </>
                        )}

                        {/* LOYALTY USER - CASE 3: Points only (checkbox opt-in) */}
                        {isLoyaltyUser && pricingCase === 'CASE_3' && (
                            <>
                                <div className={styles.loyaltyBadge}>
                                    <span>🎖️ Loyalty Member</span>
                                    <span>{availablePoints} points available</span>
                                </div>

                                <div className={styles.priceRow}>
                                    <span className={styles.mrpLabel}>MRP</span>
                                    <span className={useLoyaltyBenefit ? styles.strikethrough : styles.mrpPrice}>
                                        ₹{mrp.toFixed(2)}
                                    </span>
                                </div>

                                {/* Checkbox for opt-in */}
                                <label className={`${styles.checkboxOption} ${points > availablePoints ? styles.disabled : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={useLoyaltyBenefit}
                                        onChange={handleCheckboxChange}
                                        disabled={points > availablePoints}
                                    />
                                    <div className={styles.checkboxContent}>
                                        <span className={styles.checkboxLabel}>
                                            Buy using loyalty points (Redeem {points} points)
                                        </span>
                                        {useLoyaltyBenefit && (
                                            <div className={styles.selectedPricing}>
                                                <span className={styles.pointsUsage}>{points} points</span>
                                            </div>
                                        )}
                                    </div>
                                </label>

                                {points > availablePoints && (
                                    <div className={styles.insufficientPoints}>
                                        ⚠️ Insufficient points. Remove items from cart to use this option.
                                    </div>
                                )}
                            </>
                        )}

                        {/* LOYALTY USER - MRP ONLY (no special pricing) */}
                        {isLoyaltyUser && pricingCase === 'MRP_ONLY' && (
                            <>
                                <div className={styles.loyaltyBadge}>
                                    <span>🎖️ Loyalty Member</span>
                                </div>
                                <div className={styles.priceRow}>
                                    <span className={styles.mrpLabel}>Price</span>
                                    <span className={styles.mrpPrice}>₹{mrp.toFixed(2)}</span>
                                </div>
                                <div className={styles.noDiscountNote}>
                                    No special pricing available for this product.
                                </div>
                            </>
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

