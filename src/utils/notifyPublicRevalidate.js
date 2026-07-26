/**
 * Ask the public Next.js site to bust its CMS Data Cache (revalidateTag("cms")).
 * Failures are logged only — admin mutations must not fail because of this.
 */
export async function notifyPublicRevalidate(reason = 'cms-update') {
  const siteUrl = (
    process.env.PUBLIC_WEB_URL ||
    process.env.CLIENT_URL ||
    ''
  ).replace(/\/$/, '');
  const secret = process.env.REVALIDATE_SECRET?.trim();

  if (!siteUrl || !secret) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.warn(
        `[revalidate] Failed (${response.status}) after ${reason}:`,
        body.slice(0, 200)
      );
      return;
    }

    console.log(`[revalidate] Public CMS cache busted (${reason})`);
  } catch (err) {
    console.warn(
      `[revalidate] Could not reach public site after ${reason}:`,
      err?.message || err
    );
  } finally {
    clearTimeout(timeout);
  }
}
