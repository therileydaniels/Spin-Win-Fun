import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PRESET_COLORS } from "@/lib/wheelSegments";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);

  const handlePresetClick = (presetColor: string) => {
    onChange(presetColor);
    setCustomColor(presetColor);
    setIsOpen(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomColor(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);
    setCustomColor(value);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 p-0 rounded-md shrink-0"
          data-testid="button-color-picker"
        >
          <div
            className="w-5 h-5 rounded-sm border border-white/20"
            style={{ backgroundColor: color }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-6 gap-1.5">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => handlePresetClick(presetColor)}
                className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${
                  color === presetColor
                    ? "border-white"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: presetColor }}
                data-testid={`color-swatch-${presetColor}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <input
              type="color"
              value={customColor.startsWith("#") ? customColor : "#A855F7"}
              onChange={handleColorInputChange}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              data-testid="input-custom-color"
            />
            <Input
              type="text"
              value={customColor}
              onChange={handleCustomChange}
              placeholder="#A855F7"
              className="flex-1 h-8 text-xs bg-background/50 border-border"
              data-testid="input-color-hex"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
