export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-12 w-12 animate-ping rounded-full bg-[var(--gradient-start)] opacity-10" />
        <div className="absolute h-8 w-8 animate-ping rounded-full bg-[var(--gradient-mid)] opacity-10" style={{ animationDelay: "0.3s" }} />
        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)]" />
      </div>
    </div>
  );
}
