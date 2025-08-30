'use client'

import { useState, useRef, useEffect } from 'react'
import { PHOTO_CATEGORIES, PhotoCategory } from '@/lib/types/database'
import { ChevronDown } from 'lucide-react'

interface PhotoCategoryMenuProps {
  currentCategory: PhotoCategory
  onCategoryChange: (category: PhotoCategory) => void
}

export default function PhotoCategoryMenu({
  currentCategory,
  onCategoryChange,
}: PhotoCategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newState = !isOpen
    setIsOpen(newState)
  }

  const handleCategorySelect = (
    category: PhotoCategory,
    e: React.MouseEvent
  ) => {
    e.preventDefault()
    e.stopPropagation()

    onCategoryChange(category)
    setIsOpen(false)
  }

  return (
    <div className='relative' ref={menuRef}>
      {/* Category Button */}
      <button
        onClick={handleToggle}
        type='button'
        className='inline-flex items-center px-3 py-1.5 border border-input shadow-sm text-xs font-medium rounded-md text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring cursor-pointer'
      >
        <span className='capitalize'>{currentCategory}</span>
        <ChevronDown
          className={`ml-1.5 h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center'>
          <div className='bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 border border-border relative overflow-hidden'>
            <div className='bg-white relative z-10'>
              <h3 className='text-lg font-medium mb-4 text-gray-900'>
                Select Category
              </h3>
              <div className='space-y-2 max-h-64 overflow-y-auto bg-white'>
                {PHOTO_CATEGORIES.map(category => (
                  <button
                    key={category}
                    type='button'
                    onClick={e => handleCategorySelect(category, e)}
                    className={`block w-full text-left px-4 py-3 text-sm rounded-md hover:bg-gray-100 cursor-pointer transition-colors bg-white ${
                      currentCategory === category
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className='capitalize'>{category}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='mt-6 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
