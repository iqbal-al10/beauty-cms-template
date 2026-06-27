'use client'

interface ShareButtonProps {
  title: string
  text: string
  url: string
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
    >
      📤 Share
    </button>
  )
}
