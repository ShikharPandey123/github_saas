"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FileText, Code } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[];
  initialFileName?: string;
};

const CodeReferences = ({ filesReferences, initialFileName }: Props) => {
  const [tab, setTab] = React.useState(initialFileName ?? filesReferences[0]?.fileName);
  const [viewMode, setViewMode] = React.useState<'code' | 'markdown'>('code');
  React.useEffect(() => {
    if (initialFileName) setTab(initialFileName);
  }, [initialFileName]);
  
  if (filesReferences.length === 0) return null;

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || 'text';
  };

  const getLanguage = (fileName: string) => {
    const ext = getFileExtension(fileName);
    const languageMap: { [key: string]: string } = {
      'ts': 'typescript',
      'tsx': 'tsx',
      'js': 'javascript',
      'jsx': 'jsx',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
    };
    return languageMap[ext] || 'text';
  };

  return (
  <Card className="w-full max-w-full">
      <CardHeader className="pb-3 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Referenced Files
            <Badge variant="secondary" className="ml-2">
              {filesReferences.length}
            </Badge>
          </CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 w-1/2 sm:w-auto ${
                viewMode === 'code' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Code className="h-3 w-3" />
              Code
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 w-1/2 sm:w-auto ${
                viewMode === 'markdown' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileText className="h-3 w-3" />
              Markdown
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <TabsList className="flex w-full min-w-[350px] sm:min-w-0 overflow-x-auto gap-1 h-auto p-1 bg-gray-50">
            {filesReferences.map((file) => (
              <TabsTrigger
                key={file.fileName}
                value={file.fileName}
                className="text-xs px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md whitespace-nowrap max-w-48 truncate"
                title={file.fileName}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    getFileExtension(file.fileName) === 'ts' || getFileExtension(file.fileName) === 'tsx' 
                      ? 'bg-blue-500' 
                      : getFileExtension(file.fileName) === 'js' || getFileExtension(file.fileName) === 'jsx'
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }`} />
                  {file.fileName}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {filesReferences.map((file) => (
            <TabsContent
              key={file.fileName}
              value={file.fileName}
              className="mt-4 space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b">
                <Badge variant="outline" className="text-xs">
                  {getFileExtension(file.fileName).toUpperCase()}
                </Badge>
                <span className="text-sm font-medium text-gray-700">{file.fileName}</span>
              </div>
              {viewMode === 'code' ? (
                <div className="rounded-lg overflow-hidden border">
                  <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono flex items-center justify-between">
                    <span>{file.fileName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getLanguage(file.fileName)}
                    </Badge>
                  </div>
                  <div className="max-h-[60vh] overflow-auto">
                    <SyntaxHighlighter 
                      language={getLanguage(file.fileName)} 
                      style={lucario}
                      customStyle={{
                        margin: 0,
                        fontSize: '13px',
                        lineHeight: '1.4',
                      }}
                      showLineNumbers
                    >
                      {file.sourceCode}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-gray-50 p-4 max-h-[60vh] overflow-auto">
                  <MDEditor.Markdown 
                    source={`\`\`\`${getLanguage(file.fileName)}\n${file.sourceCode}\n\`\`\``}
                  />
                </div>
              )}
              {file.summary && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">File Summary</h4>
                  <p className="text-sm text-blue-800">{file.summary}</p>
                </div>
              )}
            </TabsContent>
          ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodeReferences;
