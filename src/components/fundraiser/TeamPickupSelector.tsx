
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamPickupSelectorProps {
  fundraiserId: string;
  onSelectionChange: (ageDivision: string, teamName: string) => void;
  selectedAgeDivision?: string;
  selectedTeam?: string;
}

interface AgeDivision {
  id: string;
  division_name: string;
  display_order: number;
}

interface Team {
  id: string;
  team_name: string;
  display_order: number;
}

export const TeamPickupSelector: React.FC<TeamPickupSelectorProps> = ({
  fundraiserId,
  onSelectionChange,
  selectedAgeDivision,
  selectedTeam
}) => {
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [selectedTeamName, setSelectedTeamName] = useState<string>(selectedTeam || '');

  // Fetch age divisions for this fundraiser
  const { data: ageDivisions, isLoading: divisionsLoading } = useQuery({
    queryKey: ['fundraiser-age-divisions', fundraiserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fundraiser_age_divisions')
        .select('*')
        .eq('fundraiser_id', fundraiserId)
        .order('display_order');

      if (error) {
        console.error('Error fetching age divisions:', error);
        throw error;
      }
      return data as AgeDivision[];
    },
    enabled: !!fundraiserId
  });

  // Fetch teams for selected age division
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['fundraiser-teams', selectedDivisionId],
    queryFn: async () => {
      if (!selectedDivisionId) return [];
      
      const { data, error } = await supabase
        .from('fundraiser_teams')
        .select('*')
        .eq('age_division_id', selectedDivisionId)
        .order('display_order');

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
      return data as Team[];
    },
    enabled: !!selectedDivisionId
  });

  // Handle age division selection
  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivisionId(divisionId);
    setSelectedTeamName(''); // Reset team selection
    
    const division = ageDivisions?.find(d => d.id === divisionId);
    if (division) {
      onSelectionChange(division.division_name, '');
    }
  };

  // Handle team selection
  const handleTeamChange = (teamName: string) => {
    setSelectedTeamName(teamName);
    
    const division = ageDivisions?.find(d => d.id === selectedDivisionId);
    if (division) {
      onSelectionChange(division.division_name, teamName);
    }
  };

  // Initialize with provided values
  useEffect(() => {
    if (selectedAgeDivision && ageDivisions) {
      const division = ageDivisions.find(d => d.division_name === selectedAgeDivision);
      if (division) {
        setSelectedDivisionId(division.id);
      }
    }
  }, [selectedAgeDivision, ageDivisions]);

  useEffect(() => {
    if (selectedTeam) {
      setSelectedTeamName(selectedTeam);
    }
  }, [selectedTeam]);

  if (divisionsLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Age Division</Label>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Label>Team</Label>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!ageDivisions || ageDivisions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        Team pickup is not configured for this fundraiser.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Age Division</Label>
        <Select value={selectedDivisionId} onValueChange={handleDivisionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select age division" />
          </SelectTrigger>
          <SelectContent>
            {ageDivisions.map((division) => (
              <SelectItem key={division.id} value={division.id}>
                {division.division_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Team</Label>
        <Select 
          value={selectedTeamName} 
          onValueChange={handleTeamChange}
          disabled={!selectedDivisionId || teamsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !selectedDivisionId 
                ? "Select age division first" 
                : teamsLoading 
                ? "Loading teams..." 
                : "Select team"
            } />
          </SelectTrigger>
          <SelectContent>
            {teams?.map((team) => (
              <SelectItem key={team.id} value={team.team_name}>
                {team.team_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
