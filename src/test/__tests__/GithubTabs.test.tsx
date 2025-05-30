import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../utils';
import { GithubTabs } from '../../components/github/GithubTabs';
import { useBookmarks } from '../../context/BookmarkContext';

// Mock the components used in GithubTabs
vi.mock('../../components/github/GithubSearch', () => ({
  GithubSearch: () => <div data-testid="github-search">Github Search Component</div>,
}));

vi.mock('../../components/github/BookmarkList', () => ({
  BookmarkList: ({ bookmarks, onRemoveBookmark }: { bookmarks: any[], onRemoveBookmark: (id: string) => void }) => (
    <div data-testid="bookmark-list" data-bookmarks-count={bookmarks.length}>
      Bookmark List Component
      <button onClick={() => onRemoveBookmark('test-id')}>Remove</button>
    </div>
  ),
}));

vi.mock('../../components/github/BookmarkStats', () => ({
  BookmarkStats: ({ stats }: { stats: any }) => (
    <div data-testid="bookmark-stats" data-stats={JSON.stringify(stats)}>
      Bookmark Stats Component
    </div>
  ),
}));

// Mock the BookmarkContext
vi.mock('../../context/BookmarkContext', () => ({
  useBookmarks: vi.fn(),
}));

// Mock UI components
vi.mock('../../components/ui/tabs', () => ({
  Tabs: ({ children, value }: { children: React.ReactNode, value: string }) => (
    <div data-testid="tabs" data-active-tab={value}>{children}</div>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode, value: string }) => (
    <div data-testid={`tab-${value}`}>{children}</div>
  ),
}));

vi.mock('../../components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode, className: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode, className: string }) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
  CardDescription: ({ children, className }: { children: React.ReactNode, className: string }) => (
    <div data-testid="card-description" className={className}>{children}</div>
  ),
}));

describe('GithubTabs Component', () => {
  const mockBookmarks = [
    { id: 'test-id-1', name: 'repo1', owner: { login: 'user1' }, html_url: 'url1', description: 'desc1', language: 'JavaScript' },
    { id: 'test-id-2', name: 'repo2', owner: { login: 'user2' }, html_url: 'url2', description: 'desc2', language: 'TypeScript' }
  ];
  
  const mockRemoveBookmark = vi.fn();
  const mockGetBookmarkStats = vi.fn().mockReturnValue({
    totalBookmarks: 2,
    languageDistribution: { JavaScript: 1, TypeScript: 1 }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useBookmarks as any).mockReturnValue({
      bookmarks: mockBookmarks,
      removeBookmark: mockRemoveBookmark,
      getBookmarkStats: mockGetBookmarkStats
    });
  });

  it('renders search tab content when activeTab is "search"', () => {
    render(<GithubTabs activeTab="search" />);
    
    // Check if search tab content is rendered
    expect(screen.getByTestId('tab-search')).toBeInTheDocument();
    expect(screen.getByTestId('github-search')).toBeInTheDocument();
    expect(screen.getByText('Search GitHub')).toBeInTheDocument();
  });

  it('renders bookmarks tab content when activeTab is "bookmarks"', () => {
    render(<GithubTabs activeTab="bookmarks" />);
    
    // Check if bookmarks tab content is rendered
    expect(screen.getByTestId('tab-bookmarks')).toBeInTheDocument();
    expect(screen.getByTestId('bookmark-list')).toBeInTheDocument();
    expect(screen.getByText('My Bookmarks')).toBeInTheDocument();
    
    // Check if bookmarks are passed to BookmarkList
    expect(screen.getByTestId('bookmark-list').getAttribute('data-bookmarks-count')).toBe('2');
  });

  it('renders stats tab content when activeTab is "stats"', () => {
    render(<GithubTabs activeTab="stats" />);
    
    // Check if stats tab content is rendered
    expect(screen.getByTestId('tab-stats')).toBeInTheDocument();
    expect(screen.getByTestId('bookmark-stats')).toBeInTheDocument();
    
    // Check if stats are passed to BookmarkStats
    const statsData = JSON.parse(screen.getByTestId('bookmark-stats').getAttribute('data-stats') || '{}');
    expect(statsData).toEqual({
      totalBookmarks: 2,
      languageDistribution: { JavaScript: 1, TypeScript: 1 }
    });
  });

  it('calls removeBookmark when remove button is clicked in bookmark list', () => {
    render(<GithubTabs activeTab="bookmarks" />);
    
    // Click remove button
    fireEvent.click(screen.getByText('Remove'));
    
    // Check if removeBookmark was called with correct ID
    expect(mockRemoveBookmark).toHaveBeenCalledWith('test-id');
  });
});
