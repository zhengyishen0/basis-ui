import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.SUPABASE_URL || "https://wiqivthmlgjwtlrnynsq.supabase.co";
const supabaseKey =
  import.meta.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcWl2dGhtbGdqd3Rscm55bnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTY1MDgsImV4cCI6MjA2ODEzMjUwOH0.1Nh6nIbXolEkrpSFYzF-l3LqYmkQw0d4xzdi1xoez9M";

export const supabase = createClient(supabaseUrl, supabaseKey);
