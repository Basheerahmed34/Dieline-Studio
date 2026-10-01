import { PackagingCategory, TemplateDefinition } from '../../types/dieline';
import { bagTemplates } from './bags';
import { foldingCartonTemplates } from './foldingCartons';
import { foodPackagingTemplates } from './foodPackaging';
import { labelTemplates } from './labels';
import { mailerShippingTemplates } from './mailerBoxes';
import { pouchTemplates } from './pouches';
import { specialtyTemplates } from './specialty';

export interface CategoryInfo {
  id: PackagingCategory;
  name: string;
  count: number;
  description: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'folding-cartons',
    name: 'Folding Cartons',
    count: foldingCartonTemplates.length,
    description: 'Tuck end boxes, auto-bottoms, snap locks, sleeves, and paperboard retail cartons.',
    icon: 'Box',
  },
  {
    id: 'mailer-shipping',
    name: 'Mailer & Shipping Boxes',
    count: mailerShippingTemplates.length,
    description: 'Roll-end tuck top mailers, RSC corrugated shipping cases, and one-piece folders.',
    icon: 'Package',
  },
  {
    id: 'food-packaging',
    name: 'Food Packaging',
    count: foodPackagingTemplates.length,
    description: 'Bakery boxes, clamshells, french fry scoops, noodle pails, and cake cartons.',
    icon: 'Utensils',
  },
  {
    id: 'pouches',
    name: 'Pouches & Flexible',
    count: pouchTemplates.length,
    description: 'Stand-up Doypack pouches, 3-side seal sachets, coffee bags, and fin seals.',
    icon: 'Layers',
  },
  {
    id: 'bags',
    name: 'Bags & Totes',
    count: bagTemplates.length,
    description: 'Euro-tote shopping bags, SOS grocery sacks, wine totes, and merchandise bags.',
    icon: 'ShoppingBag',
  },
  {
    id: 'labels',
    name: 'Labels & Tags',
    count: labelTemplates.length,
    description: 'Die-cut bottle labels, circular jar lids, wrap-arounds, and apparel hang tags.',
    icon: 'Tag',
  },
  {
    id: 'specialty',
    name: 'Specialty & Inserts',
    count: specialtyTemplates.length,
    description: 'Beverage bottle carriers, counter displays (CDU), folders, and grid partitions.',
    icon: 'Sparkles',
  },
];

export const ALL_TEMPLATES: TemplateDefinition[] = [
  ...foldingCartonTemplates,
  ...mailerShippingTemplates,
  ...foodPackagingTemplates,
  ...pouchTemplates,
  ...bagTemplates,
  ...labelTemplates,
  ...specialtyTemplates,
];

// Fast O(1) template lookup map
export const TEMPLATES_BY_ID: Record<string, TemplateDefinition> = ALL_TEMPLATES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, TemplateDefinition>
);

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATES_BY_ID[id] || ALL_TEMPLATES[0];
}

export function searchTemplates(
  query: string,
  categoryFilter?: PackagingCategory | 'all',
  difficultyFilter?: string
): TemplateDefinition[] {
  const cleanQ = query.trim().toLowerCase();

  return ALL_TEMPLATES.filter((tpl) => {
    // Category match
    if (categoryFilter && categoryFilter !== 'all' && tpl.category !== categoryFilter) {
      return false;
    }

    // Difficulty match
    if (difficultyFilter && difficultyFilter !== 'all' && tpl.difficulty !== difficultyFilter) {
      return false;
    }

    // Query match
    if (!cleanQ) return true;

    return (
      tpl.name.toLowerCase().includes(cleanQ) ||
      tpl.description.toLowerCase().includes(cleanQ) ||
      tpl.recommendedUse.toLowerCase().includes(cleanQ) ||
      (tpl.industryCode && tpl.industryCode.toLowerCase().includes(cleanQ))
    );
  });
}
