export default function CommandCenterTabs({ result, loading, error, trace }: any) {
  // Skeleton, error, and tab logic will be implemented after report structure is finalized
  return (
    <div>
      {/* Skeleton UI */}
      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/2 mx-auto" />
          <div className="h-40 bg-zinc-800 rounded" />
        </div>
      )}
      {/* Error State */}
      {error && (
        <div className="bg-red-900 text-red-200 rounded-lg p-4 text-center font-bold">{error}</div>
      )}
      {/* Main Report */}
      {result && (
        <div>
          {/* Tabs and report will be implemented here */}
          <pre className="bg-zinc-950 rounded-xl p-4 text-xs text-zinc-400 overflow-x-auto mt-4">{JSON.stringify(result, null, 2)}</pre>
          {trace && trace.length > 0 && (
            <div className="mt-4 text-xs text-zinc-500 text-center">Trace: {trace.join(" → ")}</div>
          )}
        </div>
      )}
    </div>
  );
}
