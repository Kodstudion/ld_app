import { useState } from "react";
import Confetti from "react-confetti";

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
  const [highScore, setHighScore] = useState<number>(0);
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [danceMove, setDanceMove] = useState<number>(0); // Hanterar figurens rörelse

  const playHighScoreSound = () => {
    const basePath = import.meta.env.BASE_URL; // Hämtar rätt base-path från Vite
    const audio = new Audio(`${basePath}highscore.mp3`); // Laddar ljudfilen korrekt
    audio.play();
  };

  const handleClick = () => {
    setTotalClicks(totalClicks + 1);

    const baseResetChance = count * 0.05;
    const difficultyFactor = 1 / (1 + totalClicks * 0.002);
    const adjustedResetChance = baseResetChance * difficultyFactor;

    const randomValue = Math.random();

    if (randomValue < adjustedResetChance) {
      if (count > highScore) {
        setHighScore(count);
        setShowConfetti(true);
        playHighScoreSound();

        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
      }
      setCount(0);
    } else {
      setCount(count + 1);
      setBgColor(getRandomColor());

      // Växla mellan dansrörelser (-20px och +20px)
      setDanceMove((prev) => (prev === 0 ? 1 : 0));
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
          transform: `translateX(${danceMove === 0 ? "-20px" : "20px"})`,
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
      <h3 style={{ fontSize: "20px", color: "#555", marginTop: "10px" }}>
        High Score: {highScore}
      </h3>
    </div>
  );
}

export default App;
