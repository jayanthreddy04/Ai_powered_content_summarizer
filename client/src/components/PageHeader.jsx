export default function PageHeader({ title, description, icon: Icon }) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}
