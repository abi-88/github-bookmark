import { useState, useRef } from 'react';
import { X, Upload, Check, FileText, Github, Star, Code, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { getRepositoryDetails } from '../../services/githubService';
import type { GithubRepo } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { useBookmarks } from '@/context/BookmarkContext';
import { extractRepoInfo, parseCSV, readFileContent } from '@/lib/fileUtils';

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (repos: GithubRepo[]) => void;
}

interface ValidationResult {
  valid: GithubRepo[];
  invalid: Array<{
    url: string;
    reason: string;
  }>;
}

export function CsvImportModal({ open, onOpenChange }: CsvImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [totalUrls, setTotalUrls] = useState(0);
  const [processedUrls, setProcessedUrls] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importBookmarks,importingBookMark } = useBookmarks();

  const resetState = () => {
    setValidationResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    setSelectedFile(file);
  };
  
  const handleExtract = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const content = await readFileContent(selectedFile);
      const repositories = parseCSV(content);
      
      if (repositories.length === 0) {
        setError('The CSV file is empty or has an invalid format');
        setIsUploading(false);
        return;
      }
      
      setIsUploading(false);
      setIsValidating(true);
      
      const validationResult = await validateRepositories(repositories);
      setValidationResult(validationResult);
      setIsValidating(false);
      
    } catch (err) {
      setError('Failed to read the CSV file');
      setIsUploading(false);
      setIsValidating(false);
    }
  };

  const validateRepositories = async (urls: string[]): Promise<ValidationResult> => {
    const valid: GithubRepo[] = [];
    const invalid: Array<{ url: string; reason: string }> = [];
    
    setTotalUrls(urls.length);
    setProcessedUrls(0);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setCurrentUrl(url);
      setProgress(Math.floor((i / urls.length) * 100));
      
      try {
        const repoInfo = extractRepoInfo(url);
        
        if (!repoInfo) {
          invalid.push({ url, reason: 'Invalid GitHub URL format' });
          setProcessedUrls(prev => prev + 1);
          continue;
        }
        
        const { owner, repo } = repoInfo;
        const repoDetails = await getRepositoryDetails(owner, repo);
        valid.push(repoDetails);
      } catch (error: any) {
        let reason = 'Failed to fetch repository details';
        if (error.message.includes('404')) {
          reason = 'Repository not found (404)'; 
        } else if (error.message.includes('403')) {
          reason = 'Access forbidden (403) - may be a private repository';
        }
        invalid.push({ url, reason });
      } finally {
        setProcessedUrls(prev => prev + 1);
      }
    }
    
    setProgress(100);
    return { valid, invalid };
  };

  const handleImport = async () => {
    console.log({a:validationResult?.valid})
    if (validationResult?.valid.length) {
      await  importBookmarks(validationResult.valid);
      resetState();
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-10rem)] overflow-y-auto">
        <Alert className="mb-4 bg-amber-50 border-amber-300 mt-8">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">Warning</AlertTitle>
          <AlertDescription className="text-amber-700">
            Closing this window or reloading the page will cause you to lose any data that hasn't been saved.
          </AlertDescription>
        </Alert>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#646cff]" />
            Import Repositories
          </DialogTitle>
          <DialogDescription className="mt-2 text-[#8e8e8e]">
            Import repositories from a CSV file. The file should contain repository names in the format <code>owner/repo</code>.
            <p>Example:</p>
              <pre className="bg-gray-600 p-1 mt-1 rounded text-white">
                facebook/react,
                microsoft/typescript,
                vercel/next.js
              </pre>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative w-full">
              <div className="border-1 border-dashed border-[#646cff] rounded-lg p-6 flex flex-col items-center justify-center bg-gray-900 hover:bg-gray-800 transition-colors">
                <FileText className="h-10 w-10 text-[#646cff] mb-3" />
                <p className="text-sm font-medium mb-1">Drag and drop your CSV file here, or click to browse</p>
                <p className="text-xs text-[#8e8e8e] mb-3">CSV format: each line should contain a GitHub URL or repository in the format <code>owner/repo</code></p>
                
                <div className="flex flex-col items-center gap-3 w-full">
                  <label 
                    htmlFor="csv-file-input"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-md cursor-pointer
                      border border-[#646cff] text-[#646cff] hover:bg-[#646cff] hover:text-white transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Select CSV File</span>
                  </label>
                  
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={isUploading || isValidating}
                    className="hidden"
                  />
                </div>
                
                {selectedFile && (
                  <div className="mt-4 w-full">
                    <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">{selectedFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>!importingBookMark&& setSelectedFile(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleExtract}
                      disabled={isUploading || isValidating}
                      className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                      Extract GitHub Info
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {isUploading && (
            <Alert className="bg-[#f0f0ff] border-[#646cff]">
              <Upload className="h-5 w-5 text-[#646cff]" />
              <AlertTitle className="text-lg font-semibold">Uploading</AlertTitle>
              <AlertDescription className="text-[#8e8e8e]">
                Reading your CSV file...
              </AlertDescription>
            </Alert>
          )}
          
          {isValidating && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Processing URLs: {processedUrls}/{totalUrls}</span>
                <span className="text-sm font-medium">{Math.floor(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 truncate mt-1">
                Current: {currentUrl}
              </p>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive" className="border-2">
              <X className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          {validationResult && (
            <div className="space-y-4">
              {validationResult.valid.length > 0 && (
                <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="h-6 w-6 text-green-500" />
                    <h3 className="text-lg font-semibold text-green-700">Valid Repositories</h3>
                  </div>
                  <p className="text-green-700 mb-3">
                    Found <span className="font-bold">{validationResult.valid.length}</span> valid repositories
                  </p>
                  
                  <div className="max-h-60 overflow-y-auto pr-2">
                    <div className="grid gap-3">
                      {validationResult.valid.slice(0, 5).map((repo) => (
                        <div key={repo.id} className="flex items-center gap-3 p-3 bg-white rounded-md border border-green-200">
                          <Github className="h-5 w-5 text-[#646cff]" />
                          <div className="flex-grow">
                            <p className="font-medium text-gray-800">{repo.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{repo.description || 'No description'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {repo.language && (
                              <Badge variant="outline" className="text-xs">
                                <Code className="h-3 w-3 mr-1" />
                                {repo.language}
                              </Badge>
                            )}
                            <div className="flex items-center text-xs text-gray-500">
                              <Star className="h-3 w-3 mr-1" />
                              {repo.stargazers_count}
                            </div>
                          </div>
                        </div>
                      ))}
                      {validationResult.valid.length > 5 && (
                        <p className="text-center text-sm text-gray-500">
                          ...and {validationResult.valid.length - 5} more repositories
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {validationResult.invalid.length > 0 && (
                <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <X className="h-6 w-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-700">Failed URLs</h3>
                  </div>
                  <p className="text-red-700 mb-3">
                    <span className="font-bold">{validationResult.invalid.length}</span> repositories could not be fetched
                  </p>
                  
                  <div className="max-h-40 overflow-y-auto bg-white rounded-md border border-red-200 p-3">
                    <ul className="space-y-2 text-sm">
                      {validationResult.invalid.map((item, index) => (
                        <li key={index} className="border-b border-gray-100 pb-1">
                          <div className="font-medium text-gray-800">{item.url}</div>
                          <div className="text-red-600 text-xs">{item.reason}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between pt-4 border-t">
          <Button disabled={importingBookMark} variant="outline" onClick={handleClose} className="border-gray-300">
            Cancel
          </Button>
          {validationResult && validationResult.valid.length > 0 && (
            <Button 
              disabled={importingBookMark}
              onClick={handleImport} 
              className="bg-[#646cff] hover:bg-[#535bf2] text-white transition-colors"
            >
              {importingBookMark?<Loader2 className="mr-2 h-4 w-4 animate-spin" />:     <Github className="h-4 w-4 mr-2" />}
         
              Add {validationResult.valid.length} Repositories to Bookmarks
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
