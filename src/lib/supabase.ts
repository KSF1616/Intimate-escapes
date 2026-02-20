import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://uyppwtvedirsgcshzrwi.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjQxZmFmZjYwLTUyNDMtNDg3NS05ZWM4LWQ4NGY0NDViZGYzNCJ9.eyJwcm9qZWN0SWQiOiJ1eXBwd3R2ZWRpcnNnY3NoenJ3aSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY3NDc4NjE3LCJleHAiOjIwODI4Mzg2MTcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.cfNJjpxx-8cS1L0EzzrUm2to8JNHuCiM1w0GuliSuG8';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };