import React, { useState, useEffect } from "react";
import Navbars from "../Navbar";
import styles from "./profile.module.css";
import { db, storage } from "../../firebase";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FiPlus } from "react-icons/fi";
import Modal from "react-modal";
import { IoCloseSharp } from "react-icons/io5";
import { MdOutlineModeEdit } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
import LeftProfile from "../LeftProfile";

const Profile = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [profilePicture, setprofilePicture] = useState("");
  const [bannerPicture, setbannerPicture] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [followersCount, setfollowersCount] = useState("");
  const [experience, setexperience] = useState([]);
  const [skills, setskills] = useState([]);
  const [interests, setinterests] = useState([]);
  const [newConnections, setNewConnections] = useState([]);
  const [experienceModal, setExperienceModal] = useState(false);
  const [skillModal, setSkillModal] = useState(false);
  const [addProfilePicModal, setAddProfilePicModal] = useState(false);
  const [addBannerModal, setAddBannerModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [generalInfoInput, setGeneralInfoInput] = useState("");
  const [experienceFormData, setExperienceFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    companyLogo: "",
  });
  const [skillFormData, setSkillFormData] = useState("");
  const [editExperienceIndex, setEditExperienceIndex] = useState(null);
  const [editExperienceModal, setEditExperienceModal] = useState(false);
  const [editSkillIndex, setEditSkillIndex] = useState(null);
  const [editSkillModal, setEditSkillModal] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(firstName || "");
  const [editedLastName, setEditedLastName] = useState(lastName || "");
  const [editedTitle, setEditedTitle] = useState(title || "");
  const [userModal, setUserModal] = useState(false);

  const onOpenUserModal = () => setUserModal(true);
  const onCloseUserModal = () => setUserModal(false);

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        await updateDoc(userDocRef, {
          firstName: editedFirstName,
          lastName: editedLastName,
          title: editedTitle,
        });
        console.log("User document updated successfully");
        // Update the state here
        setFirstName(editedFirstName);
        setLastName(editedLastName);
        setTitle(editedTitle);
        onCloseUserModal();
      }
    } catch (error) {
      console.error("Error editing user information:", error);
    }
  };

  const handleEditSkill = (index) => {
    setEditSkillIndex(index);
    setSkillFormData(skills[index]);
    setEditSkillModal(true);
  };

  const closeEditSkillModal = () => {
    setEditSkillIndex(null);
    setEditSkillModal(false);
    setSkillModal(false);
    setSkillFormData("");
  };

  const handleDeleteSkill = (index) => {
    setskills((prev) => {
      const updatedSkills = [...prev];
      updatedSkills.splice(index, 1);

      updateUserSkills(updatedSkills);

      return updatedSkills;
    });
  };

  const handleSkillFormSubmit = (event) => {
    event.preventDefault();

    if (editSkillIndex !== null) {
      setskills((prev) => {
        const updatedSkills = [...prev];
        updatedSkills[editSkillIndex] = skillFormData;

        updateUserSkills(updatedSkills);

        return updatedSkills;
      });
    } else {
      setskills((prev) => {
        const newSkillsList = prev ? [...prev, skillFormData] : [skillFormData];

        updateUserSkills(newSkillsList);

        return newSkillsList;
      });
    }

    setSkillFormData("");
    closeEditSkillModal();
  };

  const updateUserSkills = async (updatedSkills) => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          skills: updatedSkills,
        });
      } catch (error) {
        console.error("Error updating skills:", error);
      }
    }
  };

  const handleEditExperience = (index) => {
    setEditExperienceIndex(index);
    setExperienceFormData(experience[index]);
    setEditExperienceModal(true);
  };

  const closeEditExperienceModal = () => {
    setEditExperienceIndex(null);
    setEditExperienceModal(false);
    setExperienceFormData({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      companyLogo: "",
    });
    setExperienceModal(false);
  };

  const handleExperienceFormSubmit = async (event) => {
    event.preventDefault();

    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      try {
        // update experience state
        let updatedExperience;
        if (editExperienceIndex !== null) {
          updatedExperience = [...experience];
          updatedExperience[editExperienceIndex] = experienceFormData;
        } else {
          updatedExperience = [...experience, experienceFormData];
        }

        // update experience in firestore
        await updateDoc(userDocRef, {
          experience: updatedExperience,
        });

        // update experience state
        setexperience(updatedExperience);
        closeEditExperienceModal();
      } catch (error) {
        console.error("Error updating experience: ", error);
      }
    }
  };

  const handleDeleteExperience = async (index) => {
    let updatedExperience = experience.filter((_, i) => i !== index);
    setexperience(updatedExperience);

    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          experience: updatedExperience,
        });
      } catch (error) {
        console.error("Error updating experience:", error);
      }
    }
  };

  const handleInputChangeExperienceForm = (event) => {
    const { name, value } = event.target;
    setExperienceFormData({ ...experienceFormData, [name]: value });
  };

  const handleInputChangeSkillForm = (event) => {
    const { value } = event.target;
    setSkillFormData(value);
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;

    const fileRef = ref(storage, `logos/${file.name}`);

    try {
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error("Error uploading logo: ", error);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;

    const fileRef = ref(storage, `avatars/${file.name}`);

    try {
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error("Error uploading avatar: ", error);
    }
  };

  const handleBannerUpload = async (file) => {
    if (!file) return;

    const fileRef = ref(storage, `banners/${file.name}`);

    try {
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error("Error uploading avatar: ", error);
    }
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const logoUrl = await handleLogoUpload(file);
      setExperienceFormData((prevFormData) => ({
        ...prevFormData,
        companyLogo: logoUrl,
      }));
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const avatarUrl = await handleAvatarUpload(file);
      if (avatarUrl) {
        setprofilePicture(avatarUrl);

        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          await updateDoc(userDocRef, {
            profilePicture: avatarUrl,
          });
        } catch (error) {
          console.error("Error updating user's profile picture:", error);
        }
      }
    }
  };

  const handleBannerChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const bannerUrl = await handleBannerUpload(file);
      if (bannerUrl) {
        setbannerPicture(bannerUrl);

        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          await updateDoc(userDocRef, {
            bannerPicture: bannerUrl,
          });
        } catch (error) {
          console.error("Error updating user's banner picture:", error);
        }
      }
    }
  };

  //OPEN AND CLOSE MODAL FUNCTIONS
  function openExperienceModal() {
    setExperienceModal(true);
  }

  function closeExperienceModal() {
    setExperienceModal(false);
  }
  function openSkillModal() {
    setSkillModal(true);
  }

  function closeSkillModal() {
    setSkillModal(false);
  }

  function openAddProfilePicModal() {
    setAddProfilePicModal(true);
  }

  function closeAddProfilePicModal() {
    setAddProfilePicModal(false);
  }
  function openAddBannerModal() {
    setAddBannerModal(true);
  }

  function closeAddBannerModal() {
    setAddBannerModal(false);
  }

  function openInfoModal() {
    setInfoModal(true);
  }

  function closeInfoModal() {
    setInfoModal(false);
  }

  //General information form submission
  async function handleGeneralInfoSubmit(e) {
    e.preventDefault();

    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);

      await updateDoc(userDocRef, {
        bio: generalInfoInput,
      })
        .then(() => {
          console.log("User document updated successfully");
          setBio(generalInfoInput);
          closeInfoModal();
        })
        .catch((error) => {
          console.error("Error updating user document:", error);
        });
    }
  }

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setprofilePicture(data.profilePicture);
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setTitle(data.title);
            setBio(data.bio);
            setGeneralInfoInput(data.bio);
            setfollowersCount(data.followersCount);
            setexperience(data.experience);
            setskills(data.skills);
            setinterests(data.interests);
            setbannerPicture(data.bannerPicture);

            setEditedFirstName(data.firstName);
            setEditedLastName(data.lastName);
            setEditedTitle(data.title);
          } else {
            console.error("User document doesn't exist!");
          }
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
        });
    }

    const fetchNewConnections = async () => {
      const connections = await getNewConnections();
      setNewConnections(connections);
    };
    fetchNewConnections();
  }, []);

  const getNewConnections = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

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

  // 获取前三个元素
  const selected = shuffled.slice(0, 3);

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
        status: "requested",
      };

      try {
        const docRef = await addDoc(
          collection(db, "connections"),
          newConnection
        );
        alert("Connection request sent!");
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };

  return (
    <div>
      <Navbars />
      <div className={styles.container}>
        <div className={styles.left}>
          <LeftProfile />
        </div>

        <div className={styles.profile}>
          {/* 1st section */}
          <div className={styles.user}>
            <div
              className={styles.bannerContainer}
              onClick={openAddBannerModal}
            >
              <img className={styles.banner} src={bannerPicture} />
            </div>

            <div className={styles.userTitles}>
              <img
                className={styles.pic}
                onClick={openAddProfilePicModal}
                src={profilePicture}
              />

              <div className={styles.titleContainer}>
                <h6 className={styles.username}>
                  {firstName} {lastName}
                </h6>
                <p className={styles.jobtitle}>{title} </p>
              </div>
              <MdOutlineModeEdit onClick={onOpenUserModal} />

              {/* EDIT USER FIRST NAME, LAST NAME AND JOB TITLE */}
              <Modal
                isOpen={userModal}
                onRequestClose={onCloseUserModal}
                ariaHideApp={false}
                contentLabel="Edit Profile Modal"
              >
                <div>
                  <div className={styles.title}>
                    <h2 className={styles.addExperienceTitle}>
                      Edit Profile Information
                    </h2>
                    <button onClick={onCloseUserModal}>
                      <IoCloseSharp />
                    </button>
                  </div>
                  <form
                    className={styles.experienceForm}
                    onSubmit={handleEditUserSubmit}
                  >
                    <input
                      type="text"
                      value={editedFirstName}
                      placeholder="First Name"
                      className={styles.formInput1}
                      onChange={(e) => setEditedFirstName(e.target.value)}
                    />

                    <input
                      type="text"
                      value={editedLastName}
                      placeholder="Last Name"
                      className={styles.formInput1}
                      onChange={(e) => setEditedLastName(e.target.value)}
                    />

                    <input
                      type="text"
                      value={editedTitle}
                      placeholder="Job Title"
                      className={styles.formInput1}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />

                    <div className={styles.btns}>
                      <button
                        className={styles.btn}
                        onClick={handleEditUserSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </Modal>

              {/* ADD PROFILE PICTURE MODAL */}
              <Modal
                isOpen={addProfilePicModal}
                onRequestClose={closeSkillModal}
                ariaHideApp={false}
                contentLabel=" Add Profile Picture Modal"
              >
                <div className={styles.title}>
                  <h2 className={styles.addExperienceTitle}>
                    Add Profile Picture
                  </h2>
                  <button
                    onClick={closeAddProfilePicModal}
                    className={styles.modalBtn}
                  >
                    <IoCloseSharp />
                  </button>
                </div>
                <form className={styles.experienceForm}>
                  <input
                    type="file"
                    placeholder="Upload Profile Picture"
                    className={styles.formInput}
                    onChange={handleAvatarChange}
                  />
                  {profilePicture && (
                    <img
                      src={profilePicture}
                      alt="Profile Avatar"
                      style={{ width: "100px", height: "100px" }}
                    />
                  )}
                  <div className={styles.btns}>
                    <button className={styles.btn}>Submit</button>
                  </div>
                </form>
              </Modal>

              {/* ADD BANNER  MODAL */}
              <Modal
                isOpen={addBannerModal}
                onRequestClose={closeAddBannerModal}
                ariaHideApp={false}
                contentLabel=" Add Banner Modal"
              >
                <div className={styles.title}>
                  <h2 className={styles.addExperienceTitle}>Add Banner</h2>
                  <button
                    onClick={closeAddBannerModal}
                    className={styles.modalBtn}
                  >
                    <IoCloseSharp />
                  </button>
                </div>
                <form className={styles.experienceForm}>
                  <input
                    type="file"
                    placeholder="Upload Banner"
                    className={styles.formInput}
                    onChange={handleBannerChange}
                  />
                  {bannerPicture && (
                    <img
                      src={bannerPicture}
                      alt="Profile Avatar"
                      style={{ width: "100px", height: "100px" }}
                    />
                  )}
                  <div className={styles.btns}>
                    <button className={styles.btn}>Submit</button>
                  </div>
                </form>
              </Modal>
            </div>
          </div>
          {/* 2nd SECTION */}
          <div className={styles.info}>
            <div className={styles.infoContainer}>
              <h6>General Information</h6>
              {bio ? (
                <MdOutlineModeEdit onClick={openInfoModal} />
              ) : (
                <FiPlus onClick={openInfoModal} />
              )}
            </div>

            {bio &&
              bio
                .split("\n")
                .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>

          {/* ADD /EDIT  GENERAL INFORMATION MODAL */}
          <Modal
            isOpen={infoModal}
            onRequestClose={closeInfoModal}
            ariaHideApp={false}
            contentLabel=" Add/Edit General Information Modal"
          >
            <div className={styles.title}>
              <h2 className={styles.addExperienceTitle}>General Information</h2>
              <button onClick={closeInfoModal} className={styles.modalBtn}>
                <IoCloseSharp />
              </button>
            </div>
            <form
              className={styles.experienceForm}
              onSubmit={handleGeneralInfoSubmit}
            >
              <textarea
                type="text"
                value={generalInfoInput}
                onChange={(e) => setGeneralInfoInput(e.target.value)}
                placeholder="Enter General Information"
                className={styles.formInputTextArea}
              />
              <div className={styles.btns}>
                <button className={styles.btn}>Submit</button>
              </div>
            </form>
          </Modal>

          {/* 4th SECTION */}
          <div className={styles.experienceSection}>
            <div className={styles.experienceTitle}>
              <h6>Experience</h6>
              <FiPlus onClick={openExperienceModal} />
            </div>
            {experience &&
              experience.map((exp, index) => (
                <div key={index} className={styles.experienceContainer}>
                  <img className={styles.companylogo} src={exp.companyLogo} />
                  <div className={styles.experience}>
                    <p className={styles.job}>{exp.title}</p>
                    <p className={styles.jobCompany}>{exp.company}</p>
                    <p className={styles.jobDate}>
                      {exp.startDate} - {exp.endDate}
                    </p>
                    {exp.description &&
                      exp.description.split("\n").map((paragraph, index) => (
                        <p key={index} className={styles.jobDesc}>
                          {paragraph}
                        </p>
                      ))}
                  </div>
                  <div className={styles.btns}>
                    <MdOutlineModeEdit
                      onClick={() => handleEditExperience(index)}
                    />
                    <MdOutlineDelete
                      onClick={() => handleDeleteExperience(index)}
                    />
                  </div>
                </div>
              ))}
          </div>
          {/* ADD EXPERIENCE MODAL */}
          <Modal
            isOpen={experienceModal}
            onRequestClose={closeExperienceModal}
            ariaHideApp={false}
            contentLabel=" Add Experience Modal"
          >
            <div className={styles.title}>
              <h2 className={styles.addExperienceTitle}>Add Experience</h2>
              <button
                onClick={closeExperienceModal}
                className={styles.modalBtn}
              >
                <IoCloseSharp />
              </button>
            </div>
            <form
              className={styles.experienceForm}
              onSubmit={handleExperienceFormSubmit}
            >
              <input
                type="text"
                placeholder="Enter Job Title"
                name="title"
                className={styles.formInput}
                onChange={(e) => handleInputChangeExperienceForm(e)}
                value={experienceFormData.title}
              />
              <input
                type="text"
                placeholder="Enter Company Name"
                name="company"
                className={styles.formInput}
                onChange={(e) => handleInputChangeExperienceForm(e)}
                value={experienceFormData.company}
              />
              <p>Start Date</p>
              <input
                type="date"
                name="startDate"
                value={experienceFormData.startDate}
                className={styles.formInput}
                onChange={handleInputChangeExperienceForm}
              />
              <p>End Date</p>
              <input
                type="date"
                name="endDate"
                value={experienceFormData.endDate}
                className={styles.formInput}
                onChange={handleInputChangeExperienceForm}
              />
              <textarea
                type="text"
                placeholder="Enter Description"
                name="description"
                className={styles.formInput}
                onChange={(e) => handleInputChangeExperienceForm(e)}
                value={experienceFormData.description}
              />
              <p>Company Logo</p>
              <input
                type="file"
                placeholder="Upload Company Logo"
                name="companyLogo"
                className={styles.formInput}
                onChange={handleLogoChange}
              />
              {experienceFormData.companyLogo && (
                <img
                  src={experienceFormData.companyLogo}
                  alt="Company Logo"
                  style={{ width: "100px", height: "100px" }}
                />
              )}
              <div className={styles.btns}>
                <button className={styles.btn}>Submit</button>
              </div>
            </form>
          </Modal>

          {/* EDIT EXPERIENCE MODAL */}
          <Modal
            isOpen={editExperienceModal}
            onRequestClose={closeEditExperienceModal}
            ariaHideApp={false}
            contentLabel=" Edit Experience Modal"
          >
            <div className={styles.title}>
              <h2 className={styles.addExperienceTitle}>Edit Experience</h2>
              <button
                onClick={closeEditExperienceModal}
                className={styles.modalBtn}
              >
                <IoCloseSharp />
              </button>
            </div>
            <form
              className={styles.experienceForm}
              onSubmit={handleExperienceFormSubmit}
            >
              <input
                type="text"
                placeholder="Enter Job Title"
                name="title"
                className={styles.formInput}
                onChange={(e) => handleInputChangeExperienceForm(e)}
                value={experienceFormData.title}
              />
              <input
                type="text"
                placeholder="Enter Company Name"
                name="company"
                className={styles.formInput}
                onChange={(e) => handleInputChangeExperienceForm(e)}
                value={experienceFormData.company}
              />
              <input
                type="date"
                name="startDate"
                value={experienceFormData.startDate}
                className={styles.formInput}
                onChange={handleInputChangeExperienceForm}
              />
              <input
                type="date"
                name="endDate"
                value={experienceFormData.endDate}
                className={styles.formInput}
                onChange={handleInputChangeExperienceForm}
              />
              <textarea
                type="text"
                placeholder="Enter Description"
                name="description"
                className={styles.formInput}
                onChange={(e) => handleInputChangeExperienceForm(e)}
                value={experienceFormData.description}
              />
              <p>Company Logo</p>
              <input
                type="file"
                placeholder="Upload Company Logo"
                name="companyLogo"
                className={styles.formInput}
                onChange={handleLogoChange}
              />
              {experienceFormData.companyLogo && (
                <img
                  src={experienceFormData.companyLogo}
                  alt="Company Logo"
                  style={{ width: "100px", height: "100px" }}
                />
              )}
              <div className={styles.btns}>
                <button className={styles.btn}>Submit</button>
              </div>
            </form>
          </Modal>

          {/* 5th SECTION */}

          <div className={styles.skillSection}>
            <div className={styles.experienceTitle}>
              <h6>Skills</h6>
              <FiPlus onClick={openSkillModal} />
            </div>
            {skills &&
              skills.map((skill, index) => (
                <div key={index} className={styles.showPostsContainer}>
                  <p>{skill}</p>
                  <div className={styles.btns}>
                    <MdOutlineModeEdit onClick={() => handleEditSkill(index)} />
                    <MdOutlineDelete onClick={() => handleDeleteSkill(index)} />
                  </div>
                </div>
              ))}
          </div>

          {/* ADD SKILL MODAL */}
          <Modal
            isOpen={skillModal}
            onRequestClose={closeSkillModal}
            ariaHideApp={false}
            contentLabel=" Add Skills Modal"
          >
            <div className={styles.title}>
              <h2 className={styles.addExperienceTitle}>Add Skills</h2>
              <button onClick={closeSkillModal} className={styles.modalBtn}>
                <IoCloseSharp />
              </button>
            </div>
            <form
              className={styles.experienceForm}
              onSubmit={handleSkillFormSubmit}
            >
              <input
                type="text"
                placeholder="Enter Skill"
                className={styles.formInput}
                name="skill"
                onChange={(e) => handleInputChangeSkillForm(e)}
                value={skillFormData}
              />
              <div className={styles.btns}>
                <button className={styles.btn}>Submit</button>
              </div>
            </form>
          </Modal>

          {/* EDIT SKILL MODAL */}
          <Modal
            isOpen={editSkillModal}
            onRequestClose={closeSkillModal}
            ariaHideApp={false}
            contentLabel=" Edit Skills Modal"
          >
            <div className={styles.title}>
              <h2 className={styles.addExperienceTitle}>Add Skills</h2>
              <button onClick={closeEditSkillModal} className={styles.modalBtn}>
                <IoCloseSharp />
              </button>
            </div>
            <form
              className={styles.experienceForm}
              onSubmit={handleSkillFormSubmit}
            >
              <input
                type="text"
                placeholder="Enter Skill"
                className={styles.formInput}
                name="skill"
                onChange={(e) => handleInputChangeSkillForm(e)}
                value={skillFormData}
              />
              <div className={styles.btns}>
                <button className={styles.btn}>Submit</button>
              </div>
            </form>
          </Modal>
        </div>

        <div className={styles.others}>
          <img className={styles.background} src="/profbackpic.svg" />
          <h6>People you may know</h6>
          {selected.map((user, index) => (
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

export default Profile;
