document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');

    if (title) {
        const apiKey = '71585c23'; 
        const apiUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&plot=full&apikey=${apiKey}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.Response === "True") {
                    const movieDetails = document.getElementById('movieDetails');
                    movieDetails.innerHTML = `
                     <div class="movie-details">as
                     <img src="${data.Poster}" alt="${data.Title}">
                     <div class="text">
                     <h1>${data.Title} (${data.Year})</h1>
                     <p><strong>Director:</strong> ${data.Director}</p>
                     <p><strong>Duration:</strong> ${data.Runtime}</p>
                     <p><strong>Rating:</strong> ${data.imdbRating}</p>
                     <p><strong>Genre:</strong> ${data.Genre}</p>
                     <p><strong>Description:</strong> ${data.Plot}</p>
                     </div>
                     </div>
                    `;
                } else {
                    alert("No information was found for this movie.");
                }
            })
            .catch(error => {
                console.error("Error retrieving data from OMDb API", error);
                alert("An error occurred while loading the movie information.");
            });
    } else {
        alert("No search parameters were provided for the movie.");
    }
});
