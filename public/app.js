const form = document.getElementById("upload-form");
const resultsDiv = document.getElementById("results");
let allTitles = []; // Store all results

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = form.querySelector('input[type="file"]');
    if (!fileInput.files?.length) return;

    const formData = new FormData();
    formData.append("watchlist", fileInput.files[0]);

    // Upload CSV and get movie titles
    const res = await fetch("/upload", {
        method: "POST",
        body: formData,
    });
    const titles = await res.json();

    // Get streaming services for all movies (no filter)
    const streamRes = await fetch("/streaming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles }),
    });
    allTitles = await streamRes.json();

    renderResults();
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