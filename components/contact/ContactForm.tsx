"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Card,
  CheckboxField,
  Icon,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui";
import { sendContactMessage } from "@/app/[locale]/(site)/actions";
import type {
  ContactFormErrors,
  ContactFormValues,
  InquiryType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const INQUIRY_TYPES: InquiryType[] = [
  "scientific",
  "collaboration",
  "press",
  "general",
];

export interface ContactFormProps {
  title?: string;
  description?: string;
  /** Razılıq checkbox-u göstərilsin (Əlaqə səhifəsində bəli, Haqqında səhifəsində xeyr) */
  withConsent?: boolean;
  /** Mövzu sahəsi göstərilsin */
  withSubject?: boolean;
  className?: string;
}

const emptyValues: ContactFormValues = {
  inquiryType: "scientific",
  fullName: "",
  contact: "",
  subject: "",
  message: "",
  consent: false,
};

function validate(
  values: ContactFormValues,
  opts: { withConsent: boolean; withSubject: boolean },
  t: ReturnType<typeof useTranslations>,
): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (values.fullName.trim().length < 3) {
    errors.fullName = t("errorFullName");
  }

  const isEmail = /^\S+@\S+\.\S+$/.test(values.contact.trim());
  const isPhone = /^[+\d][\d\s()-]{8,}$/.test(values.contact.trim());
  if (!isEmail && !isPhone) {
    errors.contact = t("errorContact");
  }

  if (opts.withSubject && values.subject.trim().length < 3) {
    errors.subject = t("errorSubject");
  }

  if (values.message.trim().length < 10) {
    errors.message = t("errorMessage");
  }

  if (opts.withConsent && !values.consent) {
    errors.consent = t("errorConsent");
  }

  return errors;
}

export function ContactForm({
  title,
  description,
  withConsent = true,
  withSubject = true,
  className,
}: ContactFormProps) {
  const t = useTranslations("contact.form");
  const tTypes = useTranslations("contact.inquiryTypes");
  const inquiryTypeOptions = INQUIRY_TYPES.map((value) => ({
    value,
    label: tTypes(value),
  }));
  const [values, setValues] = useState<ContactFormValues>(emptyValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");
  const [feedback, setFeedback] = useState("");

  function update<K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setStatus("idle");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(values, { withConsent, withSubject }, t);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("sending");
    try {
      const result = await sendContactMessage(values);
      setStatus(result.success ? "sent" : "failed");
      setFeedback(result.message);
      /* Forma yalnız uğurlu göndərişdə təmizlənir — əks halda istifadəçi
       * yazdıqlarını itirər. */
      if (result.success) setValues(emptyValues);
    } catch {
      setStatus("failed");
      setFeedback(t("submitFailedRetry"));
    }
  }

  return (
    <Card className={cn("flex flex-col gap-space-md", className)}>
      <div className="flex flex-col gap-0.5">
        <span className="font-headline text-headline-md text-on-surface">
          {title ?? t("defaultTitle")}
        </span>
        <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
          {description ?? t("defaultDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-md">
        <SelectField
          label={t("inquiryTypeLabel")}
          options={inquiryTypeOptions}
          value={values.inquiryType}
          onChange={(e) => update("inquiryType", e.target.value as InquiryType)}
        />

        <div className="grid gap-space-md sm:grid-cols-2">
          <TextField
            label={t("fullNameLabel")}
            required
            icon="person"
            autoComplete="name"
            placeholder={t("fullNamePlaceholder")}
            value={values.fullName}
            error={errors.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          <TextField
            label={t("contactLabel")}
            required
            icon="contact_mail"
            placeholder={t("contactPlaceholder")}
            value={values.contact}
            error={errors.contact}
            onChange={(e) => update("contact", e.target.value)}
          />
        </div>

        {withSubject && (
          <TextField
            label={t("subjectLabel")}
            required
            placeholder={t("subjectPlaceholder")}
            value={values.subject}
            error={errors.subject}
            onChange={(e) => update("subject", e.target.value)}
          />
        )}

        <TextAreaField
          label={t("messageLabel")}
          required
          rows={5}
          placeholder={t("messagePlaceholder")}
          value={values.message}
          error={errors.message}
          onChange={(e) => update("message", e.target.value)}
        />

        {withConsent && (
          <CheckboxField
            label={t("consentLabel")}
            checked={values.consent}
            error={errors.consent}
            onChange={(checked) => update("consent", checked)}
          />
        )}

        <Button
          type="submit"
          icon="send"
          fullWidth
          size="lg"
          disabled={status === "sending"}
        >
          {status === "sending" ? t("sending") : t("submitCta")}
        </Button>

        {status === "sent" && (
          <Alert tone="success" icon="check_circle">
            {feedback}
          </Alert>
        )}

        {status === "failed" && (
          <Alert tone="danger" icon="error">
            {feedback}
          </Alert>
        )}

        <p className="flex items-start gap-1 font-label text-label-sm text-outline leading-relaxed">
          <Icon name="schedule" size={14} className="mt-0.5" />
          {t("responseTimeHint")}
        </p>
      </form>
    </Card>
  );
}
