import { nextId, store } from "@/lib/mock/store";
import type {
  ApiResult,
  ContactChannel,
  ContactFormValues,
  FaqItem,
  OfficeLocation,
} from "@/lib/types";
import { USE_MOCK } from "./config";
import { safeDb } from "./safe";
import { mockResponse } from "./http";
import {
  dbGetContactChannels,
  dbGetOfficeLocation,
  dbGetFaqItems,
  dbSubmitContactMessage,
  dbSubscribeNewsletter,
} from "@/lib/db/contact";

export const getContactChannels = async (): Promise<ContactChannel[]> => {
  if (!USE_MOCK)
    return safeDb("əlaqə kanalları", dbGetContactChannels, []);
  return mockResponse(store.channels);
};

export const getOfficeLocation = async (): Promise<OfficeLocation> => {
  if (!USE_MOCK) {
    const office = await safeDb("ünvan", dbGetOfficeLocation, null);
    return office ?? store.office;
  }
  return mockResponse(store.office);
};

export const getFaq = async (): Promise<FaqItem[]> => {
  if (!USE_MOCK) return safeDb("tez-tez verilən suallar", dbGetFaqItems, []);
  return mockResponse(store.faq);
};

/** Müraciət formasının göndərilməsi */
export async function submitContactForm(
  values: ContactFormValues,
): Promise<ApiResult<null>> {
  if (!USE_MOCK) {
    const result = await dbSubmitContactMessage(values);
    return {
      data: null,
      success: result.success,
      message: result.message,
    };
  }
  // Mock: müraciət admin panelin gələnlər qutusuna düşür
  store.messages.unshift({
    id: nextId("msg"),
    fullName: values.fullName,
    contact: values.contact,
    subject: values.subject || "Mövzu göstərilməyib",
    message: values.message,
    inquiryTypeLabel: values.inquiryType,
    receivedAtLabel: new Date().toLocaleString("az-AZ"),
    status: "new",
  });
  return mockResponse<ApiResult<null>>({
    data: null,
    success: true,
    message: "Müraciətiniz uğurla göndərildi. Tezliklə sizinlə əlaqə saxlanılacaq.",
  });
}

/** Bülletenə abunəlik */
export async function subscribeNewsletter(
  email: string,
): Promise<ApiResult<null>> {
  if (!USE_MOCK) {
    const result = await dbSubscribeNewsletter(email);
    return {
      data: null,
      success: result.success,
      message: result.message,
    };
  }
  // Mock: abunəçi admin panelin siyahısına düşür
  if (!store.subscribers.some((s) => s.email === email)) {
    store.subscribers.unshift({
      id: nextId("sub"),
      email,
      subscribedAtLabel: new Date().toLocaleDateString("az-AZ"),
      isActive: true,
    });
  }
  return mockResponse<ApiResult<null>>({
    data: null,
    success: true,
    message: "Təşəkkür edirik! İlk bülletenimiz tezliklə ünvanınıza çatacaq.",
  });
}
