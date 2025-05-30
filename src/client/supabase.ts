import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hfpswyaznqbwwhjijfyi.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcHN3eWF6bnFid3doamlqZnlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUyNTI1NCwiZXhwIjoyMDY0MTAxMjU0fQ.z2GUoDTM4oZIU6uJzd-YuqUUZJ3X-SS09g71I89V2_Y"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)