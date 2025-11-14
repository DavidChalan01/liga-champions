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

const teamSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
  category: z.enum(["men", "women"]),
  manager: z.string().trim().min(1, "El encargado es requerido").max(100),
});

interface Team {
  id: string;
  name: string;
  category: string;
  manager: string;
}

export function TeamsManager() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", category: "men", manager: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos",
        variant: "destructive",
      });
    } else {
      setTeams(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      teamSchema.parse(formData);
      setIsLoading(true);

      if (editingId) {
        const { error } = await supabase
          .from("teams")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Equipo actualizado",
          description: "El equipo ha sido actualizado exitosamente",
        });
      } else {
        const { error } = await supabase.from("teams").insert([formData]);

        if (error) throw error;

        toast({
          title: "Equipo creado",
          description: "El equipo ha sido creado exitosamente",
        });
      }

      setFormData({ name: "", category: "men", manager: "" });
      setEditingId(null);
      fetchTeams();
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
          description: "No se pudo guardar el equipo",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingId(team.id);
    setFormData({
      name: team.name,
      category: team.category,
      manager: team.manager,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return;

    const { error } = await supabase.from("teams").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado exitosamente",
      });
      fetchTeams();
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Equipo" : "Nuevo Equipo"}</CardTitle>
          <CardDescription>
            {editingId ? "Modifica los datos del equipo" : "Agrega un nuevo equipo al campeonato"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Equipo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Tigres FC"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Hombres</SelectItem>
                  <SelectItem value="women">Mujeres</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Encargado</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Nombre del encargado"
              />
              {errors.manager && <p className="text-sm text-destructive">{errors.manager}</p>}
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
                    setFormData({ name: "", category: "men", manager: "" });
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
          <CardTitle>Equipos Registrados</CardTitle>
          <CardDescription>Lista de todos los equipos en el campeonato</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {team.category === "men" ? "Hombres" : "Mujeres"} • {team.manager}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(team)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(team.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {teams.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay equipos registrados aún
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
