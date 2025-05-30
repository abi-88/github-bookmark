import type { GithubUser, GithubRepo } from "../types";


const GITHUB_API_URL = 'https://api.github.com';

export const searchUsers = async (query: string): Promise<GithubUser[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(`${GITHUB_API_URL}/search/users?q=${encodeURIComponent(query)}&per_page=10`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error searching GitHub users:', error);
    throw error;
  }
};

export const searchRepositories = async (query: string): Promise<GithubRepo[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(`${GITHUB_API_URL}/search/repositories?q=${encodeURIComponent(query)}&per_page=10`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
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
