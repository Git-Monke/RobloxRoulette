import "./App.css";
import Papa from "papaparse";
import { useState, useEffect, useRef, useCallback } from "react";

import GameCard from "./GameCard";
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

  // const setOfFilteredData = useMemo<Set<Row>>(() => {
  //   return new Set(filteredData);
  // }, [filteredData]);

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
    setFilteredData(data.filter((v) => v.visits >= minPlays));
  }, [data, minPlays]);

  useEffect(() => {
    setGames([]);
    unusedGames.current = new Set(filteredData);
    loadMoreGames();
  }, [filteredData]);

  if (data.length === 0) {
    return <p>Loading data...</p>;
  }

  return (
    <>
      <header className="flex items-center justify-center p-4 mb-4 gap-4 rounded-lg shadow-lg w-full">
        <img className="w-12 h-12" src={robloxIcon} alt="Roblox Icon" />
        <h1 className="text-3xl font-bold">Roblox Roulette</h1>
      </header>

      <main className="w-screen flex justify-center">
        <section className="p-8 pt-4 flex flex-col gap-8 w-[75%]">
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
                  </SelectContent>
                </Select>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-3 gap-4">
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
    </>
  );
}

export default App;
