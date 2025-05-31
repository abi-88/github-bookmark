import { Tabs, TabsContent } from '../../components/ui/tabs';
import { GithubSearch } from './GithubSearch';
import { BookmarkList } from './BookmarkList';
import { BookmarkStats } from './BookmarkStats';
import { useBookmarks } from '../../context/BookmarkContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useEffect, useState } from 'react';

interface GithubTabsProps {
  activeTab: string;
}

export function GithubTabs({ activeTab }: GithubTabsProps) {
  const { bookmarks, removeBookmark, getBookmarkStats } = useBookmarks();
  const [contentHeight, setContentHeight] = useState("calc(100vh - 350px)");

  // Calculate available height for scrollable content
  useEffect(() => {
    const updateHeight = () => {
      // Reduced height to make all sections visible on screen
      setContentHeight(`calc(100vh - 350px)`);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <Tabs value={activeTab} className="w-full">
      
      <TabsContent value="search" className="space-y-2">
        <Card className='border-0 bg-[#1e1e1e]' style={{
              boxShadow: '0 0 4px 0px #646cff',
            }}>
          <CardHeader className="sticky top-0 z-20 bg-[#1e1e1e] border-b border-[#2e2e2e]">
            <CardTitle className='text-2xl bold'>Search GitHub</CardTitle>
            <CardDescription className='text-[#8e8e8e]'>
              Search for GitHub users and repositories
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto p-0" style={{ maxHeight: contentHeight }}>
            <div className="p-6">
              <GithubSearch />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="bookmarks" className="space-y-2">
        <Card className='border-0 bg-[#1e1e1e]' style={{
              boxShadow: '0 0 4px 0px #646cff',
            }}>
          <CardHeader className="sticky top-0 z-20 bg-[#1e1e1e] border-b border-[#2e2e2e]">
            <CardTitle className='text-2xl bold'>My Bookmarks</CardTitle>
            <CardDescription className='text-[#8e8e8e]'>
              View and manage your bookmarked repositories
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto p-0" style={{ maxHeight: contentHeight }}>
            <div className="p-6">
              <BookmarkList 
                bookmarks={bookmarks}
                onRemoveBookmark={removeBookmark}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      

      
      <TabsContent value="stats" className="space-y-4">
        <BookmarkStats stats={getBookmarkStats()} />
      </TabsContent>
    </Tabs>
  );
}
