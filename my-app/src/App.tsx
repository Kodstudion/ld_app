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
  const [totalClicks, setTotalClicks] = useState<number>(0); // Dold, men används i logiken
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Funktion för att spela upp ljud när high score uppnås
  const playHighScoreSound = () => {
    const audio = new Audio("/highscore.mp3"); // Filen ligger i public/ mappen
    audio.play();
  };

  const handleClick = () => {
    setTotalClicks(totalClicks + 1); // Räknar antal klick totalt (dolt)

    const baseResetChance = count * 0.05; // Grundrisk att nollställas (5% per klick)
    const difficultyFactor = 1 / (1 + totalClicks * 0.002); // Minskar risken att nollställas med fler totala klick
    const adjustedResetChance = baseResetChance * difficultyFactor;

    const randomValue = Math.random(); // Slumpvärde mellan 0 och 1

    if (randomValue < adjustedResetChance) {
      // Nollställning sker
      if (count > highScore) {
        setHighScore(count); // Uppdatera high score
        setShowConfetti(true); // Visa konfetti
        playHighScoreSound(); // Spela upp ljud

        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
      }
      setCount(0); // Återställ räknaren
    } else {
      setCount(count + 1); // Öka räknaren
      setBgColor(getRandomColor()); // Ändra bakgrundsfärg
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
