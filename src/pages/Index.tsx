import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandingsTable, TeamStanding } from "@/components/StandingsTable";
import { TeamDetails } from "@/components/TeamDetails";
import { mensStandings, womensStandings } from "@/data/mockData";
import { Trophy } from "lucide-react";

const Index = () => {
  const [selectedTeam, setSelectedTeam] = useState<TeamStanding | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="bg-gradient-sport text-primary-foreground shadow-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Tabla de Posiciones</h1>
          </div>
          <p className="text-center mt-2 text-primary-foreground/90 text-lg">
            Campeonato 2025 - Estadísticas en Vivo
          </p>
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
            <StandingsTable standings={mensStandings} onTeamClick={setSelectedTeam} />
          </TabsContent>

          <TabsContent value="women" className="mt-0">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Categoría Femenina</h2>
              <p className="text-muted-foreground">
                Haz clic en cualquier equipo para ver los detalles completos
              </p>
            </div>
            <StandingsTable standings={womensStandings} onTeamClick={setSelectedTeam} />
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
              <span className="font-semibold text-muted-foreground">Pts:</span> Puntos
            </div>
          </div>
        </div>
      </main>

      {/* Team Details Modal */}
      {selectedTeam && <TeamDetails team={selectedTeam} onClose={() => setSelectedTeam(null)} />}
    </div>
  );
};

export default Index;
