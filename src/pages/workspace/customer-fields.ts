import type { Field } from './shared'

export const customerFields: Field[] = [
  { key: 'first_name', label: 'fields.first_name', required: true, maxLength: 100 },
  { key: 'last_name', label: 'fields.last_name', required: true, maxLength: 100 },
  { key: 'date_of_birth', label: 'fields.date_of_birth', type: 'date' },
  { key: 'email', label: 'fields.email', type: 'email', maxLength: 254 },
  { key: 'phone', label: 'fields.phone', maxLength: 40 },
  { key: 'street_address', label: 'fields.street_address', maxLength: 255 },
  { key: 'city', label: 'fields.city', maxLength: 100 },
  { key: 'postal_code', label: 'fields.postal_code', maxLength: 32 },
  { key: 'sex', label: 'fields.sex', maxLength: 40 },
]