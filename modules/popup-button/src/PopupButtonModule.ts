import { NativeModule, requireNativeModule } from 'expo';

import { PopupButtonModuleEvents } from './PopupButton.types';

declare class PopupButtonModule extends NativeModule<PopupButtonModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<PopupButtonModule>('PopupButton');
