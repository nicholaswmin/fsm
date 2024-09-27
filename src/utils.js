const utils = {
  String: {
    onify: function(str) {
      return `on${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}` 
    }
  },

  Object: {
    lacksOwnEntryProperty: function([key]) {
      return !Object.hasOwn(this, key) 
    }
  }
}

export default utils
