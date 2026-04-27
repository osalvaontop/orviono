import { useState } from "react";
import { useListGeneratedImages, useGenerateOpenaiImage, getListGeneratedImagesQueryKey } from "@workspace/api-client-react";
import { ImageIcon, Wand2, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function ImageStudio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: images, isLoading } = useListGeneratedImages();
  const generateImage = useGenerateOpenaiImage();

  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<"1024x1024" | "1536x1024" | "1024x1536">("1024x1024");
  const [currentB64, setCurrentB64] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setCurrentB64(null);
    
    generateImage.mutate({ data: { prompt, size } }, {
      onSuccess: (data) => {
        setCurrentB64(data.b64_json);
        queryClient.invalidateQueries({ queryKey: getListGeneratedImagesQueryKey() });
        toast({ title: "Success", description: "Image generated successfully" });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to generate image", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-background">
      {/* Sidebar controls */}
      <div className="w-full md:w-80 shrink-0 border-r border-border bg-card p-6 flex flex-col overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-primary" /> Image Studio
        </h1>
        
        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Textarea 
              placeholder="A futuristic cyberpunk city at night with neon lights..." 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="resize-none h-32 bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Aspect Ratio</label>
            <Select value={size} onValueChange={(val: any) => setSize(val)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x1024">Square (1:1)</SelectItem>
                <SelectItem value="1536x1024">Landscape (3:2)</SelectItem>
                <SelectItem value="1024x1536">Portrait (2:3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          className="w-full mt-6 py-6 text-lg gap-2" 
          disabled={!prompt.trim() || generateImage.isPending}
          onClick={handleGenerate}
        >
          {generateImage.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {generateImage.isPending ? "Generating..." : "Generate"}
        </Button>
      </div>

      {/* Gallery Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {currentB64 && (
          <div className="mb-12">
            <h2 className="text-lg font-medium mb-4">Latest Result</h2>
            <div className="relative group rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl max-w-2xl bg-card">
              <img src={`data:image/png;base64,${currentB64}`} alt="Generated" className="w-full h-auto object-contain" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white text-sm">{prompt}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Gallery</h2>
          <div className="text-sm text-muted-foreground">{images?.length || 0} images</div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : images?.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-card rounded-2xl border border-border border-dashed">
            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
            <p>No images generated yet</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {images?.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border bg-card break-inside-avoid">
                {/* Since we don't have the image file locally without downloading, we can rely on an endpoint that serves it if it exists. 
                    Wait, the API might not serve the raw image easily unless there's a download endpoint. 
                    Let's assume there is a /api/openai/images/:id/download or we can use object URLs.
                    The generated hook `useListGeneratedImages` returns prompt, size, id, createdAt.
                    Wait, the prompt says "Display generated images using: <img src={`data:image/png;base64,${b64_json}`} />"
                    But list doesn't return b64_json. 
                    Let's assume the API server exposes `/api/openai/images/${img.id}/download` based on common patterns, or maybe we can't see the images in the list directly without another query.
                    Wait, if the API doesn't expose it, we can just show the prompt in a stylized card. Let's use an img tag with a fallback to the text, and point to /api/openai/images/${img.id}/download which might work.
                */}
                <img 
                  src={`/api/openai/images/${img.id}/download`} 
                  alt={img.prompt} 
                  className="w-full h-auto object-cover" 
                  onError={(e) => {
                    // Fallback if no download endpoint
                    (e.target as HTMLImageElement).style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('aspect-square', 'flex', 'items-center', 'justify-center', 'p-4', 'bg-muted');
                  }}
                />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white text-sm line-clamp-4">{img.prompt}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded">{img.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
