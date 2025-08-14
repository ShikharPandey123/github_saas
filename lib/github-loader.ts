import  {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents';
import { generateEmbedding, summariseCode } from './gemini';
import { prisma } from './prisma';
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
        const directoryCounts = await Promise.all(
          directories.map(dirPath => getFileCount(dirPath, octokit, githubOwner, githubRepo, 0))
        );
        fileCount += directoryCounts.reduce((acc, count) => acc + count, 0);
      }
      
      return acc + fileCount;
    }
    return acc;
  } catch (error) {
    console.error("Error in getFileCount:", error);
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

export const loadGithubRepo = async (githubUrl:string,githubToken?:string) => {
  const loader = new GithubRepoLoader(githubUrl,{
    accessToken: githubToken || '',
    branch: 'main',
    ignoreFiles:['package-lock.json','yarn.lock','pnpm-lock.yaml'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5
  });
  const docs = await loader.load();
  return docs;
}
// console.log(await loadGithubRepo('https://github.com/ShikharPandey123/github_saas'))

export const indexGithubRepo = async (projectId:string, githubUrl:string, githubToken?:string) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);
  await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
    console.log(`processing ${index} of ${allEmbeddings.length}`)
    if(!embedding)return
    const sourceCodeEmbedding = await prisma.sourceCodeEmbedding.create({
      data: {
        projectId,
        summary: embedding.summary,
        sourceCode: embedding.sourceCode,
        fileName: embedding.fileName
      }
    });
    await prisma.$executeRaw`
    UPDATE "SourceCodeEmbedding"
    SET "summaryEmbedding" = ${embedding.embedding}::vector
    WHERE "id" = ${sourceCodeEmbedding.id}
    `
  }));
}

const generateEmbeddings = async (docs: Document[]) => {
  // Generate embeddings for the documents
  return await Promise.all(docs.map(async doc =>{
    const summary = await summariseCode(doc)
    const embedding = await generateEmbedding(summary)
    return{
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
    }
  }));
}