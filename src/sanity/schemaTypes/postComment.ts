import { defineField, defineType } from 'sanity'

export const postCommentType = defineType({
  name: 'postComment',
  title: 'Blog-Kommentare',
  type: 'document',
  fields: [
    defineField({ name: 'postId', title: 'Post-ID', type: 'string', readOnly: true }),
    defineField({ name: 'postTitle', title: 'Post', type: 'string', readOnly: true }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'message', title: 'Kommentar', type: 'text', rows: 3, validation: r => r.required() }),
    defineField({ name: 'approved', title: 'Freigegeben?', type: 'boolean', initialValue: false }),
    defineField({ name: 'createdAt', title: 'Erstellt am', type: 'datetime' }),
  ],
  orderings: [{ title: 'Neueste zuerst', name: 'createdDesc', by: [{ field: 'createdAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'message', approved: 'approved', post: 'postTitle' },
    prepare({ title, subtitle, approved, post }) {
      return { title: `${approved ? '✅' : '⏳'} ${title} → ${post ?? '?'}`, subtitle }
    },
  },
})
