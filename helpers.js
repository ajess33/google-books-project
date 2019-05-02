
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

  concatIsbn: function (object) {
    return `${object[0].type} ${object[0].identifier}`;
  },

  trimDesc: function(desc) {
    if (!desc) {
      return 'No description available';
    } else {
      let descArr = desc.split(' ');
      if (descArr.length > 40) {
        descArr.splice(40);
        return descArr.join(' ');
      } else {
        return desc;
      }
    }
  }

};
