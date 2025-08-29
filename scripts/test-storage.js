// Test script to debug storage upload issues
// Run this in your browser console or as a Node.js script

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testStorageAccess() {
  console.log('Testing storage access...')
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('User:', user)
  console.log('Auth error:', authError)
  
  if (!user) {
    console.log('❌ User not authenticated')
    return
  }
  
  console.log('✅ User authenticated:', user.id)
  
  // Test bucket access
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  console.log('Buckets:', buckets)
  console.log('Bucket error:', bucketError)
  
  // Test listing files in car-photos bucket
  const { data: files, error: listError } = await supabase.storage
    .from('car-photos')
    .list('', { limit: 10 })
  console.log('Files in car-photos:', files)
  console.log('List error:', listError)
}

testStorageAccess()
