import React, { useState } from "react";
import { set, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { db } from "../../firebase";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import styles from "./register.module.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../features/contexts/UserContext";
import LogoContainer from "./../LogoContainer";
import Button from "react-bootstrap/Button";
import Divider from "../Divider";


const Register = () => {
  const { user, setUser } = useUser();
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;
  const navigate = useNavigate();

  const onSubmit = (data) => {
    const auth = getAuth();
    const { email, password } = data;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setUser(user);
        addUserToFirestore(user, data);
        console.log("Registered successfully!", user);
        alert("Registered successfully! ");
        navigate("/create-profile");
      })
      .catch((error) => {
        console.error("Error registering:", error.message);
        alert("Error registering: " + error.message);
      });
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    signInWithPopup(auth, provider)
      .then((result) => {
        const isNewUser = result.additionalUserInfo?.isNewUser;
        const user = result.user;
        setUser(result.user);
        if (isNewUser) {
          addUserToFirestore(user);
        }
        navigate("/feed");
      })
      .catch((error) => {
        console.error("Error signing in with Google: ", error.message);
        alert("Error signing in with Google: " + error.message);
      });
  };

  const addUserToFirestore = async (userData, formData) => {
    try {
      const userId = userData.uid;
  
      const userProfile = {
        userID: userId,
        email: userData.email,
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        profilePicture: formData.profilePicture || "https://cdn.onlinewebfonts.com/svg/img_383214.png",
        title: formData.title || "",
        education: formData.education || "",
        skills: formData.skills || [],
        interests: formData.interests || [],
        bio: formData.bio || "",
        followersCount: 0,
        posts: [],
        comments: [],
        experience: formData.experience || [],
        contacts: formData.contacts || [],
        createdAt: new Date(),
        lastLogin: new Date(),
        birthday: formData.birthday || "",
        
      };
  
      await setDoc(doc(db, "users", userId), userProfile);
      console.log("User profile saved successfully");
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  };
  

  return (
    <>
      <LogoContainer />
      <div className={styles.registerContainer}>
        <h1>Elevate Your Professional Journey</h1>
        <h6>Let’s start with a few details from you</h6>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required!",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email format",
                },
              })}
            />
            <p className={styles.error}>{errors.email?.message}</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password", {
                  required: "Password is required!",
                  pattern: {
                    value:
                      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}$/,
                    message:
                      "Password must contain at least one lowercase letter, one uppercase letter, one special character, and at least 8 digits without spaces.",
                  },
                })}
                className={styles.passwordInput}
              />
            </div>
            <p className={styles.error}>{errors.password?.message}</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", {
                validate: (value) =>
                  value === document.getElementById("password").value ||
                  "Passwords do not match.",
              })}
            />
            <p className={styles.error}>{errors.confirmPassword?.message}</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="registerBtn"
            type="submit"
            style={{ backgroundColor: "#7F61A9" }}
          >
            Register
          </Button>

          <Divider />

          <div className={styles.googleSignIn}>
            <img src="/flat-color-icons_google.svg" alt="google logo" />
            <button type="button" onClick={handleGoogleSignIn} className={styles.GSignInBtn}>
              {" "}
              Sign in with Google
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Register;
