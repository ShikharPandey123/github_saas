"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import axios from "axios";
import useRefetch from '@/app/hooks/use-refetch'

type FormInput={
    repoURL: string
    projectName: string
    githubToken?: string
}
const CreatePage = () => {
  const {register,handleSubmit,reset}=useForm<FormInput>()
  const [isLoading, setIsLoading] = useState(false);
  const refetch = useRefetch();
  async function onSubmit(data: FormInput) {
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
    }
    finally {
    setIsLoading(false);
  }
  }
  return (
    <div className='flex items-center gap-12 h-full justify-center'>
        <img src="/undraw-github.png" alt="man coding" className='h-56 w-auto'/>
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
                    <div className='h-4'></div>
                    <Button type='submit' disabled={isLoading}>{isLoading ? "Creating..." : "Create Project"}</Button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default CreatePage
