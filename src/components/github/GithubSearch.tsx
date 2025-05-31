import { useState, useEffect, useRef } from 'react';
import type { GithubUser, GithubRepo } from '../../types';
import { SearchBar } from './SearchBar';
import { UserCard } from './UserCard';
import { RepositoryCard } from './RepositoryCard';
import { searchUsers, searchRepositories, getUserRepositories } from '../../services/githubService';
import { useBookmarks } from '../../context/BookmarkContext';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { RepositoryCardSkeleton } from '../skelton/RepositoryCardSkeleton';
import { UserCardSkeleton } from '../skelton/UserCardSkeleton';

export function GithubSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'users' | 'repositories'>('repositories');
  const [users, setUsers] = useState<GithubUser[]>([]);
  const [repositories, setRepositories] = useState<GithubRepo[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [loadingRepos, setLoadingRepos] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const includeUserSearch = searchType === "users";
  
  // Reference to the content element for infinite scroll
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Function to load more results when scrolling
  const loadMoreResults = async () => {
    if (isLoading || isLoadingMore || !hasMore || !searchQuery) return;
    
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      if (searchType === 'users') {
        const { users: moreUsers } = await searchUsers(searchQuery, nextPage);
        setUsers(prev => [...prev, ...moreUsers]);
        setHasMore(users.length + moreUsers.length < totalCount);
      } else {
        const { repositories: moreRepos } = await searchRepositories(searchQuery, nextPage);
        setRepositories(prev => [...prev, ...moreRepos]);
        setHasMore(repositories.length + moreRepos.length < totalCount);
      }
      setCurrentPage(nextPage);
    } catch (err) {
      setError('Failed to load more results. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  // Setup scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const contentElement = document.querySelector('.overflow-auto');
      if (!contentElement) return;
      
      const { scrollTop, scrollHeight, clientHeight } = contentElement;
      
      // When user scrolls to bottom (with 100px threshold), load more results
      if (scrollHeight - scrollTop - clientHeight < 100 && !isLoading && !isLoadingMore && hasMore) {
        loadMoreResults();
      }
    };
    
    const contentElement = document.querySelector('.overflow-auto');
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isLoading, isLoadingMore, hasMore, searchType, searchQuery, currentPage, totalCount, repositories.length, users.length]);

  const handleSearch = async (query: string, type: 'users' | 'repositories') => {
    setIsLoading(true);
    setError("");
    setSearchType(type);
    setSearchQuery(query);
    setCurrentPage(1);
    setExpandedUsers([]);
    setLoadingRepos([]);
    setRepositories([]);
    setUsers([]);
    
    // Scroll to top when performing a new search
    const contentElement = document.querySelector('.overflow-auto');
    if (contentElement) {
      contentElement.scrollTop = 0;
    }
    
    try {
      if (type === 'users') {
        // For user search, only fetch users initially
        const { users: userResults, totalCount: userCount } = await searchUsers(query, 1);
        setUsers(userResults);
        setTotalCount(userCount);
        setHasMore(userResults.length < userCount);
      } else if (type === 'repositories') {
        // For repository search
        const { repositories: repoResults, totalCount: repoCount } = await searchRepositories(query, 1);
        setRepositories(repoResults);
        setTotalCount(repoCount);
        setHasMore(repoResults.length < repoCount);
        
        if (includeUserSearch) {
          // If user search is included, fetch users as well
          const { users: userResults } = await searchUsers(query, 1);
          setUsers(userResults);
        }
      }
    } catch (err) {
      setError('Failed to search GitHub. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserRepos = async (username: string) => {
    if (expandedUsers.includes(username)) {
      // Collapse this user's repositories
      setExpandedUsers(expandedUsers.filter(user => user !== username));
      return;
    }
    
    // Only fetch repositories for this specific user when expanded
    try {
      // Show loading indicator just for this user section
      setExpandedUsers([...expandedUsers, username]);
      setLoadingRepos(prev => [...prev, username]);
      
      const userRepos = await getUserRepositories(username);
      
      // Add the user's repositories to the existing repositories
      const userReposWithOwner = userRepos.map(repo => ({
        ...repo,
        _ownerUsername: username // Add a temporary property to track which user these repos belong to
      }));
      
      setRepositories(prev => {
        // Filter out any existing repos for this user
        const filteredRepos = prev.filter(repo => repo._ownerUsername !== username);
        // Even if userReposWithOwner is empty, we still add it to mark that we've loaded this user's repos
        return [...filteredRepos, ...userReposWithOwner];
      });
      
      // Remove from loading state after repositories are loaded
      setLoadingRepos(prev => prev.filter(user => user !== username));
    } catch (err) {
      // If there's an error, remove the user from expanded users
      setExpandedUsers(expandedUsers.filter(user => user !== username));
      setLoadingRepos(prev => prev.filter(user => user !== username));
      setError(`Failed to fetch repositories for ${username}.`);
    }
  };
  
  // const handleToggleUserSearch = () => {
  //   const newIncludeUserSearch = !includeUserSearch;
    
  //   if (newIncludeUserSearch && searchType === 'repositories') {
  //     // If we're enabling user search and there's an active repository search, fetch users
  //     const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
  //     if (searchInput && searchInput.value.trim()) {
  //       setIsLoading(true);
  //       searchUsers(searchInput.value.trim())
  //         .then(results => {
  //           setUsers(results);
  //           setIsLoading(false);
  //         })
  //         .catch(() => {
  //           setError('Failed to search GitHub users.');
  //           setIsLoading(false);
  //         });
  //     }
  //   } else if (!newIncludeUserSearch) {
  //     // If we're disabling user search, clear users and expanded users
  //     setUsers([]);

  return (
    <div className="space-y-4" ref={contentRef}>
      <div className="sticky top-0 z-30 bg-[#1e1e1e] pt-1 pb-3">
        <SearchBar 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          searchType={searchType} 
          setSearchType={setSearchType} 
        />
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-900 border-red-500 text-white">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isLoading && (
        <div className="space-y-4">
          {searchType === 'users' && (
            <>
              <h2 className="text-lg font-medium">Users</h2>
              <div className="space-y-3">
                {Array(3).fill(0).map((_, index) => (
                  <UserCardSkeleton key={index} />
                ))}
              </div>
            </>
          )}
          
          {searchType === 'repositories' && (
            <>
              <h2 className="text-lg font-medium">Repositories</h2>
              <div className="space-y-3">
                {Array(3).fill(0).map((_, index) => (
                  <RepositoryCardSkeleton key={index} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {!isLoading && !error && (
        <>
          {/* User results section */}
          {(searchType === 'users' || includeUserSearch) && users.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Users</h2>
              {users.map(user => (
                <div key={user.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <UserCard
                      user={user}
                      onViewRepositories={() => handleToggleUserRepos(user.login)}
                      expandedUsers={expandedUsers}
                    />
                    
                  </div>
                  
                  {/* User's repositories (shown when expanded) */}
                  {expandedUsers.includes(user.login) && (
                    <div className="pl-6 border-l-1 border-l-[#646cff] border-gray-200 space-y-3 mt-2">
                      <h3 className="text-md font-medium">Repositories for {user.login}</h3>
                      {repositories
                        .filter(repo => repo._ownerUsername === user.login)
                        .length > 0 ? (
                          repositories
                            .filter(repo => repo._ownerUsername === user.login)
                            .map(repo => (
                              <RepositoryCard
                                key={repo.id}
                                repo={repo}
                                isBookmarked={isBookmarked(repo.id)}
                                onBookmark={addBookmark}
                                onRemoveBookmark={removeBookmark}
                              />
                            ))
                        ) : (
                          <div className="py-2 text-gray-500">
                            {loadingRepos.includes(user.login) ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                                <span>Loading repositories...</span>
                              </div>
                            ) : (
                              "No public repositories for this account"
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Repository results section (only for direct repo search) */}
          {searchType === 'repositories' && repositories.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Repositories</h2>
              {repositories
                .filter(repo => !repo._ownerUsername) // Only show repos from direct repo search
                .map(repo => (
                  <RepositoryCard
                    key={repo.id}
                    repo={repo}
                    isBookmarked={isBookmarked(repo.id)}
                    onBookmark={addBookmark}
                    onRemoveBookmark={removeBookmark}
                  />
                ))}
            </div>
          )}
          
          {/* No results message */}
          {!isLoading && 
           ((searchType === 'users' && users.length === 0) || 
            (searchType === 'repositories' && repositories.filter(repo => !repo._ownerUsername).length === 0 && !includeUserSearch)) && 
           users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#646cff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="mt-4 text-xl font-medium text-gray-400 bolder">No results found</span>
              <p className="mt-2 text-md text-gray-500 max-w-md">
                Try searching with different keywords or check for typos.
              </p>
            </div>
          )}
          
          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-t-[#646cff] border-gray-300 rounded-full animate-spin"></div>
                <span className="text-gray-400">Loading more results...</span>
              </div>
            </div>
          )}
          
          {/* End of results message */}
          {!isLoading && !isLoadingMore && !hasMore && (searchQuery && (users.length > 0 || repositories.length > 0)) && (
            <div className="text-center py-4 text-gray-500">
              End of results
            </div>
          )}
        </>
      )}
    </div>
  );
}
