import React from 'react'
import styles from './banner.module.css'

const Banner = () => {
      
  return (
      <div className={styles.bannerContainer}>
          <div className={styles.bannerTitles}>
              <div className={styles.bannerText}>
              <p className={styles.bannerText1}>Discover your dream job with CareerVine</p>
              <p className={styles.bannerText2}>Don't let your career dreams remain dreams; turn them into reality with our product and discover your dream job today</p>
              </div>
              <div className={styles.bannerBtns}>
              </div>
          </div>
          <div className={styles.bannerImg}>
          <img src= '/banner.svg'
          alt="Your Logo" className={styles.banner} />
          </div>

      </div>
  )
}

export default Banner
