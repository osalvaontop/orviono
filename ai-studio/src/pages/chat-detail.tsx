import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetOpenaiConversation, useListOpenaiMessages, getListOpenaiMessagesQueryKey, getListOpenaiConversationsQueryKey, useCreateOpenaiConversation } from "@workspace/api-client-react";
import { Send, User, Bot, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export function ChatDetail() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const isNew = params.id === "new";
  const id = isNew ? 0 : Number(params.id);
  
  const queryClient = useQueryClient();
  const { data: conversation, isLoading: isLoadingConv } = useGetOpenaiConversation(id, { query: { enabled: !isNew && !!id } });
  const { data: history, isLoading: isLoadingMsgs } = useListOpenaiMessages(id, { query: { enabled: !isNew && !!id } });
  
  const createChat = useCreateOpenaiConversation();
  
  const [input, setInput] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = history || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    let targetId = id;
    
    if (isNew) {
      try {
        const newChat = await createChat.mutateAsync({ data: { title: input.slice(0, 50) + (input.length > 50 ? "..." : "") } });
        targetId = newChat.id;
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        // We'll update location, but we still want to continue with the send right now
        // Wouter's setLocation will unmount/remount, so we need to be careful.
        // For simplicity, if it's new, we just redirect and let the user type again, 
        // OR we can perform the first fetch then redirect. Let's redirect first and pass state if needed,
        // or just create the chat, and we send the message using the new targetId.
        window.history.replaceState(null, "", `/chat/${targetId}`);
        // We can't easily rely on the new hook state immediately without re-rendering, 
        // so we just do the fetch raw below using targetId.
      } catch (e) {
        return;
      }
    }

    const userMsg = input;
    setInput("");
    
    // Optimistically update UI if not new
    if (!isNew) {
      const tempMsg = { id: Date.now(), conversationId: targetId, role: "user", content: userMsg, createdAt: new Date().toISOString() };
      queryClient.setQueryData(getListOpenaiMessagesQueryKey(targetId), (old: any) => old ? [...old, tempMsg] : [tempMsg]);
    }

    setIsStreaming(true);
    setStreamingMessage("");

    try {
      const response = await fetch(`/api/openai/conversations/${targetId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMsg })
      });
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");
      
      const decoder = new TextDecoder();
      let assistantMsg = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMsg += data.content;
                setStreamingMessage(assistantMsg);
              }
              if (data.done) {
                break;
              }
            } catch (e) {}
          }
        }
      }
      
      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(targetId) });
      if (isNew) {
        // If it was new, we now safely navigate so the component remounts correctly
        setLocation(`/chat/${targetId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
      setStreamingMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      <header className="h-16 shrink-0 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-4 md:px-6 gap-4">
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1 truncate font-medium text-lg">
          {isNew ? "New Conversation" : (conversation?.title || "Loading...")}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {!isNew && isLoadingMsgs ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : messages.map((msg: any) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm shadow-sm'}`}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
          
          {isStreaming && (
            <div className="flex gap-4">
              <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                <Bot className="w-5 h-5" />
              </div>
              <div className="max-w-[80%] rounded-2xl p-4 bg-card border border-border rounded-tl-sm shadow-sm">
                <div className="whitespace-pre-wrap leading-relaxed">{streamingMessage}</div>
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-3xl mx-auto relative flex items-end shadow-lg rounded-2xl border border-border bg-card">
          <Textarea 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="min-h-[60px] max-h-[200px] border-0 focus-visible:ring-0 resize-none bg-transparent py-4 pl-4 pr-14"
            rows={1}
          />
          <Button 
            size="icon" 
            className="absolute right-2 bottom-2 w-10 h-10 rounded-xl"
            disabled={!input.trim() || isStreaming || createChat.isPending}
            onClick={handleSend}
          >
            {isStreaming || createChat.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
        <div className="text-center mt-2 text-xs text-muted-foreground">Orvion pode cometer erros. Verifique informações importantes.</div>
      </div>
    </div>
  );
}
