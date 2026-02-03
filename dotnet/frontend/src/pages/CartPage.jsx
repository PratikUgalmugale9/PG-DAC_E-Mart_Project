// import React, { useEffect, useState } from "react";
// import styles from "../styles/CartPage.module.css";
// import { useCart } from "../context/CartContext";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const CartPage = () => {

//     const navigate = useNavigate();
//     const { cartItems, updateQuantity, removeFromCart } = useCart();
//     const [summary, setSummary] = useState({
//         mrpTotal: 0,
//         cardholderTotal: 0,
//         subtotal: 0,
//         delivery: 0,
//         total: 0,
//         savings: 0
//     });

//     // 🎯 LOYALTY CARD STATE
//     const [loyaltyCard, setLoyaltyCard] = useState(null);
//     const [hasLoyaltyCard, setHasLoyaltyCard] = useState(false);
//     const [paymentChoice, setPaymentChoice] = useState("CASH"); // CASH, POINTS, BOTH
//     const [pointsToRedeem, setPointsToRedeem] = useState(0);

//     // 🔥 Real API Fetch Logic
//     useEffect(() => {
//         const fetchLoyaltyData = async () => {
//             try {
//                 const userJson = localStorage.getItem("user");
//                 if (!userJson) return;

//                 const user = JSON.parse(userJson);
//                 const userId = user.id || user.userId;

//                 const token = localStorage.getItem("token");

//                 if (!userId || !token) return;

//                 // Update URL to match backend controller: /api/loyaltycard/user/{userId}
//                 // Must include Authorization header
//                 const response = await axios.get(`http://localhost:8080/api/loyaltycard/user/${userId}`, {
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 });

//                 // Check for generic 'y' or 'Y'
//                 if (response.data && String(response.data.isActive).toLowerCase() === 'y') {
//                     setLoyaltyCard(response.data);
//                     setHasLoyaltyCard(true);
//                     console.log("✅ Loyalty Card Active:", response.data);
//                 }
//             } catch (error) {
//                 console.log("ℹ️ No active loyalty card for this user or error fetching.");
//                 setHasLoyaltyCard(false);
//             }
//         };

//         fetchLoyaltyData();

//         // Load saved redemption choices
//         const savedChoice = localStorage.getItem("paymentChoice");
//         const savedPoints = localStorage.getItem("pointsToRedeem");
//         if (savedChoice) setPaymentChoice(savedChoice);
//         if (savedPoints) setPointsToRedeem(Number(savedPoints));
//     }, []);

//     // Calculate totals with loyalty pricing
//     useEffect(() => {
//         let currentMrpTotal = 0;
//         let currentCardholderTotal = 0;

//         cartItems.forEach(item => {
//             const mrp = item.mrpPrice || item.price || 0;
//             const cardholder = hasLoyaltyCard ? (item.cardholderPrice || mrp * 0.9) : mrp;

//             currentMrpTotal += mrp * item.quantity;
//             currentCardholderTotal += cardholder * item.quantity;
//         });

//         const subtotal = hasLoyaltyCard ? currentCardholderTotal : currentMrpTotal;
//         const delivery = subtotal > 500 ? 0 : 40;
//         const total = subtotal + delivery;
//         const savings = currentMrpTotal - currentCardholderTotal;

//         setSummary({
//             mrpTotal: currentMrpTotal,
//             cardholderTotal: currentCardholderTotal,
//             subtotal,
//             delivery,
//             total,
//             savings,
//             finalTotal: Math.max(0, total - pointsToRedeem)
//         });
//     }, [cartItems, hasLoyaltyCard, pointsToRedeem]);

//     // Points logic
//     const maxPointsPossible = Math.min(loyaltyCard?.pointsBalance || 0, summary.total);

//     useEffect(() => {
//         if (paymentChoice === "POINTS") {
//             setPointsToRedeem(maxPointsPossible);
//         } else if (paymentChoice === "CASH") {
//             setPointsToRedeem(0);
//         }
//     }, [paymentChoice, maxPointsPossible]);

//     const handlePointsChange = (val) => {
//         const num = parseInt(val) || 0;
//         setPointsToRedeem(Math.min(Math.max(0, num), maxPointsPossible));
//     };

