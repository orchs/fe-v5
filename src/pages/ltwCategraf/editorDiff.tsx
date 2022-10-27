import React from 'react';

import { diff as DiffEditor } from 'react-ace';
import 'ace-builds/src-noconflict/mode-elixir';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-kuroir';
interface Props {
  height: string;
  readOnly: boolean;
  value: string;
  value2: string;
  onChange?: (value: string[]) => void;
  placeholder?: string;
}
export default function Editor(props: Props) {
  return (
    <DiffEditor
      mode='elixir'
      theme='kuroir'
      value={[props.value, props.value2]}
      height='1000px'
      width='1034px'
      style={{ background: '#fff677' }}
      readOnly={props.readOnly}
      onChange={(newValue) => {
        if (props.onChange) {
          props.onChange(newValue);
        }
      }}
    />
  );
}
