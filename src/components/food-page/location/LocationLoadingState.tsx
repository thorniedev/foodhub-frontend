export default function LocationLoadingState() {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(340px,42%)_minmax(0,58%)]">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[220px] animate-pulse rounded-[24px] bg-gray-100"
          />
        ))}
      </div>

      <div className="hidden h-[680px] animate-pulse rounded-[26px] bg-gray-100 2xl:block" />
    </div>
  );
}
