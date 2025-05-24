import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "./components/ui/button";

import { Badge } from "./components/ui/badge";

import { Users, Award, ExternalLink } from "lucide-react";

interface Row {
  rootGameId: number;
  universeId: number;
  name: string;
  creatorName: string;
  visits: number;
}

const tierColors: { [key: number]: string } = {
  1e2: "#808080", // Gray - Common
  1e3: "#2ECC71", // Green - Uncommon
  1e4: "#3498DB", // Blue - Rare
  1e5: "#9B59B6", // Purple - Epic
  1e6: "#E67E22", // Orange - Mythic
  1e7: "#C0392B", // Crimson - Ultra
  1e8: "#00FFFF", // Cyan - Exotic
};

const GameCard = ({ game }: { game: Row }) => {
  if (!game) return null;

  const formatVisits = (visits: number) => {
    if (visits >= 1000000000) {
      return `${(visits / 1000000000).toFixed(1)}B`;
    } else if (visits >= 1000000) {
      return `${(visits / 1000000).toFixed(1)}M`;
    } else if (visits >= 1000) {
      return `${(visits / 1000).toFixed(1)}K`;
    }
    return visits.toString();
  };

  const getRankColor = (visits: number) => {
    return tierColors[Math.pow(10, Math.floor(Math.log10(visits)))];
  };

  const rankColor = getRankColor(game.visits);

  return (
    <Card
      className={`w-full max-w-md overflow-hidden h-full flex flex-cols justify-between`}
      style={{
        boxShadow: `0 0 10px 2px ${rankColor}`,
      }}
    >
      <CardHeader className="flex flex-wrap w-full">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 w-full">
            <CardTitle className="text-xl font-bold truncate mb-2 w-full">
              {game.name}
            </CardTitle>
            <CardDescription className="flex flex-col mt-1 gap-2 w-full">
              <div className="flex flex-wrap  gap-2 ">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{formatVisits(game.visits)} visits</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 hidden lg:flex"
                >
                  <Award className="h-3 w-3" />
                  <span>Universe #{game.universeId}</span>
                </Badge>
              </div>
              <div className="w-full">
                <span className="mr-1">By</span>
                <span className="font-medium text-foreground truncate w-full">
                  {game.creatorName}
                </span>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-0">
        <Button className="w-full gap-2" asChild>
          <a
            href={`https://www.roblox.com/games/${game.rootGameId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Play Game
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
