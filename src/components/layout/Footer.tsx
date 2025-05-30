import { Github } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-t-[1px] border-[#494949] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            <span className="text-sm">GitHub Bookmark</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            &copy; {currentYear} GitHub Bookmark. All rights reserved.
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            - Abin E - 
          </div>
        </div>
      </div>
    </footer>
  );
}
