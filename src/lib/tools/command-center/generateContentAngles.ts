export async function generateContentAngles(pageData: any) {
  return {
    strongTitle: pageData.title ? `🚀 ${pageData.title}` : "عنوان قوي...",
    hook: "Hook قصير يجذب الانتباه...",
    twitter: "تغريدة X/Twitter ملهمة...",
    instagram: "Instagram caption جذاب...",
    linkedin: "زاوية LinkedIn احترافية...",
    youtube: "عنوان YouTube مثير...",
    cta: "دعوة لاتخاذ إجراء (CTA) واضحة...",
  };
}
