import { defineField, defineType } from 'sanity'

export const newsletterType = defineType({
  name: 'newsletter',
  title: 'Newsletter Abonnenten',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'E-Mail', type: 'string', validation: r => r.required().email() }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'subscribedAt', title: 'Eingetragen am', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'name' },
  },
})
