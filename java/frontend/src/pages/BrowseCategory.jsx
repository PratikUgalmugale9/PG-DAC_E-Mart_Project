import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/HomePage.module.css";

// 🔥 CART CONTEXT
import { useCart } from "../context/CartContext";

// const BrowseCategory = () => {

//     const { catId } = useParams();     // C001, EP001, etc
//     const navigate = useNavigate();

//     const { addToCart, cartItems } = useCart();   // 🔥 GET CART ITEMS TOO

//     const [products, setProducts] = useState([]);
//     const [subCategories, setSubCategories] = useState([]);
//     const [hasSubCategories, setHasSubCategories] = useState(false);
//     const [loading, setLoading] = useState(true);

//     // Check if product is in cart
//     const isInCart = (productId) => {
//         return cartItems.some(item => item.id === productId);
//     };

//     useEffect(() => {
//         setLoading(true);

//         axios
//             .get(`http://localhost:8080/api/catalog/categories/${catId}`)
//             .then(res => {
//                 const data = res.data;

//                 setHasSubCategories(data.hasSubCategories);

//                 if (data.hasSubCategories) {
//                     setSubCategories(data.subCategories || []);
//                     setProducts([]);
//                 } else {
//                     setProducts(data.products || []);
//                     setSubCategories([]);
//                 }

//                 setLoading(false);
//             })
//             .catch(err => {
//                 console.error("Error loading category:", err);
//                 setLoading(false);
//             });

//     }, [catId]);

//     if (loading) {
//         return <h2 style={{ textAlign: "center", marginTop: "40px" }}>Loading...</h2>;
//     }

