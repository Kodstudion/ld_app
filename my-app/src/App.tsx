import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue } from "firebase/database";

// 🔥 Firebase-konfiguration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 🔥 Initiera Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

interface ScoreEntry {
  name: string;
  score: number;
}

// 🎨 Funktion för att slumpa fram en ny bakgrundsfärg
function getRandomColor(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function App() {
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [count, setCount] = useState<number>(0);
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [sessionHighScore, setSessionHighScore] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [danceMove, setDanceMove] = useState<number>(0); // 🔥 Ändra rörelse mellan -20px och 20px

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    setDanceMove((prevMove) => (prevMove === 0 ? 1 : 0)); // 🔥 Uppdatera dansrörelsen vid varje klick
  }, [count]);

  const fetchLeaderboard = () => {
    const leaderboardRef = ref(db, "leaderboard");
    onValue(leaderboardRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const scores = Object.values(data) as ScoreEntry[];
        setLeaderboard(scores.sort((a, b) => b.score - a.score).slice(0, 10));
      } else {
        console.warn("⚠️ Ingen data hittades i Firebase!");
      }
    });
  };

  const saveHighScore = (name: string, score: number) => {
    const newScoreRef = push(ref(db, "leaderboard"));
    set(newScoreRef, { name, score })
      .then(() => {
        console.log(`✅ High score sparat: ${name} - ${score}`);
        fetchLeaderboard();
      })
      .catch((error) => {
        console.error("❌ Fel vid sparning i Firebase:", error);
      });
  };

  const handleClick = () => {
    setCount((prevCount) => {
      const newCount = prevCount + 1;
      setTotalClicks((prevTotal) => prevTotal + 1);

      // 🔥 Ändra bakgrundsfärg vid varje klick
      setBgColor(getRandomColor());

      // 🔥 Uppdatera sessionens high score om den slås
      if (newCount > sessionHighScore) {
        setSessionHighScore(newCount);
      }

      // 🔥 Mekanism för slumpmässig nollställning
      const baseResetChance = newCount * 0.05;
      const difficultyFactor = 1 / (1 + totalClicks * 0.002);
      const adjustedResetChance = baseResetChance * difficultyFactor;

      if (Math.random() < adjustedResetChance) {
        return 0;
      }

      // 🔥 Kontrollera om poängen ska sparas i leaderboarden
      if (leaderboard.length < 10 || newCount > leaderboard[leaderboard.length - 1].score) {
        const playerName = prompt("🎉 Ny high score! Ange dina 3 bokstäver (A-Z):")?.toUpperCase();
        if (playerName && /^[A-Z]{3}$/.test(playerName)) {
          saveHighScore(playerName, newCount);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        return 0; // 🔴 Nollställ klickräknaren efter high score
      }

      return newCount; // Uppdatera `count` som normalt
    });
  };

  return (
    <div
      style={{
        backgroundColor: bgColor,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        transition: "background-color 0.5s ease",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {/* 🐱 Dansande katt */}
      <div
        style={{
          fontSize: "50px",
          marginBottom: "20px",
          transition: "transform 0.2s ease-in-out",
          transform: `translateX(${danceMove ? "20px" : "-20px"})`, // 🔥 Katten rör sig åt höger/vänster
        }}
      >
        🐱
      </div>

      <button
        onClick={handleClick}
        style={{
          backgroundColor: "red",
          color: "white",
          width: "80px",
          height: "80px",
          fontSize: "18px",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          marginBottom: "20px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        Tryck!
      </button>

      <h2>Antal klick: {count}</h2>

      <h3 style={{ color: "blue" }}>🔥 Session High Score: {sessionHighScore}</h3>

      <h3>🏆 Leaderboard</h3>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={index}>{entry.name} - {entry.score}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
