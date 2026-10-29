import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata = { title: "Forgot password — GERAF" };

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
        Forgot your password?
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
