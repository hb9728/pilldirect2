// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fhsusnyaxrmmfypmwbir.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoc3VzbnlheHJtbWZ5cG13YmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mzg4NTYsImV4cCI6MjA2NTUxNDg1Nn0.h_IrnWwnPQn_fy_7nqsx8Ap4_ZaUHqXn5aaCw8dgICo'

export const supabase = createClient(supabaseUrl, supabaseKey)
