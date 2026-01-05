export const CATEGORY_COLORS: Record<string, string> = {
  'gıda': '#FFD6C9',
  'sağlık': '#E4E7EB',
  'ulaşım': '#CDEED6',
  'eğlence': '#E3D5F5',
  'giyim': '#F8C8DC',
  'diğer': '#8FAF9A',
};

export const getCategoryColor = (tur?: string) => {
  if (!tur) return CATEGORY_COLORS['diğer'];
  const key = tur.toLowerCase();
  return CATEGORY_COLORS[key] || CATEGORY_COLORS['diğer'];
};
