
import React, {useEffect, useState} from 'react'
import Modal from 'react-modal';
import styles from "./posts.module.css"
import { AiOutlineLike } from "react-icons/ai";
import {BiCommentDetail, BiRepost} from "react-icons/bi";
import {BsFillSendFill} from "react-icons/bs";
import {db} from '../../firebase'
import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, doc, query, orderBy, serverTimestamp} from 'firebase/firestore';
import { getAuth } from 'firebase/auth'
import { MdOutlineDelete } from "react-icons/md";
import { Document, Page } from 'react-pdf';


const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [activePostOptions, setActivePostOptions] = useState(null);
  const [activePost,setActivePost] = useState(null)
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [UpdatePostModalOpen, setUpdatePostModalOpen] = useState(false);
  const [formContent, setFormContent] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentFormContent, setCommentFormContent] = useState("");

  //Comment Form Submission
  const handleCommentSubmit = async(e,postId) =>{
    e.preventDefault()
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("User is NOT Authenticated");
      return;
    }

    const userId = currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    const { firstName, lastName } = userSnapshot.data(); // Fetch the firstName and lastName from the user's data
    const fullName = `${firstName} ${lastName}`; // Concatenate firstName and lastName to create a full name
    const postRef = doc(db, 'posts', postId);
    const commentsCollection = collection(postRef, 'comments');
    const newComment = { userId, username: fullName, text: comment, timestamp: serverTimestamp() }; // Include the full name in the newComment object
    const commentRef = await addDoc(commentsCollection, newComment);
    const commentSnapshot = await getDoc(commentRef);
    const commentData = commentSnapshot.data();

    // Update the local state
    setPosts(posts.map(post => post.id === postId 
      ? {...post, comments: [...post.comments, {...commentData, id: commentRef.id, timestamp: commentData.timestamp.toDate()}]} 
      : post
    ));
    setComment('');
  } 

  const handleDeleteComment = async (postId, commentId) => {
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);
    await deleteDoc(commentRef);
  
    // Update the local state
    setPosts(posts.map(post => post.id === postId 
      ? {...post, comments: post.comments.filter(comment => comment.id !== commentId)} 
      : post
    ));
  };

  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    const postsQuery = query(postsCollection, orderBy('TimeCreated', 'desc')); // Order by 'createdAt' in descending order
  
    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      console.log('Snapshot received:', snapshot); // Log the received snapshot
      const postsData = await Promise.all(snapshot.docs.map(async (docPost) => {
        const postData = docPost.data();
        const { userId } = postData;
        const userData = await getUserData(userId);
        console.log('Doc data:', docPost.data()); // Log each document's data
        // Fetch comments for the post
        const postRef = doc(db, 'posts', docPost.id);
        const commentsCollection = collection(postRef, 'comments');
        const commentsSnapshot = await getDocs(commentsCollection);
        const commentsData = commentsSnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data, timestamp: data.timestamp.toDate() };
        });
        return { id: docPost.id, ...postData, ... userData, comments: commentsData };
      }));
    
      console.log('Posts data:', postsData); // Log the mapped posts data
      setPosts(postsData);
    });
  
    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activePostOptions && !event.target.closest(`.${styles.postOptionsDropdown}`)) {
        setActivePostOptions(null);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activePostOptions, styles.postOptionsDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeCommentOptions && !event.target.closest(`.${styles.commentOptionsDropdown}`)) {
        setActiveCommentOptions(null);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeCommentOptions, styles.commentOptionsDropdown]);
  
  const handleLike = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("User is NOT Authenticated");
      return;
    }
    // Get the current user's ID
    const userId = currentUser.uid;
  
    // Get the current likes
    const postSnapshot = await getDoc(postRef);
    const currentLikes = postSnapshot.data().likes;
  
    // Add or remove the user's ID from the likes
    const newLikes = currentLikes.includes(userId)
      ? currentLikes.filter(id => id !== userId) // Remove the user's ID
      : [...currentLikes, userId]; // Add the user's ID
  
    // Update the likes in Firestore
    await updateDoc(postRef, { likes: newLikes });
  };

  const getUserData = async (userId) => {
    if (!userId) {
      console.log('No userId provided!');
      return null;
    }
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const { firstName, lastName, profilePicture, title } = userData;
      return { firstName, lastName, profilePicture, title };
    } else {
      console.log('No such user!');
      return null;
    }
  } 


  //HANDLING REPOSTS 
  const handleRepost = async (post) => {
    
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("User is NOT Authenticated");
      return;
    }

    const userId = currentUser.uid;

    let newPost ;

    if(!post.media){
      newPost = {
        userId: userId,
        postCont: post.postCont,
        TimeCreated: serverTimestamp(),
        likes: [],
      };
    }else{
      newPost = {
        userId: userId,
        postCont: post.postCont,
        TimeCreated: serverTimestamp(),
        likes: [],
         media: post.media
      };
    }
    await addDoc(collection(db, 'posts'), newPost);
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handleEditPost = async (postId, newContent) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { postCont: newContent, edited: true });
    setPosts(posts.map(post => post.id === postId ? {...post, postCont: newContent, edited: true} : post));
    setFormContent("");
    setUpdatePostModalOpen(false);
  };
  
  const handleDeletePost = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    const auth = getAuth();
    const currentUser = auth.currentUser;
  
    if (!currentUser) {
      console.log("User is NOT Authenticated");
      return;
    }
  
    // Check if the current user is the author of the post
    const postSnapshot = await getDoc(postRef);
    const postAuthorId = postSnapshot.data().userId;
    if (postAuthorId !== currentUser.uid) {
      console.log("User is not the author of the post");
      return;
    }
  
    // Delete the post from Firestore
    await deleteDoc(postRef);
  
    // Delete the post from the local state
    setPosts(posts.filter(post => post.id !== postId));
  };

  const openEditForm = (postId) => {
    const post = posts.find(post => post.id === postId);
    if (!post) {
      console.log("Post not found");
      return;
    }
    setFormContent(post.postCont);
    setEditingPostId(postId);
    setUpdatePostModalOpen(true); 
  };

  const openCommentEditForm = (postId, commentId) => {

    const post = posts.find(post => post.id === postId);
    if (!post) {
      console.log("Post not found");
      return;
    }
    const comment = post.comments.find(comment => comment.id === commentId);
    if (!comment) {
      console.log("Comment not found");
      return;
    }
    setCommentFormContent(comment.text);
    setEditingCommentId(commentId);
  };

  const handleEditComment = async (postId, commentId, newContent) => {
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);
    await updateDoc(commentRef, { text: newContent, edited: true });
    setPosts(posts.map(post => post.id === postId 
      ? {...post, comments: post.comments.map(comment => comment.id === commentId ? {...comment, text: newContent, edited: true} : comment)} 
      : post
    ));
    setCommentFormContent("");
    setEditingCommentId(null);
  };

  const auth = getAuth();
  const currentUser = auth.currentUser;

  return (

    <div className={styles.postContainer}>
      <Modal
        isOpen={UpdatePostModalOpen}
        onRequestClose={() => setUpdatePostModalOpen(false)}
        contentLabel="Edit Post"
        ariaHideApp={false}
      >
        <form className={styles.form} onSubmit={(e) => {
          e.preventDefault();
          handleEditPost(editingPostId, formContent);
          setUpdatePostModalOpen(false);
          
        }}>
          <textarea
            value={formContent}
            className={styles.articleInput}
            onChange={(e) => setFormContent(e.target.value)}
          />
          <div className={styles.btns}>
          <button className={styles.btn} type="submit">Update Post</button>
          <button className={styles.btn} type="button" onClick={() => setUpdatePostModalOpen(false)}>Cancel</button>
          </div>
          
        </form>
      </Modal>
      {posts.map((post) => (

      <div className={styles.post} key = {post.id}>
        <div className={styles.user}>
          <div className={styles.profilePicContainer}>
            <img className={styles.profilePic}
              src={post.profilePicture} alt='profile' />
          </div>
          <div className={styles.postUser}>
            <p className={styles.postUserName}>{post.firstName} {post.lastName}</p>
            <p className={styles.postUserJobTitle}>{post.title}</p>
            <div className={styles.jobTimer}>
              <img className={styles.jobTimerImg} src="./history-outline.svg" alt="timer" />
              <p className={styles.jobTime}>{post.TimeCreated && post.TimeCreated.toDate ? post.TimeCreated.toDate().toLocaleString() : 'Loading...'}{post.edited && <span> (edited)</span>}</p>
            </div>
          </div>
          <div className={styles.addPostSettings}>
            {currentUser && currentUser.uid === post.userId && (
              <img
                className={styles.settingsIcon}
                src='./DotsThree.svg'
                alt='settings'
                onClick={(event) => {
                  event.stopPropagation();
                  setActivePostOptions(post.id);
                }}
              />
            )}
            {activePostOptions === post.id && (
              <div className={styles.postOptionsDropdown}>
                <button onClick={() => openEditForm(post.id)}>Edit</button>
                <button onClick={() => handleDeletePost(post.id)}>Delete</button>
              </div>
            )}
          </div>
        </div>
        {post.postCont.split('\n').map((line, index) => (
          <p key={index} className={styles.postContent} style={{margin: 0}}>
            {line}
          </p>
        ))}
        <div className={styles.postMedia}>
      
          {post.media && post.media.map((media, index) => {
              if (media.type.startsWith('image/')) {

                return(
                 
                    <img key={index} src={media.url} alt={media.url} />
                  // </div>
                )

              } else if (media.type === 'application/pdf') {
                return (
                  <div key={index}>
                    <a href={media.url} target="_blank" rel="noopener noreferrer">
                      View PDF
                    </a> 

                  </div>
                );
              } else if (media.type.startsWith('video/')) {
                return (
                  <div key={index}>
                    <video controls width="550" height="440">
                      <source src={media.url} type="video/mp4" />
                      Your browser does not support the uploaded video .
                    </video>
                   </div>
                );
              } else {
                return null;
              }
            })}
        </div>
        <div className={styles.btns}>
          <div className={styles.actionBtns}>
            <div className={styles.actionBtn} onClick={() => handleLike(post.id)}>

              <img className={styles.actionIcon}
                src='./ThumbsUp.svg' alt='search' />
              <p className={styles.actionText}>Like {post.likes && post.likes.length}</p>
            </div>
            <div className={styles.actionBtn} onClick={()=>setActivePost(post.id)}>
              <img className={styles.actionIcon} src='./ChatText.svg' alt='comment' />
              <p className={styles.actionText}>Comment {post.comments ? post.comments.length : 0}</p>
            </div>
            <div className={styles.actionBtn} onClick={()=>handleRepost(post)}>
              <img className={styles.actionIcon}
                src='./ShareNetwork.svg' alt='search' />
              <p className={styles.actionText}>Repost</p>
            </div>
            </div>
          </div>
          {activePost === post.id && 
          (
            <>
            {/* <div className={styles.commentInputContainer}> */}
            <form onSubmit={(e)=>handleCommentSubmit(e,post.id)} className={styles.commentForm}>
              <input type='text' placeholder='Enter Comment' onChange ={(e)=>setComment(e.target.value)} value={comment}
              className={styles.commentInput}></input>
              <button type='submit' className={styles.commentSubmit}>Submit</button>
            </form>
          {/* </div> */}
          
          {post.comments && post.comments
            .sort((a, b) => b.timestamp - a.timestamp) // Sort comments by timestamp in descending order
            .slice(0, 3) // Take the first 3 comments
            .map((comment, index) => (
              <div key={index} className={styles.comments}>
                <p className={styles.commentText}><b>{comment.username}</b></p>
                {editingCommentId === comment.id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleEditComment(post.id, comment.id, commentFormContent);
                  }}>
                    <textarea
                      value={commentFormContent}
                      onChange={(e) => setCommentFormContent(e.target.value)}
                    />
                    <button type="submit">Submit</button>
                  </form>
                ) : (
                  <p className={styles.commentText}>{comment.text}</p>
                )}
                <p className={styles.commentTime}>{comment.timestamp instanceof Date ? comment.timestamp.toLocaleString() : 'Loading...'}</p>
                <img
                  src='./DotsThree.svg'
                  alt='settings'
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveCommentOptions(comment.id);
                  }}
                />
                {activeCommentOptions === comment.id && (
                  <div className={styles.commentOptionsDropdown}>
                    <button onClick={() => openCommentEditForm(post.id, comment.id)}>Edit</button>
                    <button onClick={() => handleDeleteComment(post.id, comment.id)}>Delete</button>
                  </div>
                )}
              </div>
            ))
          }
            </>
          )
          }
        
          
        </div>





      ))}
    </div>
  );
};

export default Posts;
