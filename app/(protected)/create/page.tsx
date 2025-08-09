"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useForm } from 'react-hook-form'

type FormInput={
    repoURL: string
    projectName: string
    githubToken?: string
}
const CreatePage = () => {
  const {register,handleSubmit,reset}=useForm<FormInput>()
  function onSubmit(data: FormInput) {
    //TODO:convert this to toast 
    window.alert(JSON.stringify(data,null,2))
    return true
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
                    <Input {...register('githubToken', { required: true })} placeholder='Enter your GitHub Token(Optional)'/>
                    <div className='h-2'></div>
                    <div className='h-4'></div>
                    <Button type='submit' >Create Project</Button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default CreatePage
