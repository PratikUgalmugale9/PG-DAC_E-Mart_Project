import React, { useState, useEffect } from "react";
import styles from "../styles/Payment.module.css";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiCreditCard,
    FiTruck,
    FiLock,
    FiCheckCircle,
    FiShoppingBag,
    FiArrowRight,
    FiActivity,
    FiChevronLeft
} from "react-icons/fi";

const Payment = () => {
    const navigate = useNavigate();
    const { cartItems, refreshCart, cartId: contextCartId } = useCart();
    const [paymentMode, setPaymentMode] = useState("RAZORPAY");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Calculate totals
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const delivery = subtotal > 500 ? 0 : 40;
    const total = subtotal + delivery;

    useEffect(() => {
        // Load Razorpay Script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (existingScript) document.body.removeChild(existingScript);
        };
    }, []);

    // Points logic
    const maxPointsPossible = Math.min(loyaltyCard?.pointsBalance || 0, total);

    // useEffect(() => {
    //     if (paymentChoice === "POINTS") {
    //         setPointsToUse(maxPointsPossible);
    //     } else if (paymentChoice === "CASH") {
    //         setPointsToUse(0);
    //     }
    // }, [paymentChoice, maxPointsPossible]);

    useEffect(() => {
  if (paymentChoice === "CASH") {
    setPointsToUse(0);
  }
}, [paymentChoice]);


    const handlePointsChange = (val) => {
        const num = parseInt(val) || 0;
        setPointsToUse(Math.min(Math.max(0, num), maxPointsPossible));
    };

    const finalPayable = Math.max(0, total - pointsToUse);

    const handleRazorpayPayment = async (orderId, userId, user) => {
        try {
            // 1. Create Razorpay Order on Backend
            const { data: rzpOrder } = await axios.post("http://localhost:8080/rzp/create-order", {
                amount: total
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            const options = {
                key: "rzp_test_S8VpsaPPMfe66a", // This matches the backend key id
                amount: rzpOrder.amount,
                currency: "INR",
                name: "e-MART",
                description: "Purchase for Order #" + orderId,
                image: "https://cdn-icons-png.flaticon.com/512/3649/3649770.png",
                order_id: rzpOrder.id,
                config: {
                    display: {
                        blocks: {
                            utib: {
                                name: "Pay Using Axis Bank",
                                instruments: [
                                    {
                                        method: "card",
                                        issuers: ["UTIB"]
                                    },
                                    {
                                        method: "netbanking",
                                        banks: ["UTIB"]
                                    },
                                ]
                            },
                            other: {
                                name: "Other Payment Methods",
                                instruments: [
                                    {
                                        method: "card",
                                        issuers: ["ICIC"]
                                    },
                                    {
                                        method: 'netbanking',
                                    }
                                ]
                            }
                        },
                        hide: [
                            {
                                method: "upi"
                            }
                        ],
                        sequence: ["block.utib", "block.other"],
                        preferences: {
                            show_default_blocks: false
                        }
                    }
                },
                handler: async (response) => {
                    setLoading(true);
                    // 2. Verify Payment on Backend
                    const verifyRes = await axios.post("http://localhost:8080/rzp/verify-payment", response, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    });

                    if (verifyRes.data.status === "success") {
                        // 3. Save Payment Record & Trigger Email
                        await axios.post("http://localhost:8080/payments", {
                            orderId: orderId,
                            userId: userId,
                            amountPaid: total,
                            paymentMode: "RAZORPAY",
                            paymentStatus: "SUCCESS",
                            transactionId: response.razorpay_payment_id
                        }, {
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                        });

                        setSuccess(true);
                        await refreshCart();
                    }
                    setLoading(false);
                },
                modal: {
                    ondismiss: function () {
                        if (confirm("Are you sure you want to close the payment? Your order will not be completed.")) {
                            console.log("Checkout form closed by the user");
                            setLoading(false);
                        }
                    }
                },
                prefill: {
                    name: user.fullName || "",
                    email: user.email || "",
                    contact: user.mobile || ""
                },
                theme: {
                    color: "#6366f1"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
                setLoading(false);
            });
            rzp.open();

        } catch (error) {
            console.error("Razorpay initiation failed", error);
            alert("Failed to initiate online payment.");
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        const token = localStorage.getItem("token");
        const userJson = localStorage.getItem("user");

        if (!token || !userJson) {
            alert("Please login to continue");
            navigate("/login");
            return;
        }

        const user = JSON.parse(userJson);
        const userId = user.userId || user.id; // Support both DTO and legacy format

        // 🔥 Use contextCartId first, then user.cartId, then user.cart.id
        const cartId = contextCartId || user.cartId || (user.cart ? user.cart.id : null);

        if (!userId || !cartId) {
            console.warn("Session data missing:", { userId, cartId, contextCartId });
            alert("Order session expired. Please go back to cart.");
            return;
        }

        try {
            setLoading(true);

            // Step 1: Place Order
            const orderRes = await axios.post("http://localhost:8080/orders/place", {
                userId: userId,
                cartId: cartId,
                paymentMode: paymentMode
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const orderId = orderRes.data.id;

            if (paymentMode === "COD") {
                // For COD, create payment record with SUCCESS status immediately to trigger email
                await axios.post("http://localhost:8080/payments", {
                    orderId: orderId,
                    userId: userId,
                    amountPaid: total,
                    paymentMode: "COD",
                    paymentStatus: "SUCCESS", // Triggering backend email logic (Hamzah's code)
                    transactionId: "COD-" + Date.now()
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setSuccess(true);
                await refreshCart();
                setLoading(false);
            } else {
                // Online Payment via Razorpay
                await handleRazorpayPayment(orderId, userId, user);
            }

        } catch (error) {
            console.error("Payment failed", error);
            alert("Failed to process order. Please try again.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.paymentContainer}>
                <div className={styles.paymentCard} style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ color: '#10b981', marginBottom: '25px' }}>
                        <FiCheckCircle size={100} />
                    </div>
                    <h2 className={styles.sectionTitle} style={{ justifyContent: 'center' }}>Order Placed Successfully!</h2>
                    <p style={{ color: '#6b7280', marginBottom: '40px', fontSize: '1.1rem' }}>
                        Your purchase is complete. A PDF invoice has been sent to your email.
                    </p>
                    <button className={styles.payBtn} style={{ background: '#1a1a1a', color: 'white' }} onClick={() => navigate("/home")}>
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.paymentContainer}>
            <div className={styles.paymentGrid}>

                {/* Left: Payment Methods */}
                <div className={styles.paymentCard}>
                    <button className={styles.backBtn} onClick={() => navigate("/checkout/address")} style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
                        border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '30px', fontWeight: '600'
                    }}>
                        <FiChevronLeft /> Back to Shipping
                    </button>

                    <h2 className={styles.sectionTitle}>
                        <FiCreditCard /> Choose Payment Mode
                    </h2>

                    <div className={styles.methodGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <div
                            className={`${styles.methodCard} ${paymentMode === 'RAZORPAY' ? styles.activeMethod : ''}`}
                            onClick={() => setPaymentMode('RAZORPAY')}
                        >
                            <div className={styles.methodIcon}><FiCreditCard size={24} /></div>
                            <span className={styles.methodLabel}>Razorpay</span>
                            <span className={styles.methodDesc}>Credit/Debit Card, NetBanking</span>
                        </div>

                        <div
                            className={`${styles.methodCard} ${paymentMode === 'COD' ? styles.activeMethod : ''}`}
                            onClick={() => setPaymentMode('COD')}
                        >
                            <div className={styles.methodIcon}><FiTruck size={24} /></div>
                            <span className={styles.methodLabel}>Cash on Delivery</span>
                            <span className={styles.methodDesc}>Order now, pay on arrival</span>
                        </div>
                    </div>

                    {loyaltyCard && (
                        <div style={{ marginTop: '40px' }}>
                            <h2 className={styles.sectionTitle} style={{ fontSize: '1.2rem', color: '#bf953f' }}>
                                <FiGift /> Redeem Loyalty Points
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '20px' }}>
                                Available Balance: <strong>{loyaltyCard.pointsBalance} Points</strong> (1 Point = ₹1)
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                <button
                                    onClick={() => setPaymentChoice("CASH")}
                                    style={{
                                        padding: '12px', borderRadius: '12px', border: paymentChoice === 'CASH' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                        background: paymentChoice === 'CASH' ? 'rgba(99, 102, 241, 0.05)' : 'white', cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    Cash Only
                                </button>
                                {/* <button
                                    onClick={() => setPaymentChoice("POINTS")}
                                    disabled={loyaltyCard.pointsBalance === 0}
                                    style={{
                                        padding: '12px', borderRadius: '12px', border: paymentChoice === 'POINTS' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                        background: paymentChoice === 'POINTS' ? 'rgba(99, 102, 241, 0.05)' : 'white', cursor: 'pointer', fontWeight: '600',
                                        opacity: loyaltyCard.pointsBalance === 0 ? 0.5 : 1
                                    }}
                                >
                                    Points Only
                                </button> */}
                                <button
                                    onClick={() => setPaymentChoice("BOTH")}
                                    disabled={loyaltyCard.pointsBalance === 0}
                                    style={{
                                        padding: '12px', borderRadius: '12px', border: paymentChoice === 'BOTH' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                        background: paymentChoice === 'BOTH' ? 'rgba(99, 102, 241, 0.05)' : 'white', cursor: 'pointer', fontWeight: '600',
                                        opacity: loyaltyCard.pointsBalance === 0 ? 0.5 : 1
                                    }}
                                >
                                    Both
                                </button>
                            </div>

                            {paymentChoice === "BOTH" && (
                                <div style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>
                                        Enter points to redeem (Max {maxPointsPossible}):
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            type="number"
                                            value={pointsToUse}
                                            onChange={(e) => handlePointsChange(e.target.value)}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db',
                                                fontSize: '1rem', outline: 'none'
                                            }}
                                        />
                                        <button onClick={() => setPointsToUse(maxPointsPossible)} style={{
                                            padding: '10px 15px', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer'
                                        }}>
                                            Max
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{
                        marginTop: '50px', padding: '25px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.05)',
                        display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(99, 102, 241, 0.1)'
                    }}>
                        <div style={{
                            width: '40px', height: '40px', background: '#6366f1', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                            <FiLock size={20} />
                        </div>
                        <div>
                            <p style={{ fontWeight: '700', color: '#1a1a1a' }}>100% Secure Checkout</p>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                Encrypted payments handled by bank-grade security protocols.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div className={styles.summaryCard}>
                    <h3 className={styles.summaryTitle}>Final Summary</h3>

                    <div className={styles.summaryRow}>
                        <span>Cart Total</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Delivery</span>
                        <span style={{ color: delivery === 0 ? '#10b981' : 'white', fontWeight: '700' }}>
                            {delivery === 0 ? 'FREE' : `₹${delivery.toFixed(2)}`}
                        </span>
                    </div>

                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                        <span>Total Payable</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>

                    <button
                        className={styles.payBtn}
                        disabled={loading || cartItems.length === 0}
                        onClick={handlePayment}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiActivity className="spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <>
                                <FiShoppingBag />
                                <span>{paymentMode === 'COD' ? 'Confirm Order' : `Pay ₹${total.toFixed(0)}`}</span>
                                <FiArrowRight />
                            </>
                        )}
                    </button>

                    <p style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.4)' }}>
                        Trusted by 10k+ customers daily
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Payment;
