import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
// import React from "react";
import { redirect } from "next/navigation";

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
  return redirect(`/dashboard/${projectId}`);
};

export default JoinHandler;
