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
    // Removes the 'spinner-container' class from the element with the ID 'movies-list'
    $('#movies-list').removeClass('spinner-container');
    // Stores the data received from the server in a variable
    let movies = data;
    let movieListHtml = '';
    //Looping through each movie received from the server
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        // Fetches additional data for the current movie from the OMDB API
        fetch(`http://www.omdbapi.com/?t=${movie.title}&apikey=${omdbApiKey}`)
            .then(response => response.json())
            .then(omdbData => {
                let poster = omdbData.Poster;
                
                //Generating the HTML for current movies cards
                movieListHtml += generateMovieCardHtml(movie, poster);
                // Updates the inner HTML of the 'movies-list' element with the movie list HTML
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

// Event listener for add-movie-modal save button
$('#save-add-button').on('click', function() {
    // Retrieves values from the input fields in the modal
    let newTitle = $('#movie-title-modal').val();
    let newRating = $('#movie-rating-modal').val();
    let newType = $('#movie-type-modal').text();
    // Makes a POST request to add the new movie
    $.ajax({
        url: serverUrl,
        method: "POST",
        data: {
            title: newTitle,
            rating: newRating,
            type: newType
        }
    }).then(() => fetch(serverUrl))
        .then(resp => resp.json())
        .then(data => {
            console.log(data);
            location.reload();
        });
    // Closes the 'add-movie-modal' modal
    $('#add-movie-modal').modal('hide');
});

//Event listener for typing into search bar
$('#title-input').on('keyup', function(e) {
    // Stores the current value of the input field
    let searchText = $(this).val();
    // If the length of the input field value is greater than 2
    if (searchText.length > 2) {
        // Initiates an AJAX request to the OMDB API to search for movies with titles that include the input field value
        $.ajax({
            url: `http://www.omdbapi.com/?s=${searchText}&apikey=${omdbApiKey}`,
            method: 'GET',
            success: function(response) {
                let movies = response.Search;
                let suggestions = '';
                // If the movies array is not empty
                if (movies) {
                    for (let i = 0; i < movies.length; i++) {
                        // Adds a paragraph element with the class 'suggestion' and the movie title as the text to the suggestions string
                        suggestions += `<p class="suggestion">${movies[i].Title}</p>`;
                    }
                }
                // Updates the inner HTML of the element with id 'search-results'
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
    // Stores the text of the clicked suggestion
    let selectedTitle = $(this).text();
    // Sets the value of the input field in the modal to the selected title
    $('#movie-title-modal').val(selectedTitle);
    // Clears the search results
    $('#search-results').empty();
    // Initiates an AJAX request to the OMDB API to retrieve the details of the selected movie
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
    // If the element clicked is not the element with id 'title-input', 'search-results' or a descendant of it
    if(!$(event.target).closest('#title-input').length && !$(event.target).closest('#search-results').length) {
        // Empty (clear) the element with id 'search-results'
        $('#search-results').empty();
    }
});

//Event listener for when the card is clicked on
$("body").on('click', '.card', function(event){
    // If the clicked element or its ancestor has the class 'edit-icon' or 'delete-icon',
    // exit the function early without further execution.
    if($(event.target).closest('.edit-icon').length || $(event.target).closest('.delete-icon').length) {
        return;
    }
    // Get the text of the element with class 'card-title'
    let movieTitle = $(this).find('.card-title').text();
    // Makes an AJAX GET request to the OMDB API to get information about the movie with the title `movieTitle`
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
    // Shows the modal with the id 'view-movie-modal'
    $('#view-movie-modal').modal('show');
});

//Function that takes the rating and generates into stars
function generateStars(rating) {
    let stars = '';
    // Loops through 5 times since we want to display 5 stars
    for (let i = 0; i < 5; i++) {
        // If the current index is less than the rating, add a full star
        if (i < rating) {
            stars += '<i class="fas fa-star fa-lg"></i>';
        }
        // Else add an empty star
        else {
            stars += '<i class="far fa-star fa-lg"></i>';
        }
    }
    return stars;
}

//function that loads movie depending on the type
function loadMovies(type) {
    // url to get movies of a specific type
    let url = `https://coconut-same-chive.glitch.me/movies?type=${type}`;
    // Makes a GET request to the constructed url
    $.ajax({
        url: url,
        method: "GET"
    }).done(function (data) {
        // Assigns the data received to the movies variable
        let movies = data;
        let movieListHtml = '';

         // Loops through each movie
        for (let i = 0; i < movies.length; i++) {
            let movie = movies[i];
            // Makes a request to OMDB API to get movie details by its title
            fetch(`http://www.omdbapi.com/?t=${movie.title}&apikey=${omdbApiKey}`)
                .then(response => response.json())
                .then(omdbData => {
                    let poster = omdbData.Poster;

                    // Generates the movie card HTML and append it to the movie list HTM
                    movieListHtml += generateMovieCardHtml(movie, poster);
                    // Updates the movies list on the page with the generated HTML
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
    // Defines a mapping between the ids of the clicked elements and the type of movie
    let typeMap = {
        "movies": "movie",
        "tv-shows": "series"
    };
    // Gets the id of the clicked element
    let clickedId = $(this).attr('id');
    // Gets the type of movie associated with the clicked element
    let type = typeMap[clickedId];
    // Calls the function loadMovies with the determined type
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
    // Gets the movie id from the clicked icon
    let movieId = $(this).data('movie-id');
    // Sets the movie id to the delete modal and show the modal
    $('#delete-modal').data('movie-id', movieId).modal('show');

    // Sets a click event handler on the confirm-delete button
    $('#confirm-delete').on('click', function(){
        // Gets the movie id from the delete modal
        let movieId = $('#delete-modal').data('movie-id');
        // Makes an AJAX request to delete the movie with the specified id
        $.ajax({url: `https://coconut-same-chive.glitch.me/movies/${movieId}`,
            method: "DELETE"
            // Fetches the updated list of movies from the server after the delete operation
        }).then(() => fetch(serverUrl)).then(resp => resp.json()).then(data => { console.log(data); location.reload(); });
        $('#delete-modal').modal('hide');
    })
}

//Function that edits movie when icon is clicked
function handleEditIconClick() {
    // Gets the movie id from the clicked icon
    let movieId = $(this).data('movie-id');
    // Makes an AJAX request to get the movie details with the specified id
    $.ajax({url: `https://coconut-same-chive.glitch.me/movies/${movieId}`,
        method: "GET"
    }).done(function (movie){
        // Sets the current title and rating to the edit input fields
        $('#edit-title-input').val(movie.title);
        $('#edit-rating-input').val(movie.rating);

        // Sets the movie id to the edit modal
        $('#edit-modal').data('movie-id', movieId);
        // Shows the edit modal
        $('#edit-modal').modal('show');
    })
}

//Function for the edit movie modal is clicked
function handleSaveEditButtonClick() {
    // Gets the movie id from the edit modal
    let movieId = $('#edit-modal').data('movie-id');
    // Gets the updated title and rating from the input fields
    let updatedTitle = $('#edit-title-input').val();
    let updatedRating = $('#edit-rating-input').val();
    // Makes an AJAX request to update the movie details with the specified id
    $.ajax({url: `https://coconut-same-chive.glitch.me/movies/${movieId}`,
        method: "PUT",
        data: {
            title: updatedTitle,
            rating: updatedRating
        }
    }).then(() => fetch(serverUrl)).then(resp => resp.json()).then(data => { console.log(data); location.reload(); });
    $('#edit-modal').modal('hide');
}



