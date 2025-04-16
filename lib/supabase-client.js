import { createClient } from "@supabase/supabase-js"

let supabaseClient

const createSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }
  return supabaseClient
}

export default createSupabaseClient
