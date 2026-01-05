/**
 * Color Migration Codemod
 *
 * This provides patterns for migrating different color contexts:
 * - Tailwind classes: bg-[#hex] -> bg-token
 * - SVG props: stroke="#hex" -> stroke={tailwind.color("token")}
 * - Style objects: color: "#hex" -> color: tailwind.color("token")
 */

// Token mapping for reference
const TOKEN_MAP = {
  '#F8F5F3': 'sara-background',
  '#FFFFFF': 'sara-background-light',
  '#4CB6AC': 'sara-accent',
  '#E6F5F4': 'sara-accent-light',
  '#16273D': 'sara-text-primary',
  '#4B5D6E': 'sara-text-secondary',
  '#6C778A': 'sara-text-meta',
  '#E6E2DD': 'sara-border',
  '#F5F3F0': 'sara-chip',
  '#566273': 'sara-text-secondary',
  '#E6E0D7': 'sara-border',
  '#E5F3F0': 'sara-accent-light',
  '#000000': 'black',
  '#BBBBBB': 'gray-500',
  '#858585': 'gray-700',
  '#8D8D8D': 'gray-700',
  '#838383': 'gray-700',
  '#666666': 'gray-700',
  '#646464': 'gray-800',
  '#D9D9D9': 'gray-300',
  '#DDDDE3': 'gray-300',
  '#C7C7C7': 'gray-400',
  '#8F8F8F': 'gray-700',
  '#6F6F6F': 'gray-800',
  '#303030': 'gray-950',
  '#171717': 'gray-950',
  '#1F2937': 'gray-950',
  '#E5E5E5': 'gray-200',
  '#F5F5F5': 'gray-100',
  '#E54666': 'red-700',
  '#B54747': 'red-800',
  '#9F3A3A': 'red-900',
  '#8A3B3B': 'red-900',
  '#E13D45': 'red-700',
  '#D84356': 'red-700',
  '#A53326': 'red-900',
  '#EF4444': 'red-600',
  '#7F1D1D': 'red-950',
  '#880000': 'red-900',
  '#28AD21': 'green-700',
  '#02BC02': 'green-700',
  '#10B981': 'green-600',
  '#12A594': 'teal-700',
  '#0F9C9C': 'teal-700',
  '#1F7F75': 'teal-800',
  '#0F4D49': 'teal-900',
  '#0C7D7D': 'teal-800',
  '#0E857F': 'teal-700',
  '#0F8B8D': 'teal-700',
  '#14B8A6': 'teal-600',
  '#0D9B8A': 'teal-700',
  '#2F7A6D': 'teal-800',
  '#1E7068': 'teal-900',
  '#6F8A86': 'sage-700',
  '#49605C': 'sage-900',
  '#FFC53D': 'amber-700',
  '#FFBA1A': 'amber-700',
  '#F6A609': 'amber-800',
  '#F59E0B': 'amber-600',
  '#ED8A5C': 'orange-600',
  '#F97316': 'orange-600',
  '#8A5A2E': 'brown-700',
  '#9F4E2F': 'brown-800',
  '#0081F1': 'blue-700',
  '#086DE0': 'blue-700',
  '#3E63DD': 'indigo-700',
  '#2781F6': 'blue-700',
  '#1F93FF': 'blue-700',
  '#3B82F6': 'blue-600',
  '#229ED9': 'sky-700',
  '#2AABEE': 'sky-700',
  '#3B4770': 'indigo-900',
  '#6E56CF': 'violet-700',
  '#8B5CF6': 'violet-600',
  '#3E3A92': 'iris-900',
  '#E592A3': 'pink-600',
  '#EC4899': 'pink-600',
  '#CCE6DE': 'jade-200',
  '#C2E4DE': 'jade-200',
  '#D3E8E2': 'jade-200',
  '#C4DAD6': 'teal-300',
  '#D3E4E1': 'teal-200',
  '#EEF7F5': 'teal-50',
  '#F1F6F5': 'teal-50',
  '#E4F3F0': 'teal-100',
  '#E3F2EF': 'teal-100',
  '#E7F4F2': 'teal-100',
  '#DFF4F0': 'teal-100',
  '#E4EFEC': 'teal-100',
  '#F2FFFB': 'mint-50',
  '#FDFBF9': 'sara-background',
  '#F7F3EB': 'sara-background',
  '#F6F1EB': 'sara-chip',
  '#F5EFEA': 'sara-chip',
  '#F4EFE9': 'sara-chip',
  '#F3EEE7': 'sara-chip',
  '#F1ECE6': 'sara-chip',
  '#F1EBE4': 'sara-chip',
  '#F1EAE1': 'sara-chip',
  '#EFE8E0': 'sara-chip',
  '#EFE6DB': 'sand-200',
  '#EEE7E1': 'sand-100',
  '#EDE5DA': 'sand-200',
  '#EDEAE5': 'sara-chip',
  '#ECE7E1': 'sara-chip',
  '#E9E2D9': 'sara-border',
  '#E7E2DD': 'sara-border',
  '#E7DED3': 'sand-300',
  '#E3DCD2': 'sand-300',
  '#E1D9CF': 'sand-400',
  '#DDD5CA': 'sand-400',
  '#D8D1C9': 'sand-500',
  '#D6CEC4': 'sand-500',
  '#D5CBC0': 'sand-500',
  '#C9C3BA': 'sand-600',
  '#E2E6EB': 'slate-200',
  '#E1E4EA': 'slate-200',
  '#D2D9E3': 'slate-300',
  '#C9D7E3': 'slate-300',
  '#9AA3B1': 'slate-600',
  '#7D8895': 'slate-700',
  '#6F7A85': 'slate-700',
  '#3D4A5C': 'slate-900',
  '#FFF8F0': 'amber-50',
  '#FFF1D6': 'amber-100',
  '#FFEBD6': 'amber-100',
  '#FEF4E1': 'amber-50',
  '#F4DEBE': 'amber-200',
  '#FFE6E0': 'red-100',
  '#F8E6E6': 'red-100',
  '#FDF3F3': 'red-50',
  '#FDEDEE': 'red-100',
  '#FDEBEC': 'red-100',
  '#FDEBEB': 'red-100',
  '#FBEFF0': 'red-50',
  '#F8E8E8': 'red-100',
  '#F8D7D7': 'red-200',
  '#F5D9D9': 'red-200',
  '#F4E0E2': 'red-100',
  '#F3B0B0': 'red-300',
  '#F1D7D7': 'red-200',
  '#E5E7F2': 'violet-100',
  '#E5E3FC': 'iris-100',
  '#F2F5F9': 'slate-50',
  '#A8ABA9': 'sage-600',
  '#7E808A': 'slate-600',
  '#60646C': 'slate-700',
  '#6AB4B6': 'cyan-600',
  '#B4BFC6': 'slate-400',
  '#800': 'red-900',
};

// Helper to get token for a color
function getToken(hexColor: string): string | undefined {
  return TOKEN_MAP[hexColor.toUpperCase()];
}

// Migration patterns:

// 1. Tailwind class in template literal:
//    BEFORE: `bg-[#4CB6AC]`
//    AFTER:  `bg-sara-accent`

// 2. SVG stroke/fill prop:
//    BEFORE: <Icon stroke="#4CB6AC" />
//    AFTER:  <Icon stroke={tailwind.color('sara-accent')} />

// 3. Style object:
//    BEFORE: { color: '#16273D' }
//    AFTER:  { color: tailwind.color('sara-text-primary') }

// 4. ActivityIndicator/StatusBar color:
//    BEFORE: <ActivityIndicator color="#4CB6AC" />
//    AFTER:  <ActivityIndicator color={tailwind.color('sara-accent')} />

export { TOKEN_MAP, getToken };
