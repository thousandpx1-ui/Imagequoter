import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  allowGradient?: boolean;
}

const PRESET_COLORS = [
  '#ffffff', '#000000', '#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', 
  '#4ade80', '#2dd4bf', '#34d399', '#2dd4bf', '#38bdf8', '#22d3ee', '#818cf8', 
  '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'
];

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
];

export function ColorPicker({ color, onChange, label = "Color", allowGradient = false }: ColorPickerProps) {
  const isGradient = color.includes('gradient');

  return (
    <div className="flex items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-[60px] h-10 p-1 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div 
              className="w-full h-full rounded-lg border border-border/50" 
              style={{ background: color }} 
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 bg-card border-border/50 shadow-xl rounded-2xl">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">Solid Colors</p>
              <div className="grid grid-cols-7 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    className="w-7 h-7 rounded-full border border-black/10 dark:border-white/10 hover:scale-110 transition-transform active:scale-95"
                    style={{ backgroundColor: c }}
                    onClick={() => onChange(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            {allowGradient && (
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground mt-4">Gradients</p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_GRADIENTS.map((g) => (
                    <button
                      key={g}
                      className="w-full h-10 rounded-xl border border-black/10 dark:border-white/10 hover:scale-105 transition-transform active:scale-95"
                      style={{ background: g }}
                      onClick={() => onChange(g)}
                      aria-label={`Select gradient ${g}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isGradient && (
              <div className="pt-2 flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground">Custom</label>
                <input
                  type="color"
                  value={color.length === 7 ? color : '#ffffff'}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    </div>
  );
}
