import { COMPLEX_DATASET } from '@/lib/complex_data';
import { COMPLEX_DATASET_3K } from '@/lib/complex_dataset_3k';

export default function sitemap() {
  // Merge curated dataset (priority 0.9) + full 3K dataset (priority 0.8)
  const curatedNames = new Set(COMPLEX_DATASET.map((c) => c.complex_name));
  const curatedPages = COMPLEX_DATASET.map((c) => ({
    url: `https://mdeeno.com/complex/${encodeURIComponent(c.complex_name)}`,
    priority: 0.9,
  }));
  const generatedPages = COMPLEX_DATASET_3K
    .filter((c) => !curatedNames.has(c.complex_name))
    .map((c) => ({
      url: `https://mdeeno.com/complex/${encodeURIComponent(c.complex_name)}`,
      priority: 0.8,
    }));
  const complexPages = [...curatedPages, ...generatedPages];

  return [
    { url: 'https://mdeeno.com', priority: 1 },
    { url: 'https://mdeeno.com/member', priority: 0.9 },
    { url: 'https://mdeeno.com/member/report-premium', priority: 0.9 },
    { url: 'https://mdeeno.com/member/report-basic', priority: 0.7 },
    { url: 'https://mdeeno.com/analysis/seoul', priority: 0.8 },
    { url: 'https://mdeeno.com/analysis/gangnam', priority: 0.8 },
    { url: 'https://mdeeno.com/analysis/mokdong', priority: 0.8 },
    { url: 'https://mdeeno.com/analysis/apgujeong-construction-cost', priority: 0.8 },
    { url: 'https://mdeeno.com/analysis/mokdong-contribution', priority: 0.8 },
    { url: 'https://mdeeno.com/analysis/yeouido-reconstruction', priority: 0.8 },
    { url: 'https://mdeeno.com/analysis/mapo-reconstruction', priority: 0.7 },
    { url: 'https://mdeeno.com/analysis/nowon-reconstruction', priority: 0.7 },
    ...complexPages,
  ];
}
