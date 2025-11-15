import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [openTeamSelect, setOpenTeamSelect] = useState(false);

  // Fetch fundraiser settings to get school_mode and big_school
  const { data: fundraiser } = useQuery({
    queryKey: ['fundraiser-settings', fundraiserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fundraisers')
        .select('school_mode, big_school')
        .eq('id', fundraiserId)
        .single();

      if (error) {
        console.error('Error fetching fundraiser settings:', error);
        throw error;
      }
      return data;
    },
    enabled: !!fundraiserId
  });

  const schoolMode = fundraiser?.school_mode || false;
  const bigSchool = fundraiser?.big_school || false;

  const divisionLabel = schoolMode ? 'Grade' : 'Age Division';
  const teamLabel = schoolMode && bigSchool ? 'Homeroom Teacher' : schoolMode ? 'Teacher' : 'Team';

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
      // Sort teams alphabetically by team_name
      return (data as Team[]).sort((a, b) => a.team_name.localeCompare(b.team_name));
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
          <Label>{divisionLabel}</Label>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Label>{teamLabel}</Label>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!ageDivisions || ageDivisions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        {schoolMode ? 'School delivery' : 'Team pickup'} is not configured for this fundraiser.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{divisionLabel}</Label>
        <Select 
          value={selectedDivisionId} 
          onValueChange={handleDivisionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${divisionLabel.toLowerCase()}`} />
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

      {selectedDivisionId && (
        <div className="space-y-2">
          <Label>{teamLabel}</Label>
          {bigSchool && schoolMode ? (
            // Use searchable combobox for big school mode
            <Popover open={openTeamSelect} onOpenChange={setOpenTeamSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openTeamSelect}
                  className="w-full justify-between"
                >
                  {selectedTeamName || `Select ${teamLabel.toLowerCase()}`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder={`Search ${teamLabel.toLowerCase()}...`} />
                  <CommandEmpty>No {teamLabel.toLowerCase()} found.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-auto">
                    {teamsLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : teams && teams.length > 0 ? (
                      teams.map((team) => (
                        <CommandItem
                          key={team.id}
                          value={team.team_name}
                          onSelect={() => {
                            handleTeamChange(selectedTeamName === team.team_name ? "" : team.team_name);
                            setOpenTeamSelect(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTeamName === team.team_name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {team.team_name}
                        </CommandItem>
                      ))
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No {teamLabel.toLowerCase()} available for this {divisionLabel.toLowerCase()}.
                      </div>
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            // Use regular select for non-big-school mode
            <Select 
              value={selectedTeamName} 
              onValueChange={handleTeamChange}
              disabled={teamsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${teamLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.team_name}>
                    {team.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
};
