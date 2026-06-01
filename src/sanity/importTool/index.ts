import { definePlugin } from 'sanity'
import { ImportTool } from './ImportTool'

export const importPlugin = definePlugin({
  name: 'obsidian-import',
  tools: [
    {
      name: 'obsidian-import',
      title: 'Import',
      icon: () => '📥',
      component: ImportTool,
    },
  ],
})
