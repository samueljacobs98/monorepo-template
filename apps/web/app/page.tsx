import { Button } from "@frontend/ui/components/button";

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Your Monorepo is ready!</h1>
          <Button className="mt-2">Start now!</Button>
        </div>
      </div>
    </div>
  );
}
