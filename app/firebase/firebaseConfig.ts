import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBmAc-uM6_PTPAX28ioatMpcVmv-JFOE0I",
    authDomain: "crowdsource-fitness-app.firebaseapp.com",
    projectId: "crowdsource-fitness-app",
    storageBucket: "crowdsource-fitness-app.firebasestorage.app",
    messagingSenderId: "920577660683",
    appId: "1:920577660683:web:95a5b05234ad8193e4b40e",
    measurementId: "G-JX8LE1TDEZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
