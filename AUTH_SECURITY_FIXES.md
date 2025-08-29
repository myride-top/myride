# Authentication Security Fixes

This guide addresses the authentication security warnings from the Performance Advisor that need to be fixed in the Supabase dashboard.

## Issues to Fix

### 1. Auth OTP Long Expiry (Warning)
**Problem**: OTP (One-Time Password) expiry exceeds recommended threshold.

**Solution**: 
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Find the **OTP Settings** section
4. Reduce the **OTP Expiry** time to a recommended value (e.g., 5-10 minutes)
5. Save the changes

### 2. Leaked Password Protection Disable (Critical Warning)
**Problem**: Leaked password protection is currently disabled.

**Solution**:
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Find the **Security** section
4. Enable **"Check for leaked passwords"** option
5. Save the changes

## Additional Security Recommendations

### Password Policy
1. Go to **Authentication** → **Settings**
2. Configure a strong password policy:
   - Minimum length: 8+ characters
   - Require uppercase letters
   - Require lowercase letters
   - Require numbers
   - Require special characters

### Session Management
1. Set appropriate session timeout values
2. Enable secure session handling
3. Consider implementing refresh token rotation

### Rate Limiting
1. Enable rate limiting for authentication endpoints
2. Set reasonable limits for login attempts
3. Configure account lockout policies

## Verification Steps

After applying these fixes:

1. **Check Performance Advisor** again to confirm warnings are resolved
2. **Test authentication flows** to ensure they still work correctly
3. **Monitor security logs** for any issues
4. **Update your application** if needed to handle new security requirements

## Important Notes

- **Backup your current settings** before making changes
- **Test thoroughly** after applying security changes
- **Communicate changes** to your users if they affect login behavior
- **Monitor for false positives** with leaked password protection

## Migration Status

✅ **Database Security Issues**: Fixed in migration `014_fix_security_issues.sql`
- RLS enabled on `car_likes` table
- Function search path security fixed
- RLS policies created for car_likes

🔄 **Authentication Security Issues**: Need manual configuration in Supabase dashboard
- OTP expiry settings
- Leaked password protection
- Password policy configuration
