import React, { useState } from 'react'
import styles from "./profilecreation.module.css";
import LogoContainer from '../LogoContainer';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import { set, useForm } from "react-hook-form";
import Button from "react-bootstrap/Button";

const ProfileCreation = () => {
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState("");
  const navigate = useNavigate();


  const onSubmit = async (data) => {
    try {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        // 使用表单的数据更新Firestore
        await updateDoc(userDocRef, {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          age: data.age,
        });
        navigate("/feed");
      }
    } catch (error) {
      console.error("Error adding user to firestore:", error);
    }
  };

  return (
    <>
      <LogoContainer />
      <div className={styles.registerContainer}>
        <h1>User</h1>
        <h6> To begin, we'll need some basic information from you</h6>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="text">First Name:</label>
            <input
              type="text"
              id="fname"
              {...register("firstName", {
                required: "First Name is required",
              })}
            />
            <p className={styles.error}>{errors.firstName?.message}</p>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="text">Last Name:</label>
            <input
              type="text"
              id="lname"
              {...register("lastName", {
                required: "Last Name is required",
              })}
            />
            <p className={styles.error}>{errors.lastName?.message}</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">Date of Birth:</label>
            <input
              type="date"
              id="dob"
              {...register("dateOfBirth", {
                required: "Date of Birth is required",
              })}
              max={`${new Date().getFullYear()}-12-31`}
            />
            <p className={styles.error}>{errors.dateOfBirth?.message}</p>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="number">Age: </label>
            <input
              type="number"
              id="age"
              {...register("age", {
                required: "Age is required",
              })}
            />
            <p className={styles.error}>{errors.age?.message}</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="registerBtn"
            type="submit"
            style={{ backgroundColor: "#7F61A9" }}
            onSubmit={onSubmit}
          >
            Register
          </Button>
        </form>
      </div>
    </>
  );
};

export default ProfileCreation
