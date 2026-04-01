export async function generateBrief(pageData: any, strategic = false) {
  if (strategic) {
    return `تحليل استراتيجي:\n- نقاط القوة: ...\n- نقاط الضعف: ...\n- الفرص: ...\n- التهديدات: ...`;
  }
  return `ملخص تنفيذي:\n- ${pageData.title || "(بدون عنوان)"}\n- وصف مختصر: ${pageData.description || pageData.bodyText?.slice(0, 120) || "(لا يوجد)"}`;
}
