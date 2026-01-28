import React, { useEffect, useState } from "react";
import styles from "../styles/CartPage.module.css";
import { useCart } from "../context/CartContext";

const CartPage = () => {

    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const [summary, setSummary] = useState({ subtotal: 0, delivery: 0, total: 0 });

    useEffect(() => {
        const subtotal = cartItems.reduce(
            (acc, item) => acc + item.price * item.quantity, 0
        );

        const delivery = subtotal > 500 ? 0 : 40;
        const total = subtotal + delivery;

        setSummary({ subtotal, delivery, total });
    }, [cartItems]);

    if (cartItems.length === 0) {
        return (
            <div className={styles.emptyCartContainer}>
                <div className={styles.emptyCartContent}>
                    <svg className={styles.emptyCartIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.cartContainer}>

                {/* LEFT SECTION - CART ITEMS */}
                <div className={styles.cartItemsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>My Cart</h2>
                        <span className={styles.itemCount}>{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</span>
                    </div>

                    <div className={styles.cartItemsList}>
                        {cartItems.map(item => (
                            <div key={item.id} className={styles.cartItemCard}>

                                {/* Product Image */}
                                <div className={styles.imageWrapper}>
                                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                                </div>

                                {/* Product Details */}
                                <div className={styles.itemDetails}>
                                    <h3 className={styles.itemName}>{item.name}</h3>

                                    <div className={styles.priceSection}>
                                        <div className={styles.unitPrice}>
                                            <span className={styles.priceLabel}>Price:</span>
                                            <span className={styles.priceValue}>₹{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                                        </div>
                                        <div className={styles.itemTotal}>
                                            <span className={styles.totalLabel}>Item Total:</span>
                                            <span className={styles.totalValue}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
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
                        ))}
                    </div>
                </div>

                {/* RIGHT SECTION - PRICE SUMMARY */}
                <div className={styles.summarySection}>
                    <div className={styles.summaryCard}>
                        <h3 className={styles.summaryTitle}>PRICE DETAILS</h3>

                        <div className={styles.summaryContent}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                                <span>₹{summary.subtotal.toFixed(2)}</span>
                            </div>

                            <div className={styles.summaryRow}>
                                <span>Delivery Charges</span>
                                <span className={summary.delivery === 0 ? styles.freeDelivery : ''}>
                                    {summary.delivery === 0 ? 'FREE' : `₹${summary.delivery.toFixed(2)}`}
                                </span>
                            </div>

                            {summary.delivery === 0 && (
                                <div className={styles.savingsNote}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    You're saving ₹40 on delivery!
                                </div>
                            )}

                            <div className={styles.divider}></div>

                            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                <span>Total Amount</span>
                                <span className={styles.totalAmount}>₹{summary.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button className={styles.checkoutBtn}>
                            <span>PROCEED TO CHECKOUT</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
