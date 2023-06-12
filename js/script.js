const omdbApiKey = OMDB_KEY;
let serverUrl = "https://coconut-same-chive.glitch.me/movies/";

//Loading spinners//
$('#movies-list').html(`<div class="spinner-border text-danger" role="status">
  <span class="visually-hidden"></span></div>`);

$('#movies-list').addClass('spinner-container');

//Fetching information for API, starting an AJAX request to server

$.ajax({
    url: serverUrl,
    method: "GET"
}).done(function (data) {
    console.log(data);

    $('#movies-list').removeClass('spinner-container');


    let movies = data;
    let movieListHtml = '';
//Looping through each movie received from the server
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        fetch(`http://www.omdbapi.com/?t=${movie.title}&apikey=${omdbApiKey}`)
            .then(response => response.json())
            .then(omdbData => {
                let poster = omdbData.Poster;
                
//Generating the HTML for current movies cards
                movieListHtml += generateMovieCardHtml(movie, poster);
                $('#movies-list').html(movieListHtml);

            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}).fail(function (error) {
    console.log(error);
});

//Event listeners
$("body").on('click', '.delete-icon', handleDeleteIconClick);
$("body").on('click', '.edit-icon', handleEditIconClick);
$('#save-edit-button').on('click', handleSaveEditButtonClick);

//add movie modal, save button event listeners
$('#save-add-button').on('click', function() {
    let newTitle = $('#movie-title-modal').val();
    let newRating = $('#movie-rating-modal').val();
    let newType = $('#movie-type-modal').text();

    $.ajax({
        url: serverUrl,
        method: "POST",
        data: {
            title: newTitle,
            rating: newRating,
            type: newType
        }
    }).then(() => fetch(serverUrl)).then(resp => resp.json()).then(data => { console.log(data); location.reload(); });
    $('#add-movie-modal').modal('hide');
});

//Event listener for typing into search bar
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

//Event listener for when search result title is clicked
$('#search-results').on('click', '.suggestion', function() {
    let selectedTitle = $(this).text();
    $('#movie-title-modal').val(selectedTitle);
    $('#search-results').empty();

    $.ajax({
        url: `http://www.omdbapi.com/?t=${selectedTitle}&apikey=${omdbApiKey}`,
        method: 'GET',
        success: function(response) {
            $('#movie-title-modal').text(response.Title);
            $('#movie-genre-modal').text(response.Genre);
            $('#movie-year-modal').text(response.Year);
            $('#movie-plot-modal').text(response.Plot);
            $('#movie-type-modal').text(response.Type);


            // Set the src attribute of the img tag
            $('#movie-poster-modal').attr('src', response.Poster);
        },
        error: function(error){
            console.log(error);
        }
    });

    $('#add-movie-modal').modal('show');
});

//Event listener to close out of the search results, when clicked outside
$(document).click(function(event) {
    if(!$(event.target).closest('#title-input').length && !$(event.target).closest('#search-results').length) {
        $('#search-results').empty();
    }
});

//Event listener for when the card is clicked on
$("body").on('click', '.card', function(){
    if($(event.target).closest('.edit-icon').length || $(event.target).closest('.delete-icon').length) {
        return;
    }
    let movieTitle = $(this).find('.card-title').text();
    $.ajax({
        url: `http://www.omdbapi.com/?t=${movieTitle}&apikey=${omdbApiKey}`,
        method: 'GET',
        success: function(response) {
            $('#view-movie-title-modal').text(response.Title);
            $('#view-movie-genre-modal').text(response.Genre);
            $('#view-movie-year-modal').text(response.Year);
            $('#view-movie-plot-modal').text(response.Plot);
            $('#view-movie-rating-modal').text(response.imdbRating);
            $('#view-movie-poster-modal').attr('src', response.Poster);
        },
        error: function(error){
            console.log(error);
        }
    });

    $('#view-movie-modal').modal('show');
});

//Function that takes the rating and generates into stars
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

//function that loads movie depending on the type
function loadMovies(type) {
    let url = `https://coconut-same-chive.glitch.me/movies?type=${type}`;
    $.ajax({
        url: url,
        method: "GET"
    }).done(function (data) {
        let movies = data;
        let movieListHtml = '';

        for (let i = 0; i < movies.length; i++) {
            let movie = movies[i];
            fetch(`http://www.omdbapi.com/?t=${movie.title}&apikey=${omdbApiKey}`)
                .then(response => response.json())
                .then(omdbData => {
                    let poster = omdbData.Poster;

                    movieListHtml += generateMovieCardHtml(movie, poster);
                    $('#movies-list').html(movieListHtml);

                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }).fail(function (error) {
        console.log(error);
    });
}

//Event listener for type when clicked
$('.genre-filter').on('click', function() {
    let typeMap = {
        "movies": "movie",
        "tv-shows": "series"
    };
    let clickedId = $(this).attr('id');
    let type = typeMap[clickedId];
    loadMovies(type);
});

//Function that generates html cards
function generateMovieCardHtml(movie, poster) {
    return `
        <div class="card mb-4 mx-2">
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
}

//Function that deletes the movie when icon is clicked
function handleDeleteIconClick() {
    let movieId = $(this).data('movie-id');
    $('#delete-modal').data('movie-id', movieId).modal('show');

    $('#confirm-delete').on('click', function(){
        let movieId = $('#delete-modal').data('movie-id');
        $.ajax({url: `https://coconut-same-chive.glitch.me/movies/${movieId}`,
            method: "DELETE"

        }).then(() => fetch(serverUrl)).then(resp => resp.json()).then(data => { console.log(data); location.reload(); });
        $('#delete-modal').modal('hide');
    })
}

//Function that edits movie when icon is clicked
function handleEditIconClick() {
    let movieId = $(this).data('movie-id');
    $.ajax({url: `https://coconut-same-chive.glitch.me/movies/${movieId}`,
        method: "GET"
    }).done(function (movie){
        $('#edit-title-input').val(movie.title);
        $('#edit-rating-input').val(movie.rating);

        $('#edit-modal').data('movie-id', movieId);
        $('#edit-modal').modal('show');
    })
}

//Function for the edit movie modal is clicked
function handleSaveEditButtonClick() {
    let movieId = $('#edit-modal').data('movie-id');

    let updatedTitle = $('#edit-title-input').val();
    let updatedRating = $('#edit-rating-input').val();

    $.ajax({url: `https://coconut-same-chive.glitch.me/movies/${movieId}`,
        method: "PUT",
        data: {
            title: updatedTitle,
            rating: updatedRating
        }
    }).then(() => fetch(serverUrl)).then(resp => resp.json()).then(data => { console.log(data); location.reload(); });
    $('#edit-modal').modal('hide');
}



