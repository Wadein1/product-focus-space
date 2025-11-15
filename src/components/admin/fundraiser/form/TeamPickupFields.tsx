import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { FundraiserFormData } from '../types';

interface TeamPickupFieldsProps {
  form: UseFormReturn<FundraiserFormData>;
}

export const TeamPickupFields: React.FC<TeamPickupFieldsProps> = ({ form }) => {
  const { control, watch, setValue } = form;
  const ageDivisions = watch('ageDivisions') || [];
  const schoolMode = watch('schoolMode');
  const bigSchool = watch('bigSchool');
  const [bulkTeacherInput, setBulkTeacherInput] = useState('');

  const divisionLabel = schoolMode ? 'Grade' : 'Age Division';
  const teamLabel = schoolMode && bigSchool ? 'Homeroom Teacher' : schoolMode ? 'Teacher' : 'Team';
  const divisionPlaceholder = schoolMode ? 'e.g., 3rd Grade' : 'e.g., U11';

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

  const handleBulkTeacherPaste = (divisionIndex: number) => {
    if (!bulkTeacherInput.trim()) return;
    
    const teacherNames = bulkTeacherInput
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    const newDivisions = [...ageDivisions];
    newDivisions[divisionIndex].teams = teacherNames.map(name => ({ teamName: name }));
    setValue('ageDivisions', newDivisions);
    setBulkTeacherInput('');
  };

  const cardTitle = schoolMode ? 'School Delivery Configuration' : 'Team Pickup Configuration';
  const addButtonText = `Add ${divisionLabel}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {cardTitle}
          <Button type="button" onClick={addAgeDivision} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {ageDivisions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No {divisionLabel.toLowerCase()}s configured. Click "{addButtonText}" to start.
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
                          <FormLabel>{divisionLabel} Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={division.divisionName}
                              onChange={(e) => updateDivisionName(divisionIndex, e.target.value)}
                              placeholder={divisionPlaceholder}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAgeDivision(divisionIndex)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{teamLabel}s</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTeam(divisionIndex)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add {teamLabel}
                  </Button>
                </div>

                {schoolMode && bigSchool && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <FormLabel className="mb-2 block">
                      Bulk Add {teamLabel}s
                    </FormLabel>
                    <CardDescription className="mb-2">
                      Paste {teamLabel.toLowerCase()}s separated by commas (e.g., "Mr. Johnson, Mr. Heckman, Mrs. Rose")
                    </CardDescription>
                    <div className="flex gap-2">
                      <Textarea
                        value={bulkTeacherInput}
                        onChange={(e) => setBulkTeacherInput(e.target.value)}
                        placeholder="Mr. Johnson, Mr. Heckman, Mrs. Rose"
                        className="flex-1"
                        rows={3}
                      />
                      <Button
                        type="button"
                        onClick={() => handleBulkTeacherPaste(divisionIndex)}
                        disabled={!bulkTeacherInput.trim()}
                      >
                        Add All
                      </Button>
                    </div>
                  </div>
                )}

                {division.teams.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No {teamLabel.toLowerCase()}s added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {division.teams.map((team, teamIndex) => (
                      <div key={teamIndex} className="flex items-center gap-2">
                        <FormField
                          control={control}
                          name={`ageDivisions.${divisionIndex}.teams.${teamIndex}.teamName` as any}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...field}
                                  value={team.teamName}
                                  onChange={(e) => updateTeamName(divisionIndex, teamIndex, e.target.value)}
                                  placeholder={`${teamLabel} name`}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeam(divisionIndex, teamIndex)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
