import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/HomePage.module.css";

// 🔥 CART CONTEXT
import { useCart } from "../context/CartContext";

const BrowseCategory = () => {
  const { catId } = useParams(); // Example: C001, MOB001 etc
  const navigate = useNavigate();

  const { addToCart, removeFromCart, cartItems } = useCart();

  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [hasSubCategories, setHasSubCategories] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Check if product already exists in cart
  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  // ✅ Helper to fix missing category images
  const getCategoryImage = (cat) => {
    if (cat.catImagePath && cat.catImagePath.trim() !== "" && !cat.catImagePath.includes("placeholder")) {
      return cat.catImagePath;
    }

    const name = cat.catName.toLowerCase();

    // Electronics & Gadgets
    if (name.includes("smartphone")) return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1780&auto=format&fit=crop";
    if (name.includes("mobile")) return "/images/electronics/mobile.jpg";
    if (name.includes("laptop")) return "/images/electronics/laptop.jpg";
    if (name.includes("camera") || name.includes("nikon") || name.includes("canon")) return "/images/electronics/camera.jpg";
    if (name.includes("sony") || name.includes("apple") || name.includes("mi") || name.includes("samsung")) return "/images/electronics/electronics.jpg";

    // Home Appliances
    if (name.includes("refrigerator") || name.includes("fridge")) return "/images/homeappliances/refrigerator.jpg";
    if (name.includes("microwave")) return "/images/homeappliances/microwave_v2.png";
    if (name.includes("kitchen")) return "/images/homeappliances/kitchen_v2.png";
    if (name.includes("cleaning") || name.includes("vacuum") || name.includes("purifier")) return "/images/homeappliances/cleaning_v2.png";
    if (name.includes("washing machine") || name.includes("washer") || name.includes("dryer")) return "/images/homeappliances/washingmachine.jpg";
    if (name.includes("tv") || name.includes("television") || name.includes("monitor")) return "/images/homeappliances/tv.jpg";
    if (name.includes("door")) {
      if (name.includes("single")) return "/images/homeappliances/singledoor.jpg";
      if (name.includes("double")) return "/images/homeappliances/doubledoor.jpg";
      if (name.includes("triple")) return "/images/homeappliances/tripledoor.jpg";
    }

    // Fashion & Apparel
    if (name.includes("ethnic")) return "/images/fashion/ethnicwear.jpg";
    if (name.includes("western")) return "/images/fashion/westernwear.jpg";
    if (name.includes("topwear") || name.includes("shirt") || name.includes("t-shirt")) return "/images/fashion/topwear.jpg";
    if (name.includes("bottomwear") || name.includes("jeans") || name.includes("pant")) return "/images/fashion/bottomwear.jpg";
    if (name.includes("men")) return "/images/fashion/mens.jpg";
    if (name.includes("women")) return "/images/fashion/womens.jpg";
    if (name.includes("kid") || name.includes("boy") || name.includes("girl") || name.includes("baby")) return "/images/fashion/kids.jpg";
    if (name.includes("accessory") || name.includes("accessories") || name.includes("bag") || name.includes("belt")) return "/images/fashion/accessories.jpg";

    // Jewelry, Beauty & Personal Care
    if (name.includes("jwel") || name.includes("jewelry") || name.includes("gold") || name.includes("silver")) return "/images/womensacc/jwellery.jpg";
    if (name.includes("perfume") || name.includes("fragrance") || name.includes("deo")) return "/images/womensacc/perfumes.jpg";
    if (name.includes("beauty") || name.includes("personal care") || name.includes("skincare") || name.includes("makeup")) return "/images/womensacc/beauty.jpg";
    if (name.includes("lipstick") || name.includes("mask") || name.includes("soap") || name.includes("shampoo") || name.includes("hair")) return "/images/womensacc/beauty.jpg";

    // Sports, Hobbies & Gaming
    if (name.includes("cricket")) return "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2070&auto=format&fit=crop";
    if (name.includes("football") || name.includes("soccer")) return "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2070&auto=format&fit=crop";
    if (name.includes("indoor sport") || name.includes("badminton") || name.includes("table tennis")) return "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop";
    if (name.includes("outdoor sport") || name.includes("cycling") || name.includes("running")) return "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2093&auto=format&fit=crop";
    if (name.includes("chess") || name.includes("board game")) return "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?q=80&w=2070&auto=format&fit=crop";
    if (name.includes("sport") || name.includes("fitness") || name.includes("gym")) return "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop";
    if (name.includes("game") || name.includes("gaming") || name.includes("console") || name.includes("ps5") || name.includes("xbox")) return "https://images.unsplash.com/photo-1486401899868-0e43590528c6?q=80&w=2070&auto=format&fit=crop";

    // Furniture & Home Decor
    if (name.includes("furniture") || name.includes("sofa") || name.includes("chair") || name.includes("table") || name.includes("bed")) return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop";
    if (name.includes("decor") || name.includes("lighting") || name.includes("curtain")) return "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070&auto=format&fit=crop";

    // Books & Stationery
    if (name.includes("book") || name.includes("novel") || name.includes("stationery") || name.includes("pen") || name.includes("notebook")) return "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop";

    // Grocery & Daily Essentials
    if (name.includes("grocery") || name.includes("food") || name.includes("drink") || name.includes("snack") || name.includes("oil") || name.includes("rice")) return "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074&auto=format&fit=crop";

    // Toys & Kids' Hobbies
    if (name.includes("toy") || name.includes("game") || name.includes("puzzle") || name.includes("doll") || name.includes("action figure")) return "https://images.unsplash.com/photo-1532330393533-443990a51d10?q=80&w=2070&auto=format&fit=crop";

    // Healthcare & Wellness
    if (name.includes("health") || name.includes("medicine") || name.includes("vitamin") || name.includes("fitness") || name.includes("yoga")) return "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop";

    // Automotive & Gadgets
    if (name.includes("car") || name.includes("bike") || name.includes("accessory") || name.includes("helmet")) return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083&auto=format&fit=crop";

    return "/images/default.jpg";
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
                      src={getCategoryImage(sub)}
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

                  <div
                    className={styles.prodImageContainer}
                    onClick={() => navigate(`/product/${prod.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={`/${prod.prodImagePath}`}
                      alt={prod.prodName}
                      className={styles.prodImage}
                      onError={(e) => e.target.src = "/images/default.jpg"}
                    />
                  </div>

                  <div className={styles.prodInfo}>
                    <h3
                      className={styles.prodName}
                      onClick={() => navigate(`/product/${prod.id}`)}
                      style={{ cursor: 'pointer' }}
                    >{prod.prodName}</h3>

                    <div className={styles.prodPrice}>
                      ₹{prod.mrpPrice}
                    </div>

                    {/* 🔥 ADD TO CART */}
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
                            quantity: 1
                          });
                        }
                      }}
                      style={{
                        background: isInCart(prod.id) ? '#22c55e' : '',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isInCart(prod.id) ? 'Added' : 'Add to Cart'}
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
                      src={getCategoryImage(sub)}
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
                  <div
                    className={styles.prodImageContainer}
                    onClick={() => navigate(`/product/${prod.id}`)}
                    style={{ cursor: 'pointer' }}
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

                  {/* ✅ Product Info */}
                  <div className={styles.prodInfo}>
                    <h3
                      className={styles.prodName}
                      onClick={() => navigate(`/product/${prod.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {prod.prodName}
                    </h3>

                    <div className={styles.prodPrice}>
                      ₹ {prod.mrpPrice}
                    </div>

                    {/* ✅ Add To Cart Button */}
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
                            image: `/${prod.prodImagePath}`,
                            quantity: 1,
                          });
                        }
                      }}
                      style={{
                        background: isInCart(prod.id) ? '#22c55e' : '',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isInCart(prod.id)
                        ? "Added"
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
