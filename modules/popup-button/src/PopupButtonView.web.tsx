import * as React from 'react';

import { PopupButtonViewProps } from './PopupButton.types';

export default function PopupButtonView(props: PopupButtonViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
