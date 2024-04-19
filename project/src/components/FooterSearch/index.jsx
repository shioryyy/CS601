import React from 'react'
import styles from "./footersearch.module.css"

const FooterSearch = () => {
  return (
    <div className={styles.footerSearch}>
        <div className={styles.searchBarContainer}>
          <img className={styles.searchIcon}
          src='./search.svg' alt='search' />
          <input type='text' className={styles.searchInput} placeholder="Search" />
        </div>
    </div>
  )
}

export default FooterSearch