//     const handleProceedToCheckout = () => {
//         // Save redemption choices to localStorage for Payment page
//         localStorage.setItem("paymentChoice", paymentChoice);
//         localStorage.setItem("pointsToRedeem", String(pointsToRedeem));
//         navigate("/checkout/address");
//     };

//     if (cartItems.length === 0) {
//         return (
//             <div className={styles.emptyCartContainer}>
//                 <div className={styles.emptyCartContent}>
//                     <svg className={styles.emptyCartIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//                     </svg>
//                     <h2>Your cart is empty</h2>
//                     <p>Add some products to get started!</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className={styles.pageWrapper}>
//             <div className={styles.cartContainer}>

//                 {/* LEFT SECTION - CART ITEMS */}
//                 <div className={styles.cartItemsSection}>

//                     {/* 🏆 LOYALTY CARD BADGE */}
//                     {hasLoyaltyCard && loyaltyCard && (
//                         <div className={styles.loyaltyCardBadge}>
//                             <div className={styles.cardIcon}>
//                                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                     <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
//                                     <line x1="1" y1="10" x2="23" y2="10"></line>
//                                 </svg>
//                             </div>
//                             <div className={styles.cardInfo}>
//                                 <strong>e-MART Card Holder</strong>
//                                 <span>{loyaltyCard.cardNumber}</span>
//                             </div>
//                             <div className={styles.pointsBadge}>
//                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
//                                     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//                                 </svg>
//                                 <span>{loyaltyCard.pointsBalance} Points</span>
//                             </div>
//                         </div>
//                     )}

//                     <div className={styles.sectionHeader}>
//                         <h2>My Cart</h2>
//                         <span className={styles.itemCount}>{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</span>
//                     </div>

//                     <div className={styles.cartItemsList}>
//                         {cartItems.map(item => {
//                             const mrpPrice = item.mrpPrice || item.price || 0;
//                             const cardholderPrice = hasLoyaltyCard ? (item.cardholderPrice || mrpPrice * 0.9) : mrpPrice;
//                             const pointsToRedeem = item.pointsToBeRedeem || Math.floor(mrpPrice * 10);
//                             const itemSavings = (mrpPrice - cardholderPrice) * item.quantity;

//                             return (
//                                 <div key={item.id} className={styles.cartItemCard}>

//                                     {/* Product Image */}
//                                     <div className={styles.imageWrapper}>
//                                         <img src={item.image} alt={item.name} className={styles.itemImage} />
//                                     </div>

//                                     {/* Product Details */}
//                                     <div className={styles.itemDetails}>
//                                         <h3 className={styles.itemName}>{item.name}</h3>

//                                         {/* PRICING SECTION - Updated for Loyalty Card */}
//                                         <div className={styles.priceSection}>
//                                             {hasLoyaltyCard ? (
//                                                 <>
//                                                     <div className={styles.pricingRow}>
//                                                         <div className={styles.priceOriginal}>
//                                                             <span className={styles.priceLabel}>MRP:</span>
//                                                             <span className={styles.strikethrough}>₹{mrpPrice.toFixed(2)}</span>
//                                                         </div>
//                                                         <div className={styles.priceCardholder}>
//                                                             <span className={styles.priceLabel}>Cardholder:</span>
//                                                             <span className={styles.highlightPrice}>₹{cardholderPrice.toFixed(2)}</span>
//                                                         </div>
//                                                     </div>
//                                                     <div className={styles.savingsIndicator}>
//                                                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                                             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//                                                             <polyline points="22 4 12 14.01 9 11.01"></polyline>
//                                                         </svg>
//                                                         <span>Save ₹{itemSavings.toFixed(2)}</span>
//                                                     </div>
//                                                     <div className={styles.pointsInfo}>
//                                                         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//                                                             <circle cx="12" cy="12" r="10"></circle>
//                                                             <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none"></path>
//                                                         </svg>
//                                                         <span>Redeem for {pointsToRedeem} points</span>
//                                                     </div>
//                                                     <div className={styles.itemTotal}>
//                                                         <span className={styles.totalLabel}>Item Total:</span>
//                                                         <span className={styles.totalValue}>₹{(cardholderPrice * item.quantity).toFixed(2)}</span>
//                                                     </div>
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <div className={styles.unitPrice}>
//                                                         <span className={styles.priceLabel}>Price:</span>
//                                                         <span className={styles.priceValue}>₹{mrpPrice.toFixed(2)}</span>
//                                                     </div>
//                                                     <div className={styles.itemTotal}>
//                                                         <span className={styles.totalLabel}>Item Total:</span>
//                                                         <span className={styles.totalValue}>₹{(mrpPrice * item.quantity).toFixed(2)}</span>
//                                                     </div>
//                                                 </>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Quantity Controls */}
//                                     <div className={styles.actionsSection}>
//                                         <div className={styles.quantityControl}>
//                                             <button
//                                                 className={styles.quantityBtn}
//                                                 onClick={() => updateQuantity(item.id, -1)}
//                                                 disabled={item.quantity <= 1}
//                                             >
//                                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                                     <line x1="5" y1="12" x2="19" y2="12"></line>
//                                                 </svg>
//                                             </button>
//                                             <span className={styles.quantityDisplay}>{item.quantity}</span>
//                                             <button
//                                                 className={styles.quantityBtn}
//                                                 onClick={() => updateQuantity(item.id, 1)}
//                                             >
//                                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                                     <line x1="12" y1="5" x2="12" y2="19"></line>
//                                                     <line x1="5" y1="12" x2="19" y2="12"></line>
//                                                 </svg>
//                                             </button>
//                                         </div>

