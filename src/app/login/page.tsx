import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Log in — GERAF" };

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
        Member login
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Sign in to view your contributions, benefits and events.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
