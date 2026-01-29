// import { useState } from "react";
// import axios from "axios";

// const CheckoutAddress = ({ onAddressSaved }) => {

//   const [address, setAddress] = useState({
//     fullName: "",
//     mobile: "",
//     houseNo: "",
//     street: "",
//     city: "",
//     state: "",
//     pincode: ""
//   });

//   const token = localStorage.getItem("token");

//   const handleChange = (e) => {
//     setAddress({ ...address, [e.target.name]: e.target.value });
//   };

//   const saveAddress = async () => {
//     await axios.post(
//       "http://localhost:8080/api/address/add",
//       address,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }
//     );

//     onAddressSaved(); // go to payment
//   };

//   return (
//     <div>
//       <h2>Delivery Address</h2>

//       <input name="fullName" placeholder="Full Name" onChange={handleChange} />
//       <input name="mobile" placeholder="Mobile" onChange={handleChange} />
//       <input name="houseNo" placeholder="House No" onChange={handleChange} />
//       <input name="street" placeholder="Street" onChange={handleChange} />
//       <input name="city" placeholder="City" onChange={handleChange} />
//       <input name="state" placeholder="State" onChange={handleChange} />
//       <input name="pincode" placeholder="Pincode" onChange={handleChange} />

//       <button onClick={saveAddress}>Proceed to Payment</button>
//     </div>
//   );
// };

// export default CheckoutAddress;


import { useState } from "react";
import axios from "axios";
import "../styles/CheckoutAddress.css";
import { useNavigate } from "react-router-dom";


const CheckoutAddress = ({ onProceedToPayment }) => {

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    houseNo: "",
    street: "",
    city: "",
    state: "",
    pincode: ""
  });

  const navigate=useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const saveAddress = async () => {
    setError("");

    // basic validation
    if (
      !address.fullName ||
      !address.mobile ||
      !address.houseNo ||
      !address.city ||
      !address.pincode
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:8080/api/address/add",
        address,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // move to payment page
      //onProceedToPayment();

      navigate("/payment");

    } catch (err) {
      console.error("Address save failed", err);
      setError("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">

        <h2 className="checkout-title">Delivery Address</h2>

        {error && <p className="error-text">{error}</p>}

        <div className="form-grid">
          <input name="fullName" placeholder="Full Name *" onChange={handleChange} />
          <input name="mobile" placeholder="Mobile Number *" onChange={handleChange} />
          <input name="houseNo" placeholder="House / Flat No *" onChange={handleChange} />
          <input name="street" placeholder="Street / Area" onChange={handleChange} />
          <input name="city" placeholder="City *" onChange={handleChange} />
          <input name="state" placeholder="State" onChange={handleChange} />
          <input name="pincode" placeholder="Pincode *" onChange={handleChange} />
        </div>

        <button
          className="checkout-btn"
          onClick={saveAddress}
          disabled={loading}
        >
          {loading ? "Saving..." : "Proceed to Payment"}
        </button>

      </div>
    </div>
  );
};

export default CheckoutAddress;