const BrowseCategory = () => {
  const { catId } = useParams(); // Example: C001, MOB001 etc
  const navigate = useNavigate();

  const { addToCart, cartItems } = useCart();

  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [hasSubCategories, setHasSubCategories] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Check if product already exists in cart
  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  // ✅ Load Category Data
  useEffect(() => {
    setLoading(true);

    axios
      .get(`http://localhost:8080/api/catalog/categories/${catId}`)
      .then((res) => {
        const data = res.data;

        console.log("CATEGORY RESPONSE:", data);

        // ✅ Check if category has subcategories
        setHasSubCategories(data.hasSubCategories);

        // ✅ If Parent Category → Show Only Subcategories
        if (data.hasSubCategories) {
          setSubCategories(data.subCategories || []);
          setProducts([]); // ❌ No products on main category page
        }

        // ✅ If Subcategory → Show Products
        else {
          setProducts(data.products || []);
          setSubCategories([]); // ❌ No subcategories here
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading category:", err);
        setLoading(false);
      });
  }, [catId]);

  // ✅ Loading Screen
  if (loading) {
    return (
        <div style={{ padding: "40px" }}>

            {/* 🔹 SUBCATEGORIES VIEW */}
            {hasSubCategories && (
                <>
                    <h2 style={{ marginBottom: "25px" }}>Categories</h2>

                    <div className={styles.categoryGrid}>
                        {subCategories.map(sub => (
                            <div
                                key={sub.id}
                                className={styles.categoryCard}
                                onClick={() => navigate(`/browse/${sub.catId}`)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className={styles.catImageContainer}>
                                    <img
                                        src={sub.catImagePath}
                                        alt={sub.catName}
                                        className={styles.catImage}
                                        onError={(e) => e.target.src = "/images/default.jpg"}
                                    />
                                </div>
                                <div className={styles.catName}>
                                    {sub.catName}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* 🔹 PRODUCTS VIEW */}
            {!hasSubCategories && (
                <>
                    <h2 style={{ marginBottom: "25px" }}>Products</h2>

                    <div className={styles.productGrid}>

                        {products.length === 0 && (
                            <p style={{ fontSize: "18px" }}>
                                No products found in this category.
                            </p>
                        )}

                        {products.map(prod => (
                            <div key={prod.id} className={styles.productCard}>

                                <div className={styles.prodImageContainer}>
                                    <img
                                        src={`/${prod.prodImagePath}`}
                                        alt={prod.prodName}
                                        className={styles.prodImage}
                                        onError={(e) => e.target.src = "/images/default.jpg"}
                                    />
                                </div>

                                <div className={styles.prodInfo}>
                                    <h3 className={styles.prodName}>{prod.prodName}</h3>

                                    <div className={styles.prodPrice}>
                                        ₹{prod.cardholderPrice}
                                    </div>

                                    {/* 🔥 ADD TO CART */}
                                    <button
                                        className={styles.addToCartBtn}
                                        onClick={() =>
                                            addToCart({
                                                id: prod.id,
                                                name: prod.prodName,
                                                price: prod.cardholderPrice,
                                                mrpPrice: prod.mrpPrice,
                                                cardholderPrice: prod.cardholderPrice,
                                                pointsToBeRedeem: prod.pointsToBeRedeem,
                                                image: `/${prod.prodImagePath}`,
                                                quantity: 1
                                            })
                                        }
                                        disabled={isInCart(prod.id)}
                                        style={{
                                            opacity: isInCart(prod.id) ? 0.6 : 1,
                                            cursor: isInCart(prod.id) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {isInCart(prod.id) ? 'Added to Cart' : 'Add to Cart'}
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                </>
            )}

        </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>

      {/* ✅ MAIN CATEGORY VIEW → ONLY SUBCATEGORIES */}
      {hasSubCategories && (
        <>
          <h2 style={{ marginBottom: "25px" }}>Categories</h2>

          <div className={styles.categoryGrid}>
            {subCategories.length === 0 ? (
              <p>No subcategories found.</p>
            ) : (
              subCategories.map((sub) => (
                <div
                  key={sub.id}
                  className={styles.categoryCard}
                  onClick={() => navigate(`/browse/${sub.catId}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.catImageContainer}>
                    <img
                      src={sub.catImagePath}
                      alt={sub.catName}
                      className={styles.catImage}
                      onError={(e) =>
                        (e.target.src = "/images/default.jpg")
                      }
                    />
                  </div>

                  <div className={styles.catName}>
                    {sub.catName}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ✅ SUBCATEGORY VIEW → ONLY PRODUCTS */}
      {!hasSubCategories && (
        <>
          <h2 style={{ marginBottom: "25px" }}>Products</h2>

          <div className={styles.productGrid}>
            {products.length === 0 ? (
              <p style={{ fontSize: "18px" }}>
                No products found in this subcategory.
              </p>
            ) : (
              products.map((prod) => (
                <div key={prod.id} className={styles.productCard}>

                  {/* ✅ Product Image */}
                  <div className={styles.prodImageContainer}>
                    <img
                      src={`/${prod.prodImagePath}`}
                      alt={prod.prodName}
                      className={styles.prodImage}
                      onError={(e) =>
                        (e.target.src = "/images/default.jpg")
                      }
                    />
                  </div>

                  {/* ✅ Product Info */}
                  <div className={styles.prodInfo}>
                    <h3 className={styles.prodName}>
                      {prod.prodName}
                    </h3>

                    <div className={styles.prodPrice}>
                      ₹ {prod.cardholderPrice}
                    </div>

                    {/* ✅ Add To Cart Button */}
                    <button
                      className={styles.addToCartBtn}
                      onClick={() =>
                        addToCart({
                          id: prod.id,
                          name: prod.prodName,
                          price: prod.cardholderPrice,
                          image: `/${prod.prodImagePath}`,
                          quantity: 1,
                        })
                      }
                      disabled={isInCart(prod.id)}
                      style={{
                        opacity: isInCart(prod.id) ? 0.6 : 1,
                        cursor: isInCart(prod.id)
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      {isInCart(prod.id)
                        ? "Added to Cart"
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};


export default BrowseCategory;
