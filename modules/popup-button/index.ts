// Reexport the native module. On web, it will be resolved to PopupButtonModule.web.ts
// and on native platforms to PopupButtonModule.ts
export { default } from './src/PopupButtonModule';
export { default as PopupButtonView } from './src/PopupButtonView';
export * from  './src/PopupButton.types';
