import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStandings, type TeamStanding } from "@/hooks/useStandings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StandingsTable } from "@/components/StandingsTable";
import { TeamDetails } from "@/components/TeamDetails";
import { LogIn, Shield, Trophy } from "lucide-react";

const Index = () => {
  const [selectedTeam, setSelectedTeam] = useState<TeamStanding | null>(null);
  const { standings: mensStandings, isLoading: mensLoading } = useStandings("men");
  const { standings: womensStandings, isLoading: womensLoading } = useStandings("women");
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="bg-gradient-sport text-primary-foreground shadow-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Trophy className="w-10 h-10" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Tabla de Posiciones</h1>
                <p className="text-primary-foreground/90">Campeonato 2025 - Estadísticas en Vivo</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!user ? (
                <Button onClick={() => navigate("/auth")} variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </Button>
              ) : isAdmin ? (
                <Button onClick={() => navigate("/admin")} className="bg-white text-primary hover:bg-white/90">
                  <Shield className="mr-2 h-4 w-4" />
                  Panel Admin
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="men" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-12 bg-card shadow-card">
            <TabsTrigger
              value="men"
              className="text-lg font-semibold data-[state=active]:bg-gradient-sport data-[state=active]:text-primary-foreground"
            >
              🏆 Hombres
            </TabsTrigger>
            <TabsTrigger
              value="women"
              className="text-lg font-semibold data-[state=active]:bg-gradient-sport data-[state=active]:text-primary-foreground"
            >
              🏆 Mujeres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="men" className="mt-0">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Categoría Masculina</h2>
              <p className="text-muted-foreground">
                Haz clic en cualquier equipo para ver los detalles completos
              </p>
            </div>
            {mensLoading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : mensStandings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay equipos registrados aún
              </div>
            ) : (
              <StandingsTable standings={mensStandings} onTeamClick={setSelectedTeam} />
            )}
          </TabsContent>

          <TabsContent value="women" className="mt-0">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Categoría Femenina</h2>
              <p className="text-muted-foreground">
                Haz clic en cualquier equipo para ver los detalles completos
              </p>
            </div>
            {womensLoading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : womensStandings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay equipos registrados aún
              </div>
            ) : (
              <StandingsTable standings={womensStandings} onTeamClick={setSelectedTeam} />
            )}
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-8 p-6 bg-card rounded-lg shadow-card max-w-2xl mx-auto">
          <h3 className="font-semibold text-foreground mb-3">Abreviaturas:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="font-semibold text-muted-foreground">PJ:</span> Partidos Jugados
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">PG:</span> Partidos Ganados
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">PE:</span> Partidos Empatados
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">PP:</span> Partidos Perdidos
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">GF:</span> Goles a Favor
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">GC:</span> Goles en Contra
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">DG:</span> Diferencia de Goles
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">TA:</span> Tarjetas Amarillas
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">TR:</span> Tarjetas Rojas
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">PTS:</span> Puntos
            </div>
          </div>
        </div>
      </main>

      {/* Team Details Dialog */}
      {selectedTeam && (
        <TeamDetails
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
};

export default Index;
