document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE = config.API_BASE;
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    const detailsDiv = document.getElementById("movieDetails");

    if (!movieId) {
        detailsDiv.innerHTML = "<p style='color:white;'>No movie selected.</p>";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/movies/details/${movieId}`);
        const movie = await response.json();

      
        const creditsResponse = await fetch(`${API_BASE}/api/movies/details/${movieId}/credits`);
        const credits = await creditsResponse.json();
        const topCast = credits.cast.slice(0, 5).map(actor => actor.name).join(", ");

        const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

        detailsDiv.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="movie-details-content">
                <h2>${movie.title} (${releaseYear})</h2>
                <p><strong>Rating:</strong> ⭐ ${movie.vote_average}</p>
                <p><strong>Main Actors:</strong> ${topCast}</p>
                <p>${movie.overview}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading movie details:', error);
        detailsDiv.innerHTML = `<p style='color:white;'>Error loading details: ${error.message}</p>`;

    }
});
