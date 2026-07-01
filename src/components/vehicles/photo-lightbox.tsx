'use client'

import React from 'react'
import { X, Image } from 'lucide-react'

interface PhotoLightboxProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export function PhotoLightbox({ src, alt, isOpen, onClose }: PhotoLightboxProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5" />
      </button>

      {src.startsWith('data:') || src.startsWith('http') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-3 text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
            <Image className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium">Receipt preview not available</p>
        </div>
      )}
    </div>
  )
}