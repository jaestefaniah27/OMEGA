-- Enable Realtime for Profiles
alter publication supabase_realtime add table profiles;

-- Set replica identity to full to ensure all columns are available in changes
alter table profiles replica identity full;
