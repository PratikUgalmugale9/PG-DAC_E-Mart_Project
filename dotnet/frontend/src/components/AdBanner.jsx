// import React, { useState, useEffect } from 'react';
// import styles from '../styles/AdBanner.module.css';
// import { useNavigate } from "react-router-dom";


// const AdBanner = () => {
//     const [currentSlide, setCurrentSlide] = useState(0);
//     const [isPaused, setIsPaused] = useState(false);

//     const navigate = useNavigate();


//     const slides = [
//         {
//             id: 1,
//             category: "MB01",
//             headline: "Mega Electronics Sale",
//             tagline: "Upgrade Your Tech",
//             description: "Up to 50% off on premium gadgets, smartphones, and accessories",
//             discount: "50% OFF",
//             primaryBtn: "Shop Now",
//             secondaryBtn: "View Offers",
//             bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//             icon: (
//                 <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                     <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
//                     <polyline points="17 2 12 7 7 2"></polyline>
//                 </svg>
//             )
//         },
//         {
//             id: 2,
//              category: "FW01",
//             headline: "Latest Fashion Trends",
//             tagline: "Summer Collection",
//             description: "Discover the hottest styles for the season. Limited time offers!",
//             discount: "40% OFF",
//             primaryBtn: "Shop Now",
//             secondaryBtn: "New Arrivals",
//             bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
//             icon: (
//                 <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                     <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
//                     <line x1="7" y1="7" x2="7.01" y2="7"></line>
//                 </svg>
//             )
//         },
//         {
//             id: 3,
//              category: "HP001",
//             headline: "Smart Home Deals",
//             tagline: "Modern Living",
//             description: "Transform your home with the latest appliances and smart devices",
//             discount: "30% OFF",
//             primaryBtn: "Shop Now",
//             secondaryBtn: "Explore",
//             bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
//             icon: (
//                 <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                     <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
//                     <polyline points="9 22 9 12 15 12 15 22"></polyline>
//                 </svg>
//             )
//         }
//     ];

//     useEffect(() => {
//         let interval;
//         if (!isPaused) {
//             interval = setInterval(() => {
//                 setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
//             }, 4000);
//         }
//         return () => clearInterval(interval);
//     }, [isPaused, slides.length]);

//     const nextSlide = () => {
//         setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
//     };

//     const prevSlide = () => {
//         setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
//     };

//     const goToSlide = (index) => {
//         setCurrentSlide(index);
//     };

//     const handleCategoryNavigation = (category) => {
//         setIsPaused(true);      
//   navigate(`/browse/${category}`);
// };


//     return (
//         <div
//             className={styles.bannerContainer}
//             onMouseEnter={() => setIsPaused(true)}
//             onMouseLeave={() => setIsPaused(false)}
//         >
//             <div
//                 className={styles.slideTrack}
//                 style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//             >
//                 {slides.map((slide) => (
//                     <div
//                         key={slide.id}
//                         className={styles.slide}
//                         style={{ background: slide.bgGradient }}
//                     >
//                         <div className={styles.contentWrapper}>
//                             <div className={styles.textSection}>
//                                 <div className={styles.discountBadge}>
//                                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                         <circle cx="12" cy="12" r="10"></circle>
//                                         <path d="M16 8l-8 8"></path>
//                                         <circle cx="9" cy="9" r="0.5" fill="currentColor"></circle>
//                                         <circle cx="15" cy="15" r="0.5" fill="currentColor"></circle>
//                                     </svg>
//                                     <span>{slide.discount}</span>
//                                 </div>
//                                 <h2 className={styles.headline}>{slide.headline}</h2>
//                                 <p className={styles.tagline}>{slide.tagline}</p>
//                                 <p className={styles.description}>{slide.description}</p>
//                                 <div className={styles.buttonGroup}>
//                                     <button className={styles.primaryBtn}>
//                                         {slide.primaryBtn}
//                                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                             <polyline points="9 18 15 12 9 6"></polyline>
//                                         </svg>
//                                     </button>
//                                     <button className={styles.secondaryBtn} 
//                                     onClick={() => handleCategoryNavigation(slide.category)}
//                                     >
//                                         {slide.secondaryBtn}
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className={styles.iconSection}>
//                                 <div className={styles.iconCircle}>
//                                     {slide.icon}
//                                 </div>
//                                 <div className={styles.decorCircle1}></div>
//                                 <div className={styles.decorCircle2}></div>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Navigation Arrows */}
//             <button className={`${styles.arrow} ${styles.leftArrow}`} onClick={prevSlide}>
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polyline points="15 18 9 12 15 6"></polyline>
//                 </svg>
//             </button>
//             <button className={`${styles.arrow} ${styles.rightArrow}`} onClick={nextSlide}>
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polyline points="9 18 15 12 9 6"></polyline>
//                 </svg>
//             </button>

