import 'react-phone-number-input/style.css'
import PhoneInput, { type Value } from 'react-phone-number-input'
import React from 'react'
import { Input } from '@/components/ui/input'

// Omit the conflicting 'onChange' from standard input attributes and define our own.
interface PhoneNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: Value | undefined;
  onChange: (value: Value | undefined) => void;
}

const PhoneNumberInput = React.forwardRef<HTMLInputElement, PhoneNumberInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <PhoneInput
        {...props}
        // Use `as any` to bypass the ref type mismatch between the class component and the forwarded input ref.
        ref={ref as any}
        value={value}
        onChange={onChange}
        inputComponent={Input}
        international
        defaultCountry="US"
        className="phone-number-input"
      />
    )
  }
)
PhoneNumberInput.displayName = 'PhoneNumberInput'

export default PhoneNumberInput;