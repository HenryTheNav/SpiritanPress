// Copy this file to supabase-config.js and fill in your credentials.
// Keep supabase-config.js out of version control.

window.SUPABASE_CONFIG = {
    url: 'https://cgdokqdqpwmbyybpuexv.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZG9rcWRxcHdtYnl5YnB1ZXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDQyODMsImV4cCI6MjA3NjMyMDI4M30.F-xqL511-WIWsLmYUuOVgFtVZPgJyXwxWymrlIdfI1I'
};

// ✅ Create Supabase client globally
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Optional test log
console.log("✅ Supabase initialized successfully:", supabase);


