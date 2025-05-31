import type { GithubUser, GithubRepo } from "../types";

const GITHUB_API_URL = 'https://api.github.com';

interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  incomplete_results: boolean;
}

export const searchUsers = async (query: string, page: number = 1): Promise<{ users: GithubUser[], totalCount: number }> => {
  if (!query.trim()) return { users: [], totalCount: 0 };
  
  try {
    const response = await fetch(`${GITHUB_API_URL}/search/users?q=${encodeURIComponent(query)}&per_page=10&page=${page}`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json() as PaginatedResponse<GithubUser>;
    return { users: data.items, totalCount: data.total_count };
  } catch (error) {
    console.error('Error searching GitHub users:', error);
    throw error;
  }
};

export const searchRepositories = async (query: string, page: number = 1): Promise<{ repositories: GithubRepo[], totalCount: number }> => {
  if (!query.trim()) return { repositories: [], totalCount: 0 };
  
  try {
    const response = await fetch(`${GITHUB_API_URL}/search/repositories?q=${encodeURIComponent(query)}&per_page=10&page=${page}`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json() as PaginatedResponse<GithubRepo>;
    return { repositories: data.items, totalCount: data.total_count };
  } catch (error) {
    console.error('Error searching GitHub repositories:', error);
    throw error;
  }
};

export const getUserRepositories = async (username: string): Promise<GithubRepo[]> => {
  if (!username.trim()) return [];
  
  try {
    const response = await fetch(`${GITHUB_API_URL}/users/${encodeURIComponent(username)}/repos?per_page=100`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching repositories for user ${username}:`, error);
    throw error;
  }
};

export const getRepositoryDetails = async (owner: string, repo: string): Promise<GithubRepo> => {
  try {
    const response = await fetch(`${GITHUB_API_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching repository details for ${owner}/${repo}:`, error);
    throw error;
  }
};
