"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple wrapper around Radix UI Dialog components
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

// Custom simplified dialog content
const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <div className="fixed inset-0 z-50 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "w-full max-w-xl bg-white p-6 shadow-lg sm:w-[90%] md:w-[80%] lg:w-[50%] sm:rounded-lg",
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  )
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
};
