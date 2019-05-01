module.exports = {

  // change http link to https
  secureUrl: function(url) {
    if (!/https:/.test(url)) {
      const arr = url.split('');
      arr.splice(4, 0, 's');
      console.log(arr.join(''));
      return arr.join('');
    }
    return url;
  }
};

module.exports.secureUrl('http://books.google.com/books/content?id=0vno4p9dr98C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api');