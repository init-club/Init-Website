import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lmplfztarjabtujxbcow.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcGxmenRhcmphYnR1anhiY293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNzMyMTksImV4cCI6MjA4Mjc0OTIxOX0.c3YPU5wmnAwiGw_GKrvZLhTieRmRlMTI2C0S4IJNIqM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)