import { is } from './is.js'

const utils = {
  String: {
    onify: function(str) {
      return is.string(`on${str.charAt(0).toUpperCase()}${str.slice(1)}`)
    }
  },

  Object: {
    lacksOwnEntryProperty: function([key]) {
      return !Object.hasOwn(this, key) 
    }
  }
}

export default utils
