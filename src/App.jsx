import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      console.log(response)

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero1.png" alt="Hero Banner" />
          <h1>Discover Your Next <span className="text-gradient">Favorite</span> Movie</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App;








////***************************************************
// 
 

// import Search from "./components/Search";
// import React, { useEffect, useState } from "react";
// import Spinner from "./components/Spinner";
// import MovieCard from "./components/MovieCard";
// import { useDebounce } from "react-use";

// const API_BASE_URL = "https://api.themoviedb.org/3";
// const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
// const API_OPTIONS = {
//   method: "GET",
//   headers: {
//     accept: "application/json",
//     Authorization: `Bearer ${API_KEY}`,
//   },
// };
// const App = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [errorMessage, setErrorMessage] = useState("normal");
//   const [movieList, setMovieList] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [debouncedSearchTerm,setDebouncedSearchTerm]=useState('');
//   useDebounce(()=>setDebouncedSearchTerm(searchTerm), 500, [searchTerm] );

//   const fetchMovies = async (query = "") => {
//     setIsLoading(true);
//     setErrorMessage("");
//     try {
//       const endpoint = query
//         ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
//         : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

//       const response = await fetch(endpoint, API_OPTIONS);
//       if (!response.ok) {
//         throw new Error("Failed to fetch movies");
//       }
//       const data = await response.json();
//       //console.log(data);
//       if (data.Response == "False") {
//         setErrorMessage(data.Error || "Failed to fetch Movies");
//         setMovieList([]);
//         return;
//       }
//       setMovieList(data.results || []);
//     } catch (error) {
//       console.log("Error Fetching movie : ", error);
//       setErrorMessage("Error fetching movies. Please try again later....");
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   useEffect(() => {
//     fetchMovies(debouncedSearchTerm);
//   }, [debouncedSearchTerm]);

//   return (
//     <>
//       <main>
//         <div className="pattern" />
//         <div className="wrapper">
//           <header>
//             <img src="./hero1.png" alt="hero image" />
//             <h1>
//               Checkout your favorite{" "}
//               <span className="text-gradient">Movies</span> here...
//             </h1>
//           </header>

//           <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

//           <h3 className="text-3xl font-bold text-white [-webkit-text-stroke:2px_red]">
//             {errorMessage}
//           </h3>
//           <section className="all-movies">
//             <h2 className="mt-[40px]">All Movies</h2>
//             {isLoading ? (
//               <Spinner />
//             ) : errorMessage ? (
//               <p className="text-red-500">{errorMessage}</p>
//             ) : (
//               <ul>
//                 {movieList.map((movie) => (
//                   <MovieCard key={movie.id} movie={movie} />
//                 ))}
//               </ul>
//             )}
//           </section>
//         </div>
//       </main>
//     </>
//   );
// };

// export default App;
