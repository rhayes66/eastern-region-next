import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = { title: "Reset password — GERAF" };

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
        Set a new password
      </h1>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
