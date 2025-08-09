'use client'

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react";

type Project = {
  id: string;
  name: string;
  githubUrl: string;
};

const fetchProjects = async (): Promise<Project[]> => {
  const { data } = await axios.get('/api/project');
  return data;
};

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
    const open = useSidebar();
    const { data: projects = []} = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
});
    const [projectId, setProjectId] = useState<string | null>(null);

    const projectList = projects || [];

    return (
       <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Image src='/logo.png' alt='Logo' width={32} height={32} />
                    {open && (
                        <h1 className="text-xl font-bold text-primary/80">Commitly</h1>
                    )}  
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
                        {projectList.map(project => {
                            return (
                                <SidebarMenuItem key={project.id}>
                                    <SidebarMenuButton asChild>
                                        <div onClick={() => setProjectId(project.id)}>
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
                            {open && <SidebarMenuItem>
                                <Link href="/create">
                                    <Button size="sm" variant={"outline"} className="w-fit">
                                        <Plus/>
                                        Create Project
                                    </Button>
                                </Link>
                            </SidebarMenuItem>}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
       </Sidebar>
    )
}
