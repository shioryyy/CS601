import React, { useContext, useEffect, useState } from 'react'
import styles from './firstpage.module.css'
import { Link, useNavigate } from 'react-router-dom' 
import UserContext from '../../features/contexts/UserContext';
import LoadingComponent from '../LoadingContainer'; 

const FirstPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    if (user) {
      navigate('/feed');
    } else {
      setIsLoading(false); 
    }
  }, [user, navigate]);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <LoadingComponent /> 
      ) : (
        <>
            <div className={styles.nav}>
              <div className={styles.logoContainer}>
                <img src="/logo.jpg" alt="Your Logo" className={styles.logo} />
                <div className={styles.logoTitle}>
                  <h1></h1>
                </div>
              </div>
              <div className={styles.linksContainer}>
                <button className={styles.linkBtn}><Link to="/register" className={styles.link}>JOIN NOW</Link></button>
                <button className={styles.linkBtn}><Link to="/login" className={styles.link}>SIGN IN</Link></button>
              </div>
            </div>
     
           <div className={styles.homeImgContainer}>
             <img alt='home' className={styles.homeImg}
              src="/homepage.svg"
            />
           </div>
           
          </>
      )}
    </div>
  )
}

export default FirstPage