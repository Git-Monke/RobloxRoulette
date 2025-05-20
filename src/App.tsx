import "./App.css";
import Papa from "papaparse";
import { useState, useEffect, useRef, useCallback } from "react";

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

function selectRandomRows(num: number, data: Row[]) {
  return Array(num)
    .fill(0)
    .map(() => selectRandomRow(data));
}

function App() {
  const [data, setData] = useState<Row[]>([]);
  const [games, setGames] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const getMoreGames = () => {
    setLoading(false);
    setGames((g) => {
      return [...g, ...selectRandomRows(20, data)];
    });
  };

  const lastGameElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setLoading(true);
          getMoreGames();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, getMoreGames]
  );

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

    getMoreGames();
  }, []);

  return (
    <>
      {data.length == 0 && <p>Loading data</p>}
      {data.length > 0 && games.length > 0 && (
        <>
          <div className="flex items-center justify-center p-4 mb-4 gap-4 roudned-lg shadow-lg w-full">
            <img className="w-12 h-12" src={robloxIcon} alt="Roblox Icon" />
            <p className="text-3xl font-bold">Roblox Roulette</p>
          </div>
          <div className="grid grid-cols-4 gap-4 p-8 pt-4">
            {games.map((_, i) => {
              if (i == games.length - 1) {
                return (
                  <div ref={lastGameElementRef}>
                    <GameCard game={games[i]} />
                  </div>
                );
              } else {
                return <GameCard game={games[i]} />;
              }
            })}
          </div>
        </>
      )}
    </>
  );
}

export default App;
