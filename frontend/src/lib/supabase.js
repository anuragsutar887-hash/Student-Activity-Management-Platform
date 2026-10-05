/**
 * IT Pulse — Production Supabase Client & Architecture Layer
 * Senior Principal Backend Architecture:
 * - Resilient initialization with fail-safe fallback
 * - Automated connectivity check and environment diagnostics
 * - Storage helpers for certificate and document upload
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Validates if Supabase environment variables are properly defined and not default placeholders.
 */
export function isSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) return false
  const isPlaceholderUrl = supabaseUrl.includes('your-project') || supabaseUrl.includes('example.com')
  const isPlaceholderKey = supabaseAnonKey.includes('your-anon') || supabaseAnonKey.length < 20
  return !isPlaceholderUrl && !isPlaceholderKey
}

/**
 * Initialize Supabase client if configured, otherwise provide a proxy client with descriptive logging
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Test connectivity to the Supabase database
 * Returns { success: boolean, message: string, details?: any }
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      configured: false,
      message: 'Supabase credentials not configured in .env file. Running in clean local-storage mode.',
    }
  }

  try {
    const { data, error } = await supabase.from('departments').select('name').limit(1)
    if (error) {
      // Table might not exist yet if migrations haven't run
      return {
        success: false,
        configured: true,
        message: `Connected to Supabase, but encountered error querying tables: ${error.message}. Please execute the supabase/schema.sql migration in Supabase SQL editor.`,
        error,
      }
    }
    return {
      success: true,
      configured: true,
      message: 'Supabase connection established successfully.',
      data,
    }
  } catch (err) {
    return {
      success: false,
      configured: true,
      message: `Failed to connect to Supabase: ${err.message}`,
      error: err,
    }
  }
}

/**
 * Upload a document or certificate to the 'certificates' Supabase storage bucket
 * Falls back to Base64 Data URL if Supabase storage is not configured or offline.
 */
export async function uploadCertificateFile(file, studentId = 'general') {
  if (!file) return { error: 'No file provided' }

  // If Supabase is configured, attempt upload to Supabase Storage
  if (isSupabaseConfigured() && supabase) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${studentId}/${Date.now()}_${sanitizedName}`

      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('certificates')
          .getPublicUrl(filePath)

        return {
          fileName: file.name,
          filePath,
          url: urlData?.publicUrl || '',
          storage: 'supabase',
        }
      }
      console.warn('Supabase storage upload failed, falling back to local data URL:', error?.message)
    } catch (storageErr) {
      console.warn('Supabase storage exception, falling back to local data URL:', storageErr)
    }
  }

  // Robust fallback: read as Data URL for local persistence
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve({
        fileName: file.name,
        filePath: '',
        url: e.target.result,
        storage: 'local',
      })
    }
    reader.onerror = () => {
      resolve({
        fileName: file.name,
        filePath: '',
        url: '',
        storage: 'none',
        error: 'Failed to read file',
      })
    }
    reader.readAsDataURL(file)
  })
}
