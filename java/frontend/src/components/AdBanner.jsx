import React, { useState, useEffect } from 'react';
import styles from '../styles/AdBanner.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AdBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const slides = [
        {
            id: 1,
            headline: "Mega Electronics Sale",
            description: "Up to 50% off on premium gadgets. Upgrade your tech today.",
            image: "https://placehold.co/400x300/0078d4/fff?text=Mobiles+&+Laptops",
            primaryBtn: "Shop Now",
            secondaryBtn: "View Offers",
            bgColor: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)" // Light Blue
        },
        {
            id: 2,
            headline: "Latest Fashion Trends",
            description: "Redefine your style with our summer collection.",
            image: "https://placehold.co/400x300/e91e63/fff?text=Men+&+Women",
            primaryBtn: "Shop Now",
            secondaryBtn: "New Arrivals",
            bgColor: "linear-gradient(to right, #fce4ec, #f8bbd0)" // Light Pink
        },
        {
            id: 3,
            headline: "Home & Kitchen",
            description: "Essentials for a modern home. Best deals on appliances.",
            image: "https://placehold.co/400x300/4caf50/fff?text=Home+Ap",
            primaryBtn: "Shop Now",
            secondaryBtn: "Explore",
            bgColor: "linear-gradient(120deg, #e8f5e9 0%, #c8e6c9 100%)" // Light Green
        }
    ];

    useEffect(() => {
        let interval;
        if (!isPaused) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isPaused, slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
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
                        style={{ background: slide.bgColor }}
                    >
                        <div className={styles.textSection}>
                            <h2 className={styles.headline}>{slide.headline}</h2>
                            <p className={styles.description}>{slide.description}</p>
                            <div className={styles.buttonGroup}>
                                <button className={styles.primaryBtn}>{slide.primaryBtn}</button>
                                <button className={styles.secondaryBtn}>{slide.secondaryBtn}</button>
                            </div>
                        </div>
                        <div className={styles.imageSection}>
                            <img src={slide.image} alt={slide.headline} className={styles.bannerImage} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button className={`${styles.arrow} ${styles.leftArrow}`} onClick={prevSlide}>
                <FaChevronLeft />
            </button>
            <button className={`${styles.arrow} ${styles.rightArrow}`} onClick={nextSlide}>
                <FaChevronRight />
            </button>

            {/* Dots */}
            <div className={styles.dotsContainer}>
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.dot} ${currentSlide === index ? styles.active : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdBanner;
