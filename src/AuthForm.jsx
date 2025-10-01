import { useState } from "react";
// import PropTypes from "prop-types";
// AuthForm.propTypes = {
//   onGuest: PropTypes.func.isRequired,
// };
import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  // signInWithPopup, 
  // GoogleAuthProvider 
} from "firebase/auth";

// eslint-disable-next-line react/prop-types
export function AuthForm({ onGuest }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // const handleGoogle = async () => {
  //   setError("");
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     await signInWithPopup(auth, provider);
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  return (
    <div className="auth-form">
      <h2 className="block text-sm font-medium text-gray-200 mb-2">{isLogin ? "Sign In" : "Register"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">{isLogin ? "Sign In" : "Register"}</button>
      </form>
      {/* <button onClick={handleGoogle}>Sign in with Google</button> */}
      <p className="mt-4 text-white ">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} className="underline">
          {isLogin ? "Register" : "Sign In"}
        </button>
      </p>
      <button onClick={onGuest} className="mt-8 text-white underline">Continue as guest</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}
