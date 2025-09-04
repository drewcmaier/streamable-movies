const form = document.getElementById("upload-form");
const resultsDiv = document.getElementById("results");
let allMovies = []; // Store all results

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
    allMovies = await streamRes.json();

    renderResults();
});

// Listen for checkbox changes to filter results
form.querySelectorAll('input[name="services"]').forEach(cb => {
    cb.addEventListener("change", renderResults);
});

function renderResults() {
    const checkedServices = Array.from(
        form.querySelectorAll('input[name="services"]:checked')
    ).map((el) => el.value);

    let html = `<table><tr><th>Title</th><th>Streaming Services</th></tr>`;
    for (const movie of allMovies) {
        // Filter streaming services by checked boxes
        const filtered = movie.streaming.filter(s => checkedServices.includes(s));
        if (filtered.length > 0) {
            html += `<tr><td>${movie.title}</td><td>${filtered.join(", ")}</td></tr>`;
        }
    }
    html += `</table>`;
    resultsDiv.innerHTML = html;
}