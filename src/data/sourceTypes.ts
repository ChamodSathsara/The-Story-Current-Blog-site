import type { SourceType } from '../types/models';

export const sourceTypes: {value: SourceType;label: string;}[] = [
{ value: 'original', label: 'Original reporting' },
{ value: 'official', label: 'Official announcement' },
{ value: 'government', label: 'Government source' },
{ value: 'news', label: 'News publication' },
{ value: 'research', label: 'Research publication' },
{ value: 'press_release', label: 'Press release' },
{ value: 'other', label: 'Other' }];


export function sourceTypeLabel(t: SourceType): string {
  return sourceTypes.find((s) => s.value === t)?.label ?? 'Other';
}