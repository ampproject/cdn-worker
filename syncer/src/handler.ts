/**
 * Request handler.
 */

import type {App} from '@octokit/app';
import type {WebhookEventName} from '@octokit/webhooks-types';

/** Logs and returns an error response. */
function respondWithError(error: string, status = 500): Response {
  console.log(error);
  return new Response(JSON.stringify({error}), {
    status,
    headers: {'content-type': 'application/json'},
  });
}

/** Handles a Worker request as a GitHub Webhook handler. */
export async function handleRequest(
  app: App,
  request: Request
): Promise<Response> {
  if (request.method === 'GET') {
    const {data} = await app.octokit.request('GET /app');
    return new Response(JSON.stringify(data));
  }

  const id = request.headers.get('X-Github-Delivery');
  const name = request.headers.get('X-Github-Event') as WebhookEventName;
  const signature = request.headers
    .get('X-Hub-Signature-256')
    ?.slice('sha256='.length);
  const payload = await request.json();

  if (!id) {
    return respondWithError('X-Github-Delivery header is missing', 400);
  }
  if (!name) {
    return respondWithError('X-Github-Event header is missing', 400);
  }
  if (!signature) {
    return respondWithError('X-Hub-Signature-256 header is missing', 403);
  }

  try {
    console.log('Handling event', name, 'with ID =', id);
    await app.webhooks.verifyAndReceive({
      id,
      name,
      payload,
      signature,
    });

    return new Response(JSON.stringify({ok: true}), {
      headers: {'content-type': 'application/json'},
    });
  } catch (error) {
    return respondWithError(
      error instanceof Error ? error.message : String(error)
    );
  }
}
