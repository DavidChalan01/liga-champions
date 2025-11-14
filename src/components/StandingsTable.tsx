import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface TeamStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  yellowCards: number;
  redCards: number;
  points: number;
  manager: string;
  players: string[];
}

interface StandingsTableProps {
  standings: TeamStanding[];
  onTeamClick?: (team: TeamStanding) => void;
}

export const StandingsTable = ({ standings, onTeamClick }: StandingsTableProps) => {
  return (
    <Card className="overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-sport text-primary-foreground">
              <th className="px-4 py-3 text-left text-sm font-bold">#</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Equipo</th>
              <th className="px-2 py-3 text-center text-sm font-bold">PJ</th>
              <th className="px-2 py-3 text-center text-sm font-bold">PG</th>
              <th className="px-2 py-3 text-center text-sm font-bold">PE</th>
              <th className="px-2 py-3 text-center text-sm font-bold">PP</th>
              <th className="px-2 py-3 text-center text-sm font-bold">GF</th>
              <th className="px-2 py-3 text-center text-sm font-bold">GC</th>
              <th className="px-2 py-3 text-center text-sm font-bold">DG</th>
              <th className="px-2 py-3 text-center text-sm font-bold">TA</th>
              <th className="px-2 py-3 text-center text-sm font-bold">TR</th>
              <th className="px-4 py-3 text-center text-sm font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr
                key={team.team}
                onClick={() => onTeamClick?.(team)}
                className={`
                  border-b border-border transition-all duration-200 cursor-pointer
                  hover:bg-secondary/50 hover:shadow-card-hover
                  ${index % 2 === 0 ? "bg-background" : "bg-secondary/20"}
                  ${team.position <= 4 ? "border-l-4 border-l-primary" : ""}
                `}
              >
                <td className="px-4 py-3">
                  <span className="font-bold text-lg text-foreground">{team.position}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">{team.team}</div>
                  <div className="text-xs text-muted-foreground">{team.manager}</div>
                </td>
                <td className="px-2 py-3 text-center text-muted-foreground">{team.played}</td>
                <td className="px-2 py-3 text-center text-primary font-semibold">{team.won}</td>
                <td className="px-2 py-3 text-center text-muted-foreground">{team.drawn}</td>
                <td className="px-2 py-3 text-center text-destructive">{team.lost}</td>
                <td className="px-2 py-3 text-center font-semibold text-foreground">{team.goalsFor}</td>
                <td className="px-2 py-3 text-center text-muted-foreground">{team.goalsAgainst}</td>
                <td className="px-2 py-3 text-center">
                  <span
                    className={`font-bold ${
                      team.goalDifference > 0
                        ? "text-primary"
                        : team.goalDifference < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {team.goalDifference > 0 ? "+" : ""}
                    {team.goalDifference}
                  </span>
                </td>
                <td className="px-2 py-3 text-center">
                  {team.yellowCards > 0 && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {team.yellowCards}
                    </Badge>
                  )}
                </td>
                <td className="px-2 py-3 text-center">
                  {team.redCards > 0 && (
                    <Badge variant="destructive">{team.redCards}</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-xl text-primary">{team.points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
