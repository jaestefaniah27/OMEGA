import { AppRegistry } from 'react-native';
import App from './App';
import './App.css';

// Register the app
AppRegistry.registerComponent('desktop', () => App);

// Run the app (web-specific)
AppRegistry.runApplication('desktop', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
