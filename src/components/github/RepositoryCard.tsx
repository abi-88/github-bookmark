import type { BookmarkedRepo, GithubRepo } from '../../types';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { ExternalLink, Star, GitFork, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../../components/ui/badge';
import { useBookmarks } from '@/context/BookmarkContext';

interface RepositoryCardProps {
  repo: BookmarkedRepo;
  isBookmarked: boolean;
  onBookmark: (repo: GithubRepo) => void;
  onRemoveBookmark?: (doc_id: string,id:number|string) => void;
}

export function RepositoryCard({ 
  repo, 
  isBookmarked, 
  onBookmark, 
  onRemoveBookmark 
}: RepositoryCardProps) {

    const { removingBookmark,addingBookMark } = useBookmarks();

  const handleBookmarkClick = () => {
    if (isBookmarked && onRemoveBookmark) {
      onRemoveBookmark(repo.doc_id||"",repo.id);
    } else {
      onBookmark(repo);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md  border-[1px] border-[#737373]">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
            <AvatarFallback>{repo.owner.login.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{repo.full_name}</h3>
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            {repo.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{repo.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center text-xs text-gray-500">
                <Star className="h-3.5 w-3.5 mr-1" />
                {repo.stargazers_count.toLocaleString()}
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <GitFork className="h-3.5 w-3.5 mr-1" />
                {repo.forks_count.toLocaleString()}
              </div>
              
              {repo.language && (
                <Badge variant="outline" className="text-xs">
                  {repo.language}
                </Badge>
              )}
              
              <div className="text-xs text-gray-500">
                Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="sm"
            onClick={handleBookmarkClick}
            className="flex-shrink-0"
          >
            {isBookmarked ? (
              <>
              {removingBookmark == repo.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ):(
                <BookmarkCheck className="h-4 w-4 mr-1" color='green'/>
              )}
                Bookmarked
              </>
            ) : (
              <>
              {addingBookMark == repo.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ):(
                <Bookmark className="h-4 w-4 mr-1" />
              )}
                Bookmark
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
