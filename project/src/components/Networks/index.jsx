import React, { useState, useEffect } from 'react';
import styles from './networks.module.css';
import Navbars from '../Navbar';
import Users from '../Users';
import LeftProfile from '../LeftProfile';

const Networks = () => {
  const [activeTab, setActiveTab] = useState("Connections");
  const [requests, setRequests] = useState([]);
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  
  


  return (
    <>
      <Navbars />
      <div className={styles.networks_section}>
        <div className={styles.manage_network_section}>
          <h6>Manage your networks</h6>
          <div
            className={`${styles.connection} ${activeTab === "Connections" ? styles.active : ""}`}
            onClick={() => handleTabClick("Connections")}
          >
            <p className={styles.txt}>New Connections</p>
          </div>
          <div
            className={`${styles.contacts} ${activeTab === "Contacts" ? styles.active : ""}`}
            onClick={() => handleTabClick("Contacts")}
          >
            <p className={styles.txt}>Contacts</p>
          </div>
          <div
            className={`${styles.connection} ${activeTab === "Requests" ? styles.active : ""}`}
            onClick={() => handleTabClick("Requests")}
          >
            <p className={styles.txt}>Requests</p>
          </div>
        </div>
        <div className={styles.leftP}>
        <LeftProfile handleTabClick={handleTabClick}/>
        </div>
        <div className={styles.users}>
          {activeTab === "Connections" &&
            <div className={styles.title}>
              <h3>Connections</h3>
              <Users type="new-connections" />
            </div>
          }
          {activeTab === "Contacts" &&
            <div className={styles.title}>
              <h3>Contacts</h3>
              <Users type="contacts" />
            </div>
          }

          {activeTab === "Requests" &&
            <div className={styles.title}>
              <h3>Connection Requests</h3>
              <Users type="requests" />
            </div>
          }
                       
          </div>
        </div>
      
    </>
  );
};

export default Networks;


