import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Website Einstellungen',
  type: 'document',
  fields: [
    defineField({
      name: 'departureDate',
      title: 'Abreisedatum nach Japan',
      type: 'date',
      description: 'Tage in Japan wird automatisch ab diesem Datum berechnet',
    }),
  ],
  preview: {
    select: { title: 'statusText' },
  },
})
