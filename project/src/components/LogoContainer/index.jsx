import React from 'react'
import styles from "./logocontainer.module.css";

const LogoContainer = () => {
  return (
      <div className={styles.logoContainer}>
        <img src="/logo.jpg" alt="Your Logo" className={styles.logo} />
        <div className={styles.logoTitle}>
          <h1>CareerVine</h1>
        </div>
      </div>
  )
}

export default LogoContainer
