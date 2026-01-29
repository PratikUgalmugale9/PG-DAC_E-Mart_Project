import { useEffect } from "react";
import axios from "axios";

const CheckoutPayment = () => {

    // 🔐 Logged-in user
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id || user?.userId;

    // 💰 Amount from cart
    const totalAmount = Number(localStorage.getItem("payableAmount")) || 0;

    // 🧾 Demo order id (replace later with real order)
    const orderId = 1;

    // 🚀 Open Razorpay immediately
    useEffect(() => {
        if (!totalAmount || totalAmount <= 0) {
            alert("Invalid payment amount");
            return;
        }
        openRazorpay();
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
                    await axios.post(
                        "http://localhost:8080/payments",
                        {
                            orderId: orderId,
                            userId: userId,
                            amountPaid: totalAmount,
                            paymentMode: "RAZORPAY",          // ✅ REQUIRED
                            paymentStatus: "SUCCESS",         // ✅ REQUIRED
                            transactionId: response.razorpay_payment_id
                        }
                    );

                    alert("Payment successful 🎉");
                    // Optional: redirect to success page
                    // window.location.href = "/order-success";

                } catch (err) {
                    console.error("Payment save error:", err);
                    alert("Payment save failed");
                }
            },

            modal: {
                ondismiss: function () {
                    alert("Payment cancelled");
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // No UI, direct Razorpay popup
    return null;
};

export default CheckoutPayment;
