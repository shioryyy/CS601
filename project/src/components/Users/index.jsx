import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, where, doc, addDoc, getDoc, getDocs, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import styles from "./users.module.css"

const Users = ({ type }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const currentUserId = currentUser.uid;
    const [contacts, setContacts] = useState([]);
    const [newConnections, setNewConnections] = useState([]);
    const [requests, setRequests] = useState([]);
    const [sentRequestIds, setSentRequestIds] = useState(new Set());

    useEffect(() => {
      const fetchData = async () => {
  
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);
  
          if (userDocSnapshot.exists) {
            const userData = userDocSnapshot.data();
            const contactsData = userData.contacts || [];
  
            // Fetch each contact's details
            const contactsDetails = [];
            for (let contactUID of contactsData) {
              const contactDocRef = doc(db, 'users', contactUID);
              const contactDocSnapshot = await getDoc(contactDocRef);
              if (contactDocSnapshot.exists) {
                contactsDetails.push(contactDocSnapshot.data());
              }
            }
  
            setContacts(contactsDetails);
          }
        }
      };

      fetchData();

      const fetchNewConnections = async () => {
        const connections = await getNewConnections();
        setNewConnections(connections);
      };
    
      fetchNewConnections();

      const fetchAndSetRequests = async () => {
        const requests = await fetchRequests();
        setRequests(requests);
      };

      fetchAndSetRequests();

      const fetchAndSetSentRequests = async () => {
        const sentRequestIds = await fetchSentRequests();
        setSentRequestIds(sentRequestIds);
      };
    
      fetchAndSetSentRequests();

      const userDocRef = doc(db, "users", currentUser.uid);

      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          fetchData();
          fetchNewConnections();
          fetchAndSetRequests();
          fetchAndSetSentRequests();
        } else {
          console.log("No such document!");
        }
      });

      return () => unsubscribe();
    }, []);

      const handleConnectClick = async (contactId) => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
      
        if (currentUser) {
          const connectionsQuery = query(
            collection(db, "connections"),
            where("userId", "==", currentUser.uid),
            where("contactId", "==", contactId)
          );
          const querySnapshot = await getDocs(connectionsQuery);
      
          if (!querySnapshot.empty) {
            console.log("Connection request already exists");
            return;
          }
      
          const newConnection = {
            userId: currentUser.uid,
            contactId: contactId,
            timestamp: new Date(),
            status: "requested"
          };
      
          try {
            const docRef = await addDoc(collection(db, "connections"), newConnection);
            console.log("Document written with ID: ", docRef.id);
            alert("Connection request sent!");

            setSentRequestIds(prev => new Set([...prev, contactId]));
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        }
      };

      const getNewConnections = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Get all users
          const usersSnapshot = await getDocs(collection(db, "users"));
          let allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Get current user's contacts
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);
          let contacts = [];
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            contacts = userData.contacts || [];
          }

          // Add current user's id to the contacts
          contacts.push(currentUser.uid);

          // Filter out the contacts and the current user from all users
          let newConnections = allUsers.filter(user => !contacts.includes(user.id));

          return newConnections;
        }
      };

      const fetchRequests = async () => {
        const requestsRef = collection(db, "connections");
        const q = query(requestsRef, where("contactId", "==", currentUser.uid), where("status", "==", "requested"));
      
        const querySnapshot = await getDocs(q);
        const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const requestsDetails = requests.map(async (request) => {
          const userDocRef = doc(db, "users", request.userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            return { ...request, userDetails: userDocSnap.data() };
          } else {
            return { ...request, userDetails: {} }; 
          }
        });

        const requestsWithUserDetails = await Promise.all(requestsDetails);
        return requestsWithUserDetails;
      };

      const fetchSentRequests = async () => {
        const sentRequestsRef = collection(db, "connections");
        const q = query(sentRequestsRef, where("userId", "==", currentUser.uid), where("status", "==", "requested"));
      
        const querySnapshot = await getDocs(q);
        const sentRequests = querySnapshot.docs.map(doc => doc.data().contactId);
        return new Set(sentRequests);
      };
      

      const acceptFriendRequest = async (id, requesterId, currentUserId) => {
        const requestDocRef = doc(db, "connections", id);
      
        try {
          // update friend request status to "accepted"
          await updateDoc(requestDocRef, {
            status: "accepted"
          });
      
        } catch (error) {
          console.error("Error updating friend request status: ", error);
        }
      };
    
      const rejectFriendRequest = async (id, requesterId, currentUserId) => {
        const requestDocRef = doc(db, "connections", id);
      
        try {
          // update friend request status to "rejected"
          await updateDoc(requestDocRef, {
            status: "rejected"
          });
      
        } catch (error) {
          console.error("Error updating friend request status: ", error);
        }
      };
    
      const updateUserContacts = async (currentUserId, requesterId) => {
        const userDocRef = doc(db, "users", currentUserId);
        const senderDocRef = doc(db, "users", requesterId);
      
        try {
          // update current user's contacts
          await updateDoc(userDocRef, {
            contacts: arrayUnion(requesterId)
          });
    
          // update sender's contacts
          await updateDoc(senderDocRef, {
            contacts: arrayUnion(currentUserId)
          });
      
        } catch (error) {
          console.error("Error updating user contacts: ", error);
        }
      };
    
      const handleAccept = async (id, requesterId) => {
        console.log("Accept request from:", requesterId);
        await acceptFriendRequest(id, requesterId, currentUserId);
        await updateUserContacts(currentUserId, requesterId);
        setRequests(prevRequests => prevRequests.filter(request => request.id !== id));
      };
    
      const handleReject = async (id, requesterId) => {
        console.log("Reject request from:", requesterId);
        await rejectFriendRequest(id, requesterId, currentUserId);
        setRequests(prevRequests => prevRequests.filter(request => request.id !== id));
      };
      
      if (type === "new-connections") {
        return (
          <div className={styles.users}>
            {newConnections.map((user, index) => (
              <div key={index} className={styles.user}>
                <div className={styles.imgContainer}>
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className={styles.userImage}
                />
                <p className={styles.userName}>
                  {user.firstName} {user.lastName}
                </p>
                </div>
                <button
                  onClick={() => handleConnectClick(user.id)}
                  className={styles.connectBtn}
                  disabled={sentRequestIds.has(user.id)} // 如果已发送请求，则禁用按钮
                >
                  {sentRequestIds.has(user.id) ? "Request Sent" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        );
      } else if (type === "contacts") {
        return (
          <div className={styles.users}>
            {contacts.map((contact, index) => (
              <div key={index} className={styles.user}>
                <div className={styles.imgContainer}>
                <img
                  src={contact.profilePicture}
                  alt={contact.firstName}
                  className={styles.userImage}
                />
                <p className={styles.userName}>
                  {contact.firstName} {contact.lastName}
                </p>
                </div>
                <button className={styles.connectBtn}>Connected</button>
              </div>
            ))}
          </div>
        );
      } else if (type ==='requests'){
        return(
          <div className={styles.requests}> 
          {requests.map((request, index) => (
          <div key={index} className={styles.user}>
               <div className={styles.imgContainer}>
               <img
                  src={request.userDetails.profilePicture}
                  alt={"requests"}
                  className={styles.userImage}
                />
                <p className={styles.userName}>
                  {request.userDetails.firstName} {request.userDetails.lastName}
                </p>
               </div>
                
                <div className={styles.btns}>
                <button className={styles.acceptBtn} onClick={() => handleAccept(request.id, request.userId)}>Accept</button>
                <button className={styles.acceptBtn} onClick={() => handleReject(request.id, request.userId)}>Ignore</button>
                </div>
          </div>
            ))}
            </div>
        )
      }
}

export default Users
