import React from 'react';
import styles from '../styles/CategoryBar.module.css';
import {
    FaMobileAlt, FaTv, FaCamera, FaTshirt, FaCouch,
    FaPlane, FaShoppingBasket, FaGamepad, FaHome
} from 'react-icons/fa';
import { MdToys } from 'react-icons/md';
import { GiLipstick } from 'react-icons/gi';

const categories = [
    { id: 1, label: 'Mobiles', icon: <FaMobileAlt /> },
    { id: 2, label: 'Fashion', icon: <FaTshirt /> },
    { id: 3, label: 'Electronics', icon: <FaCamera /> },
    { id: 4, label: 'Home', icon: <FaHome /> },
    { id: 5, label: 'Appliances', icon: <FaTv /> },
    { id: 6, label: 'Beauty', icon: <GiLipstick /> },
    { id: 7, label: 'Toys', icon: <MdToys /> },
    { id: 8, label: 'Furniture', icon: <FaCouch /> },
    { id: 9, label: 'Flights', icon: <FaPlane /> },
    { id: 10, label: 'Grocery', icon: <FaShoppingBasket /> },
];

const CategoryBar = () => {
    return (
        <div className={styles.categoryContainer}>
            <div className={styles.categoryList}>
                {categories.map((cat) => (
                    <div key={cat.id} className={styles.categoryItem}>
                        <div className={styles.iconContainer}>
                            <span className={styles.categoryIcon}>{cat.icon}</span>
                        </div>
                        <span className={styles.categoryLabel}>{cat.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBar;
