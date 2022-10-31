import React from 'react';

import { diff as DiffEditor } from 'react-ace';
import 'ace-builds/src-noconflict/mode-elixir';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-kuroir';
interface Props {
  height: string;
  width: string;
  readOnly: boolean;
  oldValue: string;
  newValue: string;
  onChange?: (values: string[]) => void;
  placeholder?: string;
}
export default function Editor(props: Props) {
  return (
    <DiffEditor
      mode='elixir'
      theme='kuroir'
      value={[props.oldValue, props.newValue]}
      height={props.height}
      width={props.width}
      style={{ background: '#fff677' }}
      readOnly={props.readOnly}
      onChange={(values) => {
        if (props.onChange) {
          props.onChange(values);
        }
      }}
    />
  );
}
