require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function initializeSupabase() {
    const fetchModule = await import('node-fetch');
    const fetch = fetchModule.default;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        fetch: fetch,
    });
    return supabase;
}

module.exports = initializeSupabase;