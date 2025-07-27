document.addEventListener("DOMContentLoaded", function () {
    const movies = [
        { "id": 1, "title": "Inception", "poster": "inception.jpg" },
        { "id": 2, "title": "The Dark Knight", "poster": "darknight.jpg" },
        { "id": 3, "title": "Avatar", "poster": "avatar.jpeg" },
        { "id": 4, "title": "Interstellar", "poster": "interstellar.jpg" },
        { "id": 5, "title": "Titanic", "poster": "titanic.jpg" },
        { "id": 6, "title": "The Matrix", "poster": "matrix.jpg" },
        { "id": 7, "title": "Gladiator", "poster": "gladiator.jpg" },
        { "id": 8, "title": "The Godfather", "poster": "godfather.jpg" },
        { "id": 9, "title": "Pulp Fiction", "poster": "pulpfiction.jpg" },
        { "id": 10, "title": "The Shawshank Redemption", "poster": "shawshank.jpg" },
        { "id": 11, "title": "Fight Club", "poster": "fightclub.webp" },
        { "id": 12, "title": "Forrest Gump", "poster": "forrestgump.jpg" }
    ];

    let sortOrder = 'asc';
    let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];

 
    function displayMovies(movieList) {
        const movieListContainer = document.getElementById('movieList');
        movieListContainer.innerHTML = '';

        movieList.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');

            movieItem.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}">
            <h4>${movie.title}</h4>
            <a href="movie_details.html?title=${encodeURIComponent(movie.title)}">
                <button>More Info</button>
            </a>
            <button onclick="markAsWatched(${movie.id})">Mark as Watched</button>
            <button onclick="addToFavorites(${movie.id})">Add to Favorites</button>
        `;
        

            movieListContainer.appendChild(movieItem);
        });
    }

    displayMovies(movies);


    if (window.location.pathname.indexOf("movies.html") !== -1) {
        document.getElementById('sortMoviesButton').addEventListener('click', function () {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            this.textContent = sortOrder === 'asc' ? 'Sort in Ascending Order' : 'Sort in Descending Order';

            const sortedMovies = [...movies].sort((a, b) => 
                sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
            );

            displayMovies(sortedMovies);
        });
    }

    window.addToFavorites = function (id) {
        const movie = movies.find(m => m.id === id);
        if (!favoriteMovies.some(m => m.id === movie.id)) {
            favoriteMovies.push(movie);
            localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
            showSuccessMessage(`"${movie.title}" has been added to favorites!`);
        } else {
            showSuccessMessage(`"${movie.title}" is already in your favorites list.`);
        }
    };

    window.markAsWatched = function (id) {
        const movie = movies.find(m => m.id === id);
        let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
    
        if (!watchedMovies.some(m => m.id === movie.id)) {
            watchedMovies.push(movie);
            localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
            showSuccessMessage(`"${movie.title}" has been added to your watched movies!`);
        } else {
            showSuccessMessage(`"${movie.title}" is already in your watched movies list.`);
        }
    };
    

    function showSuccessMessage(message) {
        const successMessageElement = document.getElementById('successMessage');
        successMessageElement.textContent = message;
        successMessageElement.style.display = 'block';

        setTimeout(() => {
            successMessageElement.style.display = 'none';
        }, 3000);
    }


    displayMovies(movies);


    document.getElementById('showFavoritesButton').addEventListener('click', function () {
        displayFavoriteMovies();
    });


    function displayFavoriteMovies() {
        const favoriteMoviesContainer = document.getElementById('movieList');
        favoriteMoviesContainer.innerHTML = '';

        if (favoriteMovies.length > 0) {
            favoriteMovies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');

                movieItem.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}">
                <h4>${movie.title}</h4>
                <a href="movie_details.html?title=${encodeURIComponent(movie.title)}">
                    <button>More Info</button>
                </a>
                <button onclick="addToFavorites(${movie.id})">Add to Favorites</button>
                <button onclick="markAsWatched(${movie.id})">Mark as Watched</button>
            `;

                favoriteMoviesContainer.appendChild(movieItem);
            });
        } else {
            favoriteMoviesContainer.innerHTML = "<p>You don't have any favorite movies.</p>";
        }
    }

  
});