//             {/* Dots */}
//             <div className={styles.dotsContainer}>
//                 {slides.map((_, index) => (
//                     <div
//                         key={index}
//                         className={`${styles.dot} ${currentSlide === index ? styles.active : ''}`}
//                         onClick={() => goToSlide(index)}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default AdBanner;

import React, { useState, useEffect } from 'react';
import styles from '../styles/AdBanner.module.css';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdBanner = () => {
    const { t } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const navigate = useNavigate();

    const slides = [
        {
            id: 1,
            category: "MB01",
            headline: t("hero.title"),
            tagline: t("hero.subtitle"),
            description: t("hero.description"),
            discount: t("hero.discountBadge"),
            primaryBtn: t("hero.shopNow"),
            secondaryBtn: t("hero.viewOffers"),
            bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        {
            id: 2,
            category: "FW01",
            headline: t("banner2.title"),
            tagline: t("banner2.subtitle"),
            description: t("banner2.description"),
            discount: "40% OFF",
            primaryBtn: t("hero.shopNow"),
            secondaryBtn: t("banner2.secondary"),
            bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        },
        {
            id: 3,
            category: "HP001",
            headline: t("banner3.title"),
            tagline: t("banner3.subtitle"),
            description: t("banner3.description"),
            discount: "30% OFF",
            primaryBtn: t("hero.shopNow"),
            secondaryBtn: t("banner3.secondary"),
            bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        }
    ];

    useEffect(() => {
        let interval;
        if (!isPaused) {
            interval = setInterval(() => {
                setCurrentSlide((prev) =>
                    prev === slides.length - 1 ? 0 : prev + 1
                );
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isPaused, slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) =>
            prev === slides.length - 1 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrentSlide((prev) =>
            prev === 0 ? slides.length - 1 : prev - 1
        );
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const handleCategoryNavigation = (category) => {
        setIsPaused(true);
        navigate(`/browse/${category}`);
    };

    return (
        <div
            className={styles.bannerContainer}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className={styles.slideTrack}
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className={styles.slide}
                        style={{ background: slide.bgGradient }}
                    >
                        <div className={styles.contentWrapper}>
                            <div className={styles.textSection}>
                                <div className={styles.discountBadge}>
                                    <span>{slide.discount}</span>
                                </div>

                                <h2 className={styles.headline}>
                                    {slide.headline}
                                </h2>

                                <p className={styles.tagline}>
                                    {slide.tagline}
                                </p>

                                <p className={styles.description}>
                                    {slide.description}
                                </p>

                                <div className={styles.buttonGroup}>
                                    <button
                                        className={styles.primaryBtn}
                                        onClick={() =>
                                            handleCategoryNavigation(slide.category)
                                        }
                                    >
                                        {slide.primaryBtn}
                                    </button>

                                    <button
                                        className={styles.secondaryBtn}
                                        onClick={() =>
                                            handleCategoryNavigation(slide.category)
                                        }
                                    >
                                        {slide.secondaryBtn}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Left Arrow */}
            <button
                className={`${styles.arrow} ${styles.leftArrow}`}
                onClick={prevSlide}
            >
                ‹
            </button>

            {/* Right Arrow */}
            <button
                className={`${styles.arrow} ${styles.rightArrow}`}
                onClick={nextSlide}
            >
                ›
            </button>

            {/* Dots */}
            <div className={styles.dotsContainer}>
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.dot} ${
                            currentSlide === index ? styles.active : ""
                        }`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdBanner;
