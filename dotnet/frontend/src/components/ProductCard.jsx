import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLoyalty } from '../context/LoyaltyContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, removeFromCart, cartItems } = useCart();
    const { isLoyaltyUser, pointsBalance } = useLoyalty();

    // Calculate total points used in cart to determine available points
    const totalPointsUsed = cartItems.reduce((sum, item) => sum + (item.pointsUsed || 0), 0);
    const availablePoints = pointsBalance - totalPointsUsed;

    // Pricing selection state - checkbox for opt-in (default: unchecked = MRP)
    const [useLoyaltyBenefit, setUseLoyaltyBenefit] = useState(false);

    // Check if product is in cart
    const isInCart = cartItems.some(item => item.id === product.id);

    // Pricing data
    const mrp = Number(product.mrpPrice) || Number(product.price) || 0;
    const cardPrice = Number(product.cardholderPrice) || 0;
    const points = product.pointsToBeRedeem || 0;
    const hasCardholderPrice = product.cardholderPrice != null;
    const hasPoints = points > 0;

    // Determine Pricing Case
    let pricingCase = 'MRP_ONLY';
    if (isLoyaltyUser) {
        if (hasCardholderPrice && hasPoints) pricingCase = 'CASE_1';
        else if (hasCardholderPrice && !hasPoints) pricingCase = 'CASE_2';
        else if (!hasCardholderPrice && hasPoints) pricingCase = 'CASE_3';
    }

    // Reset checkbox when product changes
    useEffect(() => {
        setUseLoyaltyBenefit(false);
    }, [product.id]);

    const handleCheckboxChange = (e) => {
        e.stopPropagation();
        const isChecked = e.target.checked;

        // If trying to check, validate points availability
        if (isChecked && hasPoints) {
            if (points > availablePoints) {
                alert(`Insufficient points! You need ${points} points, but only ${availablePoints} available.`);
                return;
            }
        }

        setUseLoyaltyBenefit(isChecked);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        
        if (isInCart) {
            removeFromCart(product.id);
            return;
        }

        // Determine priceType and pointsToUse based on checkbox state
        let priceType = 'MRP';
        let pointsToUse = 0;

        if (useLoyaltyBenefit) {
            // Check points availability for points-based selections
            if (hasPoints && points > availablePoints) {
                alert(`Insufficient points! You need ${points} points, but only ${availablePoints} available.`);
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
            image: `${product.prodImagePath}`,
            quantity: 1
        }, priceType, pointsToUse);
    };

    return (
        <div className={styles.productCard} onClick={() => navigate(`/product/${product.id}`)}>
            <button className={styles.wishlistBtn} onClick={(e) => e.stopPropagation()}>
                <svg className={styles.wishlistIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>

            <div className={styles.prodImageContainer}>
                <img
                    src={`${product.prodImagePath}`}
                    alt={product.prodName}
                    className={styles.prodImage}
                    onError={(e) => e.target.src = '/images/default.jpg'}
                />
            </div>

            <div className={styles.prodInfo}>
                <h3 className={styles.prodName}>{product.prodName}</h3>
                
                <div className={styles.prodPriceRow}>
                    <div className={styles.prodPrice}>₹{mrp}</div>
                    <div className={styles.rating}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>4.8</span>
                    </div>
                </div>

                {/* LOYALTY PRICING CHECKBOX */}
                {isLoyaltyUser && pricingCase !== 'MRP_ONLY' && (
                    <div className={styles.loyaltySection} onClick={(e) => e.stopPropagation()}>
                        <span className={styles.loyaltyTitle}>Special Offers</span>
                        
                        {pricingCase === 'CASE_1' && (
                            <>
                                <div className={styles.mrpRow}>
                                    <span>MRP:</span>
                                    <span className={useLoyaltyBenefit ? styles.strikethrough : ''}>₹{mrp}</span>
                                </div>
                                <label className={`${styles.checkboxOption} ${points > availablePoints ? styles.disabled : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={useLoyaltyBenefit}
                                        onChange={handleCheckboxChange}
                                        disabled={points > availablePoints}
                                    />
                                    <div className={styles.checkboxContent}>
                                        <span className={styles.checkboxLabel}>
                                            Save ₹{(mrp - cardPrice).toFixed(0)} + {points} pts
                                        </span>
                                        {useLoyaltyBenefit && (
                                            <span className={styles.selectedPrice}>₹{cardPrice} + {points} pts</span>
                                        )}
                                    </div>
                                </label>
                            </>
                        )}

                        {pricingCase === 'CASE_2' && (
                            <>
                                <div className={styles.mrpRow}>
                                    <span>MRP:</span>
                                    <span className={useLoyaltyBenefit ? styles.strikethrough : ''}>₹{mrp}</span>
                                </div>
                                <label className={styles.checkboxOption}>
                                    <input
                                        type="checkbox"
                                        checked={useLoyaltyBenefit}
                                        onChange={handleCheckboxChange}
                                    />
                                    <div className={styles.checkboxContent}>
                                        <span className={styles.checkboxLabel}>
                                            Save ₹{(mrp - cardPrice).toFixed(0)}
                                        </span>
                                        {useLoyaltyBenefit && (
                                            <span className={styles.selectedPrice}>₹{cardPrice}</span>
                                        )}
                                    </div>
                                </label>
                            </>
                        )}

                        {pricingCase === 'CASE_3' && (
                            <>
                                <div className={styles.mrpRow}>
                                    <span>MRP:</span>
                                    <span className={useLoyaltyBenefit ? styles.strikethrough : ''}>₹{mrp}</span>
                                </div>
                                <label className={`${styles.checkboxOption} ${points > availablePoints ? styles.disabled : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={useLoyaltyBenefit}
                                        onChange={handleCheckboxChange}
                                        disabled={points > availablePoints}
                                    />
                                    <div className={styles.checkboxContent}>
                                        <span className={styles.checkboxLabel}>
                                            Redeem {points} pts
                                        </span>
                                        {useLoyaltyBenefit && (
                                            <span className={styles.selectedPrice}>{points} points</span>
                                        )}
                                    </div>
                                </label>
                            </>
                        )}
                    </div>
                )}

                <button
                    className={`${styles.addToCartBtn} ${isInCart ? styles.addedBtn : ''}`}
                    onClick={handleAddToCart}
                >
                    {isInCart ? 'Remove from Cart' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
