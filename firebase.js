const firebaseConfig = {
  apiKey: "AIzaSyB3_WGrYihcvfCQifwxSgnOCF_WSVmjyIE",
  authDomain: "saa-rpg.firebaseapp.com",
  projectId: "saa-rpg",
  storageBucket: "saa-rpg.firebasestorage.app",
  messagingSenderId: "335733843494",
  appId: "1:335733843494:web:02c817cd64bb12126f68e7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();