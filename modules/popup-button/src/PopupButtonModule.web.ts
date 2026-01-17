import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './PopupButton.types';

type PopupButtonModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class PopupButtonModule extends NativeModule<PopupButtonModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(PopupButtonModule, 'PopupButtonModule');
