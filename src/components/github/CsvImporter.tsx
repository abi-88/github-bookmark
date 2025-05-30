import { useState, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AlertCircle, Upload, Check, X } from 'lucide-react';
import type { GithubRepo } from '../../types';
import { getRepositoryDetails } from '../../services/githubService';

interface CsvImporterProps {
  onImport: (repos: GithubRepo[]) => void;
}

interface ValidationResult {
  valid: GithubRepo[];
  invalid: string[];
}

export function CsvImporter({ onImport }: CsvImporterProps) {
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading || isValidating}
          className="flex-grow"
        />
        {validationResult && validationResult.valid.length > 0 && (
          <Button 
            onClick={handleImport}
            className="whitespace-nowrap"
          >
            Import {validationResult.valid.length} Repos
          </Button>
        )}
      </div>
      
      {isUploading && (
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertTitle>Uploading</AlertTitle>
          <AlertDescription>
            Reading your CSV file...
          </AlertDescription>
        </Alert>
      )}
      
      {isValidating && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validating</AlertTitle>
          <AlertDescription>
            Checking if repositories exist on GitHub...
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {validationResult && (
        <>
          {validationResult.valid.length > 0 && (
            <Alert variant="default" className="border-green-500 bg-green-50">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Valid Repositories</AlertTitle>
              <AlertDescription>
                Found {validationResult.valid.length} valid repositories
              </AlertDescription>
            </Alert>
          )}
          
          {validationResult.invalid.length > 0 && (
            <Alert variant="destructive" className="bg-red-50">
              <X className="h-4 w-4" />
              <AlertTitle>Invalid Repositories</AlertTitle>
              <AlertDescription>
                {validationResult.invalid.length} repositories could not be found on GitHub:
                <ul className="mt-2 ml-4 list-disc">
                  {validationResult.invalid.slice(0, 5).map((repo, index) => (
                    <li key={index} className="text-sm">{repo}</li>
                  ))}
                  {validationResult.invalid.length > 5 && (
                    <li className="text-sm">...and {validationResult.invalid.length - 5} more</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
      
      <div className="text-xs text-gray-500 mt-2">
        <p>CSV format: Each line should contain a GitHub repository in the format <code>owner/repo</code></p>
        <p>Example:</p>
        <pre className="bg-gray-100 p-1 mt-1 rounded">
          facebook/react<br/>
          microsoft/typescript<br/>
          vercel/next.js
        </pre>
      </div>
    </div>
  );
}
