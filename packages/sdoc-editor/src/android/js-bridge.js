class JSBridge {

  constructor() {
    this.eventHandlerMap = {};
  }

  init = (editor) => {
    if (window.WebViewJavascriptBridge) {
      this.initWebViewJavascriptBridge();
    } else {
      document.addEventListener('WebViewJavascriptBridgeReady', this.initWebViewJavascriptBridge, false);
    }

    this.editor = editor;
    this.initJSEventHandler();
  };

  finishPage = () => {
    if (!window.WebViewJavascriptBridge) return;
    window.WebViewJavascriptBridge.callHandler('finishPage');
  };

  initWebViewJavascriptBridge = () => {
    if (window.WebViewJavascriptBridge.init && !window.WebViewJavascriptBridge.inited) {
      window.WebViewJavascriptBridge.init();
    }
  };

  initJSEventHandler = () => {
    if (!window.WebViewJavascriptBridge) return;
    window.WebViewJavascriptBridge.registerHandler('callJsFunction', (sData, responseCallback) => {
      if (!sData) return;
      let parsedData = null;
      try {
        parsedData = JSON.parse(sData);
      } catch (err) {
        console.error('parsed error');
        parsedData = null;
      }
      if (!parsedData) {
        responseCallback(JSON.stringify({ success: false }));
        return;
      }

      const { action, data } = parsedData;
      const eventHandler = this.eventHandlerMap[action];
      let params = null;
      try {
        params = JSON.parse(data);
      } catch (err) {
        console.error('Param \'data\' is not an object, place check android program to modify item');
        console.error(data);
        responseCallback(JSON.stringify({ success: false }));
      }

      const execActionSucceed = eventHandler(params, this.editor);
      if (execActionSucceed) {
        responseCallback(JSON.stringify({ success: true }));
      } else {
        responseCallback(JSON.stringify({ success: false }));
      }
    });
  };

  registerEventHandler = (key, callback) => {
    if (!key || !callback) {
      throw new Error('Parameter event type and processing function must exist.');
    }
    if (typeof key !== 'string') {
      throw new Error('Event type must be a string.');
    }
    if (typeof callback !== 'function') {
      throw new Error('The handler function must be a function.');
    }
    this.eventHandlerMap[key] = callback;
    console.log(this.eventHandlerMap);
  };

  callAndroidFunction = (dataString) => {
    if (!window.WebViewJavascriptBridge) return false;
    window.WebViewJavascriptBridge.callHandler('callAndroidFunction', dataString);
    return true;
  };

}

const jsBridge = new JSBridge();

export default jsBridge;
