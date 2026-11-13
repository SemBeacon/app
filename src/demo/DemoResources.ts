import iot from './fixtures/iot.ttl?raw';
import solidProfile from './fixtures/solid-profile.ttl?raw';

interface DemoResource {
    body: string;
    finalUrl: string;
    contentType?: string;
}

const DEMO_IOT = 'https://sembeacon.org/examples/demo/iot.ttl#smart_light';
const DEMO_PROFILE = 'https://solid.maximvdw.be/profile/card#me';

const RESOURCES: Record<string, DemoResource> = {
    'https://bit.ly/demo-iot': { body: iot, finalUrl: DEMO_IOT },
    'https://sembeacon.org/examples/demo/iot.ttl': { body: iot, finalUrl: DEMO_IOT },
    'https://bit.ly/demo-profile': { body: solidProfile, finalUrl: DEMO_PROFILE },
    'https://solid.maximvdw.be/profile/card#me': { body: solidProfile, finalUrl: DEMO_PROFILE },
};

/** Extract the resource URI from a (possibly proxied) request URL. */
function requestedUri(input: RequestInfo | URL): string {
    const raw =
        typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    try {
        const url = new URL(raw, window.location.origin);
        if (url.hostname === 'proxy.sembeacon.org') {
            return url.searchParams.get('uri') ?? raw;
        }
        return raw;
    } catch {
        return raw;
    }
}

/**
 * Fetch a demo resource from the app bundle. Resources that are not part of the local demo
 * (for example the OpenHPS example building) are fetched from the website as usual; when
 * that fails, the scanner shows the offline error and offers a retry.
 */
export async function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const uri = requestedUri(input);
    const resource =
        RESOURCES[uri] ??
        RESOURCES[uri.replace(/#.*$/, '')] ??
        // The proxy may decode or normalize the URI slightly
        Object.entries(RESOURCES).find(([key]) => uri.startsWith(key))?.[1];
    if (!resource) {
        return globalThis.fetch(input, init);
    }
    return new Response(resource.body, {
        status: 200,
        headers: {
            'content-type': resource.contentType ?? 'text/turtle; charset=utf-8',
            'x-final-url': resource.finalUrl,
            'cache-control': 'max-age=0',
        },
    });
}

/** Map the local demo resources to stable short URIs (no network for the demo device). */
export async function demoShorten(uri: string): Promise<string> {
    if (uri === DEMO_PROFILE) {
        return 'https://bit.ly/demo-profile';
    }
    if (uri.startsWith('https://sembeacon.org/examples/demo/iot.ttl')) {
        return 'https://bit.ly/demo-iot';
    }
    return uri;
}
