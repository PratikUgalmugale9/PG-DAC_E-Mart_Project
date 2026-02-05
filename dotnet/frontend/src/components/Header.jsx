// import React from 'react';
// import styles from '../styles/Header.module.css';

// const Header = () => {
//     return (
//         <header className={styles.header}>
//             <div className={styles.content}>
//                 <h1 className={styles.title}>
//                     Your one-stop shop for everything you need.
//                 </h1>
//                 <p className={styles.subtitle}>
//                     Discover top categories and best deals daily. Shop the latest trends in electronics, fashion, and more with just a click.
//                 </p>
//                 <div className={styles.ctaButtons}>
//                     <button className={styles.primaryBtn}>Shop Now</button>
//                     <button className={styles.secondaryBtn}>View Offers</button>
//                 </div>
//             </div>

//             <div className={styles.imageContainer}>
//                 {/* Placeholder for hero image - using a nice gradient blob or illustration would be ideal */}
//                 <img
//                     src="https://placehold.co/600x600/png?text=Shop+Smart"
//                     alt="Shopping Illustration"
//                     className={styles.heroImage}
//                 />
//             </div>
//         </header>
//     );
// };

// export default Header;

import React from 'react';
import styles from '../styles/Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.content}>
                <h1 className={styles.title}>
                    Your one-stop shop for everything you need.
                </h1>
                <p className={styles.subtitle}>
                    Discover top categories and best deals daily. Shop the latest trends in electronics, fashion, and more with just a click.
                </p>
                <div className={styles.ctaButtons}>
                    <button className={styles.primaryBtn}>Shop Now</button>
                    <button className={styles.secondaryBtn}>View Offers</button>
                </div>
            </div>

            <div className={styles.imageContainer}>
                {/* Placeholder for hero image - using a nice gradient blob or illustration would be ideal */}
                <img
                    src="https://placehold.co/600x600/png?text=Shop+Smart"
                    alt="Shopping Illustration"
                    className={styles.heroImage}
                />
            </div>
        </header>
    );
};

export default Header;