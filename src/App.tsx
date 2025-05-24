import "./App.css";
import Papa from "papaparse";
import { useState, useEffect, useRef, useCallback } from "react";

import GameCard from "./GameCard";
import Footer from "./Footer";

import robloxIcon from "../public/roblox.svg";
import { Sliders } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Row {
  rootGameId: number;
  universeId: number;
  name: string;
  creatorName: string;
  visits: number;
}

const NEW_GAMES_PER_SCROLL = 18 * 3;

const getUniqueRandomRows = (count: number, unused: Set<Row>) => {
  if (count >= unused.size) {
    return Array.from(unused);
  }

  let unusedArray = Array.from(unused);
  let items = [];

  for (let i = 0; i < count; i++) {
    let j = Math.floor(Math.random() * unused.size);
    items.push(unusedArray[j]);
    unusedArray.splice(j, 1);
  }

  return items;
};

function App() {
  const [minPlays, setMinPlays] = useState(100);

  const [data, setData] = useState<Row[]>([]);

  const [filteredData, setFilteredData] = useState<Row[]>([]);
  const unusedGames = useRef<Set<Row>>(new Set());

  const [games, setGames] = useState<Row[]>([]);

  const observer = useRef<IntersectionObserver | null>(null);
  const isLoading = useRef(false);

  const [shift, setShift] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused.current) {
        setShift((s) => s + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      paused.current = document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const loadMoreGames = () => {
    if (isLoading.current) {
      return;
    }

    isLoading.current = true;

    const items = getUniqueRandomRows(
      NEW_GAMES_PER_SCROLL,
      unusedGames.current
    );
    items.forEach((item) => unusedGames.current.delete(item));

    setGames((prev) => {
      return [...prev, ...items];
    });

    isLoading.current = false;
  };

  const lastGameRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading.current == true) return;
      if (games.length == filteredData.length) return;

      observer.current?.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMoreGames();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, loadMoreGames]
  );

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "games.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse<Row>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => setData(results.data),
          delimiter: " ",
        });
      });
  }, []);

  useEffect(() => {
    const newData = data.filter((v) => v.visits >= minPlays);
    setFilteredData(newData);
  }, [data, minPlays]);

  useEffect(() => {
    setGames([]);
    unusedGames.current = new Set(filteredData);
    if (filteredData.length > 0) {
      setShift((s) => s % filteredData.length);
    }
    loadMoreGames();
  }, [filteredData]);

  if (data.length === 0) {
    return <p>Loading data...</p>;
  }

  const SPINNER_ITEMS = 7;
  const CENTER = Math.floor(SPINNER_ITEMS / 2);

  return (
    <>
      <header className="flex items-center justify-center p-4 mb-4 gap-4 rounded-lg shadow-lg w-full">
        <img className="w-12 h-12" src={robloxIcon} alt="Roblox Icon" />
        <h1 className="text-3xl font-bold">Roblox Roulette</h1>
      </header>

      <main className="w-screen flex flex-col items-center">
        <section className="pt-4 pb-4 flex flex-col gap-8 w-[90%] sm:w-[90%] md:w-[75%] ">
          <h2 className="text-2xl font-bold ">Disover Games</h2>
        </section>
        <div className="w-[150vw] md:w-[100vw] h-64 relative">
          {Array.from({ length: SPINNER_ITEMS }, () => 0).map((_, index) => {
            const position = (index + shift) % 7;
            const isCenter = position === CENTER;

            return (
              <div
                className={`absolute sm:w-32 md:w-64 lg:w-96 h-48 ${
                  position !== 0 && position !== SPINNER_ITEMS - 1
                    ? "transition-all duration-1000"
                    : ""
                } `}
                style={{
                  left: `calc(${
                    200 * (position / (SPINNER_ITEMS - 1))
                  }% - 50%)`,
                  top: "50%",
                  transform: `translateY(-50%) translateX(-50%) ${
                    isCenter ? "scale(1.1)" : "scale(0.9)"
                  }`,
                }}
              >
                <GameCard
                  game={
                    filteredData[
                      (shift + SPINNER_ITEMS - position) % filteredData.length
                    ]
                  }
                />
              </div>
            );
          })}
        </div>
        <section className="pt-8 flex flex-col gap-8 w-[90%] sm:w-[90%] md:w-[75%] ">
          <div className="flex w-full justify-between">
            <h2 className="text-2xl font-bold">Random Games</h2>
            <Popover>
              <PopoverTrigger>
                <Sliders></Sliders>
              </PopoverTrigger>
              <PopoverContent>
                <h3 className="font-bold">Set minimum plays</h3>
                <Select
                  defaultValue="100"
                  onValueChange={(v) => {
                    setMinPlays(parseInt(v));
                  }}
                  value={minPlays.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="100+ Plays"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100+ Plays</SelectItem>
                    <SelectItem value="1000">1k+ Plays</SelectItem>
                    <SelectItem value="10000">10k+ Plays</SelectItem>
                    <SelectItem value="100000">100k+ Plays</SelectItem>
                    <SelectItem value="1000000">1M+ Plays</SelectItem>
                    <SelectItem value="10000000">10M+ Plays</SelectItem>
                    <SelectItem value="100000000">100M+ Plays</SelectItem>
                  </SelectContent>
                </Select>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game, index) =>
              index === games.length - NEW_GAMES_PER_SCROLL ? (
                <div key={index} ref={lastGameRef}>
                  <GameCard game={game} />
                </div>
              ) : (
                <GameCard key={index} game={game} />
              )
            )}
          </div>
          <div className="flex w-full justify-center">
            {unusedGames.current.size == 0 && (
              <p className="m-4">No more games to load!</p>
            )}
          </div>
        </section>
      </main>
      <Footer></Footer>
    </>
  );
}

export default App;
