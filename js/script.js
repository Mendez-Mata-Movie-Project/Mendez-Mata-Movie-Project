const omdbApiKey = OMDB_KEY;

$.ajax({
    url: "https://peppermint-superficial-shame.glitch.me/movies",
    method: "GET"
}).done(function (data) {
    console.log(data);
    let movies = data;
    let movieListHtml = '';

    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        fetch(`http://www.omdbapi.com/?t=${movie.title}&apikey=${omdbApiKey}`)
            .then(response => response.json())
            .then(omdbData => {
                let poster = omdbData.Poster;
                movieListHtml += `
                  <div class="card ">
                    <img src="${poster}" class="card-img-top" alt="${movie.title}" width="200" height="275">
                    <div class="card-body">
                      <p class="card-title wrap-text">${movie.title}</p>
                      <p class="card-text">Rating: ${movie.rating}</p>
                    </div>
                  </div>`;


                $('#movies-list').html(movieListHtml);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}).fail(function (error) {
    console.log(error);
});
