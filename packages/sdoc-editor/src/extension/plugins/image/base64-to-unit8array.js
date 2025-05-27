const base64ToUnit8Array = (base64) => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return { u8arr, mime };
};

export default base64ToUnit8Array;
