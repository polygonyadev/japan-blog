import { type SchemaTypeDefinition } from 'sanity'
import { postType } from './post'
import { lessonType } from './lesson'
import { bucketItemType } from './bucketItem'
import { siteSettingsType } from './siteSettings'
import { photoType } from './photo'
import { vokabelType } from './vokabel'
import { kanjiType } from './kanji'
import { grammatikType } from './grammatik'
import { partikelType } from './partikel'
import { satzType } from './satz'
import { notizType } from './notiz'
import { communityType } from './community'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [postType, lessonType, bucketItemType, siteSettingsType, photoType, vokabelType, kanjiType, grammatikType, partikelType, satzType, notizType, communityType],
}
