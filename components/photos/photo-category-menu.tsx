'use client'

import { useState, useRef, useEffect } from 'react'
import { PHOTO_CATEGORIES, PhotoCategory } from '@/lib/types/database'

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
        className='inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer'
      >
        <span className='capitalize'>{currentCategory}</span>
        <svg
          className={`ml-1.5 h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='fixed z-[9999] top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg shadow-xl p-4 max-w-sm w-full mx-4'>
            <h3 className='text-lg font-medium mb-4'>Select Category</h3>
            <div className='space-y-2'>
              {PHOTO_CATEGORIES.map(category => (
                <button
                  key={category}
                  type='button'
                  onClick={e => handleCategorySelect(category, e)}
                  className={`block w-full text-left px-4 py-3 text-sm rounded-md hover:bg-gray-100 ${
                    currentCategory === category
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700'
                  }`}
                >
                  <span className='capitalize'>{category}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className='mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
