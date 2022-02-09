import * as React from "react";
import NumberFormat from "react-number-format";
import TextField, { TextFieldProps } from "@mui/material/TextField";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

function _NumberFormatCustom<T>() {
  return React.forwardRef<NumberFormat<T>, CustomProps>(
    function NumberFormatCustom(props, ref) {
      const { onChange, ...other } = props;

      return (
        <NumberFormat
          {...other}
          getInputRef={ref}
          onValueChange={(values) => {
            onChange({
              target: {
                name: props.name,
                value: values.value,
              },
            });
          }}
          isNumericString
          suffix="%"
        />
      );
    }
  );
}

const NumberFormatCustom = _NumberFormatCustom();
export function PercentageInput(p: TextFieldProps) {
  return (
    <TextField
      InputProps={{
        inputComponent: NumberFormatCustom as any,
      }}
      {...p}
    />
  );
}
