#!/usr/bin/env npx ts-node

/**
 * Color Migration Script for Sara Mobile
 *
 * This script scans all .tsx files for hardcoded hex colors and generates:
 * 1. A report mapping hex values to Sara theme tokens
 * 2. A sed script for bulk replacement
 * 3. A list of unmapped colors for manual review
 *
 * Usage:
 *   npx ts-node scripts/migrate-colors.ts [--report] [--generate-sed] [--dry-run]
 *
 * Options:
 *   --report       Generate detailed report (default)
 *   --generate-sed Generate sed commands for bulk replacement
 *   --dry-run      Preview changes without modifying files
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Sara Theme Token Mapping
// ============================================================================

/**
 * Direct hex-to-token mappings for Sara brand colors
 * These are the primary colors defined in tailwind.config.ts
 */
const SARA_TOKEN_MAP: Record<string, string> = {
  // Sara brand colors (exact matches)
  '#F8F5F3': 'sara-background',
  '#FFFFFF': 'sara-background-light',
  '#4CB6AC': 'sara-accent',
  '#E6F5F4': 'sara-accent-light',
  '#16273D': 'sara-text-primary',
  '#4B5D6E': 'sara-text-secondary',
  '#6C778A': 'sara-text-meta',
  '#E6E2DD': 'sara-border',
  '#F5F3F0': 'sara-chip',

  // Close variants that should map to Sara tokens
  '#566273': 'sara-text-secondary', // Close to #4B5D6E
  '#E6E0D7': 'sara-border', // Close to #E6E2DD (warm border variant)
  '#E5F3F0': 'sara-accent-light', // Close to #E6F5F4

  // Common UI colors that should use theme tokens
  '#000000': 'black',
  '#BBBBBB': 'gray-500',
  '#858585': 'gray-700',
  '#8D8D8D': 'gray-700',
  '#838383': 'gray-700',
  '#666666': 'gray-700', // Common gray used in stories
  '#646464': 'gray-800',
  '#D9D9D9': 'gray-300',
  '#DDDDE3': 'gray-300',
  '#C7C7C7': 'gray-400',
  '#8F8F8F': 'gray-700',
  '#6F6F6F': 'gray-800',
  '#303030': 'gray-950',
  '#171717': 'gray-950',
  '#1F2937': 'gray-950', // Tailwind gray-800
  '#E5E5E5': 'gray-200', // Tailwind gray-200
  '#F5F5F5': 'gray-100', // Tailwind gray-100

  // Status colors - map to theme variants
  '#E54666': 'red-700', // Error/danger
  '#B54747': 'red-800', // Error variant
  '#9F3A3A': 'red-900', // Error dark
  '#8A3B3B': 'red-900',
  '#E13D45': 'red-700',
  '#D84356': 'red-700',
  '#A53326': 'red-900',
  '#EF4444': 'red-600', // Tailwind red-500
  '#7F1D1D': 'red-950', // Tailwind red-900
  '#880000': 'red-900', // Dark red
  '#28AD21': 'green-700', // Success
  '#02BC02': 'green-700',
  '#10B981': 'green-600', // Tailwind emerald-500
  '#12A594': 'teal-700', // Sara accent variant
  '#0F9C9C': 'teal-700',
  '#1F7F75': 'teal-800',
  '#0F4D49': 'teal-900', // Dark teal
  '#0C7D7D': 'teal-800',
  '#0E857F': 'teal-700',
  '#0F8B8D': 'teal-700', // Pressed button teal
  '#14B8A6': 'teal-600', // Tailwind teal-500
  '#0D9B8A': 'teal-700',
  '#2F7A6D': 'teal-800',
  '#1E7068': 'teal-900',
  '#6F8A86': 'sage-700',
  '#49605C': 'sage-900',

  // Warning/amber colors
  '#FFC53D': 'amber-700', // Warning
  '#FFBA1A': 'amber-700',
  '#F6A609': 'amber-800',
  '#F59E0B': 'amber-600', // Tailwind amber-500
  '#ED8A5C': 'orange-600',
  '#F97316': 'orange-600', // Tailwind orange-500
  '#8A5A2E': 'brown-700',
  '#9F4E2F': 'brown-800',

  // Blue/info colors
  '#0081F1': 'blue-700',
  '#086DE0': 'blue-700',
  '#3E63DD': 'indigo-700',
  '#2781F6': 'blue-700',
  '#1F93FF': 'blue-700',
  '#3B82F6': 'blue-600', // Tailwind blue-500
  '#229ED9': 'sky-700',
  '#2AABEE': 'sky-700',
  '#3B4770': 'indigo-900',
  '#6E56CF': 'violet-700',
  '#8B5CF6': 'violet-600', // Tailwind violet-500
  '#3E3A92': 'iris-900',

  // Pink/purple variants
  '#E592A3': 'pink-600',
  '#EC4899': 'pink-600', // Tailwind pink-500
  '#CCE6DE': 'jade-200', // Light green background
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
  '#E4EFEC': 'teal-100', // Light teal for audio bubble
  '#F2FFFB': 'mint-50',

  // Neutral warm tones (Sara palette)
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

  // Cool grays
  '#E2E6EB': 'slate-200',
  '#E1E4EA': 'slate-200',
  '#D2D9E3': 'slate-300',
  '#C9D7E3': 'slate-300',
  '#9AA3B1': 'slate-600',
  '#7D8895': 'slate-700',
  '#6F7A85': 'slate-700',
  '#3D4A5C': 'slate-900',

  // Error/warning backgrounds
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

  // Misc
  '#E5E7F2': 'violet-100',
  '#E5E3FC': 'iris-100',
  '#F2F5F9': 'slate-50',
  '#A8ABA9': 'sage-600',
  '#7E808A': 'slate-600',
  '#60646C': 'slate-700',
  '#6AB4B6': 'cyan-600',
  '#B4BFC6': 'slate-400',
  '#800': 'red-900', // Shorthand
};

