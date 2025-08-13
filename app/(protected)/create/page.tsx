"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import axios from "axios";
import useRefetch from '@/app/hooks/use-refetch'
import useCheckCredits from '@/app/hooks/use-check-credits'
import Image from 'next/image'

type FormInput={
    repoURL: string
    projectName: string
    githubToken?: string
}
const CreatePage = () => {
  const {register,handleSubmit,reset}=useForm<FormInput>()
  const [isLoading, setIsLoading] = useState(false);
  const refetch = useRefetch();
  const { mutate: checkCredits, isPending: isCheckingCredits, data: checkCreditsData } = useCheckCredits();

  async function onSubmit(data: FormInput) {
    // First check if user has enough credits
    if (!checkCreditsData?.fileCount || checkCreditsData.fileCount === 0) {
      toast.error("Please check credits first");
      return;
    }

    if (!checkCreditsData.hasEnoughCredits) {
      toast.error(`Repository has ${checkCreditsData.fileCount} files, but you only have ${checkCreditsData.userCredits} credits.`);
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post("/api/project", {
        name: data.projectName,
        githubUrl: data.repoURL,
        githubToken: data.githubToken || undefined,
      });

      console.log("Project created:", res.data);
      toast.success("Project created successfully!");
      refetch();
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCheckCredits = () => {
    const repoURL = (document.querySelector('input[placeholder="Enter your repository URL"]') as HTMLInputElement)?.value;
    const githubToken = (document.querySelector('input[placeholder="Enter your GitHub Token(Optional)"]') as HTMLInputElement)?.value;

    if (!repoURL) {
      toast.error("Please enter a repository URL first");
      return;
    }

    checkCredits(
      { githubUrl: repoURL, githubToken },
      {
        onSuccess: (data) => {
          if (data.hasEnoughCredits) {
            toast.success(`Repository has ${data.fileCount} files. You have sufficient credits!`);
          } else {
            toast.error(`Repository has ${data.fileCount} files, but you only have ${data.userCredits} credits.`);
          }
        },
        onError: (error) => {
          toast.error("Failed to check credits");
          console.error(error);
        },
      }
    );
  };
  return (
    <div className='flex items-center gap-12 h-full justify-center'>
        <Image src="/undraw-github.png" alt="man coding" className='h-56 w-auto' width={300} height={224} />
        <div>
            <div>
                <h1 className='font-semibold text-2xl'>Link your Github Repository</h1>
                <p className='text-sm text-muted-foreground'>Enter the URL of your Github repository to link it to Commitly</p>
            </div>
            <div className='h-4'></div>
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input {...register('projectName', { required: true })} placeholder='Enter your Project Name'
                    required />
                    <div className='h-2'></div>
                    <Input {...register('repoURL', { required: true })} placeholder='Enter your repository URL'
                    type='url'
                    required />
                    <div className='h-2'></div>
                    <Input {...register('githubToken')} placeholder='Enter your GitHub Token(Optional)'/>
                    <div className='h-2'></div>
                    
                    {/* Check Credits Button */}
                    <Button 
                      type='button' 
                      variant="outline" 
                      onClick={handleCheckCredits}
                      disabled={isCheckingCredits}
                      className="w-full"
                    >
                      {isCheckingCredits ? "Checking..." : "Check Credits Required"}
                    </Button>

                    {/* Display Credit Check Results */}
                    {checkCreditsData && (
                      <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                        <div className="text-sm">
                          <p><strong>Files in repository:</strong> {checkCreditsData.fileCount}</p>
                          <p><strong>Your credits:</strong> {checkCreditsData.userCredits}</p>
                          <p className={checkCreditsData.hasEnoughCredits ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {checkCreditsData.hasEnoughCredits 
                              ? "✅ You have enough credits!" 
                              : "❌ Insufficient credits - Please purchase more credits"
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    <div className='h-4'></div>
                    <Button 
                      type='submit' 
                      disabled={isLoading || !checkCreditsData?.hasEnoughCredits}
                      className="w-full"
                    >
                      {isLoading ? "Creating..." : "Create Project"}
                    </Button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default CreatePage
