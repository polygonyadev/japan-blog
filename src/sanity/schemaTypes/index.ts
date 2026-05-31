import { type SchemaTypeDefinition } from 'sanity'
import { postType } from './post'
import { lessonType } from './lesson'
import { bucketItemType } from './bucketItem'
import { siteSettingsType } from './siteSettings'
import { photoType } from './photo'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [postType, lessonType, bucketItemType, siteSettingsType, photoType],
}
