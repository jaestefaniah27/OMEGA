import { AppRegistry } from 'react-native';
import './patch-rtn'; // Import before App
import App from './App';
import './App.css';

console.log("Renderer: Registering component...");
AppRegistry.registerComponent('desktop', () => App);

console.log("Renderer: Running application...");
AppRegistry.runApplication('desktop', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
console.log("Renderer: Application run call finished.");
