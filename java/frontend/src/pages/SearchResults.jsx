import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/HomePage.module.css";
import { useCart } from "../context/CartContext";

const SearchResults = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(search).get("q");

  const { addToCart, removeFromCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isInCart = (id) => cartItems.some((item) => item.id === id);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    axios
      .get(`http://localhost:8080/api/products/search?q=${query}`)
      .then((res) => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setLoading(false);
      });
  }, [query]);

  if (loading) {
    return <div style={{ padding: "40px" }}>Searching products...</div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ marginBottom: "25px" }}>
        Search results for “{query}”
      </h2>

      <div className={styles.productGrid}>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((prod) => (
            <div key={prod.id} className={styles.productCard}>
              {/* IMAGE */}
              <div
                className={styles.prodImageContainer}
                onClick={() => navigate(`/product/${prod.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={`/${prod.prodImagePath}`}
                  alt={prod.prodName}
                  className={styles.prodImage}
                  onError={(e) =>
                    (e.target.src = "/images/default.jpg")
                  }
                />
              </div>

              {/* INFO */}
              <div className={styles.prodInfo}>
                <h3
                  className={styles.prodName}
                  onClick={() => navigate(`/product/${prod.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {prod.prodName}
                </h3>

                <div className={styles.prodPrice}>
                  ₹ {prod.cardholderPrice}
                </div>

                {/* ADD TO CART */}
                <button
                  className={styles.addToCartBtn}
                  onClick={() => {
                    if (isInCart(prod.id)) {
                      removeFromCart(prod.id);
                    } else {
                      addToCart({
                        id: prod.id,
                        name: prod.prodName,
                        price: prod.cardholderPrice,
                        mrpPrice: prod.mrpPrice,
                        cardholderPrice: prod.cardholderPrice,
                        pointsToBeRedeem: prod.pointsToBeRedeem,
                        image: `/${prod.prodImagePath}`,
                        quantity: 1,
                      });
                    }
                  }}
                  style={{
                    background: isInCart(prod.id) ? "#22c55e" : "",
                  }}
                >
                  {isInCart(prod.id) ? "Added" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;
