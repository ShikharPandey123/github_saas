"use client";
import useUserCredits from "@/app/hooks/use-user-credits";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { createCheckoutSession } from "@/lib/stripe";
import { Info } from "lucide-react";
import React from "react";

const BillingPage = () => {
  const { data: credits } = useUserCredits();
  const [creditsToBuy, setCreditsToBuy] = React.useState<number[]>([100]);
  const creditsToBuyAmount = creditsToBuy[0];
  const price = (creditsToBuyAmount / 50).toFixed(2);

  return (
    <div>
      <h1 className="text-xl font-semibold">Billing</h1>
      <div className="h-2"></div>
      <p className="text-sm text-gray-500">
        You currently have {credits?.credits || 0} credits.
      </p>
      <div className="h-2"></div>
      <div className="space-y-2 bg-blue-50 px-4 py-2 rounded-md border border-blue-200 text-blue-700">
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <p className="text-sm font-semibold">
            1 credit allows you to index 1 file in a repository.
          </p>
        </div>
        <p className="text-sm">
          E.g. If your project has 100 files, you will need 100 credits to index
          it.
        </p>
      </div>
      <div className="h-4"></div>
      <Slider
        defaultValue={[100]}
        max={1000}
        min={10}
        step={10}
        onValueChange={(value) => setCreditsToBuy(value)}
        value={creditsToBuy}
      />
      <div className="h-4"></div>
      <Button onClick = {()=>{
        createCheckoutSession(creditsToBuyAmount);
      }}>
        Buy {creditsToBuyAmount} Credits for ${price}
      </Button>
    </div>
  );
};

export default BillingPage;