/**
 * Colors that should NOT be replaced (valid use cases)
 */
const IGNORE_COLORS = new Set([
  // These are intentionally hardcoded in specific contexts
]);

/**
 * Context patterns where hardcoded colors may be acceptable
 */
const ACCEPTABLE_CONTEXTS = [
  /\.stories\.tsx$/, // Storybook stories may use sample colors
  /mocks?\.tsx?$/, // Mock data
  /test\.tsx?$/, // Test files
];

// ============================================================================
// File Scanning
// ============================================================================

interface ColorOccurrence {
  file: string;
  line: number;
  column: number;
  color: string;
  context: string;
  suggestedToken?: string;
}

interface ScanResult {
  totalFiles: number;
  totalOccurrences: number;
  mappedOccurrences: number;
  unmappedOccurrences: number;
  occurrences: ColorOccurrence[];
  colorFrequency: Map<string, number>;
  unmappedColors: Set<string>;
}

function normalizeHexColor(color: string): string {
  const upper = color.toUpperCase();
  // Expand 3-char hex to 6-char
  if (upper.length === 4) {
    return `#${upper[1]}${upper[1]}${upper[2]}${upper[2]}${upper[3]}${upper[3]}`;
  }
  return upper;
}

function findColorOccurrences(filePath: string, content: string): ColorOccurrence[] {
  const occurrences: ColorOccurrence[] = [];
  const lines = content.split('\n');

  // Match hex colors: #RGB or #RRGGBB
  const hexPattern = /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g;

  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = hexPattern.exec(line)) !== null) {
      const color = normalizeHexColor(match[0]);
      const suggestedToken = SARA_TOKEN_MAP[color];

      // Get surrounding context (up to 60 chars)
      const contextStart = Math.max(0, match.index - 20);
      const contextEnd = Math.min(line.length, match.index + match[0].length + 20);
      const context = line.slice(contextStart, contextEnd).trim();

      occurrences.push({
        file: filePath,
        line: lineIndex + 1,
        column: match.index + 1,
        color,
        context,
        suggestedToken,
      });
    }
  });

  return occurrences;
}

