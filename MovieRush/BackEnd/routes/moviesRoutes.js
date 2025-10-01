const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

router.get('/genres', async(req,res)=> {
     try{
        const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
        res.json(response.data.genres);
     }catch(error){
        console.error('Error fetching genres:', error.message);
        res.status(500).json({error:'Failed to fetch genres'});
     }
});

router.get('/by-genre/:genreId', async (req, res) => {
    try {
        const genreId = req.params.genreId;
        const page = req.query.page || 1;
        const response = await axios.get(
            `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=${genreId}&page=${page}`
        );
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching movies by genre:', error.message);
        res.status(500).json({ error: 'Failed to fetch movies by genre' });
    }
});



router.get('/top-rated', async (req, res) => {
    try {
        const page = req.query.page || 1;
        console.log(`Fetching top-rated movies for page ${page}`);
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
        );
        console.log('TMDB response:', response.data.results.length, 'movies');
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching top rated movies:', error.message);
        res.status(500).json({ error: 'Failed to fetch top rated movies' });
    }
});

router.get('/all', async (req, res) => {
    try {
        const [popular, topRated, upcoming, nowPlaying] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
            axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
            axios.get(`https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
            axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
        ]);

         res.json({
            popular: popular.data.results.slice(0, 13),
            topRated: topRated.data.results.slice(0, 13),
            upcoming: upcoming.data.results.slice(0, 13),
            nowPlaying: nowPlaying.data.results.slice(0, 13),
        });
    } catch (error) {
        console.error('Error fetching movies:', error.message);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

//for the movies details page
router.get('/details/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        if (!movieId || isNaN(movieId)) {
            return res.status(400).json({ error: 'Invalid movie ID' });
        }
        console.log(`Details route hit for movie ID: ${movieId}`); 
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movie details:', error.message);
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
});

router.get('/details/:id/credits', async (req, res) => {
    try {
        const movieId = req.params.id;
        if (!movieId || isNaN(movieId)) {
            return res.status(400).json({ error: 'Invalid movie ID' });
        }
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movie credits:', error.message);
        res.status(500).json({ error: 'Failed to fetch movie credits' });
    }
});

module.exports = router;