"use client";

import React, { useEffect, useState } from "react";
import useProject from "@/app/hooks/use-project";
import axios from "axios";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { MessageCircle, Calendar, User } from "lucide-react";

type Question = {
  id: string;
  createdAt: string; // API returns ISO string, not Date object
  updatedAt: string; // API returns ISO string, not Date object
  question: string;
  answer: string;
  projectId: string;
  project: {
    id: string;
    name: string;
  };
  userId: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  filesReferences?: unknown;
};

export default function QAPage() {
  const { projectId } = useProject();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [filesForAnswer, setFilesForAnswer] = useState<{ fileName: string; sourceCode: string; summary: string }[]>([]);
  const question = questions?.[questionIndex];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!projectId || !isMounted) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/get-questions?projectId=${projectId}`);
        setQuestions(res.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [projectId, isMounted]);

  // When the selected question changes, ensure filesForAnswer is populated either from stored filesReferences
  // or by parsing the answer's SOURCES for a "Files:" line and fetching via API.
  useEffect(() => {
    const loadFiles = async () => {
      if (!question) return setFilesForAnswer([]);

      // If backend stored filesReferences, use them
      if (Array.isArray(question.filesReferences) && question.filesReferences.length > 0) {
        setFilesForAnswer(question.filesReferences as { fileName: string; sourceCode: string; summary: string }[]);
        return;
      }

      // Parse files from the answer's SOURCES section
      // Look for a line starting with "Files:" and split by comma
      const answer = question.answer || "";
      const filesLine = answer
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find((l) => /^files\s*:/i.test(l));

      if (!filesLine) {
        setFilesForAnswer([]);
        return;
      }

      const list = filesLine.replace(/^files\s*:/i, "").split(",").map((s) => s.trim()).filter(Boolean);
      if (list.length === 0 || !projectId) {
        setFilesForAnswer([]);
        return;
      }

      try {
        const res = await axios.get(`/api/get-files-by-names?projectId=${projectId}&files=${encodeURIComponent(list.join(","))}`);
        setFilesForAnswer(res.data.files ?? []);
      } catch (e) {
        console.error("Failed to load files for answer:", e);
        setFilesForAnswer([]);
      }
    };
    loadFiles();
  }, [question, projectId]);

  if (!isMounted || loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-2">
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Q&A</h1>
          <p className="text-muted-foreground">Browse previous questions and answers</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {questions.length} questions
        </Badge>
      </div>

      <AskQuestionCard />
      
      {questions.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No questions yet</h3>
              <p className="text-muted-foreground">Ask your first question to get started!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Sheet>
          <div className="grid gap-4">
            {questions?.map((question, index) => (
              <SheetTrigger key={question.id} onClick={() => setQuestionIndex(index)} asChild>
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {question.user.imageUrl ? (
                        <Image
                          className="rounded-full ring-2 ring-gray-100"
                          height={40}
                          width={40}
                          src={question.user.imageUrl}
                          alt={`${question.user.firstName || 'User'} avatar`}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-gray-100">
                          <span className="text-white font-medium text-sm">
                            {question.user.firstName?.[0] || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                            {question.question}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {new Date(question.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {question.answer}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {question.user.firstName || 'Anonymous'}
                          </div>
                          {Array.isArray(question.filesReferences) && question.filesReferences.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {question.filesReferences.length} files referenced
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SheetTrigger>
            ))}
          </div>
          
          {question && (
            <SheetContent className="w-full sm:max-w-[90vw] max-w-none">
              <SheetHeader className="space-y-4 pb-4">
                <div className="flex items-start gap-3">
                  {question.user.imageUrl ? (
                    <Image
                      className="rounded-full ring-2 ring-gray-100"
                      height={32}
                      width={32}
                      src={question.user.imageUrl}
                      alt={`${question.user.firstName || 'User'} avatar`}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {question.user.firstName?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-xl font-semibold text-left leading-tight">
                      {question.question}
                    </SheetTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>By {question.user.firstName || 'Anonymous'}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="space-y-6 h-full overflow-y-auto">
                <Tabs defaultValue="answer" className="w-full">
                  <TabsList>
                    <TabsTrigger value="answer">Answer</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>

                  <TabsContent value="answer">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-gray-900">Answer</h3>
                      </div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="prose prose-sm max-w-none">
                            <MDEditor.Markdown source={question.answer} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="files">
                    {filesForAnswer.length > 0 ? (
                      <CodeReferences filesReferences={filesForAnswer} />
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-sm text-muted-foreground">
                          No file references found for this answer.
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          )}
        </Sheet>
      )}
    </div>
  );
}
