import { Octokit } from '@octokit/rest';

const getFileCount = async (path: string, octokit: Octokit, githubOwner: string, githubRepo: string, acc: number = 0) => {
  try {
    console.log("getFileCount called with:", { path, githubOwner, githubRepo, acc });
    
    const { data } = await octokit.rest.repos.getContent({
      owner: githubOwner,
      repo: githubRepo,
      path
    });
    
    console.log("GitHub API response type:", Array.isArray(data) ? "array" : typeof data);
    
    if (!Array.isArray(data) && data.type === "file") {
      return acc + 1;
    }
    
    if (Array.isArray(data)) {
      let fileCount = 0;
      const directories: string[] = [];
      
      for (const item of data) {
        if (item.type === "dir") {
          directories.push(item.path);
        } else {
          fileCount++;
        }
      }
      
      if (directories.length > 0) {
        // Limit the number of directories to prevent rate limiting
        const limitedDirectories = directories.slice(0, 10); // Only check first 10 directories
        console.log(`Processing ${limitedDirectories.length} out of ${directories.length} directories`);
        
        const directoryCounts = await Promise.all(
          limitedDirectories.map(dirPath => getFileCount(dirPath, octokit, githubOwner, githubRepo, 0))
        );
        fileCount += directoryCounts.reduce((acc, count) => acc + count, 0);
        
        // If we skipped directories, add an estimated count
        if (directories.length > 10) {
          const avgFilesPerDir = fileCount / limitedDirectories.length || 1;
          const estimatedRemainingFiles = (directories.length - 10) * avgFilesPerDir;
          fileCount += Math.round(estimatedRemainingFiles);
          console.log(`Estimated additional files from remaining directories: ${Math.round(estimatedRemainingFiles)}`);
        }
      }
      
      return acc + fileCount;
    }
    return acc;
  } catch (error: unknown) {
    console.error("Error in getFileCount:", error);
    
    // Handle rate limit errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please provide a GitHub token for higher limits.');
    }
    
    // Handle other GitHub API errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      throw new Error('Repository not found or not accessible.');
    }
    
    throw error;
  }
}

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
  try {
    console.log("checkCredits called with:", { githubUrl, hasToken: !!githubToken });
    
    const octokit = new Octokit({ auth: githubToken });
    
    // Clean and parse the GitHub URL
    const cleanUrl = githubUrl.replace(/\.git$/, '').replace(/\/$/, '');
    const urlParts = cleanUrl.split('/');
    const githubOwner = urlParts[3];
    const githubRepo = urlParts[4];
    
    console.log("Parsed GitHub URL:", { githubOwner, githubRepo, urlParts });
    
    if (!githubOwner || !githubRepo) {
      console.error("Invalid GitHub URL format");
      return 0;
    }
    
    console.log("Calling getFileCount...");
    const fileCount = await getFileCount('', octokit, githubOwner, githubRepo, 0);
    console.log("File count result:", fileCount);
    
    return fileCount;
  } catch (error) {
    console.error("Error in checkCredits:", error);
    throw error;
  }
}
