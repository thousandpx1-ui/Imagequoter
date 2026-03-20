import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">Lost in the Canvas</h2>
      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        The page you're looking for doesn't exist or has been moved. Let's get you back to creating.
      </p>
      <Link href="/">
        <Button size="lg" className="rounded-xl shadow-lg hover:shadow-xl font-semibold px-8 h-14 text-base">
          Back to Editor
        </Button>
      </Link>
    </div>
  );
}
