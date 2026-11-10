import { forwardRef, useState } from 'react';
import { InputAdornment, MenuItem, TextField } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';

const noSpinners = {
  '& input[type=number]': { MozAppearance: 'textfield' },
  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
};

/**
 * MUI floating-label text field with a leading icon + divider (matches the reference design).
 * Works as text / email / password / number / date / textarea / select.
 *
 *   <FloatField icon={Mail} label="Email address" value={v} onChange={...} />
 *   <FloatField icon={Layers} label="Status" select options={[{value,label}]} ... />
 */
const FloatField = forwardRef(function FloatField(
  { icon: Icon, label, type = 'text', select = false, options = [], placeholder, helperText, error, multiline, rows, minRows, readOnly, inputProps, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';

  const startAdornment = Icon ? (
    <InputAdornment position="start" sx={{ mr: 0, alignSelf: multiline ? 'flex-start' : 'center' }}>
      <Icon size={20} strokeWidth={1.75} aria-hidden className="text-ink/70" />
      <span aria-hidden className="mx-3.5 h-6 w-px bg-ink/55" />
    </InputAdornment>
  ) : undefined;

  const endAdornment = isPw ? (
    <InputAdornment position="end">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-surface2 hover:text-ink"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </InputAdornment>
  ) : undefined;

  const selectSlot = select
    ? {
        displayEmpty: true,
        renderValue: (v) =>
          v === '' || v == null
            ? <span className="text-muted/70">{placeholder || 'Select'}</span>
            : options.find((o) => String(o.value) === String(v))?.label ?? v,
        MenuProps: { slotProps: { paper: { style: { maxHeight: 320 } } } },
      }
    : undefined;

  return (
    <TextField
      inputRef={ref}
      fullWidth
      variant="outlined"
      label={label}
      type={isPw && show ? 'text' : type}
      select={select}
      error={!!error}
      helperText={error || helperText}
      placeholder={select ? undefined : placeholder}
      multiline={multiline}
      rows={rows}
      minRows={minRows}
      sx={noSpinners}
      slotProps={{
        inputLabel: { shrink: true },
        input: { startAdornment, endAdornment, readOnly },
        htmlInput: inputProps,
        select: selectSlot,
      }}
      {...rest}
    >
      {select && options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </TextField>
  );
});
export default FloatField;
