import React, { useState, useMemo } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchoolModeTeacherSelectorProps {
  teacherList: string[];
  selectedTeacher?: string;
  onTeacherChange: (teacher: string) => void;
  label: string;
}

export const SchoolModeTeacherSelector: React.FC<SchoolModeTeacherSelectorProps> = ({
  teacherList,
  selectedTeacher,
  onTeacherChange,
  label
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredTeachers = useMemo(() => {
    if (!searchValue) return teacherList;
    return teacherList.filter(teacher =>
      teacher.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [teacherList, searchValue]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTeacher || `Select ${label.toLowerCase()}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[200px]">
                {filteredTeachers.map((teacher) => (
                  <CommandItem
                    key={teacher}
                    value={teacher}
                    onSelect={(currentValue) => {
                      onTeacherChange(currentValue === selectedTeacher ? "" : teacher);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTeacher === teacher ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {teacher}
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};