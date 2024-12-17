import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerProps {
  color: string | null;
  onChange: (color: string) => void;
}

const predefinedColors = [
  '#000000', // Black
  '#FFFFFF', // White
  '#ea384c', // Red
  '#0EA5E9', // Blue
  '#22c55e', // Green
  '#9b87f5', // Purple
  '#8E9196', // Gray
  '#F97316', // Orange
  '#D946EF', // Pink
  '#0EA5E9', // Light Blue
  '#F2FCE2', // Soft Green
  '#FEF7CD', // Soft Yellow
  '#FEC6A1', // Soft Orange
  '#E5DEFF', // Soft Purple
  '#FFDEE2', // Soft Pink
];

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[60px] p-0 flex items-center justify-center"
          style={{ backgroundColor: color || undefined }}
        >
          <div 
            className="w-full h-full rounded"
            style={{ 
              backgroundColor: color || undefined,
              border: !color ? '1px dashed #ccc' : undefined 
            }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((presetColor) => (
              <Button
                key={presetColor}
                variant="outline"
                className="w-8 h-8 p-0 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all"
                style={{ backgroundColor: presetColor }}
                onClick={() => onChange(presetColor)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="#000000"
              value={color || ''}
              onChange={(e) => {
                const newColor = e.target.value;
                // Only update if it's a valid hex color or empty
                if (newColor === '' || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor)) {
                  onChange(newColor);
                }
              }}
              className="flex-1"
            />
            <Input
              type="color"
              value={color || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 p-0 cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};