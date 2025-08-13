import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "User must be authenticated" },
        { status: 401 }
      );
    }

    const { credits } = await request.json();

    if (!credits || credits < 1) {
      return NextResponse.json(
        { error: "Invalid credits amount" },
        { status: 400 }
      );
    }

    // Get the base URL from the request or fallback to environment variable
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    // Ensure the base URL has a protocol
    const normalizedBaseUrl = baseUrl.startsWith('http') 
      ? baseUrl 
      : `https://${baseUrl}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${credits} Commitly Credits`,
            },
            unit_amount: Math.round((credits / 50) * 100),
          },
          quantity: 1,
        },
      ],
      customer_creation: "always",
      mode: "payment",
      success_url: `${normalizedBaseUrl}/billing?success=true`,
      cancel_url: `${normalizedBaseUrl}/billing`,
      client_reference_id: userId.toString(),
      metadata: {
        credits,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
