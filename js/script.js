const omdbApiKey = OMDB_KEY;
$('#movies-list').html(`<div class="spinner-border text-light" role="status">
  <span class="visually-hidden"></span></div>`);

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
                    <div class="d-flex flex-column" >
                    <p class="card-title wrap-text d-inline text-center">${movie.title}</p>
                    <div class="mx-auto">
                          <i class="fa-regular fa-pen-to-square edit-icon mr-2" data-movie-id="${movie.id}"></i>
                          <i class="fa-solid fa-trash delete-icon" data-movie-id="${movie.id}"></i>
                          </div>
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

$('#save-add-button').on('click', function() {
    let newTitle = $('#movie-title-modal').val();
    let newRating = $('#movie-rating-modal').val();

    $.ajax({
        url: `https://peppermint-superficial-shame.glitch.me/movies/`,
        method: "POST",
        data: {
            title: newTitle,
            rating: newRating
        }
    }).then(() => fetch("https://peppermint-superficial-shame.glitch.me/movies")).then(resp => resp.json()).then(data => { console.log(data); location.reload(); });
    $('#add-movie-modal').modal('hide');
});


$('#title-input').on('keyup', function(e) {
   let searchText = $(this).val();

   if (searchText.length > 2) {
       $.ajax({
           url: `http://www.omdbapi.com/?s=${searchText}&apikey=${omdbApiKey}`,
           method: 'GET',
           success: function(response) {
               let movies = response.Search;
               let suggestions = '';
               if (movies) {
                   for (let i = 0; i < movies.length; i++) {
                       suggestions += `<p class="suggestion">${movies[i].Title}</p>`;
                   }
               }
               $('#search-results').html(suggestions);
           },
           error: function(error){
               console.log(error);
           }
       });
   }
});

$('#search-results').on('click', '.suggestion', function() {
    let selectedTitle = $(this).text();
    $('#movie-title-modal').val(selectedTitle);
    $('#search-results').empty();
    $('#add-movie-modal').modal('show');
});

$(document).click(function(event) {
    if(!$(event.target).closest('#title-input').length && !$(event.target).closest('#search-results').length) {
        $('#search-results').empty();
    }
});



