import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // NipponOS-Einstellungen als Singleton ganz oben (Banner + SYSTEMS)
      S.listItem()
        .title('⚙️ NipponOS Einstellungen')
        .id('nipponSettings')
        .child(
          S.document()
            .schemaType('nipponSettings')
            .documentId('nipponSettings')
            .title('NipponOS Einstellungen')
        ),
      S.divider(),
      // Alle übrigen Dokumenttypen wie gehabt
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'nipponSettings'
      ),
    ])
