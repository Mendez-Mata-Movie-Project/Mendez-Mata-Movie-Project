const omdbApiKey = OMDB_KEY;
$('#movies-list').html(`<div class="spinner-border text-light" role="status">
  <span class="visually-hidden">Loading...</span></div>`);

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
                      <div class="d-flex justify-content-end align-self-end" >
                          <i class="fa-regular fa-pen-to-square edit-icon" data-movie-id="${movie.id}"></i>
                          <i class="fa-solid fa-trash delete-icon" data-movie-id="${movie.id}"></i>
                         
                      </div>
                    </div>
                  </div>`;
                $('#movies-list').html(movieListHtml);

                $("body").on('click', '.delete-icon', function(){
                    let movieId = $(this).data('movie-id');
                    $('#delete-modal').data('movie-id', movieId).modal('show');

                    $('#confirm-delete').on('click', function(){
                        let movieId = $('#delete-modal').data('movie-id');
                        $.ajax({url: `https://peppermint-superficial-shame.glitch.me/movies/${movieId}`,
                            method: "DELETE"

                        }).then(() => fetch("https://peppermint-superficial-shame.glitch.me/movies")).then(resp => resp.json()).then(data => { console.log(data); location.reload(); });
                        $('#delete-modal').modal('hide');
                    })
                })
                $("body").on('click', '.edit-icon', function(){
                    let movieId = $(this).data('movie-id');
                    $.ajax({url: `https://peppermint-superficial-shame.glitch.me/movies/${movieId}`,
                        method: "GET"
                    }).done(function (movie){
                        $('#edit-title-input').val(movie.title);
                        $('#edit-rating-input').val(movie.rating);

                        $('#edit-modal').data('movie-id', movieId);
                        $('#edit-modal').modal('show');
                    })
                });

                $('#save-edit-button').on('click', function(){
                    let movieId = $('#edit-modal').data('movie-id');

                    let updatedTitle = $('#edit-title-input').val();
                    let updatedRating = $('#edit-rating-input').val();

                    $.ajax({url: `https://peppermint-superficial-shame.glitch.me/movies/${movieId}`,
                        method: "PUT",
                        data: {
                            title: updatedTitle,
                            rating: updatedRating
                        }
                    }).then(() => fetch("https://peppermint-superficial-shame.glitch.me/movies")).then(resp => resp.json()).then(data => { console.log(data); location.reload(); });
                    $('#edit-modal').modal('hide');
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}).fail(function (error) {
    console.log(error);
});

$('#add-movie-form').on('submit', function(e) {
    e.preventDefault();

    let newTitle = $('#title').val();
    let newRating = $('#rating').val();

    $.ajax({url: `https://peppermint-superficial-shame.glitch.me/movies/`,
        method: "POST",
        data: {
            title: newTitle,
            rating: newRating
        }
    }).then(() => fetch("https://peppermint-superficial-shame.glitch.me/movies")).then(resp => resp.json()).then(data => { console.log(data); location.reload(); });

});
