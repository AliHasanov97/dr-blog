"use client";

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
import { sendContactMessage } from "@/app/(site)/actions";
import { inquiryTypeOptions } from "@/lib/mock/contact";
import type {
  ContactFormErrors,
  ContactFormValues,
  InquiryType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

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
): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (values.fullName.trim().length < 3) {
    errors.fullName = "Ad və soyadınızı tam yazın (ən azı 3 simvol).";
  }

  const isEmail = /^\S+@\S+\.\S+$/.test(values.contact.trim());
  const isPhone = /^[+\d][\d\s()-]{8,}$/.test(values.contact.trim());
  if (!isEmail && !isPhone) {
    errors.contact = "Düzgün e-poçt və ya telefon nömrəsi daxil edin.";
  }

  if (opts.withSubject && values.subject.trim().length < 3) {
    errors.subject = "Müraciətin mövzusunu qeyd edin.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "Mesajınız ən azı 10 simvoldan ibarət olmalıdır.";
  }

  if (opts.withConsent && !values.consent) {
    errors.consent = "Davam etmək üçün şərtlərlə razılaşmalısınız.";
  }

  return errors;
}

export function ContactForm({
  title = "Müraciət Forması",
  description = "Məqalə təhlilləri, akademik çıxış təklifləri və ya mətbuat suallarınızı təqdim edin.",
  withConsent = true,
  withSubject = true,
  className,
}: ContactFormProps) {
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
    const nextErrors = validate(values, { withConsent, withSubject });
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
      setFeedback("Müraciət göndərilmədi. Bir azdan yenidən cəhd edin.");
    }
  }

  return (
    <Card className={cn("flex flex-col gap-space-md", className)}>
      <div className="flex flex-col gap-0.5">
        <span className="font-headline text-headline-md text-on-surface">
          {title}
        </span>
        <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-md">
        <SelectField
          label="Müraciət Növü"
          options={inquiryTypeOptions}
          value={values.inquiryType}
          onChange={(e) => update("inquiryType", e.target.value as InquiryType)}
        />

        <div className="grid gap-space-md sm:grid-cols-2">
          <TextField
            label="Adınız və Soyadınız"
            required
            icon="person"
            autoComplete="name"
            placeholder="Məs. Aygün Məmmədova"
            value={values.fullName}
            error={errors.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          <TextField
            label="Əlaqə Vasitəsi (Telefon / E-poçt)"
            required
            icon="contact_mail"
            placeholder="poct@unvan.az və ya +994 ..."
            value={values.contact}
            error={errors.contact}
            onChange={(e) => update("contact", e.target.value)}
          />
        </div>

        {withSubject && (
          <TextField
            label="Müraciətin Mövzusu"
            required
            placeholder="Qısa başlıq"
            value={values.subject}
            error={errors.subject}
            onChange={(e) => update("subject", e.target.value)}
          />
        )}

        <TextAreaField
          label="Mesajınız və ya Şərhiniz"
          required
          rows={5}
          placeholder="Müraciətinizin mətnini yazın..."
          value={values.message}
          error={errors.message}
          onChange={(e) => update("message", e.target.value)}
        />

        {withConsent && (
          <CheckboxField
            label="Fərdi məlumatların qorunması, elmi etik prinsiplər və konfidensiallıq şərtləri ilə razıyam."
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
          {status === "sending" ? "Göndərilir..." : "Mesajı Göndər"}
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
          Müraciətiniz həkimin assistenti və ya Dr. Nərmin Əliyeva tərəfindən
          24-48 saat ərzində cavablandırılacaqdır.
        </p>
      </form>
    </Card>
  );
}
