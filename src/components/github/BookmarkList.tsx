import { useState } from 'react';
import type { BookmarkedRepo, GithubRepo } from '../../types';
import { RepositoryCard } from './RepositoryCard';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { CsvImportModal } from './CsvImportModal';

interface BookmarkListProps {
  bookmarks: BookmarkedRepo[];
  onRemoveBookmark: (doc_id: string) => void;
}

export function BookmarkList({ bookmarks, onRemoveBookmark }: BookmarkListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  
  const filteredBookmarks = bookmarks.filter(bookmark => 
    bookmark.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bookmark.description && bookmark.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (bookmark.language && bookmark.language.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Group bookmarks by date
  const groupedBookmarks = filteredBookmarks.reduce((groups, bookmark) => {
    const date = bookmark.bookmarkedAt.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(bookmark);
    return groups;
  }, {} as Record<string, BookmarkedRepo[]>);
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedBookmarks).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-0 bg-gray-700 h-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

          <Button 
            variant="default" 
            onClick={() => setImportModalOpen(true)}
            className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 h-10"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>

      </div>
      
      {importModalOpen && (
        <CsvImportModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
        />
      )}
      
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {bookmarks.length === 0 
            ? "You haven't bookmarked any repositories yet."
            : "No bookmarks match your search."}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">
                {format(new Date(date), 'MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {groupedBookmarks[date].map(bookmark => (
                  <RepositoryCard
                    key={bookmark.id}
                    repo={bookmark}
                    isBookmarked={true}
                    onBookmark={() => {}} // No-op since already bookmarked
                    onRemoveBookmark={onRemoveBookmark}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
