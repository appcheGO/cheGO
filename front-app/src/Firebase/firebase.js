import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAeEFkpZJQ_gw7GowD5SZlWl5XnJQLnXAQ",
  authDomain: "chego-delivery-app.firebaseapp.com",
  databaseURL: "https://chego-delivery-app-default-rtdb.firebaseio.com",
  projectId: "chego-delivery-app",
  storageBucket: "chego-delivery-app.appspot.com",
  messagingSenderId: "471857496315",
  appId: "1:471857496315:web:c1809f1b3659ad753d305e",
};

const app = initializeApp(firebaseConfig);
export default app;
