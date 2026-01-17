import { requireNativeView } from 'expo';
import * as React from 'react';

import { PopupButtonViewProps } from './PopupButton.types';

const NativeView: React.ComponentType<PopupButtonViewProps> =
  requireNativeView('PopupButton');

export default function PopupButtonView(props: PopupButtonViewProps) {
  return <NativeView {...props} />;
}
