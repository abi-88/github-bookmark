
import { createContext, useContext, useState, useEffect } from 'react';
import type { GithubRepo, BookmarkedRepo, BookmarkStats } from '../types';
import { supabase } from '../client/supabase';
import { useAuth } from './AuthContext';


interface BookmarkContextType {
  bookmarks: BookmarkedRepo[];
  addBookmark: (repo: GithubRepo) => void;
  removeBookmark: (doc_id: string,id:number|string) => void;
  isBookmarked: (repoId: number) => boolean;
  importBookmarks: (repos: GithubRepo[]) => void;
  getBookmarkStats: () => BookmarkStats[];
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: any }) {
  const [bookmarks, setBookmarks] = useState<BookmarkedRepo[]>([]);
  const { user, isAuthenticated } = useAuth();

  const fetchBookmarks = async () => {
    if (!isAuthenticated || !user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('github_repos')
        .select('*')
        .eq('bookmarked_user_id', user.email);
      
      if (error) {
        console.error('Error fetching bookmarks from Supabase:', error);
        return;
      }
      
      if (data) {
        // Transform the data to match BookmarkedRepo structure if needed
        const transformedData = data.map(repo => {
          // Parse owner from JSON if it's stored as a string
          let owner = repo.owner;
          if (typeof owner === 'string') {
            try {
              owner = JSON.parse(owner);
            } catch (e) {
              console.error('Error parsing owner JSON:', e);
              owner = { login: '', avatar_url: '' };
            }
          }
          
          return {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            description: repo.description,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language,
            owner: owner,
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            bookmarkedAt: repo.bookmarked_at,
            doc_id: repo.doc_id
          };
        }) as BookmarkedRepo[];
        
        setBookmarks(transformedData);
      }
    } catch (error) {
      console.error('Error loading bookmarks from Supabase:', error);
    }
  };
  
  // Load bookmarks from Supabase when user is authenticated
  useEffect(() => {    
    fetchBookmarks();
  }, [isAuthenticated, user?.email]);



  const addBookmark = async (repo: GithubRepo) => {
    if (!user?.email || isBookmarked(repo.id)) return;
    
    const bookmarkedAt = new Date().toISOString();
    
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('github_repos')
        .insert({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          html_url: repo.html_url,
          description: repo.description,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language,
          owner: JSON.stringify(repo.owner), // Store the full owner object as JSON
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          bookmarked_at: bookmarkedAt,
          bookmarked_user_id: user.email
        })
        .select('doc_id');
      
      if (error) {
        console.error('Error adding bookmark to Supabase:', error);
        return;
      }
      
      // Update local state with the doc_id from Supabase
      const bookmarkedRepo: BookmarkedRepo & { doc_id?: string } = {
        ...repo,
        bookmarkedAt,
        doc_id: data?.[0]?.doc_id
      };
      
      setBookmarks(prev => [...prev, bookmarkedRepo]);
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const removeBookmark = async (doc_id: string,id:number|string) => {
    if (!user?.email) return;
    console.log(doc_id,id)
    // Find the bookmark to get its doc_id
    let bookmark:BookmarkedRepo|undefined;
    if(doc_id){
       bookmark = bookmarks.find(b => b.doc_id === doc_id);
    }else if(id){
       bookmark = bookmarks.find(b => b.id === id);
    }
   console.log(bookmark)
    if (!bookmark) return;
    
    try {
      // Delete from Supabase using doc_id if available, otherwise fallback to id
      const query = supabase
        .from('github_repos')
        .delete();
        
      if (bookmark.doc_id) {
        query.eq('doc_id', bookmark.doc_id).eq('bookmarked_user_id', user.email);
      } 
      
      const { error } = await query;
      
      if (error) {
        console.error('Error removing bookmark from Supabase:', error);
        return;
      }
      
      // Update local state
      setBookmarks(prev => prev.filter(bookmark => bookmark.doc_id !== doc_id));
      fetchBookmarks()
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const isBookmarked = (repoId: number): boolean => {
    return bookmarks.some(bookmark => bookmark.id === repoId);
  };

  const importBookmarks = async (repos: GithubRepo[]) => {
    if (!user?.email) return;
    
    const newRepos = repos.filter(repo => !isBookmarked(repo.id));
    if (newRepos.length === 0) return;
    
    try {
      // Prepare data for Supabase
      const bookmarkedAt = new Date().toISOString();
      const supabaseData = newRepos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        language: repo.language,
        owner: JSON.stringify(repo.owner), // Store the full owner object as JSON
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        bookmarked_at: bookmarkedAt,
        bookmarked_user_id: user.email
      }));
      
      // Insert into Supabase and return the doc_ids
      const { data, error } = await supabase
        .from('github_repos')
        .insert(supabaseData)
        .select('doc_id, id');
      
      if (error) {
        console.error('Error importing bookmarks to Supabase:', error);
        return;
      }
      
      // Update local state with doc_ids
      const newBookmarks = newRepos.map(repo => {
        // Find the corresponding doc_id for this repo
        const matchingData = data?.find(d => d.id === repo.id);
        return {
          ...repo,
          bookmarkedAt,
          doc_id: matchingData?.doc_id
        };
      });
      
      setBookmarks(prev => [...prev, ...newBookmarks]);
    } catch (error) {
      console.error('Error importing bookmarks:', error);
    }
  };

  const getBookmarkStats = (): BookmarkStats[] => {
    // Group bookmarks by date (YYYY-MM-DD)
    const statsByDate = bookmarks.reduce((acc: Record<string, number>, bookmark) => {
      const date = bookmark.bookmarkedAt.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Convert to array of { date, count } objects and sort by date
    return Object.entries(statsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <BookmarkContext.Provider 
      value={{ 
        bookmarks, 
        addBookmark, 
        removeBookmark, 
        isBookmarked, 
        importBookmarks,
        getBookmarkStats
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
