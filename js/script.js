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
                  <div class="card">
                    <div class="rating-overlay">
                      <p class="card-text card-rating p-0">${movie.rating}</p>
                    </div>
                    <img src="${poster}" class="card-img-top" alt="${movie.title}" width="200" height="275">
                    <div class="card-body">
                    <p class="card-title wrap-text d-inline text-center">${movie.title}</p>
                      <div class="d-flex justify-content-end align-self-end">
                          <i class="fa-regular fa-pen-to-square edit-icon" data-movie-id="${movie.id}"></i>
                          <i class="fa-solid fa-trash" data-movie-id="${movie.id}"></i>
                      </div>
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
