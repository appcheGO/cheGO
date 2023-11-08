// ---------------------------------------------------------------------
import { getAuth } from "firebase/auth";
const auth = getAuth();
const user = auth.currentUser;
const account = {
  email: user ? user.email : "",
  photoURL: user ? user.photoURL : "",
};

export { account };
