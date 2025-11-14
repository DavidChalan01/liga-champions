import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TeamStanding {
  id: string;
  position: number;
  teamName: string;
  manager: string;
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
}

export function useStandings(category: "men" | "women") {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStandings();

    // Subscribe to changes
    const channel = supabase
      .channel(`standings-${category}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => fetchStandings()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchStandings()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => fetchStandings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  const fetchStandings = async () => {
    try {
      // Fetch teams
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .eq("category", category);

      if (teamsError) throw teamsError;
      if (!teams) return;

      // Fetch matches
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("*");

      if (matchesError) throw matchesError;

      // Fetch players
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("*");

      if (playersError) throw playersError;

      // Calculate standings
      const calculatedStandings: TeamStanding[] = teams.map((team) => {
        const teamMatches = matches?.filter(
          (m) => m.home_team_id === team.id || m.away_team_id === team.id
        ) || [];

        const teamPlayers = players?.filter((p) => p.team_id === team.id) || [];

        let won = 0;
        let drawn = 0;
        let lost = 0;
        let goalsFor = 0;
        let goalsAgainst = 0;

        teamMatches.forEach((match) => {
          if (match.home_team_id === team.id) {
            goalsFor += match.home_goals;
            goalsAgainst += match.away_goals;
            if (match.home_goals > match.away_goals) won++;
            else if (match.home_goals === match.away_goals) drawn++;
            else lost++;
          } else {
            goalsFor += match.away_goals;
            goalsAgainst += match.home_goals;
            if (match.away_goals > match.home_goals) won++;
            else if (match.away_goals === match.home_goals) drawn++;
            else lost++;
          }
        });

        const yellowCards = teamPlayers.reduce((sum, p) => sum + p.yellow_cards, 0);
        const redCards = teamPlayers.reduce((sum, p) => sum + p.red_cards, 0);
        const points = won * 3 + drawn;
        const goalDifference = goalsFor - goalsAgainst;

        return {
          id: team.id,
          position: 0,
          teamName: team.name,
          manager: team.manager,
          played: teamMatches.length,
          won,
          drawn,
          lost,
          goalsFor,
          goalsAgainst,
          goalDifference,
          yellowCards,
          redCards,
          points,
        };
      });

      // Sort by points, then goal difference, then goals for
      calculatedStandings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

      // Assign positions
      calculatedStandings.forEach((team, index) => {
        team.position = index + 1;
      });

      setStandings(calculatedStandings);
    } catch (error) {
      console.error("Error fetching standings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { standings, isLoading };
}
