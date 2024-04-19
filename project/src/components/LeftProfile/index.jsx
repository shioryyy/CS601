
import React, { useState, useEffect } from 'react'
import styles from "./leftprofile.module.css"
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


const LeftProfile = ({ onFindJobsClick, onSavedJobsClick, handleTabClick }) => {

  const [showJobsMenu, setShowJobsMenu] = useState(false);
  const [showNetWorksMenu, setShowNetWorksMenu] = useState(false);


  const toggleJobsMenu = () => {
    setShowJobsMenu(!showJobsMenu);
  };

  const toggleNetorkMenu = () => {
    setShowNetWorksMenu(!showNetWorksMenu);
  };



  const [profilePicture, setprofilePicture] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');

  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate("/profile");
  }


  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef).then(docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setprofilePicture(data.profilePicture);
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setTitle(data.title);
        } else {
          console.error("User document doesn't exist!");
        }
      }).catch(err => {
        console.error("Error fetching user data:", err);
      });
    }
  }, []);


  return (
    <div className={styles.left}>
      <div className={styles.user}>
        <img className={styles.userImage}
          src={profilePicture} alt="user" />
        <p className={styles.name}>{firstName} {lastName}</p>
        <p className={styles.jobTitle}>{title}</p>
        <button className={styles.viewProfileBtn} onClick={handleViewProfile}>View Profile</button>    </div>
      <div className={styles.menu}>
        <Link to="/feed" className={styles.homeMenuItemLink}>
          <div className={styles.menuItem}>
            <img className={styles.icon} src='./home.svg' alt="home" />
            <p className={styles.menuText}> Home</p>

          </div>
        </Link>


        <div className={styles.JobmenuItem} onClick={() => toggleNetorkMenu()}>
          <img className={styles.icon} src='./layers.svg' alt="Network" />
          <p className={styles.menuText}> My Network</p>
        </div>
        {showNetWorksMenu &&

          <div className={styles.job_tabs}>
            <Link to="/network" className={styles.menuItemLink} onClick={() => handleTabClick("Connections")}>
              <div className={styles.jobItem} onClick={onFindJobsClick}>
                <img className={styles.icon} src='./briefcase.svg' alt="Network" />
                <p className={styles.menuText}> New Connections</p>
              </div>
            </Link>
            <Link to="/network" className={styles.menuItemLink} onClick={() => handleTabClick("Contacts")}>
              <div className={styles.jobItem} onClick={onSavedJobsClick}>
                <img className={styles.icon} src='./briefcase.svg' alt="Network" />
                <p className={styles.menuText}> Contacts</p>
              </div>
            </Link>
            <Link to="/network" className={styles.menuItemLink} onClick={() => handleTabClick("Requests")}>
              <div className={styles.jobItem} onClick={onSavedJobsClick}>
                <img className={styles.icon} src='./briefcase.svg' alt="Network" />
                <p className={styles.menuText}> Requests</p>
              </div>
            </Link>

          </div>
        }



        <div className={styles.JobmenuItem} onClick={() => toggleJobsMenu()}>
          <img className={styles.icon} src='./briefcase.svg' alt="jobs" />
          <p className={styles.menuText}> Jobs</p>
        </div>
        {showJobsMenu &&

          <div className={styles.job_tabs}>
            <Link to="/jobs" className={styles.menuItemLink}>
              <div className={styles.jobItem} onClick={onFindJobsClick}>
                <img className={styles.icon} src='./briefcase.svg' alt="jobs" />
                <p className={styles.menuText}> Find Jobs</p>
              </div>
            </Link>
            <Link to="/jobs" className={styles.menuItemLink}>
              <div className={styles.jobItem} onClick={onSavedJobsClick}>
                <img className={styles.icon} src='./briefcase.svg' alt="jobs" />
                <p className={styles.menuText}> Saved Jobs</p>
              </div>
            </Link>
          </div>
        }

      </div>
    </div>
  )
}

export default LeftProfile
