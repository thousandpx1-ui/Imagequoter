import React from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/hooks/use-editor-store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = ["All", "Inspirational", "Motivation", "Minimal", "Gradient", "Creative"];

const TEMPLATES = [
  {
    id: 1,
    category: "Gradient",
    state: {
      text: "Creativity takes courage.",
      fontFamily: "Playfair Display",
      fontSize: 48,
      color: "#ffffff",
      textAlign: "center" as const,
      fontWeight: "bold" as const,
      fontStyle: "italic" as const,
      textShadow: true,
      shadowColor: "rgba(0,0,0,0.5)",
      letterSpacing: 2,
      lineHeight: 1.2,
      textBgOpacity: 0,
      backgroundColor: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      backgroundImage: null,
      overlayOpacity: 0,
      aspectRatio: "1:1" as const,
    }
  },
  {
    id: 2,
    category: "Inspirational",
    state: {
      text: "The only impossible journey is the one you never begin.",
      fontFamily: "Montserrat",
      fontSize: 36,
      color: "#ffffff",
      textAlign: "center" as const,
      fontWeight: "bold" as const,
      fontStyle: "normal" as const,
      textShadow: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textBgOpacity: 0,
      backgroundColor: "#000000",
      backgroundImage: `${import.meta.env.BASE_URL}images/hero-bg.png`,
      overlayOpacity: 40,
      aspectRatio: "16:9" as const,
    }
  },
  {
    id: 3,
    category: "Motivation",
    state: {
      text: "STAY\nHUNGRY.\nSTAY\nFOOLISH.",
      fontFamily: "Bebas Neue",
      fontSize: 80,
      color: "#ffffff",
      textAlign: "left" as const,
      fontWeight: "normal" as const,
      fontStyle: "normal" as const,
      textShadow: true,
      shadowColor: "#ff007f",
      letterSpacing: 4,
      lineHeight: 0.9,
      textBgOpacity: 0,
      backgroundColor: "#111111",
      backgroundImage: `${import.meta.env.BASE_URL}images/pattern-1.png`,
      overlayOpacity: 60,
      aspectRatio: "4:5" as const,
    }
  },
  {
    id: 4,
    category: "Minimal",
    state: {
      text: "Less is more.",
      fontFamily: "Inter",
      fontSize: 32,
      color: "#333333",
      textAlign: "center" as const,
      fontWeight: "normal" as const,
      fontStyle: "normal" as const,
      textShadow: false,
      letterSpacing: 8,
      lineHeight: 1,
      textBgOpacity: 0,
      backgroundColor: "#f5f5f5",
      backgroundImage: `${import.meta.env.BASE_URL}images/pattern-2.png`,
      overlayOpacity: 10,
      aspectRatio: "1:1" as const,
    }
  },
  {
    id: 5,
    category: "Creative",
    state: {
      text: "Dance with the waves,\nmove with the sea.",
      fontFamily: "Dancing Script",
      fontSize: 54,
      color: "#ffffff",
      textAlign: "center" as const,
      fontWeight: "normal" as const,
      fontStyle: "normal" as const,
      textShadow: true,
      shadowColor: "#000000",
      letterSpacing: 1,
      lineHeight: 1.2,
      textBgOpacity: 0,
      backgroundColor: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
      backgroundImage: null,
      overlayOpacity: 0,
      aspectRatio: "9:16" as const,
    }
  },
  {
    id: 6,
    category: "Gradient",
    state: {
      text: "Make today amazing.",
      fontFamily: "Pacifico",
      fontSize: 42,
      color: "#ffffff",
      textAlign: "center" as const,
      fontWeight: "normal" as const,
      fontStyle: "normal" as const,
      textShadow: true,
      shadowColor: "rgba(0,0,0,0.2)",
      letterSpacing: 2,
      lineHeight: 1.3,
      textBgOpacity: 0,
      backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      backgroundImage: null,
      overlayOpacity: 0,
      aspectRatio: "1:1" as const,
    }
  }
];

export default function Explore() {
  const [, setLocation] = useLocation();
  const setAllState = useEditorStore(s => s.setAllState);
  const [activeCategory, setActiveCategory] = React.useState("All");

  const filteredTemplates = TEMPLATES.filter(t => activeCategory === "All" || t.category === activeCategory);

  const handleApplyTemplate = (state: any) => {
    setAllState(state);
    setLocation('/');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-12 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold tracking-tight font-playfair">
          Explore Templates
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start your creative journey with our handcrafted layouts. Click any template to open it in the editor.
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search styles..." className="pl-10 h-12 rounded-2xl bg-card border-border shadow-sm text-base" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <Badge 
              key={cat} 
              variant={activeCategory === cat ? "default" : "secondary"}
              className="px-4 py-2 text-sm cursor-pointer rounded-xl hover:scale-105 transition-transform"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates.map((template, idx) => {
          const s = template.state;
          const aspectClass = s.aspectRatio === '16:9' ? 'aspect-video' : s.aspectRatio === '9:16' ? 'aspect-[9/16]' : s.aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square';
          const fontClassMap: Record<string, string> = {
            'Inter': 'font-inter', 'Playfair Display': 'font-playfair', 'Montserrat': 'font-montserrat',
            'Dancing Script': 'font-dancing', 'Oswald': 'font-oswald', 'Raleway': 'font-raleway',
            'Roboto': 'font-roboto', 'Lobster': 'font-lobster', 'Bebas Neue': 'font-bebas', 'Pacifico': 'font-pacifico',
          };

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 200, damping: 20 }}
              onClick={() => handleApplyTemplate(s)}
              className="group cursor-pointer rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 bg-card"
            >
              <div 
                className={`relative w-full overflow-hidden ${aspectClass}`}
                style={{ background: s.backgroundColor }}
              >
                {s.backgroundImage && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${s.backgroundImage})` }}
                  />
                )}
                <div className="absolute inset-0 bg-black" style={{ opacity: s.overlayOpacity / 100 }} />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <p 
                    className={`${fontClassMap[s.fontFamily] || 'font-inter'}`}
                    style={{
                      fontSize: `${s.fontSize * 0.6}px`, // Scale down for preview
                      color: s.color,
                      textAlign: s.textAlign,
                      fontWeight: s.fontWeight,
                      fontStyle: s.fontStyle,
                      textShadow: s.textShadow ? `1px 1px 4px ${s.shadowColor}` : 'none',
                      lineHeight: s.lineHeight,
                      letterSpacing: `${s.letterSpacing * 0.5}px`
                    }}
                  >
                    {s.text}
                  </p>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Button variant="secondary" className="rounded-xl shadow-xl font-semibold">
                    Use Template
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-card">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{s.fontFamily}</span>
                  <Badge variant="outline" className="text-xs">{template.category}</Badge>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
