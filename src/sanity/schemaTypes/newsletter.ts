import { defineField, defineType } from 'sanity'

export const newsletterType = defineType({
  name: 'newsletter',
  title: 'Newsletter Abonnenten',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'E-Mail', type: 'string', validation: r => r.required().email() }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'subscribedAt', title: 'Eingetragen am', type: 'datetime' }),
    defineField({ name: 'unsubscribed', title: 'Abgemeldet?', type: 'boolean', initialValue: false }),
    defineField({ name: 'unsubscribedAt', title: 'Abgemeldet am', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'name', unsub: 'unsubscribed' },
    prepare({ title, subtitle, unsub }) {
      return { title: `${unsub ? '🚫 ' : '✅ '}${title}`, subtitle }
    },
  },
})
