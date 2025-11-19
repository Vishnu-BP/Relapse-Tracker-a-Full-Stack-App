import { createSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';
import React from 'react';
import { Button, View } from 'react-native';

export const AddLogButton = () => {
  const { getToken } = useAuth();

  const handleAddLog = async () => {
    try {
      console.log('Attempting to add log...');
      
      // 1. Get the Token
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        console.error('No token found! User might not be signed in.');
        return;
      }

      // 2. Create Client
      const supabase = createSupabaseClient(token);

      // 3. Insert Data 
      const { data, error } = await supabase
        .from('logs')
        .insert({
           mood: 'Anxious',
           notes: 'Testing my new security setup!',
           type: 'relapse',
        });

      if (error) console.error('Supabase Error:', error.message);
      else console.log('Success! Log added to Supabase.');

    } catch (err) {
      console.error('Unexpected Error:', err);
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Button title="Test Database Write" onPress={handleAddLog} />
    </View>
  );
};