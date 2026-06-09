import { defineField, defineType } from 'sanity'

export const highscoreType = defineType({
  name: 'highscore',
  title: 'Highscores (Spiele)',
  type: 'document',
  fields: [
    defineField({
      name: 'game', title: 'Spiel', type: 'string',
      options: { list: [{ title: '🐍 Snake', value: 'snake' }, { title: '🏓 Pong', value: 'pong' }] },
    }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'score', title: 'Punkte', type: 'number' }),
    defineField({ name: 'createdAt', title: 'Erstellt am', type: 'datetime' }),
  ],
  orderings: [{ title: 'Höchste zuerst', name: 'scoreDesc', by: [{ field: 'score', direction: 'desc' }] }],
  preview: {
    select: { name: 'name', score: 'score', game: 'game' },
    prepare({ name, score, game }) {
      return { title: `${game === 'snake' ? '🐍' : '🏓'} ${name} — ${score}` }
    },
  },
})
