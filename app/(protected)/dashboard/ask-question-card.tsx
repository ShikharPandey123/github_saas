"use client";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/app/hooks/use-project";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { askQuestion } from "./actions";
import { readStreamableValue } from "@ai-sdk/rsc";
import CodeReferences from "./code-references";
import useAnswers from "@/app/hooks/use-answers";
import { toast } from "sonner";
import useRefetch from "@/app/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = useProject();
  const saveAnswer = useAnswers();
  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [filesReferences, setFilesReferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");

  const onSubmit = async (e: React.FormEvent) => {
    setAnswer("");
    setFilesReferences([]);
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);
    const { output, filesReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFilesReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }

    setLoading(false);
  };
  const refetch = useRefetch();

  const onSaveAnswer = () => {
    if (!project?.id || !answer.trim() || !question.trim()) return;
    saveAnswer.mutate({
      projectId: project.id,
      question,
      answer,
      fileReferences: filesReferences,
    },{
      onSuccess: () => {
        toast.success("Answer saved successfully");
        refetch();
      },
      onError: () => {
        toast.error("Error saving answer");
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-[90vw] sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <DialogTitle className="flex items-center gap-2">
                <Image src="/logo.png" alt="Commitly" width={40} height={40} />
                <span className="hidden sm:inline">Ask Commitly</span>
              </DialogTitle>
              <Button disabled={saveAnswer.isPending} variant={"outline"} onClick={onSaveAnswer} className="w-full sm:w-auto">
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <MDEditor.Markdown
              source={answer}
              className="w-full max-h-[40vh] overflow-auto text-sm"
            />
            <CodeReferences filesReferences={filesReferences} />
          </div>
          <Button type="button" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Card className="relative lg:col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mb-4"
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask Commitly!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};
export default AskQuestionCard;
