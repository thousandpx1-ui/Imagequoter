import React, { useCallback, useState } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { useEditorStore } from '@/hooks/use-editor-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type, Image as ImageIcon, Sparkles, Upload, Hash, Languages, Loader2, Copy, Check, CreditCard } from 'lucide-react';
import { ColorPicker } from '@/components/ColorPicker';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useGenerateQuote, useGenerateCaption, useGenerateHashtags, useTranslateText } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { deductCredit, isUnlimited, getCredits, getDailyFreeRemaining, getPaidCredits, getTimeUntilReset } from "@/utils/credits";

const FONTS = ['Inter', 'Playfair Display', 'Montserrat', 'Dancing Script', 'Oswald', 'Raleway', 'Roboto', 'Lobster', 'Bebas Neue', 'Pacifico'];
const RATIOS = ['1:1', '16:9', '9:16', '4:5'];
const LANGUAGES = [
  { code: 'hindi', label: 'Hindi', script: 'hi' },
  { code: 'kannada', label: 'Kannada', script: 'Ka' },
  { code: 'malayalam', label: 'Malayalam', script: 'Ma' },
  { code: 'tamil', label: 'Tamil', script: 'Ta' },
  { code: 'telugu', label: 'Telugu', script: 'Te' },
];
const DAILY_LIMIT = 3;

function getUsage() {
  const today = new Date().toDateString();
  try {
    const saved = JSON.parse(localStorage.getItem('usage') || '{}');
    if (saved.date !== today) {
      const reset = { date: today, count: 0, extra: 0 };
      localStorage.setItem('usage', JSON.stringify(reset));
      return reset;
    }
    return saved;
  } catch {
    return { date: today, count: 0, extra: 0 };
  }
}

function increaseUsage() {
  const data = getUsage();
  data.count += 1;
  localStorage.setItem('usage', JSON.stringify(data));
}

function increaseExtra() {
  const data = getUsage();
  data.extra = (data.extra || 0) + 1;
  localStorage.setItem('usage', JSON.stringify(data));
}

function canGenerate() {
  const data = getUsage();
  return data.count < DAILY_LIMIT || (data.extra || 0) > 0;
}

interface ToolbarProps {
  credits?: number;
}

