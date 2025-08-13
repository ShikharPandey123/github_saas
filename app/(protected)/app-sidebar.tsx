'use client'

import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import useProject from '@/app/hooks/use-project';
// import { useEffect, useState } from "react"

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Q&A",
        url: "/qa",
        icon: Bot
    },
    {
        title: "Meetings",
        url: "/meetings",
        icon: Presentation
    },
    {
        title: "Billing",
        url: "/billing",
        icon: CreditCard
    }
]

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
   const { projects = [], projectId, setProjectId } = useProject();

    const handleProjectClick = (selectedProjectId: string) => {
        setProjectId(selectedProjectId);
        router.push('/dashboard');
    };

    return (
       <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Image src='/logo.png' alt='Logo' width={32} height={32} />
                    <h1 className="text-xl font-bold text-primary/80">Commitly</h1>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        {items.map(item => {
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className={cn({
                                            '!bg-primary !text-white':pathname===item.url
                                        },'list-none')}>
                                            <item.icon/>
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        {projects.map(project => {
                            return (
                                <SidebarMenuItem key={project.id}>
                                    <SidebarMenuButton asChild>
                                        <div 
                                            onClick={() => handleProjectClick(project.id)}
                                            className="cursor-pointer"
                                        >
                                            <div className={cn(
                                                'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                                                {
                                                    'bg-primary text-white': project.id === projectId
                                                }
                                            )}>
                                                {project.name[0]}
                                            </div>
                                            <span className="ml-2">{project.name}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/create">
                                    <Button size="sm" variant={"outline"} className="w-full">
                                        <Plus/>
                                        Create Project
                                    </Button>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
       </Sidebar>
    )
}

