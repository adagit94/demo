export type OnValueChange<T> = (
  value: T,
  target?: HTMLElement
) => void

export type InputPropsBase<T> = Partial<{
  label: string
  readOnly: boolean
  isValid: boolean
  validationMsg: string
  onChange: OnValueChange<T | undefined>
  renderCustomButtons: () => React.ReactNode
}>

export type InputProps<T> = InputPropsBase<T> & { value: T }
