// Generic type for dynamic filters
export type FilterConfig<TData> = {
  key: keyof TData
  label: string
  placeholder: string
}
