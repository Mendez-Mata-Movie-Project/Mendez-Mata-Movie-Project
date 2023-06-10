const omdbApiKey = OMDB_KEY;
$('#movies-list').html(`<div class="spinner-border text-danger" role="status">
  <span class="visually-hidden"></span></div>`);

$('#movies-list').addClass('spinner-container');

$.ajax({
    url: "https://peppermint-superficial-shame.glitch.me/movies",
    method: "GET"
}).done(function (data) {
    console.log(data);

    $('#movies-list').removeClass('spinner-container');

    let movies = data;
    let movieListHtml = '';

    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        fetch(`http://www.omdbapi.com/?t=${movie.title}&apikey=${omdbApiKey}`)
            .then(response => response.json())
            .then(omdbData => {
                let poster = omdbData.Poster;
                movieListHtml += `
                  <div class="card mb-4">                                          
                    <img src="${poster}" class="card-img-top" alt="${movie.title}" width="200" height="275">
                    <div class="card-body">
                    <div class="d-flex flex-column">
                    <p class="card-title wrap-text d-inline text-center">${movie.title}</p>
                    <div class="d-flex justify-content-between card-bottom">
                            <p class="card-text card-rating p-0">${generateStars(movie.rating)}</p>
                          <div>
                          <i class="fa-regular fa-pen-to-square edit-icon" data-movie-id="${movie.id}"></i>
                          <i class="fa-solid fa-trash delete-icon" data-movie-id="${movie.id}"></i>
                          </div>
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

    // Fetch the genre of the selected movie
    $.ajax({
        url: `http://www.omdbapi.com/?t=${selectedTitle}&apikey=${omdbApiKey}`,
        method: 'GET',
        success: function(response) {
            $('#movie-title-modal').text(response.Title);
            $('#movie-genre-modal').text(response.Genre);
            $('#movie-year-modal').text(response.Year);
            $('#movie-plot-modal').text(response.Plot);


            // Set the src attribute of the img tag
            $('#movie-poster-modal').attr('src', response.Poster);
        },
        error: function(error){
            console.log(error);
        }
    });

    $('#add-movie-modal').modal('show');
});

$(document).click(function(event) {
    if(!$(event.target).closest('#title-input').length && !$(event.target).closest('#search-results').length) {
        $('#search-results').empty();
    }
});

function generateStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars += '<i class="fas fa-star fa-lg"></i>';
        } else {
            stars += '<i class="far fa-star fa-lg"></i>';
        }
    }
    return stars;
}



