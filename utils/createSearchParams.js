function checkParam(param) {
  if (Array.isArray(param)) {
    return !!param.length;
  }

  if (param?.value || param) {
    return true;
  }
}

export function createSearchParams(data, exceptions = []) {
  /*  let locationSearch =
    typeof window !== 'undefined' ? window.location.search : '';*/
  const urlParams = new URLSearchParams();

  Object.keys(data).forEach((key) => {
    if (exceptions.includes(key)) {
      return;
    }

    if (checkParam(data[key])) {
      urlParams.set(key, data[key]);
      return;
    }

    urlParams.delete(key);
  });

  return decodeURIComponent(
    urlParams.toString() ? `?${urlParams.toString()}` : '',
  );
}
