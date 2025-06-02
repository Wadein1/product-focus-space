
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { FundraiserFormData } from '../types';

interface TeamPickupFieldsProps {
  form: UseFormReturn<FundraiserFormData>;
}

export const TeamPickupFields: React.FC<TeamPickupFieldsProps> = ({ form }) => {
  const { control, watch, setValue } = form;
  const ageDivisions = watch('ageDivisions') || [];

  const addAgeDivision = () => {
    const newDivisions = [...ageDivisions];
    const previousTeams = ageDivisions.length > 0 
      ? ageDivisions[ageDivisions.length - 1].teams 
      : [];
    
    newDivisions.push({
      divisionName: '',
      teams: previousTeams.map(team => ({ teamName: team.teamName }))
    });
    setValue('ageDivisions', newDivisions);
  };

  const removeAgeDivision = (index: number) => {
    const newDivisions = ageDivisions.filter((_, i) => i !== index);
    setValue('ageDivisions', newDivisions);
  };

  const addTeam = (divisionIndex: number) => {
    const newDivisions = [...ageDivisions];
    newDivisions[divisionIndex].teams.push({ teamName: '' });
    setValue('ageDivisions', newDivisions);
  };

  const removeTeam = (divisionIndex: number, teamIndex: number) => {
    const newDivisions = [...ageDivisions];
    newDivisions[divisionIndex].teams = newDivisions[divisionIndex].teams.filter((_, i) => i !== teamIndex);
    setValue('ageDivisions', newDivisions);
  };

  const updateDivisionName = (index: number, name: string) => {
    const newDivisions = [...ageDivisions];
    newDivisions[index].divisionName = name;
    setValue('ageDivisions', newDivisions);
  };

  const updateTeamName = (divisionIndex: number, teamIndex: number, name: string) => {
    const newDivisions = [...ageDivisions];
    newDivisions[divisionIndex].teams[teamIndex].teamName = name;
    setValue('ageDivisions', newDivisions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Team Pickup Configuration
          <Button type="button" onClick={addAgeDivision} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Age Division
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {ageDivisions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No age divisions configured. Click "Add Age Division" to start.
          </p>
        ) : (
          ageDivisions.map((division, divisionIndex) => (
            <Card key={divisionIndex} className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <FormField
                      control={control}
                      name={`ageDivisions.${divisionIndex}.divisionName` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Division Name (e.g., U11, U12, U13)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={division.divisionName}
                              onChange={(e) => updateDivisionName(divisionIndex, e.target.value)}
                              placeholder="e.g., U11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAgeDivision(divisionIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel>Teams in this Division</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTeam(divisionIndex)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team
                    </Button>
                  </div>
                  
                  {division.teams.length === 0 ? (
                    <p className="text-gray-400 text-sm">No teams configured for this division.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {division.teams.map((team, teamIndex) => (
                        <div key={teamIndex} className="flex items-center gap-2">
                          <Input
                            value={team.teamName}
                            onChange={(e) => updateTeamName(divisionIndex, teamIndex, e.target.value)}
                            placeholder="e.g., Blue, Red, Purple"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTeam(divisionIndex, teamIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
