# Supabase Setup Guide for Car Racing Game

This guide will help you set up Supabase to enable a shared leaderboard across all players.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up with GitHub
3. Create a new organization (if needed)
4. Create a new project

## Step 2: Create the Database Table

1. In your Supabase dashboard, go to the "Table Editor"
2. Click "Create a new table"
3. Name the table: `leaderboard`
4. Add the following columns:

| Column Name | Type | Default Value | Primary Key | Unique |
|-------------|------|---------------|-------------|---------|
| id | int8 | `gen_random_uuid()` | ✅ Yes | ❌ No |
| player_name | text | null | ❌ No | ❌ No |
| email | text | null | ❌ No | ✅ Yes |
| score | int8 | null | ❌ No | ❌ No |
| created_at | timestamptz | `now()` | ❌ No | ❌ No |

5. **Important**: Make sure to check the "Unique" checkbox for the `email` column
6. Click "Save" to create the table

**Note**: The `email` column must be unique so that each player can only have one score entry. When a player submits a new score:
- If it's higher than their previous score, it will replace the old score
- If it's lower than their previous score, it will be ignored
- This keeps the leaderboard clean with only the best score per player

## Step 3: Get Your Supabase Credentials

1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy your "Project URL" (looks like: `https://your-project-id.supabase.co`)
3. Copy your "anon public" key (starts with `eyJ...`)

## Step 4: Update the Configuration

1. Open `supabase-config.js` in your project
2. Replace `YOUR_SUPABASE_URL` with your Project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your anon public key

Example:
```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Step 5: Set Up Row Level Security (Optional but Recommended)

1. In your Supabase dashboard, go to "Authentication" → "Policies"
2. Click on the `leaderboard` table
3. Click "New Policy"
4. Choose "Create a policy from scratch"
5. Set the following:
   - Policy name: `Enable read access for all users`
   - Target roles: `authenticated` and `anon`
   - Using policy definition: `true`
   - Operation: `SELECT`
6. Click "Review" and then "Save policy"

7. Create another policy for INSERT:
   - Policy name: `Enable insert for all users`
   - Target roles: `authenticated` and `anon`
   - Using policy definition: `true`
   - Operation: `INSERT`
8. Click "Review" and then "Save policy"

## Step 6: Test Your Setup

1. Start your local server: `python3 -m http.server 8000`
2. Open `http://localhost:8000` in your browser
3. Play the game and submit a score
4. Check the leaderboard to see if your score appears
5. Check your Supabase dashboard → Table Editor → leaderboard to see the data

## Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure you're running the game from a web server (not just opening the HTML file)
2. **Authentication Error**: Check that your Supabase URL and anon key are correct
3. **Policy Error**: Make sure you've set up the RLS policies correctly
4. **Network Error**: Check your internet connection and Supabase project status

### Debug Tips:

1. Open browser developer tools (F12)
2. Check the Console tab for error messages
3. Check the Network tab to see if API calls are being made
4. Verify your Supabase credentials in the browser console

## Security Notes

- The anon key is safe to use in client-side code
- Row Level Security (RLS) policies protect your data
- Consider implementing rate limiting for production use
- The email addresses are stored but partially masked in the leaderboard display

## Next Steps

Once Supabase is working:
1. Deploy your game to GitHub Pages or another hosting service
2. Share the game URL with others to test the shared leaderboard
3. Consider adding real-time updates using Supabase subscriptions
4. Add more features like player profiles, achievements, etc. 