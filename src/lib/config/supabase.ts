import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
	'https://rpqnyshfebidgpbvpouf.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwcW55c2hmZWJpZGdwYnZwb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMjM0NjIsImV4cCI6MjA1NDY5OTQ2Mn0.cpFQukkL90FfapRo5Aff5IAVTRi0GxnyPYWjAN1Sd6A'
);

export const tableName = 'book_locations';
