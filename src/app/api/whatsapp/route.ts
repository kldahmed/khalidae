async function processIncomingWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
  const ownerPhone = normalizePhone(requireEnv("OWNER_PHONE"));
  const messages = extractIncomingMessages(payload);

  console.log("[whatsapp] incoming messages count:", messages.length);
  console.log("[whatsapp] owner phone:", ownerPhone);

  for (const message of messages) {
    console.log("[whatsapp] incoming from:", message.from);
    console.log("[whatsapp] incoming type:", message.type);
    console.log("[whatsapp] incoming text:", message.text);

    try {
      if (message.from !== ownerPhone) {
        console.log("[whatsapp] unauthorized sender");
        await sendWhatsAppMessage(message.from, "غير مصرح");
        continue;
      }

      await sendTypingIndicator(message.from, message.messageId);

      if (message.type !== "text" || !message.text) {
        console.log("[whatsapp] unsupported message type");
        await sendWhatsAppMessage(message.from, "Please send a text message only.");
        continue;
      }

      console.log("[whatsapp] sending instruction to manager...");
      const managerResult = await executeManagerInstruction(message.text);

      console.log("[whatsapp] manager result:", JSON.stringify(managerResult));

      const reply = managerResult.ok
        ? managerResult.output ||
          (managerResult.language === "ar"
            ? "تمت المعالجة بدون رد نصي."
            : "Processed successfully with no text response.")
        : managerResult.error ||
          (managerResult.language === "ar"
            ? "حدث خطأ أثناء المعالجة."
            : "An error occurred while processing the request.");

      const chunks = splitLongMessage(reply, 1500);

      console.log("[whatsapp] reply chunks:", chunks.length);

      for (const chunk of chunks) {
        console.log("[whatsapp] sending reply chunk:", chunk);
        await sendWhatsAppMessage(message.from, chunk);
      }

      console.log("[whatsapp] reply sent successfully");
    } catch (error) {
      console.error("[whatsapp] processing failed:", error);

      try {
        await sendWhatsAppMessage(
          message.from,
          "حدث خطأ أثناء تنفيذ الطلب."
        );
      } catch (sendError) {
        console.error("[whatsapp] fallback send failed:", sendError);
      }
    }
  }
}