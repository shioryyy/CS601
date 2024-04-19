import React, { useState, useEffect} from 'react'
import styles from "./rightnews.module.css"
import {useNavigate} from 'react-router-dom'
import { getDocs, getDoc,deleteDoc, collection, updateDoc, doc, arrayUnion, arrayRemove, setDoc, serverTimestamp, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";

const RightNews = () => {

  const navigate = useNavigate()
  const jobDocRef = collection(db, "jobs");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const jobDocs = await getDocs(jobDocRef);
      const jobsData = await Promise.all(jobDocs.docs.map(async (jobDoc) => {
        const jobDetailsRef = doc(db, `jobs/${jobDoc.id}`);
        const jobDetailsSnap = await getDoc(jobDetailsRef);
  
        if (jobDetailsSnap.exists()) {
          return {
            id: jobDoc.id,
            ...jobDetailsSnap.data(),
          };
        } else {
          return null;
        }
      }));
  
      setJobs(jobsData.filter(job => job !== null));
    };
  
    fetchJobs();
  }, []);

  return (
    <div className={styles.right}>
      <a href="/jobs" className={styles.viewRecommendation}>View all recommendations</a>

      {/* JOB RECOMMENDATIONS */}
      <div className={styles.jobRecommendations}>
        <div className={styles.jobsHeader}>
          <div className={styles.jobsTitle}>
            <p className={styles.jobTitleName}>Jobs</p>
            <p className={styles.jobNumber}>{jobs.length} Jobs recommended for you</p>
          </div>
          <button className={styles.viewAllBtn} onClick={()=>navigate("/jobs")}>View all</button>

        </div>
        <div className={styles.joblists}>
          {jobs.slice(0, 4).map((job, index) => (
            <div key={index} className={styles.jobItems}>
              <img className={styles.jobImg} src={job.imageUrl} alt="job" />
              <div className={styles.job}>
                <p className={styles.jobName}>{job.title}</p>
                <p className={styles.jobCompany}>{job.company}</p>
              </div>
              <div className={styles.jobTimer}>
                <img className={styles.jobTimerImg} src="./history-outline.svg" alt="timer" />
                <p className={styles.jobTime}> {Math.ceil(Math.abs(new Date() - new Date(job['posted On'].toDate()))/ (1000 * 60))} mins</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>

  )
}

export default RightNews
