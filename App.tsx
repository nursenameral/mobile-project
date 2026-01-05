import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthWrapper from './src/components/AuthWrapper';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthWrapper />
    </GestureHandlerRootView>
  );
}

export default App;
