import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://rsvvnsbxqddjsygmhpus.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdnZuc2J4cWRkanN5Z21ocHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDEyMDksImV4cCI6MjA3MTI3NzIwOX0.uITTfDq0jptz1o162tSCoft-MxkjbAJQ-3DnUhARACQ";

window.supabase = createClient(supabaseUrl, supabaseKey);
