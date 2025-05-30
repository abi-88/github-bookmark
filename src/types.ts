export interface GithubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  public_repos: number;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  _ownerUsername?: string; // Added for tracking which user's repositories these are
}

export interface BookmarkedRepo extends GithubRepo {
  bookmarkedAt: string;
  doc_id?: string;
}

export interface BookmarkStats {
  date: string;
  count: number;
}
