// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { useLocalStorage } from "usehooks-ts";
// import axios from "axios";

// type Project = {
//   id: string;
//   name: string;
//   githubUrl: string;
// };

// const useProject = () => {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [projectId, setProjectId] = useLocalStorage<string | null>(
//     "commitly-projectId",
//     null
//   );

//    const fetchProjects = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("/api/project");
//       setProjects(res.data);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch projects");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchProjects();
//   }, [fetchProjects]);


//   const project = projects.find((p) => p.id === projectId) || null;
//   return {  
//     projects,
//     project,
//     projectId,
//     setProjectId,
//     loading,
//     error,
//     refetchProjects: fetchProjects 
// };
// };

// export default useProject;
'use client'

import { useQuery} from '@tanstack/react-query';
import axios from 'axios';
import { useLocalStorage } from 'usehooks-ts';

type Project = {
  id: string;
  name: string;
  githubUrl: string;
};

const fetchProjects = async (): Promise<Project[]> => {
  const { data } = await axios.get('/api/project');
  return data;
};

const useProject = () => {
//   const queryClient = useQueryClient();
  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Project[], Error>({
  queryKey: ['projects'],
  queryFn: fetchProjects,
});

  const [projectId, setProjectId] = useLocalStorage<string | null>(
    'commitly-projectId',
    null
  );
  const project = projects.find((p) => p.id === projectId) || null;
  const refetchProjects = async () => {
    await refetch();
  };

  return {
    projects,
    project,
    projectId,
    setProjectId,
    loading: isLoading,
    error,
    refetchProjects,
  };
};

export default useProject;

