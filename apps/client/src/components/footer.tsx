import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-medium text-foreground">Sloth</span>
          <span>· © {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="#" className="transition hover:text-foreground">
            Privacy
          </Link>
          <Link href="#" className="transition hover:text-foreground">
            Terms
          </Link>
          <Link href="#" className="transition hover:text-foreground">
            Twitter
          </Link>
        </div>
      </div>
    </footer>
  );
}
