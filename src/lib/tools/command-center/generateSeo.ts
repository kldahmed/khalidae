export async function generateSeo(pageData: any) {
  return {
    title: pageData.title || "عنوان مقترح...",
    metaDescription: pageData.description || "وصف ميتا مقترح...",
    ogTitle: pageData.ogTitle || "OG Title مقترح...",
    ogDescription: pageData.ogDescription || "OG Description مقترح...",
    keywordFocus: "كلمة مفتاحية رئيسية...",
    slug: pageData.title ? pageData.title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9\-]/g, '') : "slug",
  };
}
