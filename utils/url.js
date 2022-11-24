export default class UrlHelper {
  static setQueryParameter(key, value) {
    if (!history.pushState) {
      return;
    }
    let searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, value);
    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
    window.history.pushState({path: newurl}, '', newurl);
  }
  static setQueryParameters(parameters) {
    if (parameters instanceof Object) {
      Object.keys(parameters).forEach(key => this.setQueryParameter(key, parameters[key]));
    }
  }
  static jsonObjectToQueryString (obj, prefix) {
    const euc = encodeURIComponent;
    const serialize = this.jsonObjectToQueryString;
    const isNotNullObject = (v) => v !== null && typeof v === "object";
    const queryStringItems = [];

    for (let p in obj) {
      if (!obj.hasOwnProperty(p)) {
        continue
      }

      const key = p;
      const k = prefix ? prefix + "[" + p + "]" : p;
      const v = obj[key];
      queryStringItems.push(isNotNullObject(v) ? serialize(v, k) : euc(k) + "=" + euc(v));
    }
    return queryStringItems.join("&");
  }
}
