import type { CustomValidator } from 'sanity'

/**
 * Returns a custom validator that blocks publishing if another document of the
 * same type already has the same value in the given field.
 * Excludes the current document (draft + published version).
 */
export function uniqueCheck(type: string, field: string, label: string): CustomValidator<string | undefined> {
  return async (value, context) => {
    if (!value) return true
    const client = context.getClient({ apiVersion: '2024-01-01' })
    const rawId = (context.document?._id as string | undefined) ?? ''
    const id = rawId.replace(/^drafts\./, '')
    const params = { draft: `drafts.${id}`, published: id, value }
    const query = `count(*[_type == "${type}" && ${field} == $value && !(_id in [$draft, $published])]) > 0`
    const isDuplicate = await client.fetch<boolean>(query, params)
    return isDuplicate ? `${label} „${value}" existiert bereits!` : true
  }
}
