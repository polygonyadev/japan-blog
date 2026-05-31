import { type SchemaTypeDefinition } from 'sanity'
import { postType } from './post'
import { lessonType } from './lesson'
import { bucketItemType } from './bucketItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [postType, lessonType, bucketItemType],
}
