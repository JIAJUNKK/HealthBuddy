import * as React from 'react';
import MainContainer from './navigation/MainContainer';
import {LogBox} from 'react-native';

function App() {
  LogBox.ignoreAllLogs();
  return (
    <MainContainer/>
  );
}

export default App;