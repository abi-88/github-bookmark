import { Tabs, TabsContent } from '../../components/ui/tabs';
import { GithubSearch } from './GithubSearch';
import { BookmarkList } from './BookmarkList';
import { BookmarkStats } from './BookmarkStats';
import { useBookmarks } from '../../context/BookmarkContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

interface GithubTabsProps {
  activeTab: string;
}

export function GithubTabs({ activeTab }: GithubTabsProps) {
  const { bookmarks, removeBookmark, getBookmarkStats } = useBookmarks();

  return (
    <Tabs value={activeTab} className="w-full mt-10 mb-10">
      
      <TabsContent value="search" className="space-y-2">
        <Card className='border-0 bg-[#1e1e1e]' style={{
              boxShadow: '0 0 4px 0px #646cff',
            }}>
          <CardHeader>
            <CardTitle className='text-2xl bold'>Search GitHub</CardTitle>
            <CardDescription className='text-[#8e8e8e]'>
              Search for GitHub users and repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GithubSearch />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="bookmarks" className="space-y-2">
        <Card className='border-0 bg-[#1e1e1e]' style={{
              boxShadow: '0 0 4px 0px #646cff',
            }}>
          <CardHeader>
            <CardTitle className='text-2xl bold'>My Bookmarks</CardTitle>
            <CardDescription className='text-[#8e8e8e]'>
              View and manage your bookmarked repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookmarkList 
              bookmarks={bookmarks}
              onRemoveBookmark={removeBookmark}
            />
          </CardContent>
        </Card>
      </TabsContent>
      

      
      <TabsContent value="stats" className="space-y-4">
        <BookmarkStats stats={getBookmarkStats()} />
      </TabsContent>
    </Tabs>
  );
}