//                                         <button
//                                             className={styles.removeBtn}
//                                             onClick={() => removeFromCart(item.id)}
//                                         >
//                                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                                 <polyline points="3 6 5 6 21 6"></polyline>
//                                                 <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
//                                             </svg>
//                                             Remove
//                                         </button>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* RIGHT SECTION - PRICE SUMMARY */}
//                 <div className={styles.summarySection}>
//                     <div className={styles.summaryCard}>
//                         <h3 className={styles.summaryTitle}>PRICE DETAILS</h3>

//                         <div className={styles.summaryContent}>
//                             {/* Show MRP vs Cardholder breakdown if has loyalty card */}
//                             {hasLoyaltyCard && (
//                                 <>
//                                     <div className={styles.summaryRow}>
//                                         <span>MRP Total ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
//                                         <span className={styles.strikethroughText}>₹{summary.mrpTotal.toFixed(2)}</span>
//                                     </div>
//                                     <div className={styles.summaryRow}>
//                                         <span>Cardholder Price</span>
//                                         <span className={styles.cardholderPriceText}>₹{summary.cardholderTotal.toFixed(2)}</span>
//                                     </div>
//                                     <div className={styles.savingsRow}>
//                                         <span>💚 You Save</span>
//                                         <span className={styles.savingsAmount}>₹{summary.savings.toFixed(2)}</span>
//                                     </div>
//                                     <div className={styles.divider}></div>
//                                 </>
//                             )}

//                             {!hasLoyaltyCard && (
//                                 <div className={styles.summaryRow}>
//                                     <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
//                                     <span>₹{summary.subtotal.toFixed(2)}</span>
//                                 </div>
//                             )}

//                             <div className={styles.summaryRow}>
//                                 <span>Delivery Charges</span>
//                                 <span className={summary.delivery === 0 ? styles.freeDelivery : ''}>
//                                     {summary.delivery === 0 ? 'FREE' : `₹${summary.delivery.toFixed(2)}`}
//                                 </span>
//                             </div>

//                             {summary.delivery === 0 && (
//                                 <div className={styles.savingsNote}>
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                         <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//                                         <polyline points="22 4 12 14.01 9 11.01"></polyline>
//                                     </svg>
//                                     You're saving ₹40 on delivery!
//                                 </div>
//                             )}

//                             <div className={styles.divider}></div>

//                             <div className={`${styles.summaryRow} ${styles.totalRow}`}>
//                                 <span>Total Amount</span>
//                                 <span className={styles.totalAmount}>₹{summary.total.toFixed(2)}</span>
//                             </div>

//                             {hasLoyaltyCard && (
//                                 <div className={styles.redemptionSection}>
//                                     <h4 className={styles.redemptionTitle}>
//                                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                             <path d="M20 12v10H4V12"></path>
//                                             <path d="M2 7h20v5H2z"></path>
//                                             <path d="M12 22V7"></path>
//                                             <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
//                                             <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
//                                         </svg>
//                                         Redeem Loyalty Points
//                                     </h4>
//                                     <p className={styles.redemptionBalance}>
//                                         Available: <strong>{loyaltyCard.pointsBalance} Points</strong>
//                                     </p>

