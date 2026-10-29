import { auth } from "@/lib/auth";

/**
 * Shared guards for API routes.
 *
 * Every route resolves the caller here and scopes its queries by the returned
 * id. A userId is never read from a request body — the session cookie is the
 * only thing that decides whose rows a request can touch.
 */

export async function requireUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user.id ?? null;
}

export const unauthorized = () => Response.json({ error: "Not signed in" }, { status: 401 });

export const notFound = (what: string) => Response.json({ error: `${what} not found` }, { status: 404 });

export const invalid = (message: string, issues?: unknown) =>
  Response.json({ error: message, issues }, { status: 422 });
