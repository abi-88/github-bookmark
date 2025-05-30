import { useState, useRef } from 'react';
import { X, Upload, AlertCircle, Check, FileText, Github, Star, Code } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { getRepositoryDetails } from '../../services/githubService';
import type { GithubRepo } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (repos: GithubRepo[]) => void;
}

interface ValidationResult {
  valid: GithubRepo[];
  invalid: string[];
}

export function CsvImportModal({ open, onOpenChange, onImport }: CsvImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setValidationResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const content = await readFileContent(file);
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

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseCSV = (content: string): string[] => {
    // Split by newlines and filter out empty lines
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Extract repository full names (owner/repo)
    return lines.map(line => {
      // Handle both simple CSV with just repo names and more complex CSV with multiple columns
      const columns = line.split(',');
      return columns[0].trim();
    }).filter(Boolean);
  };

  const validateRepositories = async (repoFullNames: string[]): Promise<ValidationResult> => {
    const valid: GithubRepo[] = [];
    const invalid: string[] = [];
    
    const promises = repoFullNames.map(async (fullName) => {
      try {
        const [owner, repo] = fullName.split('/');
        
        if (!owner || !repo) {
          invalid.push(fullName);
          return;
        }
        
        const repoDetails = await getRepositoryDetails(owner, repo);
        valid.push(repoDetails);
      } catch (error) {
        invalid.push(fullName);
      }
    });
    
    await Promise.all(promises);
    
    return { valid, invalid };
  };

  const handleImport = () => {
    if (validationResult?.valid.length) {
      onImport(validationResult.valid);
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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 0 20px 0 #646cff' }}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#646cff]" />
            Import Repositories
          </DialogTitle>
          <DialogDescription className="mt-2 text-[#8e8e8e]">
            Import repositories from a CSV file. The file should contain repository names in the format <code>owner/repo</code>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative w-full">
              <div className="border-1 border-dashed border-[#646cff] rounded-lg p-6 flex flex-col items-center justify-center bg-gray-900 hover:bg-gray-800 transition-colors">
                <FileText className="h-10 w-10 text-[#646cff] mb-3" />
                <p className="text-sm font-medium mb-1">Drag and drop your CSV file here, or click to browse</p>
                <p className="text-xs text-[#8e8e8e] mb-3">CSV format: each line should contain a repository in the format <code>owner/repo</code></p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isUploading || isValidating}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button 
                  variant="outline" 
                  className="border-[#646cff] text-[#646cff] hover:bg-[#646cff] hover:text-white transition-colors"
                  disabled={isUploading || isValidating}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select CSV File
                </Button>
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
            <Alert className="bg-[#f0f0ff] border-[#646cff]">
              <AlertCircle className="h-5 w-5 text-[#646cff]" />
              <AlertTitle className="text-lg font-semibold">Validating</AlertTitle>
              <AlertDescription className="text-[#8e8e8e]">
                Checking if repositories exist on GitHub...
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="border-2">
              <X className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          {validationResult && (
            <div className="space-y-5">
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
                    <h3 className="text-lg font-semibold text-red-700">Invalid Repositories</h3>
                  </div>
                  <p className="text-red-700 mb-3">
                    <span className="font-bold">{validationResult.invalid.length}</span> repositories could not be found on GitHub
                  </p>
                  
                  <div className="max-h-40 overflow-y-auto bg-white rounded-md border border-red-200 p-3">
                    <ul className="space-y-1 list-disc pl-5 text-sm text-red-700">
                      {validationResult.invalid.map((repo, index) => (
                        <li key={index}>{repo}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="border-gray-300">
            Cancel
          </Button>
          {validationResult && validationResult.valid.length > 0 && (
            <Button 
              onClick={handleImport} 
              className="bg-[#646cff] hover:bg-[#535bf2] text-white transition-colors"
            >
              <Github className="h-4 w-4 mr-2" />
              Import {validationResult.valid.length} Repositories
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
