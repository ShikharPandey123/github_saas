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

