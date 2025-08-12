"use client";

import React, { useEffect, useState } from "react";
import useProject from "@/app/hooks/use-project";
import axios from "axios";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

type Question = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
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
  const question = questions?.[questionIndex];

  useEffect(() => {
    if (!projectId) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/get-questions`);
        setQuestions(res.data);
      } catch {
        setError("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [projectId]);

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => (
          <React.Fragment key={question.id}>
            <SheetTrigger onClick={() => setQuestionIndex(index)}>
              <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
                <img
                  className="rounded-full"
                  height={30}
                  width={30}
                  src={question.user.imageUrl ?? ""}
                />
                <div className="text-left flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 line-clamp-1 text-lg font-medium">
                      {question.question}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {question.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-500 line-clamp-1 text-sm">
                    {question.answer}
                  </p>
                </div>
              </div>
            </SheetTrigger>
          </React.Fragment>
        ))}
      </div>
      {question && (
  <SheetContent className="sm:max-w-[80vw]">
    <SheetHeader>
      <SheetTitle>
        {question.question}
      </SheetTitle>
      <MDEditor.Markdown source={question.answer} />
      <CodeReferences filesReferences={Array.isArray(question.filesReferences) ? question.filesReferences as { fileName: string; sourceCode: string; summary: string; }[] : []} />
    </SheetHeader>
  </SheetContent>
)}
    </Sheet>
  );
}
