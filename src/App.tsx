import "./App.css";
import Papa from "papaparse";
import { useState, useEffect } from "react";

interface Row {
  rootGameId: number;
  universeId: number;
  name: string;
  creatorName: string;
  visits: number;
}

function selectRandomRow(data: Row[]) {
  return data[Math.floor(data.length * Math.random())];
}

function App() {
  const [data, setData] = useState<Row[]>([]);
  const [selectedGame, setSelectedGame] = useState<Row | null>(null);

  useEffect(() => {
    fetch("/games.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse<Row>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
          },
          delimiter: " ",
        });
      });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setSelectedGame(selectRandomRow(data));
    }
  }, [data]);

  return (
    <>
      {data.length == 0 && <p>Loading data</p>}
      {data.length > 0 && selectedGame !== null && (
        <>
          <p>Game name: {selectedGame.name}</p>
          <p>Creator: {selectedGame.creatorName}</p>
          <a
            href={`https://www.roblox.com/games/${selectedGame.rootGameId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here to visit game
          </a>
          <p>Visits: {selectedGame.visits}</p>
        </>
      )}
    </>
  );
}

export default App;
