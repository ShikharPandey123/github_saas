import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil"
});

export async function POST(request: Request) {
  console.log("Webhook endpoint hit!");
  const body = await request.text();
  const signature = (await headers()).get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature , process.env.STRIPE_WEBHOOK_SECRET!);
    console.log("Webhook signature verified successfully");
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  console.log("Event type:", event.type);
  console.log("Session object:", JSON.stringify(session, null, 2));
  
  if(event.type === "checkout.session.completed") {
    const credits = Number(session.metadata?.['credits']);
    const userId = session.client_reference_id;
    console.log("Processing payment - Credits:", credits, "UserId:", userId);
    
    if (!credits || !userId) {
      console.error("Missing userId or credits in session:", { credits, userId });
      return NextResponse.json({ error: "Missing userId or credits" }, { status: 400 });
    }
    await prisma.stripeTransaction.create({
      data: {
        userId,
        credits
      }
    });
    console.log("Created Stripe transaction record");
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: credits } }
    });
    console.log("Updated user credits:", updatedUser.credits);
    
    return NextResponse.json({ message: "Credits added successfully" },{status:200});
  }

  return NextResponse.json({ message: "Hello, world!" });
}