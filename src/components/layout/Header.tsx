import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Github, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full py-3 border-b border-b-[1px] border-[#494949] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_2px_4px_0_rgba(107,114,128,0.3)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Github className="h-6 w-6" color="#646cff"/>
          <span className="text-2xl bolder">GitHub Bookmark</span>
        </div>

        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="gap-10">
              <TabsTrigger value="search" className="text-md transition-all hover:[text-shadow:0_0_6px_#646cff,0_0_10px_#646cff] data-[state=active]:[text-shadow:0_0_6px_#646cff,0_0_10px_#646cff] bold">Search</TabsTrigger>
              <TabsTrigger value="bookmarks" className="text-md transition-all hover:[text-shadow:0_0_6px_#646cff,0_0_10px_#646cff] data-[state=active]:[text-shadow:0_0_6px_#646cff,0_0_10px_#646cff] bold">Bookmarks</TabsTrigger>
              <TabsTrigger value="stats" className="text-md transition-all hover:[text-shadow:0_0_6px_#646cff,0_0_10px_#646cff] data-[state=active]:[text-shadow:0_0_6px_#646cff,0_0_10px_#646cff] bold">Statistics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://avatar.vercel.sh/${user?.username}`} alt={user?.username || ""} />
              <AvatarFallback>
                {user?.username?.substring(0, 2).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="hidden text-md md:inline-block bolder">{user?.username}</span>
              <span className="text-xs bold text-[#646cff]">{user?.email}</span>
            </div>
          </div>
          
          <Button title="logout" variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" color="#ff4848"/>
          </Button>
        </div>
      </div>

      <div className="md:hidden container mx-auto px-4 pb-2">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
}
