'use client'
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getToolSuggestions } from '@/app/actions';
import type { SuggestTrainingToolsOutput } from '@/ai/flows/suggest-training-tools';
import { ClipboardPenLine, Timer, FileText, Users, Presentation, Lightbulb, BarChart, SquareCode, Sparkles, Terminal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const toolIcons: { [key: string]: React.ElementType } = {
  whiteboard: ClipboardPenLine,
  timer: Timer,
  document: FileText,
  "breakout rooms": Users,
  "code editor": SquareCode,
  polls: BarChart,
  quizzes: Lightbulb,
  presentation: Presentation,
  default: Sparkles,
};

const getIconForTool = (toolName: string) => {
  const lowerCaseTool = toolName.toLowerCase();
  for (const key in toolIcons) {
    if (lowerCaseTool.includes(key)) {
      return toolIcons[key];
    }
  }
  return toolIcons.default;
};

export function AiToolSuggesterDialog({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestTrainingToolsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPrompt('');
      setSuggestions(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await getToolSuggestions(prompt);
      setSuggestions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Tool Suggester</DialogTitle>
          <DialogDescription>
            Describe your session, and our AI will suggest helpful tools.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Label htmlFor="prompt">Session Description</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'I'm teaching a class on advanced JavaScript closures and need to show some code examples and then split students into groups to practice.'"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !prompt.trim()}>
              {isLoading ? 'Getting Suggestions...' : 'Get Suggestions'}
            </Button>
          </DialogFooter>
        </form>
        
        {isLoading && (
            <div className="mt-4 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-16 w-full" />
            </div>
        )}
        
        {error && (
            <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {suggestions && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Suggested Tools</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {suggestions.tools.map((tool) => {
                  const Icon = getIconForTool(tool);
                  return (
                    <Card key={tool} className="flex flex-col items-center justify-center p-4 text-center">
                      <Icon className="h-8 w-8 mb-2 text-primary" />
                      <p className="font-medium text-sm capitalize">{tool}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Reasoning</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{suggestions.reasoning}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
