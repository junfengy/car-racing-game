// Supabase configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

// Replace these with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://raqpxhwbcttithpleaxr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcXB4aHdiY3R0aXRocGxlYXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzE5NjksImV4cCI6MjA2NjY0Nzk2OX0.rsYWtDXe8KjN1rxwexjRzTXbsuQHJ1HRzJP8BaP9GbQ'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Rate limiting and security utilities
const rateLimiter = {
    lastSubmission: 0,
    minInterval: 2000, // 2 seconds between submissions
    
    canSubmit() {
        const now = Date.now();
        if (now - this.lastSubmission < this.minInterval) {
            return false;
        }
        this.lastSubmission = now;
        return true;
    }
};

// Input validation
const validators = {
    email(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    },
    
    playerName(name) {
        return name && name.trim().length > 0 && name.length <= 50;
    },
    
    score(score) {
        return typeof score === 'number' && score >= 0 && score <= 999999;
    }
};

// Leaderboard functions
export const leaderboardAPI = {
    // Get top scores
    async getTopScores(limit = 10) {
        try {
            // Validate limit
            const safeLimit = Math.min(Math.max(1, limit), 50); // Max 50 scores
            
            // Get the top scores ordered by score (highest first)
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false })
                .limit(safeLimit)
            
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
            // Rate limiting
            if (!rateLimiter.canSubmit()) {
                throw new Error('Please wait before submitting another score');
            }
            
            // Input validation
            if (!validators.playerName(playerName)) {
                throw new Error('Invalid player name');
            }
            
            if (!validators.email(email)) {
                throw new Error('Invalid email address');
            }
            
            if (!validators.score(score)) {
                throw new Error('Invalid score');
            }
            
            // Sanitize inputs
            const sanitizedName = playerName.trim().substring(0, 50);
            const sanitizedEmail = email.trim().toLowerCase();
            
            // Simply insert the new score (no upsert since anon key typically only allows INSERT)
            const { data, error } = await supabase
                .from('leaderboard')
                .insert([
                    {
                        player_name: sanitizedName,
                        email: sanitizedEmail,
                        score: Math.floor(score),
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
            
            if (error) {
                throw error;
            }
            
            return data?.[0] || null
        } catch (error) {
            console.error('Error adding score:', error)
            throw error; // Re-throw to allow proper error handling
        }
    },

    // Get player's best score
    async getPlayerBestScore(email) {
        try {
            if (!validators.email(email)) {
                return 0;
            }
            
            const { data, error } = await supabase
                .from('leaderboard')
                .select('score')
                .eq('email', email.trim().toLowerCase())
                .order('score', { ascending: false })
                .limit(1)
            
            if (error) throw error
            return data?.[0]?.score || 0
        } catch (error) {
            console.error('Error fetching player score:', error)
            return 0
        }
    },
    
    // Check if connection is working
    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('count')
                .limit(1)
            
            return !error;
        } catch (error) {
            console.error('Connection test failed:', error)
            return false;
        }
    }
} 