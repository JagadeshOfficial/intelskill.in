"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Users, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuickSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={cn(
                "fixed left-0 top-24 z-50 flex flex-col gap-2 rounded-r-xl border-y border-r bg-background/95 shadow-md backdrop-blur transition-all duration-500 ease-in-out",
                isOpen ? "w-48 p-4 translate-x-0" : "w-10 p-1 -translate-x-0"
            )}
        >
            {/* Trigger */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={cn("h-8 w-8", isOpen ? "self-end mb-2" : "mx-auto")}
            >
                {isOpen ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>

            {/* Content */}
            <div className={cn("flex flex-col gap-4", !isOpen && "items-center")}>

                {/* Community Link */}
                <Link href="/forum" className="group flex items-center gap-3 rounded-lg p-1 hover:bg-muted transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                        <Users className="h-4 w-4" />
                    </div>
                    {isOpen && (
                        <span className="text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                            Community
                        </span>
                    )}
                </Link>

                {/* Chat App Link */}
                <Link href="/messages" className="group flex items-center gap-3 rounded-lg p-1 hover:bg-muted transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 transition-transform group-hover:scale-110">
                        <MessageCircle className="h-4 w-4" />
                    </div>
                    {isOpen && (
                        <span className="text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                            Chat App
                        </span>
                    )}
                </Link>

            </div>
        </div>
    );
}
