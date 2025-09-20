import fetch from 'node-fetch';


const SERVICE_MAP = {
    "HBO Max": 1899,
    "Hulu": 15,
    "Amazon Prime": 9,
    "Disney Plus": 337,
    "Tubi TV": 73,
    "Pluto TV": 300,
    "Netflix": 8,
    "Netflix Standard with Ads": 1796,
};

export async function getStreamingServices(titles) {
    const results = [];

    const token = process.env.TMDB_API_TOKEN;

    const fetchOptions = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    };

    for (const title of titles) {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
            title
        )}`;
        const searchRes = await fetch(searchUrl, fetchOptions).then((r) => r.json());
        const movie = searchRes.results?.[0];
        if (!movie) {
            continue;
        }
        const providersUrl = `https://api.themoviedb.org/3/movie/${movie.id}/watch/providers`;
        const providersRes = await fetch(providersUrl, fetchOptions).then((r) => r.json());
        const usProviders = providersRes.results?.US?.flatrate || [];
        const available = usProviders
            .map((prov) => prov.provider_name);

        results.push({ title, streaming: available });
    }
    return results.sort((a, b) => {
        const primary = a.streaming.join(",").localeCompare(b.streaming.join(","));
        if (primary !== 0) return primary;
        return a.title.localeCompare(b.title);
    });
}
