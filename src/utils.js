export default {
  String: {
    onify: function(str) {
      return `on${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}` 
    }
  },

  Object: {
    lacksOwnEntryProperty: function([key]) {
      return !Object.hasOwn(this, key) 
    },

    denumerateKeys: function(obj, keys = []) {
      Object.keys(obj)
        .filter(key => keys.includes(key))
        .forEach(key => Object.defineProperty(obj, key, { enumerable: false }))
      
      return obj
    }
  }
}
