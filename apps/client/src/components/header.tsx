"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/logo";

export function Header() {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated" && Boolean(session?.user);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">Sloth</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="/#features" className="transition hover:text-foreground">
            Features
          </a>
          <a href="/#how" className="transition hover:text-foreground">
            How it works
          </a>
          <a href="/#preview" className="transition hover:text-foreground">
            Preview
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {status === "loading" ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-secondary" />
          ) : isSignedIn ? (
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat with Sloth
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-elevated"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Connect Drive <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
