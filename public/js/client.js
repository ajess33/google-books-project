// toggle book details
$(document).ready(() => {
  $('#more-details').click((e) => {
    console.log('client-side');
    e.preventDefault();
    $('#more-details-list').toggle('.show-toggle');
  });
});

