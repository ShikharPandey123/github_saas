"use client";
import useUserCredits from "@/app/hooks/use-user-credits";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const BillingPage = () => {
  const queryClient = useQueryClient();
  const { data: user, refetch } = useUserCredits();
  const [creditsToBuy, setCreditsToBuy] = React.useState<number[]>([100]);
  const [isLoading, setIsLoading] = React.useState(false);
  const creditsToBuyAmount = creditsToBuy[0];
  const price = (creditsToBuyAmount / 50).toFixed(2);

  // Refetch credits when component mounts (useful when returning from successful payment)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // If coming back from successful payment, invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userCredits"] });
      refetch();
      toast.success("Credits updated successfully!");
    }
  }, [queryClient, refetch]);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credits: creditsToBuyAmount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create checkout session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Billing</h1>
      <div className="h-2"></div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          You currently have {user?.credits || 0} credits.
        </p>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["userCredits"] });
            refetch();
          }}
        >
          Refresh Credits
        </Button> */}
      </div>
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
      <Button 
        onClick={handlePurchase}
        disabled={isLoading}
      >
        {isLoading ? "Creating checkout..." : `Buy ${creditsToBuyAmount} Credits for $${price}`}
      </Button>
    </div>
  );
};

export default BillingPage;
