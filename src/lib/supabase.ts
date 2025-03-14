import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// For client components
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key are required')
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// For server components
export const createServerClientFromCookies = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key are required')
  }
  
  // Import cookies only when this function is called in a server context
  const { cookies } = require('next/headers')
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookies().set(name, value, options)
        },
        remove(name: string, options: any) {
          cookies().set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )
}

// For API routes
export const createServerClientFromRequest = (request: Request, response: Response) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key are required')
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          const cookies = request.headers.get('cookie') || ''
          const cookie = cookies
            .split(';')
            .find((c) => c.trim().startsWith(`${name}=`))
          
          if (!cookie) return undefined
          return cookie.split('=')[1]
        },
        set(name: string, value: string, options: any) {
          // API Routes: response needs to be updated to include the set-cookie header
          if (response && typeof response.headers?.set === 'function') {
            const cookieValue = `${name}=${value}; Path=/; ${options.maxAge ? `Max-Age=${options.maxAge}; ` : ''}${options.httpOnly ? 'HttpOnly; ' : ''}${options.secure ? 'Secure; ' : ''}${options.sameSite ? `SameSite=${options.sameSite}; ` : ''}`
            response.headers.set('Set-Cookie', cookieValue)
          }
        },
        remove(name: string, options: any) {
          if (response && typeof response.headers?.set === 'function') {
            response.headers.set(
              'Set-Cookie',
              `${name}=; Path=/; Max-Age=0; ${options.httpOnly ? 'HttpOnly; ' : ''}${options.secure ? 'Secure; ' : ''}${options.sameSite ? `SameSite=${options.sameSite}; ` : ''}`
            )
          }
        },
      },
    }
  )
}

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          job_title: string | null
          email: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          job_title?: string | null
          email: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          job_title?: string | null
          email?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          industry: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          industry?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          industry?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'manager' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'manager' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'manager' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          company_id: string
          email: string
          role: 'admin' | 'manager' | 'member'
          token: string
          invited_by: string
          status: 'pending' | 'accepted' | 'expired' | 'canceled'
          created_at: string
          expires_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          role: 'admin' | 'manager' | 'member'
          token: string
          invited_by: string
          status: 'pending' | 'accepted' | 'expired' | 'canceled'
          created_at?: string
          expires_at: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          role?: 'admin' | 'manager' | 'member'
          token?: string
          invited_by?: string
          status?: 'pending' | 'accepted' | 'expired' | 'canceled'
          created_at?: string
          expires_at?: string
          updated_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string | null
          is_group: boolean
          company_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          is_group?: boolean
          company_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          is_group?: boolean
          company_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_room_members: {
        Row: {
          id: string
          chat_room_id: string
          user_id: string
          last_read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          user_id: string
          last_read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          user_id?: string
          last_read_at?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_room_id: string
          sender_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          sender_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          sender_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Add more table types as needed
    }
  }
} 