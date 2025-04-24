import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Signed in:", user.email);
  } else {
    console.log("Not signed in");
  }
});
