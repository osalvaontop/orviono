import { useState } from "react";
import { useListOpenaiConversations, useCreateOpenaiConversation, getListOpenaiConversationsQueryKey, useDeleteOpenaiConversation } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { MessageSquare, Plus, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function ChatList() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  
  const { data: conversations, isLoading } = useListOpenaiConversations();
  const createChat = useCreateOpenaiConversation();
  const deleteChat = useDeleteOpenaiConversation();

  const handleCreate = () => {
    createChat.mutate({ data: { title: "New Conversation" } }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setLocation(`/chat/${data.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
      }
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChat.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        toast({ title: "Deleted", description: "Conversation deleted successfully" });
      }
    });
  };

  const filtered = conversations?.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Chat Studio</h1>
          <p className="text-muted-foreground">Gerencie suas conversas com o Orvion</p>
        </div>
        <Button onClick={handleCreate} disabled={createChat.isPending} className="gap-2">
          {createChat.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Chat
        </Button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search conversations..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered?.map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.id}`} className="group flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-medium truncate">{chat.title}</h3>
                    <p className="text-xs text-muted-foreground">{format(new Date(chat.createdAt), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-opacity"
                  onClick={(e) => handleDelete(e, chat.id)}
                  disabled={deleteChat.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