//                                     <div className={styles.choiceGrid}>
//                                         <button
//                                             className={`${styles.choiceBtn} ${paymentChoice === 'CASH' ? styles.choiceBtnPrimary : ''}`}
//                                             onClick={() => setPaymentChoice("CASH")}
//                                         >
//                                             Cash Only
//                                         </button>
//                                         {/* <button
//                                             className={`${styles.choiceBtn} ${paymentChoice === 'POINTS' ? styles.choiceBtnPrimary : ''}`}
//                                             onClick={() => setPaymentChoice("POINTS")}
//                                             disabled={loyaltyCard.pointsBalance === 0}
//                                         >
//                                             Points Only
//                                         </button> */}
//                                         <button
//                                             className={`${styles.choiceBtn} ${paymentChoice === 'BOTH' ? styles.choiceBtnPrimary : ''}`}
//                                             onClick={() => setPaymentChoice("BOTH")}
//                                             disabled={loyaltyCard.pointsBalance === 0}
//                                         >
//                                             Both
//                                         </button>
//                                     </div>

//                                     {paymentChoice === "BOTH" && (
//                                         <div className={styles.pointsInputWrapper}>
//                                             <label className={styles.pointsLabel}>Points to redeem (Max {maxPointsPossible}):</label>
//                                             <div className={styles.inputGroup}>
//                                                 <input
//                                                     type="number"
//                                                     className={styles.pointsInput}
//                                                     value={pointsToRedeem}
//                                                     onChange={(e) => handlePointsChange(e.target.value)}
//                                                 />
//                                                 <button className={styles.maxBtn} onClick={() => setPointsToRedeem(maxPointsPossible)}>MAX</button>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {pointsToRedeem > 0 && (
//                                 <>
//                                     <div className={`${styles.summaryRow} ${styles.pointsRedeemedRow}`}>
//                                         <span>Points Redeemed</span>
//                                         <span>-₹{pointsToRedeem.toFixed(2)}</span>
//                                     </div>
//                                     <div className={`${styles.summaryRow} ${styles.totalRow} ${styles.amountToPayRow}`}>
//                                         <span>Amount to Pay</span>
//                                         <span className={styles.totalAmount}>₹{summary.finalTotal.toFixed(2)}</span>
//                                     </div>
//                                 </>
//                             )}
//                         </div>

