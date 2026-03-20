import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/hooks/use-editor-store';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function Canvas() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    text, fontFamily, fontSize, color, textAlign, fontWeight, fontStyle,
    textShadow, shadowColor, letterSpacing, lineHeight, textBgColor, textBgOpacity,
    backgroundImage, backgroundColor, overlayOpacity, brightness, contrast, saturation,
    aspectRatio,
  } = useEditorStore();

  const aspectMap: Record<string, string> = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '4:5': 'aspect-[4/5]',
  };

  const fontClassMap: Record<string, string> = {
    'Inter': 'font-inter',
    'Playfair Display': 'font-playfair',
    'Montserrat': 'font-montserrat',
    'Dancing Script': 'font-dancing',
    'Oswald': 'font-oswald',
    'Raleway': 'font-raleway',
    'Roboto': 'font-roboto',
    'Lobster': 'font-lobster',
    'Bebas Neue': 'font-bebas',
    'Pacifico': 'font-pacifico',
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    try {
      setIsExporting(true);

      const textEl = canvasRef.current.querySelector('.draggable-text') as HTMLElement;
      if (textEl) {
        textEl.style.border = 'none';
        textEl.style.outline = 'none';
      }

      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `quote-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({ title: "Downloaded!", description: "Your image was saved successfully." });
    } catch (err) {
      console.error(err);
      toast({
        title: "Export failed",
        description: "Something went wrong while exporting.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-muted/20 md:rounded-2xl md:border md:border-border/50 overflow-hidden">

      {/* Canvas container */}
      <div className="w-full h-full flex items-center justify-center p-3 md:p-6">
        <div
          className={cn(
            "relative shadow-2xl transition-all duration-300 ease-in-out bg-white overflow-hidden",
            "max-w-full max-h-full",
            aspectMap[aspectRatio]
          )}
          style={{ maxHeight: '100%', maxWidth: '100%', width: 'min(100%, 500px)' }}
        >
          {/* Export target */}
          <div
            ref={canvasRef}
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ background: backgroundColor }}
          >
            {/* Background image */}
            {backgroundImage && (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                }}
              />
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0 w-full h-full bg-black transition-opacity"
              style={{ opacity: overlayOpacity / 100 }}
            />

            {/* Text (draggable) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none p-6">
              <motion.div
                drag
                dragMomentum={false}
                dragConstraints={canvasRef}
                className={cn(
                  "draggable-text pointer-events-auto cursor-grab active:cursor-grabbing p-3 border border-transparent hover:border-white/30 rounded-xl transition-colors select-none",
                  fontClassMap[fontFamily] || 'font-inter'
                )}
                style={{
                  fontSize: `clamp(12px, ${fontSize}px, 10vw)`,
                  color,
                  textAlign,
                  fontWeight,
                  fontStyle,
                  textShadow: textShadow ? `2px 2px 8px ${shadowColor}` : 'none',
                  letterSpacing: `${letterSpacing}px`,
                  lineHeight,
                  backgroundColor: textBgOpacity > 0
                    ? `${textBgColor}${Math.round(textBgOpacity * 2.55).toString(16).padStart(2, '0')}`
                    : 'transparent',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  minWidth: '80px',
                  minHeight: '36px',
                  maxWidth: '90%',
                  wordBreak: 'break-word',
                }}
              >
                {text || "Write your inspiring quote here..."}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="absolute bottom-4 right-4">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 px-5"
        >
          {isExporting
            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            : <Download className="w-4 h-4 mr-2" />}
          Download
        </Button>
      </div>
    </div>
  );
}
