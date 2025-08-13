import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import JoinProjectClient from "./join-project-client";

type Props = {
  params: Promise<{ projectId: string }>;
};

const JoinHandler = async (props: Props) => {
  const { projectId } = await props.params;
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");
  
  const dbUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  
  if (!dbUser) {
    await prisma.user.create({
      data: {
        id: userId,
        emailAddress: user.emailAddresses[0]!.emailAddress,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }
  
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      name: true,
    },
  });
  
  if (!project) return redirect("/dashboard");
  
  try {
    await prisma.userToProject.create({
      data: {
        userId,
        projectId,
      },
    });
  } catch (error) {
    console.log("user already in project", error);
  }
  
  // Pass the project data to the client component for handling
  return <JoinProjectClient projectId={projectId} projectName={project.name} />;
};

export default JoinHandler;
