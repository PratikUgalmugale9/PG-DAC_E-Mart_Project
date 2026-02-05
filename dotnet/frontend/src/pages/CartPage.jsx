import React, { useEffect, useState } from "react";
import styles from "../styles/CartPage.module.css";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart } = useCart();

    const [summary, setSummary] = useState({
        mrpTotal: 0,
        subtotal: 0,
        delivery: 0,
        total: 0,
        savings: 0,
        pointsRedeemed: 0,
        pointsToEarn: 0
    });

    const [loyaltyCard, setLoyaltyCard] = useState(null);
    const [hasLoyaltyCard, setHasLoyaltyCard] = useState(false);

    useEffect(() => {
        const fetchLoyaltyData = async () => {
            try {
                const userJson = localStorage.getItem("user");
                const token = localStorage.getItem("token");
                if (!userJson || !token) return;

                const user = JSON.parse(userJson);
                const userId = user.id || user.userId;

                const res = await axios.get(
                    `http://localhost:8080/api/LoyaltyCard/user/${userId}`,
                    { 
                        headers: { Authorization: `Bearer ${token}` },
                        validateStatus: (status) => status < 500
                    }
                );

                if (res.data && String(res.data.isActive).toLowerCase() === "y") {
                    setLoyaltyCard(res.data);
                    setHasLoyaltyCard(true);
                }
            } catch {
                setHasLoyaltyCard(false);
            }
        };

        fetchLoyaltyData();
    }, []);

    useEffect(() => {
        let mrpTotal = 0;
        let cashSubtotal = 0;
        let pointsRedeemedTotal = 0;

        cartItems.forEach(item => {
            const mrp = item.mrpPrice || item.price || 0;
            mrpTotal += mrp * item.quantity;
            
            // For POINTS items, don't add to cash subtotal (they're paid via points only)
            if (item.priceType !== 'POINTS') {
                cashSubtotal += (item.price * item.quantity);
            }
            
            pointsRedeemedTotal += (item.pointsUsed || 0) * item.quantity;
        });

        const delivery = cashSubtotal > 500 ? 0 : 40;
        const total = cashSubtotal + delivery;
        const savings = mrpTotal - cashSubtotal;
        const earningEstimation = Math.floor(cashSubtotal / 10);

        setSummary({
            mrpTotal,
            subtotal: cashSubtotal,
            delivery,
            total,
            savings,
            pointsRedeemed: pointsRedeemedTotal,
            pointsToEarn: earningEstimation
        });


    }, [cartItems]);

    const handleProceedToCheckout = () => {
        navigate("/checkout/address");
    };

    if (cartItems.length === 0) {
        return (
            <div className={styles.emptyCartContainer}>
                <div className={styles.emptyCartContent}>
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.cartContainer}>
                {/* left section */}
                <div className={styles.cartItemsSection}>
                    {hasLoyaltyCard && loyaltyCard && (
                        <div className={styles.loyaltyCardBadge}>
                            <div className={styles.cardIcon}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                            </div>
                            <div className={styles.cardInfo}>
                                <strong>e-MART Card Holder</strong>
                                <span>{loyaltyCard.cardNumber}</span>
                            </div>
                            <div className={styles.pointsBadge}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <span>{loyaltyCard.pointsBalance} Points</span>
                            </div>
                        </div>
                    )}

                    <div className={styles.sectionHeader}>
                        <h2>My Cart</h2>
                        <span className={styles.itemCount}>{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</span>
                    </div>

                    <div className={styles.cartItemsList}>
                        {cartItems.map(item => {
                            const mrpPrice = item.mrpPrice || item.price || 0;
                            const itemSavings = (mrpPrice - item.price) * item.quantity;

                            return (
                                <div key={item.id} className={styles.cartItemCard}>
                                    <div className={styles.imageWrapper}>
                                        <img src={item.image} alt={item.name} className={styles.itemImage} />
                                    </div>

                                    <div className={styles.itemDetails}>
                                        <h3 className={styles.itemName}>{item.name}</h3>
                                        <div className={styles.priceSection}>
                                            {/* Price Type Badge */}
                                            {item.priceType && item.priceType !== 'MRP' && (
                                                <div className={styles.priceTypeBadge}>
                                                    {item.priceType === 'LOYALTY' && '💳 Cardholder Price'}
                                                    {item.priceType === 'POINTS' && '⭐ Points Redemption'}
                                                </div>
                                            )}

                                            {hasLoyaltyCard ? (
                                                <>
                                                    <div className={styles.pricingRow}>
                                                        <div className={styles.priceOriginal}>
                                                            <span className={styles.priceLabel}>MRP:</span>
                                                            <span className={item.priceType !== 'MRP' ? styles.strikethrough : styles.priceValue}>
                                                                ₹{mrpPrice.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        {item.priceType === 'LOYALTY' && (
                                                            <div className={styles.priceCardholder}>
                                                                <span className={styles.priceLabel}>Cardholder:</span>
                                                                <span className={styles.highlightPrice}>₹{item.price.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Points Used */}
                                                    {item.pointsUsed > 0 && (
                                                        <div className={styles.pointsInfo}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                <circle cx="12" cy="12" r="10"></circle>
                                                                <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none"></path>
                                                            </svg>
                                                            <span>Using {item.pointsUsed} points/item</span>
                                                        </div>
                                                    )}

                                                    {item.priceType !== 'MRP' && itemSavings > 0 && (
                                                        <div className={styles.savingsIndicator}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                            </svg>
                                                            <span>Save ₹{itemSavings.toFixed(2)}</span>
                                                        </div>
                                                    )}

                                                    <div className={styles.itemTotal}>
                                                        <span className={styles.totalLabel}>Item Total:</span>
                                                        <span className={styles.totalValue}>
                                                            {item.priceType === 'POINTS' 
                                                                ? `${item.pointsUsed * item.quantity} pts`
                                                                : `₹${(item.price * item.quantity).toFixed(2)}`
                                                            }
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={styles.unitPrice}>
                                                        <span className={styles.priceLabel}>Price:</span>
                                                        <span className={styles.priceValue}>₹{mrpPrice.toFixed(2)}</span>
                                                    </div>
                                                    <div className={styles.itemTotal}>
                                                        <span className={styles.totalLabel}>Item Total:</span>
                                                        <span className={styles.totalValue}>₹{(mrpPrice * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                    </div>

                                    {/* Quantity Controls */}
                                    <div className={styles.actionsSection}>
                                        <div className={styles.quantityControl}>
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => updateQuantity(item.id, -1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                </svg>
                                            </button>
                                            <span className={styles.quantityDisplay}>{item.quantity}</span>
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                </svg>
                                            </button>
                                        </div>

                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className={styles.summarySection}>
                    <div className={styles.summaryCard}>
                        <h3 className={styles.summaryTitle}>PRICE DETAILS</h3>

                        <div className={styles.summaryContent}>
                            <div className={styles.summaryRow}>
                                <span>Total MRP</span>
                                <span>₹{summary.mrpTotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Cart Subtotal (Cash)</span>
                                <span>₹{summary.subtotal.toFixed(2)}</span>
                            </div>
                            {summary.pointsRedeemed > 0 && (
                                <div className={styles.summaryRow} style={{ color: '#fbbf24' }}>
                                    <span>Points Redeemed</span>
                                    <span>{summary.pointsRedeemed} pts</span>
                                </div>
                            )}
                            {summary.savings > 0 && (
                                <div className={styles.summaryRow}>
                                    <span>💚 Total Savings</span>
                                    <span style={{ color: '#10b981', fontWeight: '700' }}>-₹{summary.savings.toFixed(2)}</span>
                                </div>
                            )}
                            <div className={styles.divider}></div>
                            <div className={styles.summaryRow}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>Delivery Charges</span>
                                    <small className={styles.summaryDesc}>Free for orders above ₹500</small>
                                </div>
                                <span className={summary.delivery === 0 ? styles.freeDelivery : ''}>
                                    {summary.delivery === 0 ? 'FREE' : `₹${summary.delivery.toFixed(2)}`}
                                </span>
                            </div>
                            {hasLoyaltyCard && (
                                <div className={styles.summaryRow} style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>Points you will get</span>
                                        <small className={styles.summaryDesc}>1 point per ₹10 spent (cash portion)</small>
                                    </div>
                                    <span style={{ color: '#667eea', fontWeight: '700' }}>+{summary.pointsToEarn} pts</span>
                                </div>
                            )}
                            <div className={styles.totalRow}>
                                <span>Amount to Pay</span>
                                <span className={styles.totalAmount}>₹{summary.total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button className={styles.checkoutBtn} onClick={handleProceedToCheckout}>
                            PROCEED TO CHECKOUT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
