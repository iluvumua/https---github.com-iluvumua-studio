import { LoginForm } from "@/components/login-form";
import { Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary/50" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-8 flex items-center gap-3 text-foreground">
          <Zap className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">
            EnerTrack Sousse
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
