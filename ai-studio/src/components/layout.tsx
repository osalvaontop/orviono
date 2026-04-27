import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, MessageSquare, ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/chat", label: "Chat Studio", icon: MessageSquare },
    { href: "/images", label: "Image Studio", icon: ImageIcon },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              O
            </div>
            Orvion
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-4">Quick Actions</div>
          <div className="flex flex-col gap-2">
            <Link href="/chat/new" className="w-full block">
              <Button className="w-full justify-start gap-2" variant="outline">
                <MessageSquare className="w-4 h-4" />
                New Chat
              </Button>
            </Link>
            <Link href="/images" className="w-full block">
              <Button className="w-full justify-start gap-2" variant="outline">
                <ImageIcon className="w-4 h-4" />
                Generate Image
              </Button>
            </Link>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto flex flex-col relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none -z-10" />
        {children}
      </main>
    </div>
  );
}
