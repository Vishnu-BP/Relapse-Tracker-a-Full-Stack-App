import { createSupabaseClient } from '@/lib/supabase'; // Ensure you have this helper
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect } from 'react';

export const useUserSync = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const syncUser = async () => {
      if (!user) return;

      try {
        // 1. Get the Clerk Token to authenticate with Supabase
        const token = await getToken({ template: 'supabase' });
        if (!token) return;

        // 2. Create the client
        const supabase = createSupabaseClient(token);

        // 3. Check if profile exists
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // 4. If no profile, Create one (The "Trigger")
        if (!data) {
          console.log('Creating new profile for user:', user.id);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              nickname: user.firstName || 'Friend', // Default name
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });

          if (insertError) {
             console.error('Error creating profile:', insertError);
          }
        }
      } catch (e) {
        console.error('Sync error:', e);
      }
    };

    syncUser();
  }, [user]); // Run this every time the 'user' object changes (e.g. login)
};