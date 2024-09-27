export default {
  String: {
    onify: function(str) {
      return `on${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}` 
    }
  },

  Object: {
    denumerateKeys: function(obj, keys = []) {
      Object.keys(obj)
        .filter(key => keys.includes(key))
        .forEach(key => Object.defineProperty(obj, key, { enumerable: false }))
      
      return obj
    }
  }
}
