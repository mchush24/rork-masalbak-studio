/**
 * Showcase Data - Fallback content for the Discover screen
 *
 * Displayed when backend returns empty results so the
 * screen never feels barren. Shared between discover.tsx
 * and DiscoverSection (home page).
 */

// Gallery items shown when no community content is available
export const SHOWCASE_GALLERY = [
  {
    id: 'showcase-1',
    image_url: '',
    thumbnail_url: null,
    child_age: 5,
    theme: 'family',
    content_type: 'drawing',
    likes_count: 24,
  },
  {
    id: 'showcase-2',
    image_url: '',
    thumbnail_url: null,
    child_age: 7,
    theme: 'nature',
    content_type: 'coloring',
    likes_count: 18,
  },
  {
    id: 'showcase-3',
    image_url: '',
    thumbnail_url: null,
    child_age: 4,
    theme: 'animals',
    content_type: 'drawing',
    likes_count: 31,
  },
  {
    id: 'showcase-4',
    image_url: '',
    thumbnail_url: null,
    child_age: 6,
    theme: 'fantasy',
    content_type: 'coloring',
    likes_count: 15,
  },
  {
    id: 'showcase-5',
    image_url: '',
    thumbnail_url: null,
    child_age: 8,
    theme: 'emotions',
    content_type: 'drawing',
    likes_count: 27,
  },
  {
    id: 'showcase-6',
    image_url: '',
    thumbnail_url: null,
    child_age: 5,
    theme: 'seasons',
    content_type: 'coloring',
    likes_count: 12,
  },
] as const;

// Success stories shown when no user stories are available
export const SHOWCASE_STORIES = [
  {
    id: 'showcase-s1',
    title: 'Renklerle İfade',
    content:
      'Kızım boyama yaparken duygularını ifade etmeye başladı. Renk seçimleri ile iç dünyasını anlamamıza yardımcı oldu.',
    child_age: 6,
    author_type: 'parent',
    images: [] as string[],
    likes_count: 42,
    is_featured: true,
  },
  {
    id: 'showcase-s2',
    title: 'Masal Dünyası',
    content:
      'Oğlum kendi masallarını oluşturmaya bayılıyor. Her gece yatmadan önce birlikte yeni bir hikaye yazıyoruz.',
    child_age: 5,
    author_type: 'parent',
    images: [] as string[],
    likes_count: 35,
    is_featured: false,
  },
  {
    id: 'showcase-s3',
    title: 'Çizimle Gelişim',
    content:
      'Çocuğumun çizimlerindeki gelişimi izlemek çok güzel. Her hafta daha detaylı ve anlamlı çizimler yapıyor.',
    child_age: 7,
    author_type: 'parent',
    images: [] as string[],
    likes_count: 29,
    is_featured: false,
  },
] as const;

// Type helpers for consumers
export type ShowcaseGalleryItem = (typeof SHOWCASE_GALLERY)[number];
export type ShowcaseStoryItem = (typeof SHOWCASE_STORIES)[number];
