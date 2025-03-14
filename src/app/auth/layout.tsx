import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            PM Dashboard
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        {children}
      </main>
      <footer className="border-t bg-background py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PM Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 