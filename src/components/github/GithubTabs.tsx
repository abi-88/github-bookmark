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
  const { bookmarks, removeBookmark, importBookmarks, getBookmarkStats } = useBookmarks();

  return (
    <Tabs value={activeTab} className="w-full mt-10">
      
      <TabsContent value="search" className="space-y-2">
        <Card className='border-0' style={{
              boxShadow: '0 0 20px 0 #646cff',
            }}>
          <CardHeader>
            <CardTitle className='text-2xl font-semibold'>Search GitHub</CardTitle>
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
        <Card className='border-0' style={{
              boxShadow: '0 0 20px 0 #646cff',
            }}>
          <CardHeader>
            <CardTitle className='text-2xl font-semibold'>My Bookmarks</CardTitle>
            <CardDescription className='text-[#8e8e8e]'>
              View and manage your bookmarked repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookmarkList 
              bookmarks={bookmarks}
              onRemoveBookmark={removeBookmark}
              onImportBookmarks={importBookmarks}
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
