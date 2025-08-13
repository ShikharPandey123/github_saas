"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProject from "@/app/hooks/use-project";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = React.useState(false);
  
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Ask them to copy and past this link
          </p>
          <Input
            className="mt-4"
            readOnly
            onClick={()=>{
                navigator.clipboard.writeText(`${window.location.origin}/join/${projectId}`);
                toast.success("Invite link copied to clipboard!");
            }}
            value={`${window.location.origin}/join/${projectId}`}
          />
        </DialogContent>
      </Dialog>
      <Button size='sm' onClick={() => setOpen(true)}>Invite Team Members</Button>
    </>
  );
};

export default InviteButton;
