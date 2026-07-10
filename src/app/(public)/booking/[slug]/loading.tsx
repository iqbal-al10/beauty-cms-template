export default function BookingDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-200 rounded-2xl aspect-square" />

        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-3">
            <div className="h-9 bg-gray-200 rounded w-32" />
            <div className="h-9 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-24" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="flex gap-3">
            <div className="h-12 bg-gray-200 rounded-full flex-1" />
            <div className="h-12 bg-gray-200 rounded-full w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}