import { createClient } from "@supabase/supabase-js";



export const supabase = createClient(
  "https://hanshgjcfnchcvyhagkf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhbnNoZ2pjZm5jaGN2eWhhZ2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMjU3MzksImV4cCI6MjA1NTgwMTczOX0.7y4GrwN7OzLNu0Yf1INFSLJYaewBo9QN8uzbce9fjUM"
);
