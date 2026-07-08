import { Suspense } from 'react'
import ErrorContent from './ErrorContent'

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}