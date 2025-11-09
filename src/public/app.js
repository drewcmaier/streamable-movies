const form = document.getElementById("upload-form");
const resultsDiv = document.getElementById("results");
let allTitles = []; // Store all results

// Create a simple loading element (will be styled via CSS)
const loadingEl = document.createElement("div");
loadingEl.id = "loading";
loadingEl.innerHTML = `<div class="spinner" aria-hidden="true"></div><div class="loading-text">Loading…</div>`;

function setControlsDisabled(disabled) {
    // Disable/enable all inputs and buttons inside the form while fetching
    const controls = form.querySelectorAll('input, button');
    controls.forEach((c) => {
        c.disabled = disabled;
    });
}

function showLoading(message = "Loading…") {
    // update text and display in results area
    const textEl = loadingEl.querySelector('.loading-text');
    if (textEl) textEl.textContent = message;
    resultsDiv.innerHTML = "";
    resultsDiv.appendChild(loadingEl);
    setControlsDisabled(true);
}

function hideLoading() {
    if (resultsDiv.contains(loadingEl)) resultsDiv.removeChild(loadingEl);
    setControlsDisabled(false);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = form.querySelector('input[type="file"]');
    if (!fileInput.files?.length) return;

    const formData = new FormData();
    formData.append("watchlist", fileInput.files[0]);

    showLoading("Uploading watchlist…");

    try {
        // Upload CSV and get movie titles
        const res = await fetch("/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);

        const titles = await res.json();

        // Get streaming services for all movies (no filter)
        showLoading("Searching streaming services…");
        const streamRes = await fetch("/streaming", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ titles }),
        });

        if (!streamRes.ok) throw new Error(`Streaming lookup failed: ${streamRes.status} ${streamRes.statusText}`);

        allTitles = await streamRes.json();

        renderResults();
    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `<div class="error">${err?.message || 'An error occurred while searching.'}</div>`;
        allTitles = [];
    } finally {
        hideLoading();
    }
});

// Listen for checkbox changes to filter results
form.querySelectorAll('input[name="services"]').forEach(cb => {
    cb.addEventListener("change", renderResults);
});

function isAvailableOnCheckedServices(streaming, checkedServices) {
    return streaming.some(service => checkedServices.some(cs => service.includes(cs)));
}

function filterByCheckedServices(streaming, checkedServices) {
    return streaming.filter(service => checkedServices.some(cs => service.includes(cs)));
}

function renderResults() {
    const checkedServices = Array.from(
        form.querySelectorAll('input[name="services"]:checked')
    ).map((el) => el.value);

    let html = `<table><tr><th>Title</th><th>Streaming Services</th></tr>`;

    const sortedByAvailability = [...allTitles].sort((a, b) => {
        const aAvailable = isAvailableOnCheckedServices(a.streaming, checkedServices) ? 1 : 0;
        const bAvailable = isAvailableOnCheckedServices(b.streaming, checkedServices) ? 1 : 0;
        // Sort available first (descending), then by title
        return bAvailable - aAvailable || a.title.localeCompare(b.title);
    });

    for (const movie of sortedByAvailability) {
        // Filter streaming services by checked boxes
        const filtered = filterByCheckedServices(movie.streaming, checkedServices);
        html += `<tr class="${filtered.length > 0 ? '' : 'unavailable'}"><td>${movie.title}</td><td>${filtered.join(", ")}</td></tr>`;
    }

    html += `</table>`;
    resultsDiv.innerHTML = html;
}