import type { GithubUser } from '../../types';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface UserCardProps {
  user: GithubUser;
  onViewRepositories: (username: string) => void;
  expandedUsers: string[];
}

export function UserCard({ user, onViewRepositories, expandedUsers }: UserCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md w-full border-[1px] border-[#737373]">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Avatar className="h-16 w-16 border shadow-sm">
              <AvatarImage src={user.avatar_url} alt={user.login} />
              <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{user.name || user.login}</h3>
              {user.name && <span className="text-sm text-gray-500">@{user.login}</span>}
              <a 
                href={user.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors"
                title="View on GitHub"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            {user.bio && (
              <div className="mb-2">
                <p className="text-sm text-gray-700 line-clamp-2">{user.bio}</p>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-xs text-gray-600">
              {user.public_repos > 0 && (
                <div className="flex items-center">
                  <span className="font-medium">{user.public_repos}</span>
                  <span className="ml-1">{user.public_repos === 1 ? 'repository' : 'repositories'}</span>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => onViewRepositories(user.login)}
            className="p-2 hover:bg-blue-600 rounded-full transition-colors"
            aria-label={expandedUsers.includes(user.login) ? "Collapse repositories" : "Expand repositories"}
            title={expandedUsers.includes(user.login) ? "Hide repositories" : "Show repositories"}
          >
            {expandedUsers.includes(user.login) ? 
              <ChevronUp className="h-5 w-5" /> : 
              <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
