import {createClient} from '@supabase/supabase-js'
import {createSdk} from '@radio4000/sdk'

// Hard-coded access to the "migration-test" project on Supabase.
const key =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaHdzeGJzamx6Yml3cmVyYXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg1NzE4MjUsImV4cCI6MjAxNDE0NzgyNX0.utV_0mI-k-EcTPlwMFHhNxB0nlvOY-Srx05Mr7EHJcQ'
const url = 'https://tqhwsxbsjlzbiwreratc.supabase.co'
const supabase = createClient(url, key)

export const sdk = createSdk(supabase)
