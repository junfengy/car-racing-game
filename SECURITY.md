# Security Documentation for Car Racing Game

This document explains the security measures implemented in the Supabase integration for the car racing game.

## 🔐 Security Overview

The game uses Supabase's **anon public key** for client-side operations, which is designed to be safe for public use. Here's why and how we've implemented additional security layers.

## 🛡️ Security Measures

### 1. Supabase Anon Key Security

**Why it's safe:**
- The anon key has **limited permissions** - only what you explicitly allow through RLS policies
- **No admin access** - cannot modify database schemas or access sensitive data
- **Designed for public use** - specifically created for client-side applications
- **Row Level Security (RLS)** - controls what data can be accessed/modified

### 2. Row Level Security (RLS) Policies

Your Supabase database should have these policies:

```sql
-- Allow anyone to read leaderboard data
CREATE POLICY "Enable read access for all users" ON leaderboard
FOR SELECT USING (true);

-- Allow anyone to insert new scores
CREATE POLICY "Enable insert for all users" ON leaderboard
FOR INSERT WITH CHECK (true);
```

### 3. Input Validation & Sanitization

**Email Validation:**
- Regex pattern validation
- Length limit (254 characters max)
- Trimmed and converted to lowercase

**Player Name Validation:**
- Required field
- Length limit (50 characters max)
- Trimmed whitespace

**Score Validation:**
- Must be a number
- Range: 0 to 999,999
- Converted to integer

### 4. Rate Limiting

**Client-side rate limiting:**
- Minimum 2 seconds between score submissions
- Prevents spam submissions
- User-friendly error messages

### 5. Data Sanitization

**Before database insertion:**
- All strings are trimmed
- Email addresses normalized (lowercase)
- Player names truncated to 50 characters
- Scores converted to integers

### 6. Error Handling

**Graceful error handling:**
- Network errors don't crash the game
- User-friendly error messages
- Fallback to localStorage for high scores
- Detailed logging for debugging

### 7. Privacy Protection

**Email privacy:**
- Email addresses partially masked in leaderboard display
- Only email prefix shown: `user@***`
- Full email stored for leaderboard functionality

## 🚨 Security Best Practices

### For Production Use

1. **Environment Variables** (if using a build system):
   ```javascript
   const SUPABASE_URL = process.env.SUPABASE_URL;
   const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
   ```

2. **Additional RLS Policies** (optional):
   ```sql
   -- Prevent users from updating their own scores
   CREATE POLICY "Prevent score updates" ON leaderboard
   FOR UPDATE USING (false);
   
   -- Prevent users from deleting scores
   CREATE POLICY "Prevent score deletion" ON leaderboard
   FOR DELETE USING (false);
   ```

3. **Server-side validation** (for critical applications):
   - Implement server-side validation as a backup
   - Use Supabase Edge Functions for complex validation

4. **Monitoring**:
   - Monitor Supabase dashboard for unusual activity
   - Set up alerts for high request volumes

## 🔍 Security Testing

### Test the Security Measures

1. **Rate Limiting Test:**
   - Try submitting scores rapidly
   - Should see rate limit error after 2 seconds

2. **Input Validation Test:**
   - Try submitting invalid emails
   - Try submitting negative scores
   - Try submitting very long names

3. **Error Handling Test:**
   - Disconnect internet and try submitting
   - Should see graceful error message

### Test Commands

```bash
# Test connection
curl -X GET "https://your-project.supabase.co/rest/v1/leaderboard?select=count&limit=1" \
  -H "apikey: YOUR_ANON_KEY"

# Test rate limiting (should fail)
curl -X POST "https://your-project.supabase.co/rest/v1/leaderboard" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"player_name":"test","email":"test@test.com","score":100}'
```

## 🛠️ Troubleshooting Security Issues

### Common Issues

1. **CORS Errors:**
   - Ensure you're running from a web server (not file://)
   - Check Supabase project settings

2. **Authentication Errors:**
   - Verify anon key is correct
   - Check RLS policies are set up

3. **Rate Limiting:**
   - Normal behavior - wait 2 seconds between submissions
   - Can be adjusted in `supabase-config.js`

### Security Checklist

- [ ] Supabase anon key configured
- [ ] RLS policies set up
- [ ] Input validation working
- [ ] Rate limiting active
- [ ] Error handling implemented
- [ ] Privacy measures in place

## 📞 Security Support

If you encounter security issues:

1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Test with the `test-supabase.html` file
4. Review the RLS policies in your Supabase dashboard

## 🔒 Additional Recommendations

1. **Regular Updates:**
   - Keep Supabase client library updated
   - Monitor for security advisories

2. **Backup Strategy:**
   - Regular database backups
   - Export leaderboard data periodically

3. **Monitoring:**
   - Set up Supabase dashboard alerts
   - Monitor for unusual activity patterns

---

**Remember:** The anon key is designed to be public. The real security comes from proper RLS policies and input validation, which we've implemented comprehensively. 