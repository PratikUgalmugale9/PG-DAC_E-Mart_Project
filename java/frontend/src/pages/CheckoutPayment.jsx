import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CheckoutPayment = () => {

    const navigate = useNavigate();

    // 🔥 CART CONTEXT
    const { clearCart, refreshCart } = useCart();

    // 🔐 Logged-in user
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id || user?.userId;

    // 💰 Amount from cart
    const totalAmount = Number(localStorage.getItem("payableAmount")) || 0;

    // 🚀 Open Razorpay when page loads
    useEffect(() => {
        if (!totalAmount || totalAmount <= 0) {
            alert("Invalid payment amount");
            navigate("/cart");
            return;
        }

        openRazorpay();
        // eslint-disable-next-line
    }, []);

    const openRazorpay = () => {

        if (!window.Razorpay) {
            alert("Razorpay SDK not loaded");
            return;
        }

        const options = {
            key: "rzp_test_S9aXyMGNFu8gWE", // test key
            amount: totalAmount * 100,     // ₹ → paise
            currency: "INR",
            name: "E-Mart",
            description: "Order Payment",

            handler: async function (response) {
                try {
                    // ✅ SAVE PAYMENT
                    await axios.post(
                        "http://localhost:8080/payments",
                        {
                            userId: userId,
                            amountPaid: totalAmount,
                            paymentMode: "RAZORPAY",
                            paymentStatus: "SUCCESS",
                            transactionId: response.razorpay_payment_id
                        }
                    );

                    // 🔥 VERY IMPORTANT
                    clearCart();      // clear frontend cart instantly
                    await refreshCart(); // sync with backend

                    // Cleanup
                    localStorage.removeItem("payableAmount");

                    alert("Payment successful 🎉");

                    // ✅ Redirect user
                    navigate("/home");

                } catch (err) {
                    console.error("❌ Payment save error:", err);
                    alert("Payment save failed");
                }
            },

            modal: {
                ondismiss: function () {
                    alert("Payment cancelled");
                    navigate("/cart");
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // No UI – Razorpay opens directly
    return null;
};

export default CheckoutPayment;
