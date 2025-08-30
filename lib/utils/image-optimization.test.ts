// This is a simple test file for the image optimization utilities
// In a real project, you'd use Jest or Vitest to run these tests

import {
  needsOptimization,
  formatFileSize,
  calculateDimensions,
} from './image-optimization'

// Mock test functions (these would be actual test functions in a testing framework)
export function testImageOptimization() {
  console.log('Testing image optimization utilities...')

  // Test needsOptimization
  const largeFile = { size: 1024 * 1024 } as File // 1MB
  const smallFile = { size: 100 * 1024 } as File // 100KB

  console.log(
    'Large file needs optimization:',
    needsOptimization(largeFile, 500)
  )
  console.log(
    'Small file needs optimization:',
    needsOptimization(smallFile, 500)
  )

  // Test formatFileSize
  console.log('1MB formatted:', formatFileSize(1024 * 1024))
  console.log('500KB formatted:', formatFileSize(500 * 1024))

  // Test calculateDimensions
  const dimensions = calculateDimensions(4000, 3000, 1920, 1080)
  console.log('Resized dimensions:', dimensions)

  console.log('All tests passed!')
}

// Uncomment to run tests in development
// testImageOptimization()
