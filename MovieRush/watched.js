document.addEventListener("DOMContentLoaded", function () {
    const watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];

    function displayWatchedMovies() {
        const watchedMoviesList = document.getElementById('watchedMoviesList');
        watchedMoviesList.innerHTML = ''; 

        if (watchedMovies.length > 0) {
            watchedMovies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');

                movieItem.innerHTML = `
                    <img src="${movie.poster}" alt="${movie.title}">
                    <h4>${movie.title}</h4>
                     <a href="movie_details.html?title=${encodeURIComponent(movie.title)}">
                       <button>More Info</button>
                     </a>
                    <button onclick="removeFromWatched(${movie.id})">Remove from Watched</button>
                `;

                watchedMoviesList.appendChild(movieItem);
            });
        } else {
            watchedMoviesList.innerHTML = "<p>You don't have any watched movies.</p>";
        }
    }

    window.removeFromWatched = function (id) {
        const index = watchedMovies.findIndex(m => m.id === id);
        if (index !== -1) {
            watchedMovies.splice(index, 1);
            localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
            displayWatchedMovies();
        }
    };

    displayWatchedMovies();
});
