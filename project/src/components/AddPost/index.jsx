import React, {useState, useEffect} from 'react'
import styles from "./addpost.module.css"
import Modal from 'react-modal';
import { db, storage } from '../../firebase';
import { collection, addDoc, serverTimestamp, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getAuth } from 'firebase/auth'

const AddPost = () => {

  const [mediaModal, setMediaModal] = useState(false);
  const [articleModal, setArticleModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState([]);
  const [comment, setComment] = useState('');
  const [profilePicture, setprofilePicture] = useState('');
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef).then(docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setprofilePicture(data.profilePicture);
        } else {
          console.error("User document doesn't exist!");
        }
      }).catch(err => {
        console.error("Error fetching user data:", err);
      });
    }
  }, []);
  
  function openMediaModal() {
    setMediaModal(true);
  }

  function closeMediaModal() {
    setMediaModal(false);
  }

  function openArticleModal(){
    setArticleModal(true);
  }

  function closeArticleModal(){
    setArticleModal(false);
  }
  
  const getFileCategory = (file) => {
    const fileCategories = {
      image: ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      video: ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.webm'],
    };

    const fileExt = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2);

    for (const category in fileCategories) {
      if (fileCategories[category].includes(`.${fileExt}`)) {
        return category;
      }
    }
    // Other types not listed (Prob need to manually add it into fileCategories)
    return 'other';

  };

  const handleMultiFiles = (e) => {
    const files = Array.from(e.target.files);

    // Combine newly selected files + existing selected files (else it will override & destroy)
    setSelectedFile((prevSelectedFiles) => [...prevSelectedFiles, ...files]);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      console.log("User is NOT Authenticated");
      return;
    }

    const userId = currentUser.uid;
    // Initialize array to store upload-promise(s)
    const postPromises = [];
    const uploadCounter = selectedFile.length;

    if (uploadCounter === 0) {
      // NO media files, create post without media
      console.log('Post content:', JSON.stringify(postContent));
      postPromises.push(
        addDoc(collection(db, 'posts'), {
          userId: userId,
          postCont: postContent,
          TimeCreated: serverTimestamp(),
          likes: [],
          //comments: arrayUnion({ userId, text: comment })
        })
      );
    } 
    else {
      // Media files included
      selectedFile.forEach((file) => {
        // ID if its image or video file type
        const fileGrp = getFileCategory(file);
        // Set the directory path from the Ext
        const dir = `media/${userId}/${fileGrp}`;
        const storageRef = ref(storage, `${dir}/${file.name}`);
        const uploadPromise = uploadBytes(storageRef, file).then(() => {
          return getDownloadURL(storageRef);
        });
        // Add each upload-promise to array
        postPromises.push(uploadPromise);
      });

      // Wait for ALL media uploads to finish
      Promise.all(postPromises)
        .then((mediaURLs) => {
          const mediaData = mediaURLs.map((url, index) => ({
            url,
            type: selectedFile[index].type
          }));
          return addDoc(collection(db, 'posts'), {
            userId: userId,
            postCont: postContent,
            media: mediaData,
            TimeCreated: serverTimestamp(),
            likes: [],
            //comments: arrayUnion({ userId, text: comment })
          });
        })
        .then(() => {
          console.log("Posts added with media");
          
          
          // End part is just to deal with grammar (1 = file but 2,3,4,5 = fileS)
          alert(`Uploaded ${uploadCounter} media file${uploadCounter === 1 ? '' : 's'}!`);
        })
        .catch((error) => {
          console.error("Error adding post with media:", error);
        });
    }
    //setPosts((prevPosts) => [newPost, ...prevPosts]);
    setSelectedFile([]);
    closeMediaModal();
    closeArticleModal();
    setPostContent("");
  };

  return (
    <div className={styles.addPostContainer}>
      <div className={styles.addPostInputContainer}>
        <div className={styles.profilePicContainer}>
          <img className={styles.profilePic}
            src={profilePicture} alt='profile' />
        </div>
        
        <input type="text" className={styles.addPostInput} value={postContent} onChange={(e) => setPostContent(e.target.value)}/>

      </div>
      <div className={styles.addPostBtns}>

        <div className={styles.addPostBtn} onClick={openArticleModal}>
          <img className={styles.icon}
            src='./Article.svg' alt='search' />
          <p className={styles.btnText}>Write Article</p>
        </div>

        <div className={styles.inputPostContainer}>
          <Modal
            isOpen={articleModal}
            onRequestClose={closeArticleModal}
            ariaHideApp={false}
            contentLabel="Article Modal">
            <div>
              <h2>Write your Article</h2>
              <textarea className={styles.articleInput} placeholder="Start writing your article..." onChange={(e) => setPostContent(e.target.value)}></textarea>
              <div className={styles.btns}>
                <button className={styles.btn} onClick={closeArticleModal}>Close</button>
                <button className={styles.btn} onClick={handlePostSubmit}>Submit</button>
              </div>
              
            </div>
          </Modal>
        </div>

        <div className={styles.addPostBtn} onClick={openMediaModal}>
          <img className={styles.icon}
            src='./play-circle.svg' alt='search' />
          <p className={styles.btnText}>Media</p>
        </div>

        <div className={styles.inputPostContainer}>
          <Modal
            isOpen={mediaModal}
            onRequestClose={closeMediaModal}
            ariaHideApp={false}
            contentLabel="Media Modal">
            <div className={styles.mediasContainer}>
              <h2>Attach Media Files</h2>
              <input type="file" multiple onChange={handleMultiFiles}/>
            </div>
            <div className={styles.mediasContainer}>
            <h2>Preview</h2>
              {selectedFile.length > 0 && (
                <div>
                  {selectedFile.map((file, index) => (
                    <div key={index}>
                      {file.type.includes('image') ? (
                        <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
                      ) : (
                        <video src={URL.createObjectURL(file)} controls />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <textarea type="text" className={styles.captionInput} placeholder="Enter caption" onChange={(e) => setPostContent(e.target.value)}/>
            </div>
            <div className={styles.btns}>
            <button className={styles.btn} onClick={closeMediaModal}>Close</button>
            <button className={styles.btn} onClick={handlePostSubmit}>Submit</button>
            </div>
            
          </Modal>
        </div>

        <button className={styles.postBtn} disabled={!postContent.trim()}
            onClick={handlePostSubmit}>
          Post
        </button>

      </div>

    </div>
  )
}

export default AddPost