function scanDirectory(dir: string): ScanResult {
  const result: ScanResult = {
    totalFiles: 0,
    totalOccurrences: 0,
    mappedOccurrences: 0,
    unmappedOccurrences: 0,
    occurrences: [],
    colorFrequency: new Map(),
    unmappedColors: new Set(),
  };

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, build outputs, etc.
        if (!['node_modules', '.git', 'build', 'dist', '.expo'].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        result.totalFiles++;
        const content = fs.readFileSync(fullPath, 'utf-8');
        const occurrences = findColorOccurrences(fullPath, content);

        for (const occ of occurrences) {
          result.totalOccurrences++;
          result.occurrences.push(occ);

          // Track frequency
          const count = result.colorFrequency.get(occ.color) || 0;
          result.colorFrequency.set(occ.color, count + 1);

          if (occ.suggestedToken) {
            result.mappedOccurrences++;
          } else {
            result.unmappedOccurrences++;
            result.unmappedColors.add(occ.color);
          }
        }
      }
    }
  }

  walk(dir);
  return result;
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport(result: ScanResult): string {
  const lines: string[] = [];

  lines.push('# Color Migration Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total .tsx files scanned:** ${result.totalFiles}`);
  lines.push(`- **Total hardcoded colors found:** ${result.totalOccurrences}`);
  lines.push(
    `- **Colors with token mapping:** ${result.mappedOccurrences} (${((result.mappedOccurrences / result.totalOccurrences) * 100).toFixed(1)}%)`,
  );
  lines.push(
    `- **Colors needing manual review:** ${result.unmappedOccurrences} (${((result.unmappedOccurrences / result.totalOccurrences) * 100).toFixed(1)}%)`,
  );
  lines.push(`- **Unique colors found:** ${result.colorFrequency.size}`);
  lines.push('');

  // Color frequency table
  lines.push('## Color Frequency (Top 30)');
  lines.push('');
  lines.push('| Color | Count | Suggested Token | Status |');
  lines.push('|-------|-------|-----------------|--------|');

  const sortedColors = Array.from(result.colorFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  for (const [color, count] of sortedColors) {
    const token = SARA_TOKEN_MAP[color];
    const status = token ? 'Mapped' : 'NEEDS REVIEW';
    lines.push(`| \`${color}\` | ${count} | ${token || '-'} | ${status} |`);
  }
  lines.push('');

  // Unmapped colors
  if (result.unmappedColors.size > 0) {
    lines.push('## Unmapped Colors (Needs Manual Review)');
    lines.push('');
    lines.push('These colors have no automatic mapping and need manual review:');
    lines.push('');

    const unmappedWithFreq = Array.from(result.unmappedColors)
      .map(color => ({ color, count: result.colorFrequency.get(color) || 0 }))
      .sort((a, b) => b.count - a.count);

    for (const { color, count } of unmappedWithFreq) {
      lines.push(`- \`${color}\` (${count} occurrences)`);
    }
    lines.push('');
  }

  // Detailed occurrences by file
  lines.push('## Occurrences by File');
  lines.push('');

  const byFile = new Map<string, ColorOccurrence[]>();
  for (const occ of result.occurrences) {
    const list = byFile.get(occ.file) || [];
    list.push(occ);
    byFile.set(occ.file, list);
  }

  const sortedFiles = Array.from(byFile.entries()).sort((a, b) => b[1].length - a[1].length);

  for (const [file, occs] of sortedFiles.slice(0, 50)) {
    const relPath = file.replace(process.cwd() + '/', '');
    lines.push(`### ${relPath} (${occs.length} colors)`);
    lines.push('');

    for (const occ of occs.slice(0, 20)) {
      const status = occ.suggestedToken ? `-> ${occ.suggestedToken}` : 'MANUAL';
      lines.push(`- Line ${occ.line}: \`${occ.color}\` ${status}`);
      lines.push(`  \`\`\`${occ.context}\`\`\``);
    }

    if (occs.length > 20) {
      lines.push(`- ... and ${occs.length - 20} more`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================================================
// Sed Script Generation
// ============================================================================

function generateSedScript(result: ScanResult): string {
  const lines: string[] = [];

  lines.push('#!/bin/bash');
  lines.push('');
  lines.push('# Color Migration Sed Script');
  lines.push('# Generated: ' + new Date().toISOString());
  lines.push('');
  lines.push('# WARNING: Review each replacement carefully before running!');
  lines.push('# Some colors may be intentionally hardcoded (e.g., brand colors in stories)');
  lines.push('');
  lines.push('# Usage: ./migrate-colors.sh');
  lines.push('');
  lines.push('set -e');
  lines.push('');

  // Group replacements by pattern type
  const stylePatterns: Map<string, string> = new Map();
  const strokePatterns: Map<string, string> = new Map();
  const fillPatterns: Map<string, string> = new Map();
  const bgPatterns: Map<string, string> = new Map();
  const textPatterns: Map<string, string> = new Map();
  const borderPatterns: Map<string, string> = new Map();
  const colorPropPatterns: Map<string, string> = new Map();

  for (const [color, token] of Object.entries(SARA_TOKEN_MAP)) {
    // Skip unmapped
    if (!token) continue;

    const colorLower = color.toLowerCase();

    // Tailwind class patterns (bg-[#hex], text-[#hex], border-[#hex])
    bgPatterns.set(color, token);
    textPatterns.set(color, token);
    borderPatterns.set(color, token);

    // SVG stroke/fill props
    strokePatterns.set(color, token);
    fillPatterns.set(color, token);

    // Generic color props
    colorPropPatterns.set(color, token);
  }

  lines.push('# Tailwind background class replacements');
  lines.push('echo "Replacing bg-[#hex] patterns..."');
  for (const [color, token] of bgPatterns) {
    const colorLower = color.toLowerCase();
    // Match both upper and lowercase
    lines.push(`find src -name "*.tsx" -exec sed -i '' 's/bg-\\[${color}\\]/bg-${token}/g' {} +`);
    if (colorLower !== color) {
      lines.push(
        `find src -name "*.tsx" -exec sed -i '' 's/bg-\\[${colorLower}\\]/bg-${token}/g' {} +`,
      );
    }
  }
  lines.push('');

  lines.push('# Tailwind text class replacements');
  lines.push('echo "Replacing text-[#hex] patterns..."');
  for (const [color, token] of textPatterns) {
    const colorLower = color.toLowerCase();
    lines.push(
      `find src -name "*.tsx" -exec sed -i '' 's/text-\\[${color}\\]/text-${token}/g' {} +`,
    );
    if (colorLower !== color) {
      lines.push(
        `find src -name "*.tsx" -exec sed -i '' 's/text-\\[${colorLower}\\]/text-${token}/g' {} +`,
      );
    }
  }
  lines.push('');

  lines.push('# Tailwind border class replacements');
  lines.push('echo "Replacing border-[#hex] patterns..."');
  for (const [color, token] of borderPatterns) {
    const colorLower = color.toLowerCase();
    lines.push(
      `find src -name "*.tsx" -exec sed -i '' 's/border-\\[${color}\\]/border-${token}/g' {} +`,
    );
    if (colorLower !== color) {
      lines.push(
        `find src -name "*.tsx" -exec sed -i '' 's/border-\\[${colorLower}\\]/border-${token}/g' {} +`,
      );
    }
  }
  lines.push('');

  lines.push('echo "Color migration complete!"');
  lines.push(
    'echo "NOTE: SVG stroke/fill and inline color props need manual migration using tailwind.color()"',
  );

  return lines.join('\n');
}

// ============================================================================
// JavaScript/TypeScript Codemod
// ============================================================================

function generateCodemodScript(result: ScanResult): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * Color Migration Codemod');
  lines.push(' * ');
  lines.push(' * This provides patterns for migrating different color contexts:');
  lines.push(' * - Tailwind classes: bg-[#hex] -> bg-token');
  lines.push(' * - SVG props: stroke="#hex" -> stroke={tailwind.color("token")}');
  lines.push(' * - Style objects: color: "#hex" -> color: tailwind.color("token")');
  lines.push(' */');
  lines.push('');
  lines.push('// Token mapping for reference');
  lines.push('const TOKEN_MAP = {');

  for (const [color, token] of Object.entries(SARA_TOKEN_MAP)) {
    lines.push(`  '${color}': '${token}',`);
  }

  lines.push('};');
  lines.push('');

  lines.push('// Helper to get token for a color');
  lines.push('function getToken(hexColor: string): string | undefined {');
  lines.push('  return TOKEN_MAP[hexColor.toUpperCase()];');
  lines.push('}');
  lines.push('');

  lines.push('// Migration patterns:');
  lines.push('');
  lines.push('// 1. Tailwind class in template literal:');
  lines.push('//    BEFORE: `bg-[#4CB6AC]`');
  lines.push('//    AFTER:  `bg-sara-accent`');
  lines.push('');
  lines.push('// 2. SVG stroke/fill prop:');
  lines.push('//    BEFORE: <Icon stroke="#4CB6AC" />');
  lines.push("//    AFTER:  <Icon stroke={tailwind.color('sara-accent')} />");
  lines.push('');
  lines.push('// 3. Style object:');
  lines.push("//    BEFORE: { color: '#16273D' }");
  lines.push("//    AFTER:  { color: tailwind.color('sara-text-primary') }");
  lines.push('');
  lines.push('// 4. ActivityIndicator/StatusBar color:');
  lines.push('//    BEFORE: <ActivityIndicator color="#4CB6AC" />');
  lines.push("//    AFTER:  <ActivityIndicator color={tailwind.color('sara-accent')} />");
  lines.push('');

  lines.push('export { TOKEN_MAP, getToken };');

  return lines.join('\n');
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const srcDir = path.join(process.cwd(), 'src');

  console.log('Scanning for hardcoded colors in', srcDir);
  console.log('');

  const result = scanDirectory(srcDir);

  // Generate report
  const report = generateReport(result);
  const reportPath = path.join(process.cwd(), 'scripts', 'color-migration-report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`Report written to: ${reportPath}`);

  // Generate sed script
  const sedScript = generateSedScript(result);
  const sedPath = path.join(process.cwd(), 'scripts', 'migrate-colors.sh');
  fs.writeFileSync(sedPath, sedScript);
  fs.chmodSync(sedPath, '755');
  console.log(`Sed script written to: ${sedPath}`);

  // Generate codemod reference
  const codemod = generateCodemodScript(result);
  const codemodPath = path.join(process.cwd(), 'scripts', 'color-token-map.ts');
  fs.writeFileSync(codemodPath, codemod);
  console.log(`Token map written to: ${codemodPath}`);

  // Print summary
  console.log('');
  console.log('=== Summary ===');
  console.log(`Total files scanned: ${result.totalFiles}`);
  console.log(`Total hardcoded colors: ${result.totalOccurrences}`);
  console.log(
    `Mapped to tokens: ${result.mappedOccurrences} (${((result.mappedOccurrences / result.totalOccurrences) * 100).toFixed(1)}%)`,
  );
  console.log(`Needs manual review: ${result.unmappedOccurrences}`);
  console.log('');

  if (result.unmappedColors.size > 0) {
    console.log('Unmapped colors (top 10):');
    const unmapped = Array.from(result.unmappedColors)
      .map(c => ({ color: c, count: result.colorFrequency.get(c) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    for (const { color, count } of unmapped) {
      console.log(`  ${color} (${count} occurrences)`);
    }
  }
}

main();
