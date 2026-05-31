import { type SchemaTypeDefinition } from 'sanity'
import { postType } from './post'
import { lessonType } from './lesson'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [postType, lessonType],
}
