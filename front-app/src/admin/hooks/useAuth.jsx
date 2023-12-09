import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import app from '../../Firebase/firebase';

const auth = getAuth(app);

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const isAuthenticated = () => !!user;

  return {
    user,
    isAuthenticated,
  };
};
