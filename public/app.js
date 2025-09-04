const form = document.getElementById("upload-form");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = form.querySelector('input[type="file"]');
    const checkedServices = Array.from(
        form.querySelectorAll('input[name="services"]:checked')
    ).map((el) => el.value);

    if (!fileInput.files?.length) return;

    const formData = new FormData();
    formData.append("watchlist", fileInput.files[0]);

    // Upload CSV and get movie titles
    const res = await fetch("/upload", {
        method: "POST",
        body: formData,
    });
    const titles = await res.json();

    // Get streaming services
    const streamRes = await fetch("/streaming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles, services: checkedServices }),
    });
    const movies = await streamRes.json();

    // Render results
    let html = `<table><tr><th>Title</th><th>Streaming Services</th></tr>`;
    for (const movie of movies) {
        html += `<tr><td>${movie.title}</td><td>${movie.streaming.join(", ")}</td></tr>`;
    }
    html += `</table>`;
    resultsDiv.innerHTML = html;
});