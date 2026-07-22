export function Logo() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
      <div className="h-3.5 w-3.5 rounded-full bg-primary-foreground" />
      <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
    </div>
  );
}
