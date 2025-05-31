import { useState } from 'react';
import type { BookmarkedRepo } from '../../types';
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
      <div className="sticky top-0 z-30 bg-[#1e1e1e] pt-1 pb-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Scroll to top when searching
                const contentElement = document.querySelector('.overflow-auto');
                if (contentElement) {
                  contentElement.scrollTop = 0;
                }
              }}
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
      </div>
      
      {importModalOpen && (
        <CsvImportModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
        />
      )}
      
      {filteredBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {bookmarks.length === 0 ? (
            <>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#646cff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-400">No bookmarks yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md">
                Start bookmarking repositories to see them listed here.
              </p>
            </>
          ) : (
            <>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#646cff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="mt-4 text-xl font-medium text-gray-400 bolder">No matching bookmarks</span>
              <p className="mt-2 text-md text-gray-500 max-w-md">
                Try searching with different keywords or check for typos.
              </p>
            </>
          )}
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
