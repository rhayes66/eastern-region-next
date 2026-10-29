import ApplyForm from "@/components/ApplyForm";

export const metadata = {
  title: "Apply for membership — GERAF",
};

export default function ApplyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold text-green-700 dark:text-green-500">
        Membership application
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Fill in your details below. Fields marked with{" "}
        <span className="text-red-600">*</span> are required. Your application
        will be reviewed by an administrator.
      </p>
      <div className="mt-8">
        <ApplyForm />
      </div>
    </main>
  );
}
