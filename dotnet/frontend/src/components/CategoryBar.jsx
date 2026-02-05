// import React from 'react';
// import styles from '../styles/CategoryBar.module.css';
// import { useNavigate } from "react-router-dom";

// const categories = [
//     {
//         id: 1,
//         category: "E001",
//         label: 'Mobiles',
//         icon: (
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
//                 <line x1="12" y1="18" x2="12.01" y2="18"></line>
//             </svg>
//         )
//     },
//     {
//         id: 2,
//         category: "C002",
//         label: 'Fashion',
//         icon: (
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
//                 <line x1="7" y1="7" x2="7.01" y2="7"></line>
//             </svg>
//         )
//     },
//     {
//         id: 3,
//         category: "C001",
//         label: 'Electronics',
//         icon: (
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <circle cx="12" cy="12" r="3"></circle>
//                 <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
//             </svg>
//         )
//     },
//     // {
//     //     id: 4,
//     //     category: "",
//     //     label: 'Home',
//     //     icon: (
//     //         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     //             <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
//     //             <polyline points="9 22 9 12 15 12 15 22"></polyline>
//     //         </svg>
//     //     )
//     // },
//     {
//         id: 5,
//         category: "C003",
//         label: 'Appliances',
//         icon: (
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
//                 <polyline points="17 2 12 7 7 2"></polyline>
//             </svg>
//         )
//     },
//     {
//         id: 6,
//         category: "FW05",
//         label: 'Beauty',
//         icon: (
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
//                 <path d="M12 12v10"></path>
//                 <path d="M8 22h8"></path>
//             </svg>
//         )
//     },
//     {
//         id: 7,
//         category: "S002",
//         label: 'Sports',
//         icon: (
            // <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            //     <circle cx="12" cy="8" r="6"></circle>
            //     <path d="M15.477 12.89l1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
            // </svg>
//         )
//     },
//     {
//         id: 8,
//         category: "HP003",
//         label: "TV's",
//         icon: (
//            <svg
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       {/* TV screen */}
//       <rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect>

//       {/* TV stand */}
//       <line x1="8" y1="20" x2="16" y2="20"></line>
//       <line x1="12" y1="16" x2="12" y2="20"></line>
//     </svg>
//         )
//     },
  
// ];

// const CategoryBar = () => {
//     const navigate = useNavigate();

//     const handleCategoryNavigation = (category) => {
//      //  setIsPaused(true);      
//   navigate(`/browse/${category}`);
// };


//     return (
//         <div className={styles.categoryContainer}>
//             <div className={styles.categoryList}>
//                 {categories.map((cat) => (
//                     <div key={cat.id} className={styles.categoryItem}>
//                         <div className={styles.iconContainer} 
//                          onClick={() => handleCategoryNavigation(cat.category)}
//                          >
//                             {cat.icon}
//                         </div>
//                         <span className={styles.categoryLabel}>{cat.label}</span>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default CategoryBar;

import React from "react";
import styles from "../styles/CategoryBar.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CategoryBar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const categories = [
    {
      id: 1,
      category: "E001",
      label: t("categories.mobiles"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      )
    },
    {
      id: 2,
      category: "C002",
      label: t("categories.fashion"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      )
    },
    {
      id: 3,
      category: "C001",
      label: t("categories.electronics"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
                 <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
             </svg>
      )
    },
    {
      id: 4,
      category: "C003",
      label: t("categories.appliances"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
          <polyline points="17 2 12 7 7 2"></polyline>
        </svg>
      )
    },
    {
      id: 5,
      category: "FW05",
      label: t("categories.beauty"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
          <path d="M12 12v10"></path>
          <path d="M8 22h8"></path>
        </svg>
      )
    },
    {
      id: 6,
      category: "S002",
      label: t("categories.sports"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89l1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
            </svg>
      )
    },
    {
      id: 7,
      category: "HP003",
      label: t("categories.tvs"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect>
          <line x1="8" y1="20" x2="16" y2="20"></line>
          <line x1="12" y1="16" x2="12" y2="20"></line>
        </svg>
      )
    }
  ];

  const handleCategoryNavigation = (category) => {
    navigate(`/browse/${category}`);
  };

  return (
    <div className={styles.categoryContainer}>
      <div className={styles.categoryList}>
        {categories.map((cat) => (
          <div key={cat.id} className={styles.categoryItem}>
            <div
              className={styles.iconContainer}
              onClick={() => handleCategoryNavigation(cat.category)}
            >
              {cat.icon}
            </div>
            <span className={styles.categoryLabel}>
              {cat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;