"use client";

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import AppSidebar to avoid SSR issues
const AppSidebar = dynamic(() => import('./app-sidebar').then(mod => ({ default: mod.AppSidebar })), {
  ssr: false,
  loading: () => (
    <div className="w-64 bg-sidebar border-r h-screen">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded"></div>
          <div className="w-20 h-4 bg-primary/20 rounded"></div>
        </div>
      </div>
    </div>
  )
})

type Props={
    children: React.ReactNode
}

const SidebarLayout = ({children}: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='flex-1 flex flex-col min-h-screen'>
          <div className='flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4 m-2'>
              <SidebarTrigger className="md:hidden" />
              <div className='ml-auto'></div>
              {isMounted && <UserButton />}
          </div>
          <div className='flex-1 border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-auto mx-2 mb-2 px-4'>
              {children}
          </div>
      </main>
    </SidebarProvider>
  )
}

export default SidebarLayout
