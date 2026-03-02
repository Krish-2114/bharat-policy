import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-7xl mx-auto px-8 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-gray-400">
          Monitor system performance and policy updates across all sectors.
        </p>
      </div>
      <DashboardOverview />
    </div>
  );
}
