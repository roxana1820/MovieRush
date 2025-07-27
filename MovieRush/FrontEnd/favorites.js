document.addEventListener("DOMContentLoaded", function () {
    const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];

    function displayFavoriteMovies() {
        const favoriteMoviesList = document.getElementById('favoriteMoviesList');
        favoriteMoviesList.innerHTML = ''; 

        if (favoriteMovies.length > 0) {
            favoriteMovies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');

                movieItem.innerHTML = `
                    <img src="${movie.poster}" alt="${movie.title}">
                    <h4>${movie.title}</h4>

                    <div class="comment-form">
                        <input type="text" id="authorName${movie.id}" placeholder="Your Name" required>
                        <textarea id="commentText${movie.id}" placeholder="Write your comment here..." maxlength="200" required></textarea>
                        <button type="button" onclick="saveComment(${movie.id})">Save Comment</button>
                    </div>

                  <button class="show-comments-btn" onclick="toggleComments(${movie.id})">Show Comments</button>
                  <div class="comments-list" id="commentsList${movie.id}"></div>
                `;

                favoriteMoviesList.appendChild(movieItem);
            });
        } else {
            favoriteMoviesList.innerHTML = "<p>You don't have any favorite movies.</p>";
        }
    }

    window.saveComment = function (movieId) {
        const authorName = document.getElementById(`authorName${movieId}`).value;
        const commentText = document.getElementById(`commentText${movieId}`).value;

        if (authorName.trim() && commentText.trim()) {
            const movie = favoriteMovies.find(m => m.id === movieId);
            const newComment = {
                author: authorName,
                date: new Date().toLocaleString(),
                text: commentText
            };

            if (!movie.comments) {
                movie.comments = [];
            }
            movie.comments.push(newComment);

            localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
            displayFavoriteMovies(); 
        } else {
            alert('Please fill in both fields (Name and Comment).');
        }
    };

    window.toggleComments = function (movieId) {
        const movie = favoriteMovies.find(m => m.id === movieId);
        const commentsList = document.getElementById(`commentsList${movieId}`);
    
        if (!commentsList.classList.contains("active")) {
            if (movie.comments && movie.comments.length > 0) {
                let commentsHtml = '';
                movie.comments.forEach(comment => {
                    commentsHtml += `
                        <div class="comment-item">
                            <span class="comment-author">${comment.author}</span> 
                            <span class="comment-date">${comment.date}</span>
                            <p class="comment-text">${comment.text}</p>
                        </div>
                    `;
                });
                commentsList.innerHTML = commentsHtml;
            } else {
                commentsList.innerHTML = "<p>No comments yet.</p>";
            }
    
            commentsList.classList.add("active");
        } else {
            commentsList.classList.remove("active");
        }
    };

    displayFavoriteMovies();
}); 