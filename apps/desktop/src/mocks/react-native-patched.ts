import * as RNWeb from 'react-native-web';

// 1. Exportamos todo lo que SÍ existe en web
export * from 'react-native-web';
export default RNWeb;

// 2. Agregamos los parches para lo que NO existe
export const TurboModuleRegistry = {
  get: (_name: string) => null,
  getEnforcing: (_name: string) => null,
};

export const codegenNativeComponent = (componentName: string, _options?: any) => {
  return componentName;
};

// Parche extra común para librerías antiguas
export const ViewPropTypes = { 
  style: () => {} 
};
