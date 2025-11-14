import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

const matchSchema = z.object({
  home_team_id: z.string().uuid("Selecciona el equipo local"),
  away_team_id: z.string().uuid("Selecciona el equipo visitante"),
  home_goals: z.number().min(0, "Los goles no pueden ser negativos"),
  away_goals: z.number().min(0, "Los goles no pueden ser negativos"),
});

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_goals: number;
  away_goals: number;
  match_date: string;
  home_team?: { name: string };
  away_team?: { name: string };
}

interface Team {
  id: string;
  name: string;
  category: string;
}

export function MatchesManager() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    home_team_id: "",
    away_team_id: "",
    home_goals: 0,
    away_goals: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("*").order("name");
    setTeams(data || []);
  };

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `)
      .order("match_date", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los partidos",
        variant: "destructive",
      });
    } else {
      setMatches(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      matchSchema.parse(formData);

      if (formData.home_team_id === formData.away_team_id) {
        toast({
          title: "Error",
          description: "Un equipo no puede jugar contra sí mismo",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      if (editingId) {
        const { error } = await supabase
          .from("matches")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Partido actualizado",
          description: "El partido ha sido actualizado exitosamente",
        });
      } else {
        const { error } = await supabase.from("matches").insert([formData]);

        if (error) throw error;

        toast({
          title: "Partido creado",
          description: "El partido ha sido creado exitosamente",
        });
      }

      setFormData({ home_team_id: "", away_team_id: "", home_goals: 0, away_goals: 0 });
      setEditingId(null);
      fetchMatches();
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
          description: "No se pudo guardar el partido",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (match: Match) => {
    setEditingId(match.id);
    setFormData({
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      home_goals: match.home_goals,
      away_goals: match.away_goals,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este partido?")) return;

    const { error } = await supabase.from("matches").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el partido",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Partido eliminado",
        description: "El partido ha sido eliminado exitosamente",
      });
      fetchMatches();
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Partido" : "Nuevo Partido"}</CardTitle>
          <CardDescription>
            {editingId ? "Modifica los datos del partido" : "Registra un nuevo partido"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="home-team">Equipo Local</Label>
              <Select
                value={formData.home_team_id}
                onValueChange={(value) => setFormData({ ...formData, home_team_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el equipo local" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.home_team_id && (
                <p className="text-sm text-destructive">{errors.home_team_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="away-team">Equipo Visitante</Label>
              <Select
                value={formData.away_team_id}
                onValueChange={(value) => setFormData({ ...formData, away_team_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el equipo visitante" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.away_team_id && (
                <p className="text-sm text-destructive">{errors.away_team_id}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home-goals">Goles Local</Label>
                <Input
                  id="home-goals"
                  type="number"
                  min="0"
                  value={formData.home_goals}
                  onChange={(e) =>
                    setFormData({ ...formData, home_goals: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="away-goals">Goles Visitante</Label>
                <Input
                  id="away-goals"
                  type="number"
                  min="0"
                  value={formData.away_goals}
                  onChange={(e) =>
                    setFormData({ ...formData, away_goals: parseInt(e.target.value) || 0 })
                  }
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
                    setFormData({ home_team_id: "", away_team_id: "", home_goals: 0, away_goals: 0 });
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
          <CardTitle>Partidos Registrados</CardTitle>
          <CardDescription>Lista de todos los partidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{match.home_team?.name}</span>
                    <span className="text-2xl font-bold">
                      {match.home_goals} - {match.away_goals}
                    </span>
                    <span className="font-semibold">{match.away_team?.name}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(match)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(match.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {matches.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay partidos registrados aún
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
