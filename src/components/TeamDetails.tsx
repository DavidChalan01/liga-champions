import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamStanding } from "./StandingsTable";
import { Users, Award, Target } from "lucide-react";

interface TeamDetailsProps {
  team: TeamStanding;
  onClose: () => void;
}

export const TeamDetails = ({ team, onClose }: TeamDetailsProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-card-hover">
        <CardHeader className="bg-gradient-sport text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{team.team}</CardTitle>
            <button
              onClick={onClose}
              className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Manager Info */}
          <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Persona a Cargo</p>
              <p className="font-semibold text-foreground">{team.manager}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-sport rounded-lg text-center">
              <Award className="w-6 h-6 mx-auto mb-2 text-primary-foreground" />
              <p className="text-2xl font-bold text-primary-foreground">{team.points}</p>
              <p className="text-xs text-primary-foreground/80">Puntos</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{team.goalsFor}</p>
              <p className="text-xs text-muted-foreground">Goles</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">{team.won}</p>
              <p className="text-xs text-muted-foreground">Ganados</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">
                {team.goalDifference > 0 ? "+" : ""}
                {team.goalDifference}
              </p>
              <p className="text-xs text-muted-foreground">Diferencia</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Estadísticas del Torneo
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between p-2 bg-secondary/30 rounded">
                  <span className="text-muted-foreground">Partidos Jugados:</span>
                  <span className="font-semibold text-foreground">{team.played}</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/30 rounded">
                  <span className="text-muted-foreground">Empates:</span>
                  <span className="font-semibold text-foreground">{team.drawn}</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/30 rounded">
                  <span className="text-muted-foreground">Derrotas:</span>
                  <span className="font-semibold text-destructive">{team.lost}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Goles y Tarjetas</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between p-2 bg-secondary/30 rounded">
                  <span className="text-muted-foreground">Goles en Contra:</span>
                  <span className="font-semibold text-foreground">{team.goalsAgainst}</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/30 rounded">
                  <span className="text-muted-foreground">Tarjetas Amarillas:</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    {team.yellowCards}
                  </Badge>
                </div>
                <div className="flex justify-between p-2 bg-secondary/30 rounded">
                  <span className="text-muted-foreground">Tarjetas Rojas:</span>
                  <Badge variant="destructive">{team.redCards}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Players List */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Jugadores del Equipo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {team.players.map((player, index) => (
                <div
                  key={index}
                  className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{player}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
