// Supabase configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

// Replace these with your actual Supabase URL and anon key
const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Leaderboard functions
export const leaderboardAPI = {
    // Get top scores
    async getTopScores(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false })
                .limit(limit)
            
            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
            return []
        }
    },

    // Add new score
    async addScore(playerName, email, score) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .insert([
                    {
                        player_name: playerName,
                        email: email,
                        score: score,
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
            
            if (error) throw error
            return data?.[0] || null
        } catch (error) {
            console.error('Error adding score:', error)
            return null
        }
    },

    // Get player's best score
    async getPlayerBestScore(email) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('score')
                .eq('email', email)
                .order('score', { ascending: false })
                .limit(1)
            
            if (error) throw error
            return data?.[0]?.score || 0
        } catch (error) {
            console.error('Error fetching player score:', error)
            return 0
        }
    }
} 