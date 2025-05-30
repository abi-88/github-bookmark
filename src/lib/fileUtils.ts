export const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

export const parseCSV = (content: string): string[] => {
    // Split by newlines and filter out empty lines
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Extract GitHub URLs or repository names
    return lines.map(line => {
      // Handle both simple CSV with just URLs and more complex CSV with multiple columns
      const columns = line.split(',');
      const urlOrRepo = columns[0].trim();
      return urlOrRepo;
    }).filter(Boolean);
  };

export const extractRepoInfo = (url: string): { owner: string; repo: string } | null => {
    // Handle GitHub URLs like https://github.com/owner/repo
    const githubUrlRegex = /github\.com\/([\w.-]+)\/([\w.-]+)(?:\.git|\/)?$/;
    const githubMatch = url.match(githubUrlRegex);
    
    if (githubMatch) {
      return { owner: githubMatch[1], repo: githubMatch[2] };
    }
    
    // Handle direct owner/repo format
    const directFormatRegex = /^([\w.-]+)\/([\w.-]+)$/;
    const directMatch = url.match(directFormatRegex);
    
    if (directMatch) {
      return { owner: directMatch[1], repo: directMatch[2] };
    }
    
    return null;
  };