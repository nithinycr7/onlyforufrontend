'use client';

import Image from 'next/image';
import styles from './Layout.module.css';

export const TopBar = () => {
    return (
        <header className={styles.topBar}>
            <div className={styles.logoSmall}>
                <Image
                    src="/logo.png"
                    alt="OnlyForU"
                    width={32}
                    height={32}
                    className={styles.logoImage}
                />
            </div>
        </header>
    );
};
