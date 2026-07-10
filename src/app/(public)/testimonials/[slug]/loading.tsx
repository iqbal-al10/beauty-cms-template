export default function TestimonialDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-4 bg-gray-200 rounded w-48 mb-6 animate-pulse" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded w-48" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  )
}