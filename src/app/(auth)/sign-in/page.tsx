"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { Chrome } from "lucide-react";
import Image from "next/image";

const Page = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-16 md:py-32">
      <div className="flex flex-row justify-center items-center gap-x-2">
        <h1 className="text-3xl font-extrabold text-foreground">
          Welcome to Super Ask
        </h1>
      </div>

      <p className="mt-2 text-lg text-muted-foreground font-semibold">
        Sign in below (we'll increase your message limits if you do 😉)
      </p>

      <Button
        variant={"default"}
        className={
          "max-w-sm mt-5 w-full px-7 py-7 flex flex-row justify-center items-center cursor-pointer"
        }
        onClick={() =>
          signIn.social({
            provider: "google",
            callbackURL: "/",
          })
        }
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        <span className="font-bold ml-2">Sign in with Google</span>
      </Button>
    </section>
  );
};

export default Page;
