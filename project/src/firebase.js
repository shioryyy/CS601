import { initializeApp } from 'firebase/app'
import {getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult} from 'firebase/auth'
import {getStorage} from 'firebase/storage'
import { getFirestore } from 'firebase/firestore';



const firebaseConfig = {
  apiKey: "AIzaSyC0pSppIxd7gzWX1tvD4Wv8aQYtgLT83xE",
  authDomain: "cs601-a3588.firebaseapp.com",
  projectId: "cs601-a3588",
  storageBucket: "cs601-a3588.appspot.com",
  messagingSenderId: "844894453413",
  appId: "1:844894453413:web:798ae18d219bd2f869974c",
  measurementId: "G-HGYPYC1535"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app)
const provider = new GoogleAuthProvider()
const db = getFirestore()



  export {app, auth, provider, storage, db}

  export function GoogleSignInAPIRedirect(){
    return (dispatch) =>{
        signInWithRedirect(auth, provider).then(payload => {
            console.log(payload)
        }).catch(err=>{
            console.log(err)
        })
    }
  }
  

