import React from 'react';
import styles from './loading.module.css';

const Loading = () => {
    return (
        <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <h2>Loading...</h2>
        </div>
    );
};

export default Loading;
