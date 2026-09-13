import type { Instrumentation } from "next";

/**
 * Production-da server xətalarının mesajı Next tərəfindən gizlədilir
 * (yalnız `digest` qalır) — bu, təhlükəsizlik üçün doğrudur, amma
 * `DYNAMIC_SERVER_USAGE` kimi siqnalların HANSI route/komponentdən
 * gəldiyini loglardan görmək mümkün olmurdu. `onRequestError` isə
 * REDAKSİYA OLUNMAMIŞ orijinal xətaya çıxışı verir (mesaj + stack),
 * üstəlik hansı route-da, hansı render növündə baş verdiyini də bildirir.
 *
 * Yalnız diaqnostika üçündür — heç bir davranışı dəyişmir.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest: unknown }).digest)
      : undefined;

  console.error(
    "[onRequestError]",
    JSON.stringify(
      {
        message,
        digest,
        path: request.path,
        method: request.method,
        routePath: context.routePath,
        routeType: context.routeType,
        renderSource: context.renderSource,
        revalidateReason: context.revalidateReason,
      },
      null,
      2,
    ),
  );
  if (stack) console.error(stack);
};
