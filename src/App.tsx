import "./App.css";
import Papa from "papaparse";
import { useState, useEffect } from "react";

import GameCard from "./GameCard";
import robloxIcon from "../public/roblox.svg";

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
    fetch(import.meta.env.BASE_URL + "games.csv")
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
          <div className="flex items-center justify-center p-4 mb-4 gap-4 roudned-lg shadow-lg w-full">
            <img className="w-12 h-12" src={robloxIcon} alt="Roblox Icon" />
            <p className="text-3xl font-bold">Roblox Roulette</p>
          </div>
          <div className="grid grid-cols-4 grid-rows-5 gap-4 p-8 pt-4">
            {Array(20)
              .fill(0)
              .map(() => {
                return <GameCard game={selectRandomRow(data)} />;
              })}
          </div>
        </>
      )}
    </>
  );
}

export default App;