//                         <button className={styles.checkoutBtn} onClick={handleProceedToCheckout}>
//                             <span>PROCEED TO CHECKOUT</span>
//                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                 <line x1="5" y1="12" x2="19" y2="12"></line>
//                                 <polyline points="12 5 19 12 12 19"></polyline>
//                             </svg>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CartPage;

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
        cardholderTotal: 0,
        subtotal: 0,
        delivery: 0,
        total: 0,
        savings: 0,
        finalTotal: 0
    });

    // 🎯 Loyalty Card
    const [loyaltyCard, setLoyaltyCard] = useState(null);
    const [hasLoyaltyCard, setHasLoyaltyCard] = useState(false);

    // 🔘 Payment Choice (NO manual points)
    const [paymentChoice, setPaymentChoice] = useState("CASH"); // CASH | BOTH

    // 🔥 Fetch loyalty card
    useEffect(() => {
        const fetchLoyaltyData = async () => {
            try {
                const userJson = localStorage.getItem("user");
                const token = localStorage.getItem("token");
                console.log(token);
                if (!userJson || !token) return;

                const user = JSON.parse(userJson);
                const userId = user.id || user.userId;

                const res = await axios.get(
                    `http://localhost:8080/api/loyaltycard/user/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
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

    // 🎯 AUTO points from PRODUCT TABLE
    const totalRedeemPoints = cartItems.reduce((sum, item) => {
        return sum + (item.pointsToBeRedeem || 0) * item.quantity;
    }, 0);

    const pointsToRedeem =
        paymentChoice === "BOTH" ? totalRedeemPoints : 0;

    // 💰 Price Calculation
    useEffect(() => {
        let mrpTotal = 0;
        let cardholderTotal = 0;

        cartItems.forEach(item => {
            const mrp = item.mrpPrice || item.price || 0;
            const cardPrice = hasLoyaltyCard
                ? (item.cardholderPrice || mrp * 0.9)
                : mrp;

            mrpTotal += mrp * item.quantity;
            cardholderTotal += cardPrice * item.quantity;
        });

        const subtotal = hasLoyaltyCard ? cardholderTotal : mrpTotal;
        const delivery = subtotal > 500 ? 0 : 40;
        const total = subtotal + delivery;

        setSummary({
            mrpTotal,
            cardholderTotal,
            subtotal,
            delivery,
            total,
            savings: mrpTotal - cardholderTotal,
            finalTotal: Math.max(0, total - pointsToRedeem)
        });

    }, [cartItems, hasLoyaltyCard, paymentChoice]);

    const handleProceedToCheckout = () => {
        localStorage.setItem("paymentChoice", paymentChoice);
        localStorage.setItem("pointsToRedeem", String(pointsToRedeem));
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

                {/* LEFT SECTION */}
                <div className={styles.cartItemsSection}>

                  {/* 🏆 LOYALTY CARD BADGE */}                    {hasLoyaltyCard && loyaltyCard && (
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
                            const cardholderPrice = hasLoyaltyCard ? (item.cardholderPrice || mrpPrice * 0.9) : mrpPrice;
                            const pointsToRedeem = item.pointsToBeRedeem || Math.floor(mrpPrice * 10);
                            const itemSavings = (mrpPrice - cardholderPrice) * item.quantity;

                            return (
                                <div key={item.id} className={styles.cartItemCard}>

                                    {/* Product Image */}
                                    <div className={styles.imageWrapper}>
                                        <img src={item.image} alt={item.name} className={styles.itemImage} />
                                    </div>

                                    {/* Product Details */}
                                    <div className={styles.itemDetails}>
                                        <h3 className={styles.itemName}>{item.name}</h3>

                                        {/* PRICING SECTION - Updated for Loyalty Card */}
                                        <div className={styles.priceSection}>
                                            {hasLoyaltyCard ? (
                                                <>
                                                    <div className={styles.pricingRow}>
                                                        <div className={styles.priceOriginal}>
                                                            <span className={styles.priceLabel}>MRP:</span>
                                                            <span className={styles.strikethrough}>₹{mrpPrice.toFixed(2)}</span>
                                                        </div>
                                                        <div className={styles.priceCardholder}>
                                                            <span className={styles.priceLabel}>Cardholder:</span>
                                                            <span className={styles.highlightPrice}>₹{cardholderPrice.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.savingsIndicator}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                        </svg>
                                                        <span>Save ₹{itemSavings.toFixed(2)}</span>
                                                    </div>
                                                    <div className={styles.pointsInfo}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none"></path>
                                                        </svg>
                                                        <span>Redeem for {pointsToRedeem} points</span>
                                                    </div>
                                                    <div className={styles.itemTotal}>
                                                        <span className={styles.totalLabel}>Item Total:</span>
                                                        <span className={styles.totalValue}>₹{(cardholderPrice * item.quantity).toFixed(2)}</span>
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
                                <span>Total</span>
                                <span>₹{summary.total.toFixed(2)}</span>
                            </div>

                            {hasLoyaltyCard && (
                                <div className={styles.redemptionSection}>
                                    <h4 className={styles.redemptionTitle}>
                                        Redeem Loyalty Points
                                    </h4>

                                    <div className={styles.choiceGrid}>
                                        <button
                                            className={`${styles.choiceBtn} ${paymentChoice === "CASH" ? styles.choiceBtnPrimary : ""}`}
                                            onClick={() => setPaymentChoice("CASH")}
                                        >
                                            Cash Only
                                        </button>

                                        <button
                                            className={`${styles.choiceBtn} ${paymentChoice === "BOTH" ? styles.choiceBtnPrimary : ""}`}
                                            onClick={() => setPaymentChoice("BOTH")}
                                            disabled={loyaltyCard.pointsBalance < totalRedeemPoints}
                                        >
                                            Cash + Points
                                        </button>
                                    </div>
                                </div>
                            )}

                            {pointsToRedeem > 0 && (
                                <>
                                    <div className={styles.pointsRedeemedRow}>
                                        <span>Points Redeemed</span>
                                        <span>-₹{pointsToRedeem}</span>
                                    </div>

                                    <div className={styles.totalRow}>
                                        <span>Amount to Pay</span>
                                        <span>₹{summary.finalTotal.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            className={styles.checkoutBtn}
                            onClick={handleProceedToCheckout}
                        >
                            PROCEED TO CHECKOUT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
