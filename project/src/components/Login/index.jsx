import React, { useState, useEffect } from "react";
import styles from "./login.module.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useUser } from "../../features/contexts/UserContext";
import LogoContainer from "./../LogoContainer";
import Divider from "../Divider";
import Button from "react-bootstrap/Button";
import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Login = () => {
  const { user, setUser } = useUser();

  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;


  const navigate = useNavigate();

  const onSubmit = (data) => {
    const auth = getAuth();

    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        setUser(userCredential.user);
        navigate("/feed");
      })
      .catch((error) => {
        console.error("Error signing in: ", error.message);
        alert("Error signing in: " + error.message);
      });
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      await checkUserInFirestore(user);
      navigate("/feed");
    } catch (error) {
      console.error("Error signing in with Google: ", error.message);
      alert("Error signing in with Google: " + error.message);
    }
  };
  

  const addUserToFirestore = async (userData) => {
    try {
      const userId = userData.uid;
      const userProfile = createDefaultUserProfile(userData);
  
      await setDoc(doc(db, "users", userId), userProfile);
      console.log("User profile saved successfully");
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  };

  const checkUserInFirestore = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    console.log("docSnap.exists(): ", docSnap.exists());
  
    if (!docSnap.exists()) {
      await addUserToFirestore(user);
    }
    else {
      console.log("User already exists in Firestore");
    }
  };

  const createDefaultUserProfile = (userData) => ({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    profilePicture: "https://cdn.onlinewebfonts.com/svg/img_383214.png",
    title: "",
    education: "",
    skills: [],
    interests: [],
    bio: "",
    followersCount: 0,
    posts: [],
    comments: [],
    experience: [],
    contacts: [],
    createdAt: new Date(),
    lastLogin: new Date(),
  });

  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <LogoContainer />
      <div className={styles.registerContainer}>
        <h1>Welcome back, We missed you</h1>
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

          <Button
            id="registerButton"
            variant="primary"
            size="lg"
            className={styles.registerBtn}
            type="submit"
            style={{ backgroundColor: "#7F61A9" }}
          >
            Sign In
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

export default Login;
