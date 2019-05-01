
module.exports = {

  // change http link to https
  secureUrl: function (url) {
    if (!/https:/.test(url)) {
      const arr = url.split('');
      arr.splice(4, 0, 's');
      return arr.join('');
    }
    return url;
  },


};