export function Toolbar({ credits: propCredits }: ToolbarProps) {
  const { isSignedIn } = useUser();
  const store = useEditorStore();
  const { toast } = useToast();
  const [credits, setCredits] = useState(() => getCredits());
  const [dailyFree, setDailyFree] = useState(() => getDailyFreeRemaining());
  const [paidCredits, setPaidCredits] = useState(() => getPaidCredits());
  const [resetIn, setResetIn] = useState(() => getTimeUntilReset());
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState('');
  const [translatedResult, setTranslatedResult] = useState<{ text: string; lang: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleApplyTranslation = () => {
    if (translatedResult) {
      store.updateTextProperty('text', translatedResult.text);
      toast({ title: 'Translation Applied!' });
    }
  };

  const handleCopyTranslation = () => {
    if (translatedResult) {
      navigator.clipboard.writeText(translatedResult.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!' });
    }
  };

  const watchAd = () => {
    window.open('https://www.profitableratecpm.com/', '_blank');
    setTimeout(() => {
      increaseExtra();
      toast({ title: 'Extra generation unlocked!', description: 'You gained 1 extra generation.' });
    }, 5000);
  };

  const refreshCredits = () => {
    setCredits(getCredits());
    setDailyFree(getDailyFreeRemaining());
    setPaidCredits(getPaidCredits());
    setResetIn(getTimeUntilReset());
  };

  const checkAndDeduct = (): boolean => {
    if (!isSignedIn) {
      toast({ title: 'Sign in required', description: 'Please sign in to use AI features.' });
      return false;
    }
    if (!isUnlimited() && !deductCredit()) {
      toast({ title: 'No credits left', description: `Free credits reset in ${getTimeUntilReset()}`, variant: 'destructive' });
      return false;
    }
    refreshCredits();
    return true;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => store.setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [store]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
  });

  const quoteMutation = useGenerateQuote({
    mutation: {
      onSuccess: (data) => {
        if (data.quotes?.length > 0) {
          store.updateTextProperty('text', data.quotes[0]);
          toast({ title: 'Quote Generated!', description: 'Applied to canvas.' });
        }
      },
      onError: () => toast({ title: 'Error', description: 'Failed to generate quote.', variant: 'destructive' }),
    },
  });

  const captionMutation = useGenerateCaption({
    mutation: {
      onSuccess: (data) => {
        if (data.captions?.length > 0) {
          const caption = data.captions.join('\n');
          setGeneratedCaption(caption);
          navigator.clipboard.writeText(caption);
          toast({ title: 'Caption Copied!' });
        }
      },
      onError: () => toast({ title: 'Error', description: 'Failed to generate caption.', variant: 'destructive' }),
    },
  });

  const hashtagMutation = useGenerateHashtags({
    mutation: {
      onSuccess: (data) => {
        if (data.hashtags?.length > 0) {
          const hashtags = data.hashtags.join(' ');
          setGeneratedHashtags(hashtags);
          navigator.clipboard.writeText(hashtags);
          toast({ title: 'Hashtags Copied!' });
        }
      },
      onError: () => toast({ title: 'Error', description: 'Failed to generate hashtags.', variant: 'destructive' }),
    },
  });

  const translateMutation = useTranslateText({
    mutation: {
      onSuccess: (data) => setTranslatedResult({ text: data.translatedText, lang: data.targetLanguage }),
      onError: () => toast({ title: 'Error', description: 'Failed to translate.', variant: 'destructive' }),
    },
  });

  const handleTranslate = (langCode: string) => {
    const textToTranslate = store.text.trim();
    if (!textToTranslate || textToTranslate === 'Write your inspiring quote here...') {
      toast({ title: 'No text to translate', description: 'Add a quote first.', variant: 'destructive' });
      return;
    }
    setTranslatedResult(null);
    translateMutation.mutate({ data: { text: textToTranslate, targetLanguage: langCode } });
  };

  return (
    <div className="w-full h-full flex flex-col bg-card border-t md:border md:rounded-2xl border-border shadow-sm overflow-hidden">
      <Tabs defaultValue="text" className="w-full h-full flex flex-col min-h-0">
        <div className="px-4 pt-3 pb-2 flex-shrink-0 border-b border-border/50">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="text" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Type className="w-3.5 h-3.5 mr-1.5" /> Text
            </TabsTrigger>
            <TabsTrigger value="background" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Canvas
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-4 pb-6 pt-3">

              <TabsContent value="text" className="space-y-5 mt-0">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quote Text</Label>
                  <Textarea value={store.text} onChange={(e) => store.updateTextProperty('text', e.target.value)} placeholder="Enter your quote..." className="resize-none min-h-[90px] rounded-xl bg-background text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Font Family</Label>
                    <Select value={store.fontFamily} onValueChange={(v) => store.updateTextProperty('fontFamily', v)}>
                      <SelectTrigger className="rounded-xl text-xs h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FONTS.map(f => <SelectItem key={f} value={f} style={{ fontFamily: f }} className="text-sm">{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Text Color</Label>
                    <ColorPicker color={store.color} onChange={(c) => store.updateTextProperty('color', c)} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Font Size</Label>
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{store.fontSize}px</span>
                  </div>
                  <Slider value={[store.fontSize]} min={12} max={120} step={1} onValueChange={([v]) => store.updateTextProperty('fontSize', v)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Alignment</Label>
                    <ToggleGroup type="single" value={store.textAlign} onValueChange={(v: any) => v && store.updateTextProperty('textAlign', v)} className="justify-start">
                      <ToggleGroupItem value="left" className="rounded-lg h-8 w-8 p-0"><AlignLeft className="w-3.5 h-3.5" /></ToggleGroupItem>
                      <ToggleGroupItem value="center" className="rounded-lg h-8 w-8 p-0"><AlignCenter className="w-3.5 h-3.5" /></ToggleGroupItem>
                      <ToggleGroupItem value="right" className="rounded-lg h-8 w-8 p-0"><AlignRight className="w-3.5 h-3.5" /></ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Style</Label>
                    <ToggleGroup type="multiple" value={[...(store.fontWeight === 'bold' ? ['bold'] : []), ...(store.fontStyle === 'italic' ? ['italic'] : [])]} onValueChange={(v) => { store.updateTextProperty('fontWeight', v.includes('bold') ? 'bold' : 'normal'); store.updateTextProperty('fontStyle', v.includes('italic') ? 'italic' : 'normal'); }} className="justify-start">
                      <ToggleGroupItem value="bold" className="rounded-lg h-8 w-8 p-0"><Bold className="w-3.5 h-3.5" /></ToggleGroupItem>
                      <ToggleGroupItem value="italic" className="rounded-lg h-8 w-8 p-0"><Italic className="w-3.5 h-3.5" /></ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between"><Label className="text-xs">Line Height</Label><span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{store.lineHeight.toFixed(1)}</span></div>
                  <Slider value={[store.lineHeight]} min={0.5} max={2.5} step={0.1} onValueChange={([v]) => store.updateTextProperty('lineHeight', v)} />
                  <div className="flex items-center justify-between pt-1"><Label className="text-xs">Letter Spacing</Label><span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{store.letterSpacing}px</span></div>
                  <Slider value={[store.letterSpacing]} min={-5} max={20} step={1} onValueChange={([v]) => store.updateTextProperty('letterSpacing', v)} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div><Label className="text-xs">Drop Shadow</Label><p className="text-xs text-muted-foreground">Add depth</p></div>
                    <Switch checked={store.textShadow} onCheckedChange={(c) => store.updateTextProperty('textShadow', c)} />
                  </div>
                  {store.textShadow && <ColorPicker color={store.shadowColor} onChange={(c) => store.updateTextProperty('shadowColor', c)} label="Shadow Color" />}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Text Highlight</Label>
                  <div className="flex items-center gap-3">
                    <ColorPicker color={store.textBgColor} onChange={(c) => store.updateTextProperty('textBgColor', c)} label="" />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Opacity</span><span>{store.textBgOpacity}%</span></div>
                      <Slider value={[store.textBgOpacity]} min={0} max={100} step={1} onValueChange={([v]) => store.updateTextProperty('textBgOpacity', v)} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="background" className="space-y-5 mt-0">
                <div className="space-y-2">
                  <Label className="text-xs">Aspect Ratio</Label>
                  <Select value={store.aspectRatio} onValueChange={(v: any) => store.updateBackgroundProperty('aspectRatio', v)}>
                    <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{RATIOS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Image Background</Label>
                  <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40'}`}>
                    <input {...getInputProps()} />
                    <Upload className="w-7 h-7 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Drag and drop or tap to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP</p>
                  </div>
                  {store.backgroundImage && (
                    <Button variant="outline" size="sm" onClick={() => store.setImage(null)} className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10">
                      Remove Image
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Solid / Gradient Background</Label>
                  <ColorPicker allowGradient color={store.backgroundColor} onChange={(c) => store.updateBackgroundProperty('backgroundColor', c)} label="" />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Adjustments</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><Label className="text-xs">Dark Overlay</Label><span className="text-muted-foreground">{store.overlayOpacity}%</span></div>
                    <Slider value={[store.overlayOpacity]} min={0} max={100} step={1} onValueChange={([v]) => store.updateBackgroundProperty('overlayOpacity', v)} />
                  </div>
                  {store.backgroundImage && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs"><Label className="text-xs">Brightness</Label><span className="text-muted-foreground">{store.brightness}%</span></div>
                        <Slider value={[store.brightness]} min={0} max={200} step={1} onValueChange={([v]) => store.updateBackgroundProperty('brightness', v)} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs"><Label className="text-xs">Contrast</Label><span className="text-muted-foreground">{store.contrast}%</span></div>
                        <Slider value={[store.contrast]} min={0} max={200} step={1} onValueChange={([v]) => store.updateBackgroundProperty('contrast', v)} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs"><Label className="text-xs">Saturation</Label><span className="text-muted-foreground">{store.saturation}%</span></div>
                        <Slider value={[store.saturation]} min={0} max={200} step={1} onValueChange={([v]) => store.updateBackgroundProperty('saturation', v)} />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-5 mt-0">
                {!isUnlimited() && (
                  <div className="rounded-2xl border border-border/50 overflow-hidden">
                    {/* Daily free credits */}
                    <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Free Daily Credits</span>
                        <span className="text-xs text-muted-foreground">Resets in {resetIn}</span>
                      </div>
                      {/* Progress dots */}
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2.5 flex-1 rounded-full transition-all ${
                              i < dailyFree
                                ? 'bg-primary'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                        <span className={`text-sm font-bold ml-1 ${dailyFree === 0 ? 'text-destructive' : 'text-primary'}`}>
                          {dailyFree}/3
                        </span>
                      </div>
                    </div>
                    {/* Paid credits */}
                    <div className="px-4 py-2.5 bg-muted/30 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Paid credits</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${paidCredits === 0 ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {paidCredits}
                        </span>
                        <Button
                          size="sm"
                          className="h-6 text-xs px-2 rounded-lg bg-primary hover:bg-primary/90 text-white"
                          onClick={() => window.location.href = '/buy-credits'}
                        >
                          + Buy
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"><Type className="w-3.5 h-3.5" /></div>
                    <h3 className="font-semibold text-sm">AI Quote Generator</h3>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); if (!checkAndDeduct()) return; const fd = new FormData(e.currentTarget); quoteMutation.mutate({ data: { theme: fd.get('theme') as string, mood: fd.get('mood') as string, count: 1 } }); }} className="space-y-3">
                    <div className="space-y-1"><Label className="text-xs">Topic / Theme</Label><Input name="theme" required placeholder="e.g. Success, Nature, Love" className="rounded-xl bg-background h-9 text-sm" /></div>
                    <div className="space-y-1"><Label className="text-xs">Mood (Optional)</Label><Input name="mood" placeholder="e.g. Inspirational, Funny" className="rounded-xl bg-background h-9 text-sm" /></div>
                    <Button type="submit" disabled={quoteMutation.isPending} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white" size="sm">
                      {quoteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />} Generate Quote
                    </Button>
                  </form>
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-shrink-0"><ImageIcon className="w-3.5 h-3.5" /></div>
                    <h3 className="font-semibold text-sm">Caption Generator</h3>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); if (!checkAndDeduct()) return; const fd = new FormData(e.currentTarget); captionMutation.mutate({ data: { description: store.text.substring(0, 100) || 'A beautiful quote', mood: fd.get('mood') as string, platform: 'instagram' } }); }} className="space-y-3">
                    <div className="space-y-1"><Label className="text-xs">Vibe / Mood</Label><Input name="mood" placeholder="e.g. Professional, Casual" className="rounded-xl bg-background h-9 text-sm" /></div>
                    <Button type="submit" disabled={captionMutation.isPending} variant="outline" className="w-full rounded-xl" size="sm">
                      {captionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />} Generate Caption
                    </Button>
                  </form>
                  {generatedCaption && (
                    <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
                      <p className="text-xs text-accent font-medium">Generated Caption</p>
                      <p className="text-xs leading-relaxed">{generatedCaption}</p>
                      <Button size="sm" variant="outline" className="w-full rounded-xl text-xs" onClick={() => { navigator.clipboard.writeText(generatedCaption); toast({ title: 'Copied!' }); }}>
                        <Copy className="w-3 h-3 mr-1" /> Copy Caption
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary-foreground/10 flex items-center justify-center flex-shrink-0"><Hash className="w-3.5 h-3.5" /></div>
                    <h3 className="font-semibold text-sm">Hashtag Generator</h3>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); if (!checkAndDeduct()) return; const fd = new FormData(e.currentTarget); hashtagMutation.mutate({ data: { topic: fd.get('topic') as string, count: 15, platform: 'instagram' } }); }} className="space-y-3">
                    <div className="space-y-1"><Label className="text-xs">Topic</Label><Input name="topic" required placeholder="e.g. Photography, Motivation" className="rounded-xl bg-background h-9 text-sm" /></div>
                    <Button type="submit" disabled={hashtagMutation.isPending} variant="outline" className="w-full rounded-xl" size="sm">
                      {hashtagMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Hash className="w-3.5 h-3.5 mr-2" />} Generate Hashtags
                    </Button>
                  </form>
                  {generatedHashtags && (
                    <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Generated Hashtags</p>
                      <p className="text-xs leading-relaxed break-words">{generatedHashtags}</p>
                      <Button size="sm" variant="outline" className="w-full rounded-xl text-xs" onClick={() => { navigator.clipboard.writeText(generatedHashtags); toast({ title: 'Copied!' }); }}>
                        <Copy className="w-3 h-3 mr-1" /> Copy Hashtags
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0"><Languages className="w-3.5 h-3.5" /></div>
                    <div><h3 className="font-semibold text-sm leading-none">Translate Quote</h3><p className="text-xs text-muted-foreground mt-0.5">Indian languages</p></div>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {LANGUAGES.map((lang) => (
                      <button key={lang.code} onClick={() => handleTranslate(lang.code)} disabled={translateMutation.isPending} className="flex flex-col items-center gap-1 p-2 rounded-xl border border-border bg-background hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                        <span className="text-sm font-bold text-emerald-500 group-hover:scale-110 transition-transform leading-none">{lang.script}</span>
                        <span className="text-[9px] text-muted-foreground leading-none">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                  {translateMutation.isPending && (
                    <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /><span className="text-xs">Translating...</span>
                    </div>
                  )}
                  {translatedResult && !translateMutation.isPending && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1 capitalize">{LANGUAGES.find(l => l.code === translatedResult.lang)?.label ?? translatedResult.lang}</p>
                        <p className="text-sm leading-relaxed">{translatedResult.text}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleApplyTranslation} className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-xs">
                          <Check className="w-3 h-3 mr-1" /> Apply to Canvas
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCopyTranslation} className="rounded-xl text-xs">
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl" size="sm" onClick={watchAd}>
                  <Sparkles className="w-3.5 h-3.5 mr-2" /> Watch Ad for Extra Generation
                </Button>
              </TabsContent>

            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
