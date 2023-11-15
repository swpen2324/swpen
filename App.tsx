// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from './src/navigation/AppStack';
import {NativeBaseProvider} from 'native-base';

const App = () => {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;