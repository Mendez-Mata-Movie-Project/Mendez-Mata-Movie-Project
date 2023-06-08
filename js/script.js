const omdbApiKey = OMDB_KEY;

$.ajax({
    url: "https://peppermint-superficial-shame.glitch.me/movies",
    method: "GET"
}).done(function (data) {
    console.log(data);
    var movies = data;
    var table = '';

    for (var i = 0; i < movies.length; i++) {
        var movie = movies[i];
        fetch(`http://www.omdbapi.com/?t=${movie.title}&apikey=${omdbApiKey}`)
            .then(response => response.json())
            .then(omdbData => {
                let poster = omdbData.Poster;
                table += '<div>';
                table += `<h2>${movie.title}</h2>`;
                table += `<img src="${poster}" alt="${movie.title}">`;
                table += `<p>Rating: ${movie.rating}</p>`;
                table += '</div>';
                $('#movies-list').html(table);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}).fail(function (error) {
    console.log(error);
});
