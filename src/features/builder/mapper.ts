type LocalizedError = {
  ar?: string;
  en?: string;
};

type ErrorObject = {
  error?: LocalizedError | string;
};

export function mapError(
  error: unknown,
  locale: "ar" | "en" = "ar"
) {
  if (!error) {
    return {
      type: "server",
      message:
        locale === "ar"
          ? "فشل الاتصال بالخادم"
          : "Failed to reach server",
    };
  }

  if (typeof error === "string") {
    return {
      type: "server",
      message: error,
    };
  }

  if (typeof error === "object") {
    const e = error as ErrorObject;

    if (typeof e.error === "string") {
      return {
        type: "server",
        message: e.error,
      };
    }

    if (typeof e.error === "object" && e.error) {
      return {
        type: "server",
        message:
          e.error[locale] ||
          e.error.en ||
          e.error.ar ||
          "Server error",
      };
    }
  }

  return {
    type: "server",
    message:
      locale === "ar"
        ? "خطأ غير معروف"
        : "Unknown error",
  };
}