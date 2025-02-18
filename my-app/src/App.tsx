import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJ7BWfArna55_PHHHunJnjzlFXA_J3WgA",
  authDomain: "ld-highscore-c08ed.firebaseapp.com",
  databaseURL: "https://ld-highscore-c08ed-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ld-highscore-c08ed",
  storageBucket: "ld-highscore-c08ed.firebasestorage.app",
  messagingSenderId: "1011318501781",
  appId: "1:1011318501781:web:862b01f9a13bf55997469c"
};

// 🔥 Initiera Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

interface ScoreEntry {
  name: string;
  score: number;
}

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
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    fetchLeaderboard(); // Hämta leaderboard vid sidstart
  }, []);

  const fetchLeaderboard = () => {
    const leaderboardRef = ref(db, "leaderboard");
    onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const scores = Object.values(data) as ScoreEntry[];
        setLeaderboard(scores.sort((a, b) => b.score - a.score).slice(0, 10));
      }
    });
  };

  const saveHighScore = (name: string, score: number) => {
    const newScoreRef = push(ref(db, "leaderboard"));
    set(newScoreRef, { name, score }).then(() => fetchLeaderboard()); // Uppdatera listan
  };

  const playHighScoreSound = () => {
    const audio = new Audio(import.meta.env.BASE_URL + "highscore.mp3");
    audio.play();
  };

  const handleClick = () => {
    setTotalClicks(totalClicks + 1);

    const baseResetChance = count * 0.05;
    const difficultyFactor = 1 / (1 + totalClicks * 0.002);
    const adjustedResetChance = baseResetChance * difficultyFactor;
    const randomValue = Math.random();

    if (randomValue < adjustedResetChance) {
      // Nollställning sker
      if (leaderboard.length < 10 || count > leaderboard[leaderboard.length - 1].score) {
        const playerName = prompt("🎉 Ny high score! Ange dina 3 bokstäver (A-Z):")?.toUpperCase();
        if (playerName && /^[A-Z]{3}$/.test(playerName)) {
          saveHighScore(playerName, count);
          setShowConfetti(true);
          playHighScoreSound();
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
      setCount(0);
    } else {
      setCount(count + 1);
      setBgColor(getRandomColor());
    }
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

      {/* 🐱 Dansande figur */}
      <div
        style={{
          fontSize: "50px",
          marginBottom: "20px",
          transition: "transform 0.2s ease-in-out",
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

      <h2 style={{ fontSize: "24px", color: "#333" }}>Antal klick: {count}</h2>

      {/* Leaderboard */}
      <h3 style={{ fontSize: "20px", color: "#555", marginTop: "20px" }}>🏆 Leaderboard</h3>
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: "10px",
          borderRadius: "10px",
          textAlign: "center",
          width: "200px",
        }}
      >
        {leaderboard.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#777" }}>Inga high scores än!</p>
        ) : (
          <ol style={{ paddingLeft: "15px", fontSize: "16px", color: "#333" }}>
            {leaderboard.map((entry, index) => (
              <li key={index}>
                {entry.name} - {entry.score}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default App;
