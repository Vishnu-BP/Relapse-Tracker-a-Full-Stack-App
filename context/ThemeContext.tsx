import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// 1. Define your Colors
export const Colors = {
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#111111',
    subtext: '#666666',
    border: '#f0f0f0',
    iconBg: '#f0f0f0',
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    subtext: '#AAAAAA',
    border: '#333333',
    iconBg: '#2C2C2C',
  },
};

// 2. Create the Context
type Theme = 'light' | 'dark';
const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // Get phone's default
  const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

  // Load saved preference on startup
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    };
    loadTheme();
  }, []);

  // Function to toggle theme
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  // Values accessible to any component
  const value = {
    theme,
    toggleTheme,
    colors: Colors[theme], // Automatically returns the correct color set
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Create a helper hook
export const useTheme = () => useContext(ThemeContext);