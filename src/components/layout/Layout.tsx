import type { ReactNode } from "react";
import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const navigate = useNavigate();

  const {user} = useAuth();


 useEffect(()=>{
  if(user){
    navigate("/home");
  }
  },[user])

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
