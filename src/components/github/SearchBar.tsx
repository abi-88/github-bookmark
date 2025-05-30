import { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, type: 'users' | 'repositories') => void;
  isLoading?: boolean;
  setSearchType: (type: 'users' | 'repositories') => void;
  searchType: 'users' | 'repositories';
}

export function SearchBar({ onSearch, isLoading = false,setSearchType,searchType }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, searchType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-grow">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
          <div className="flex border-0 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setSearchType('users')}
              className={`px-2 py-1 text-xs ${searchType === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-100 hover:bg-gray-700'}`}
            >
              Users
            </button>
            <button
              type="button"
              onClick={() => setSearchType('repositories')}
              className={`px-2 py-1 text-xs ${searchType === 'repositories' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-100 hover:bg-gray-700'}`}
            >
              Repos
            </button>
          </div>
        </div>
        
        <div className="absolute left-30 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <Input
          type="text"
          placeholder={`Search GitHub ${searchType === 'users' ? 'Users' : 'Repositories'}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-36 h-10 border-0 bg-gray-700"
        />
      </div>
      
      <Button 
        size="lg" 
        type="submit" 
        disabled={isLoading || !query.trim()} 
        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 w-30 h-10"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
}
