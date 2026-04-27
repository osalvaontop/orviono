import { useListOpenaiConversations, useListGeneratedImages } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MessageSquare, ImageIcon, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function Home() {
  const { data: conversations, isLoading: isLoadingChats } = useListOpenaiConversations();
  const { data: images, isLoading: isLoadingImages } = useListGeneratedImages();

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          Bem-vindo ao Orvion <Sparkles className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-lg">O que vamos criar hoje?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Iniciar uma Conversa</h2>
            <p className="text-muted-foreground mb-6 line-clamp-2">Converse com o Orvion — brainstorm de ideias, escreva código ou analise dados.</p>
            <Link href="/chat" className="inline-block">
              <Button>
                Abrir Chat Studio <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Gerar Imagens</h2>
            <p className="text-muted-foreground mb-6 line-clamp-2">Transforme texto em visuais incríveis. Perfeito para moodboards ou assets finais.</p>
            <Link href="/images" className="inline-block">
              <Button variant="secondary">
                Abrir Image Studio <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Conversas Recentes</h3>
            <Link href="/chat" className="text-sm text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {isLoadingChats ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            ) : conversations?.slice(0, 3).map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.id}`} className="block bg-card border border-border p-4 rounded-xl hover:border-primary/50 transition-colors">
                <div className="font-medium mb-1 truncate">{chat.title}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(chat.createdAt), 'MMM d, yyyy h:mm a')}</div>
              </Link>
            )) || <div className="text-muted-foreground text-sm p-4 bg-muted/50 rounded-xl text-center">Nenhuma conversa recente</div>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Imagens Recentes</h3>
            <Link href="/images" className="text-sm text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {isLoadingImages ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)
            ) : images?.slice(0, 4).map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-border">
                <img src={`/api/openai/images/${img.id}/download`} alt={img.prompt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-xs text-white line-clamp-2">{img.prompt}</p>
                </div>
              </div>
            )) || <div className="col-span-2 text-muted-foreground text-sm p-4 bg-muted/50 rounded-xl text-center">Nenhuma imagem recente</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
