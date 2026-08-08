import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { chatWithGeminiFn, chatWithOllamaFn } from "@/lib/api";

interface Handoff {
  patient: string;
  from: string;
  to: string;
  summary: string;
  approved?: boolean;
}

export function GenerateHandoffForm({ onAdd }: { onAdd: (handoff: Handoff) => void }) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    patient: "Jerry Wilcox · PT-10243",
    from: "Dr. April Gallegos",
    to: "Dr. Basil Frost",
    summary: ""
  });

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a clinical shift handoff summary for patient "${formData.patient}" being transferred from "${formData.from}" to "${formData.to}". Keep it professional, structured, and concise (about 3-4 sentences). Focus on condition, treatments, and overnight watch items.`;
      
      let summary = "";
      try {
        // Try Ollama first since user wants Ollama on priority
        summary = await chatWithOllamaFn({ data: prompt });
      } catch (ollamaError) {
        console.error("Ollama failed, trying Gemini:", ollamaError);
        summary = await chatWithGeminiFn({ data: prompt });
      }

      setFormData(prev => ({ ...prev, summary }));
    } catch (error) {
      console.error("Failed to generate handoff summary:", error);
      alert("Failed to auto-generate summary using AI. You can write it manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.summary) {
      alert("Please generate or write a summary.");
      return;
    }

    onAdd({
      patient: formData.patient,
      from: formData.from,
      to: formData.to,
      summary: formData.summary,
      approved: false
    });
    setOpen(false);
    setFormData({
      patient: "Jerry Wilcox · PT-10243",
      from: "Dr. April Gallegos",
      to: "Dr. Basil Frost",
      summary: ""
    });
  };

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-popover";
  const textareaClass = "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-popover";

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Generate handoff</Button>
      {open && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-popover p-6 rounded-xl border shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="size-5 text-primary animate-pulse" />
              Generate Shift Handoff
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Patient Info</label>
                <select
                  value={formData.patient}
                  onChange={e => setFormData(prev => ({ ...prev, patient: e.target.value }))}
                  className={inputClass}
                >
                  <option value="Jerry Wilcox · PT-10243" className="bg-popover text-foreground">Jerry Wilcox · PT-10243</option>
                  <option value="Deena Cooley · PT-10241" className="bg-popover text-foreground">Deena Cooley · PT-10241</option>
                  <option value="Eduardo Kramer · PT-10250" className="bg-popover text-foreground">Eduardo Kramer · PT-10250</option>
                  <option value="Jason Compton · PT-10256" className="bg-popover text-foreground">Jason Compton · PT-10256</option>
                  <option value="Emmitt Bryan · PT-10261" className="bg-popover text-foreground">Emmitt Bryan · PT-10261</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">From Clinician</label>
                  <input
                    type="text"
                    value={formData.from}
                    onChange={e => setFormData(prev => ({ ...prev, from: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">To Clinician</label>
                  <input
                    type="text"
                    value={formData.to}
                    onChange={e => setFormData(prev => ({ ...prev, to: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">Handoff Summary</label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary flex items-center gap-1.5 h-7 px-2 hover:bg-primary/10"
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <textarea
                  value={formData.summary}
                  onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Enter or generate shift summary..."
                  className={textareaClass}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  Create Handoff
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
