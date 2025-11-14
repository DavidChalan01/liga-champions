import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

const playerSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  team_id: z.string().uuid("Selecciona un equipo"),
  goals: z.number().min(0, "Los goles no pueden ser negativos"),
  yellow_cards: z.number().min(0, "Las tarjetas amarillas no pueden ser negativas"),
  red_cards: z.number().min(0, "Las tarjetas rojas no pueden ser negativas"),
});

interface Player {
  id: string;
  name: string;
  team_id: string;
  goals: number;
  yellow_cards: number;
  red_cards: number;
  teams?: { name: string };
}

interface Team {
  id: string;
  name: string;
  category: string;
}

export function PlayersManager() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    team_id: "",
    goals: 0,
    yellow_cards: 0,
    red_cards: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("*").order("name");
    setTeams(data || []);
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*, teams(name)")
      .order("name", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los jugadores",
        variant: "destructive",
      });
    } else {
      setPlayers(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      playerSchema.parse(formData);
      setIsLoading(true);

      if (editingId) {
        const { error } = await supabase
          .from("players")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Jugador actualizado",
          description: "El jugador ha sido actualizado exitosamente",
        });
      } else {
        const { error } = await supabase.from("players").insert([formData]);

        if (error) throw error;

        toast({
          title: "Jugador creado",
          description: "El jugador ha sido creado exitosamente",
        });
      }

      setFormData({ name: "", team_id: "", goals: 0, yellow_cards: 0, red_cards: 0 });
      setEditingId(null);
      fetchPlayers();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar el jugador",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setFormData({
      name: player.name,
      team_id: player.team_id,
      goals: player.goals,
      yellow_cards: player.yellow_cards,
      red_cards: player.red_cards,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este jugador?")) return;

    const { error } = await supabase.from("players").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el jugador",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Jugador eliminado",
        description: "El jugador ha sido eliminado exitosamente",
      });
      fetchPlayers();
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Jugador" : "Nuevo Jugador"}</CardTitle>
          <CardDescription>
            {editingId ? "Modifica los datos del jugador" : "Agrega un nuevo jugador"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Nombre del Jugador</Label>
              <Input
                id="player-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre completo"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Equipo</Label>
              <Select
                value={formData.team_id}
                onValueChange={(value) => setFormData({ ...formData, team_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} ({team.category === "men" ? "Hombres" : "Mujeres"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.team_id && <p className="text-sm text-destructive">{errors.team_id}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Goles</Label>
                <Input
                  id="goals"
                  type="number"
                  min="0"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yellow-cards">T. Amarillas</Label>
                <Input
                  id="yellow-cards"
                  type="number"
                  min="0"
                  value={formData.yellow_cards}
                  onChange={(e) =>
                    setFormData({ ...formData, yellow_cards: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="red-cards">T. Rojas</Label>
                <Input
                  id="red-cards"
                  type="number"
                  min="0"
                  value={formData.red_cards}
                  onChange={(e) => setFormData({ ...formData, red_cards: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? "Actualizar" : "Crear"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", team_id: "", goals: 0, yellow_cards: 0, red_cards: 0 });
                    setErrors({});
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jugadores Registrados</CardTitle>
          <CardDescription>Lista de todos los jugadores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{player.name}</h3>
                  <p className="text-sm text-muted-foreground">{player.teams?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ⚽ {player.goals} • 🟨 {player.yellow_cards} • 🟥 {player.red_cards}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(player)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(player.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {players.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay jugadores registrados aún
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
