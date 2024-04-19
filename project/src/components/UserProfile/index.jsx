import React, { useState, useEffect } from "react";
import Navbars from "../Navbar";
import styles from "./userProfile.module.css";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { FiPlus } from "react-icons/fi";
import Modal from "react-modal";
import { IoCloseSharp } from "react-icons/io5";
import { MdOutlineModeEdit } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
import { useParams } from "react-router-dom";
import LeftProfile from "../LeftProfile";
import { set } from "react-hook-form";

const UserProfile = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [newConnections, setNewConnections] = useState([]);

  useEffect(() => {
    const fetchNewConnections = async () => {
      const connections = await getNewConnections();
      setNewConnections(connections);
    };
    fetchNewConnections();
  }, []);

  const [showButton, setShowButton] = useState(true);

  const getNewConnections = async () => {
    if (currentUser) {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      let allUsers = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get current user's contacts
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      let contacts = [];
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        contacts = userData.contacts || [];
      }

      // Add current user's id to the contacts
      contacts.push(currentUser.uid);

      // Filter out the contacts and the current user from all users
      let newConnections = allUsers.filter(
        (user) => !contacts.includes(user.id)
      );

      return newConnections;
    }
  };

  const shuffled = newConnections.sort(() => 0.5 - Math.random());

  const selected = shuffled.slice(0, 3);

  const [buttonText, setButtonText] = useState();

  const checkConnectionStatus = async (contactId) => {
    if (currentUser) {
      // Get current user's contacts
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      let contacts = [];
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        contacts = userData.contacts || [];
      }
      if (contacts.includes(contactId)) {
        setButtonText("Connected");
        console.log("Connected by checking contacts");
        setShowButton(false);
        return;
      }

      const connectionsQuery = query(
        collection(db, "connections"),
        where("userId", "==", currentUser.uid),
        where("contactId", "==", contactId)
      );
      const querySnapshot = await getDocs(connectionsQuery);

      if (!querySnapshot.empty) {
        console.log("Connection request already exists");
        if (querySnapshot.docs[0].data().status === "accepted") {
          setShowButton(false);
          setButtonText("Connected");
          console.log("Connected");
        } else if (querySnapshot.docs[0].data().status === "requested") {
          setShowButton(true);
          setButtonText("request sent");
          console.log("Connection request already sent");
        }
      } else {
        setButtonText("Connect");
      }
    }
  };

  const handleConnectClick = async (contactId) => {
    console.log(currentUser.uid, contactId);

    if (currentUser) {
      const connectionsQuery = query(
        collection(db, "connections"),
        where("userId", "==", currentUser.uid),
        where("contactId", "==", contactId)
      );
      const querySnapshot = await getDocs(connectionsQuery);

      if (!querySnapshot.empty) {
        console.log("Connection request already exists");
        if (querySnapshot.docs[0].data().status === "accepted") {
          setButtonText("Connected");
          alert("You are already connected with this user");
        } else if (querySnapshot.docs[0].data().status === "requested") {
          setButtonText("request sent");
          alert("Connection request already sent");
        }
        return;
      }

      const newConnection = {
        userId: currentUser.uid,
        contactId: contactId,
        timestamp: new Date(),
        status: "requested",
      };

      try {
        const docRef = await addDoc(
          collection(db, "connections"),
          newConnection
        );
        alert("Connection request sent!");
        console.log("Document written with ID: ", docRef.id);
        setShowButton(false);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };

  ///////////////
  const { userID } = useParams();
  const [userProfileData, setUserProfileData] = useState(null);

  useEffect(() => {
    const fetchNewConnections = async () => {
      const connections = await getNewConnections();
      setNewConnections(connections);
    };
    fetchNewConnections();

    console.log("id", userID);
    let newUserID = userID.slice(1);

    // console.log(userID.split("").slice(0,1).join(""))
    // userID = userID.split("").splice(0,1).join("")
    console.log("after", newUserID);
    console.log(typeof userID);

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", newUserID);
        console.log("Path:", userDocRef.path);
        const docSnapshot = await getDoc(userDocRef);
        console.log("shot", docSnapshot);
        const data = docSnapshot.data();
        console.log("data", data);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log("data", data);
          setUserProfileData(docSnapshot.data());
        } else {
          console.error("User Not Found");
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUserData();

    checkConnectionStatus(newUserID);
  }, [userID]);

  console.log("prof", userProfileData);

  return (
    <div>
      <Navbars />
      <div className={styles.container}>
        <div className={styles.left}>
          <LeftProfile />
        </div>
        <div className={styles.profileContainer}>
          <div className={styles.profile}>
            {/* 1st section */}
            <div className={styles.user}>
              <div className={styles.bannerContainer}>
                <img
                  className={styles.banner}
                  src={userProfileData?.bannerPicture}
                />
              </div>

              <div className={styles.userTitles}>
                <img
                  className={styles.pic}
                  src={userProfileData?.profilePicture}
                />

                <div className={styles.titleContainer}>
                  <h6 className={styles.username}>
                    {userProfileData?.firstName} {userProfileData?.lastName}
                  </h6>
                  <p className={styles.jobtitle}>{userProfileData?.title} </p>
                </div>

                {showButton &&
                  (buttonText == "Connect" || buttonText == "request sent") && (
                    <div className={styles.btns}>
                      <button className={styles.connectBtn}>
                        <img src="/connect.svg" className={styles.icon} />
                        <p
                          className={styles.btnTxt}
                          onClick={() => handleConnectClick(userID.slice(1))}
                        >
                          {" "}
                          {buttonText}
                        </p>
                      </button>
                    </div>
                  )}
              </div>
            </div>
            {/* 2nd SECTION */}
            <div className={styles.info}>
              <div className={styles.infoContainer}>
                <h6>General Information</h6>
              </div>

              {userProfileData?.bio && <p>{userProfileData?.bio}</p>}
            </div>

            {/* 4th SECTION */}
            <div className={styles.experienceSection}>
              <div className={styles.experienceTitle}>
                <h6>Experience</h6>
              </div>
              {userProfileData?.experience &&
                userProfileData?.experience.map((exp, index) => (
                  <div key={index} className={styles.experienceContainer}>
                    <img className={styles.companylogo} src={exp.companyLogo} />
                    <div className={styles.experience}>
                      <p className={styles.job}>{exp.title}</p>
                      <p className={styles.jobCompany}>{exp.company}</p>
                      <p className={styles.jobDate}>
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p className={styles.jobDesc}>{exp.description}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* 5th SECTION */}

            <div className={styles.skillSection}>
              <div className={styles.experienceTitle}>
                <h6>Skills</h6>
              </div>
              {userProfileData?.skills.map((skill, index) => (
                <div key={index} className={styles.showPostsContainer}>
                  <p>{skill}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.others}>
          <img className={styles.background} src="/profbackpic.svg" />
          <h6>People you may know</h6>
          {selected?.map((user, index) => (
            <div key={index} className={styles.interestContainer}>
              <img
                src={user.profilePicture}
                alt={user.firstName}
                className={styles.companylogo}
              />
              <div className={styles.experience}>
                <p className={styles.job}>
                  {user.firstName} {user.lastName}
                </p>

                <button
                  className={styles.followBtn}
                  onClick={() => handleConnectClick(user.id)}
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
