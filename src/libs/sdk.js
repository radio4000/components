import {createClient} from '@supabase/supabase-js'
import {createSdk} from '@radio4000/sdk'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY
export const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const sdk = createSdk(supabase)
