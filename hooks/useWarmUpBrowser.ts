import * as WebBrowser from 'expo-web-browser';
import React from 'react';

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    // Preloads the browser to make the login popup faster
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Tell Expo to complete the auth session if the app was closed
WebBrowser.maybeCompleteAuthSession();