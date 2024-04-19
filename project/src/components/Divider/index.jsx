import React from 'react'
import styles from "./divider.module.css"

const Divider = () => {
  return (
          <div className={styles.dividerContainer}>
              <span className={styles.divider}></span>
              <span className={styles.dividerContent}>or</span>
              <span className={styles.divider}></span>
          </div>
  )
}

export default Divider
