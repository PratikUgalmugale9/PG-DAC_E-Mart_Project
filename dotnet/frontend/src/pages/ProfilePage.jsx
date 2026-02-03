import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const cardRef = useRef(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                // 1. Get User from LocalStorage (Reliable & Fast - derived from CartPage logic)
                const userJson = localStorage.getItem("user");
                const token = localStorage.getItem("token");

                if (!userJson || !token) {
                    navigate('/login');
                    return;
                }

                const userData = JSON.parse(userJson);
                setUser(userData);

                // 2. Fetch Loyalty Card using User ID from LocalStorage
                // We use the exact endpoint that works in CartPage: /loyaltycard/user/{id}
                // We DO NOT send the Authorization header, matching CartPage's working behavior
                const userId = userData.id || userData.userId;

                if (userId) {
                    try {
                        const response = await axios.get(`http://localhost:8080/api/loyaltycard/user/${userId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        // Check for active status like CartPage does
                        if (response.data && String(response.data.isActive).toLowerCase() === 'y') {
                            setCard(response.data);
                        }
                    } catch (cardError) {
                        console.log("No loyalty card found or validation error:", cardError);
                    }
                }

            } catch (err) {
                console.error("Profile load error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const cardElem = cardRef.current;
        const box = cardElem.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        const centerX = box.width / 2;
        const centerY = box.height / 2;

        const rotateX = (centerY - y) / 10;
        const rotateY = (x - centerX) / 20;

        cardElem.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        const gloss = cardElem.querySelector(`.${styles.cardGlow}`);
        if (gloss) {
            gloss.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2) 0%, transparent 80%)`;
        }
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        const gloss = cardRef.current.querySelector(`.${styles.cardGlow}`);
        if (gloss) {
            gloss.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)`;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        window.location.reload();
    };

    if (loading) {
        return (
            <div className={styles.profileWrapper}>
                <div className={styles.loadingPulse}>Loading Profile...</div>
            </div>
        );
    }

    // Number of points to show in circles
    const pointsCount = card ? (card.pointsBalance % 8 === 0 && card.pointsBalance > 0 ? 8 : card.pointsBalance % 8) : 0;

    return (
        <div className={styles.profileWrapper}>
            <div className={styles.profileCard}>

                <div className={styles.avatarContainer}>
                    <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop"
                        alt="Profile"
                        className={styles.avatar}
                    />
                </div>

                <h2 className={styles.userName}>{user?.fullName || user?.name || 'Valued Member'}</h2>

                {card ? (
                    <div className={styles.loyaltySection}>
                        <div
                            className={styles.cardContainer}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            ref={cardRef}
                        >
                            <div className={styles.loyaltyCard}>
                                <div className={styles.cardGlow}></div>
                                <div className={styles.goldWave}></div>

                                <div className={styles.cardNumber}>
                                    ID: {card.cardNumber?.slice(-8) || '********'}
                                </div>

                                <div className={styles.cardFooter}>
                                    {user?.fullName || user?.name}
                                </div>

                                <div className={styles.cardContent}>
                                    <h1 className={styles.cardTitle}>Loyalty Card</h1>
                                    <div className={styles.cardWebsite}>WWW.EMART.COM</div>
                                </div>

                                <div className={styles.pointsContainer}>
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className={styles.pointCircle}>
                                            {i < pointsCount && <div className={styles.pointActive}></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#bf953f', fontWeight: '600' }}>
                            Total e-Points Balance: {card.pointsBalance}
                        </p>
                    </div>
                ) : (
                    <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '0.9rem' }}>
                        No loyalty card linked to this account.
                    </p>
                )}

                <button className={styles.logoutBtn} onClick={handleLogout}>
                    End Secured Session
                </button>

            </div>
        </div>
    );
};

export default ProfilePage;
