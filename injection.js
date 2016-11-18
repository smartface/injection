/* globals SMF, DOMParser */
(function() {
    var injections = {},
        i;
    injections.xmlhtppRequest = function xmlhtppRequest() {
        function XMLHttpRequest(objParameters) {
            var me = this;
            /*var upload = new XMLHttpRequestUpload();*/

            function setResponseCode() {
                var statusCode = webClient.responseStatusCode;
                status = Number(statusCode);
            }

            function onComplete(e) {
                if (e && e.responseCode) {
                    if (e.responseCode > 99) { //has response
                        setResponseCode();
                    }
                    else { //cannot connect or internal error
                        status = null;
                        statusText = "";
                        switch (e.responseCode) {
                            case 28:
                                if (typeof me.ontimeout === 'function') {
                                    me.ontimeout.call(me);
                                }
                                break;
                            default:
                                if (typeof me.onerror === 'function') {
                                    me.onerror.call(me);
                                }
                                break;
                        }
                    }
                }
                else {
                    setResponseCode();
                }
                me.readyState = 4;
                if (typeof me.onload === 'function' && status) {
                    me.onload.call(me);
                }
                if (typeof me.onloadend === 'function') {
                    me.onloadend.call(me);
                }
            }
            var webClient = new SMF.Net.WebClient({
                onSyndicationSuccess: onComplete,
                onServerError: onComplete,
                onProgress: function() {
                    me.readyState = 3;
                    if (typeof me.onprogress === 'function') {
                        me.onprogress.call(me);
                    }
                }
            });
            var status = null;
            var statusText = "";
            Object.defineProperty(this, "webClient", {
                get: function() {
                    return webClient;
                }
            });
            this.onreadystatechange = null;
            var readyState = 0;
            Object.defineProperty(this, "readyState", {
                get: function() {
                    return readyState;
                },
                set: function(value) {
                    if (value !== readyState) {
                        readyState = value;
                        if (typeof this.onreadystatechange === 'function' && value !== 0) {
                            this.onreadystatechange.call(me);
                        }
                    }
                },
                enumerable: true
            });
            Object.defineProperty(this, "response", {
                get: function() {
                    return this.webClient.response;
                },
                enumerable: true
            });
            Object.defineProperty(this, "responseText", {
                get: function() {
                    /*if (typeof me.webClient.response !== "string") {
                        var sr = me.webClient.response.openStream(SMF.IO.StreamType.read);
                        var text = sr.readToEnd();
                        sr.close();
                        return text;
                    } */
                    return this.webClient.responseText;
                },
                enumerable: true
            });
            Object.defineProperty(this, "ignoreSSLErrors", {
                get: function() {
                    return this.webClient.ignoreSSLErrors;
                },
                set: function(value) {
                    return this.webClient.ignoreSSLErrors = value;
                },
                enumerable: true
            });
            Object.defineProperty(this, "timeout", {
                get: function() {
                    return this.webClient.timeoutInterval;
                },
                enumerable: true
            });
            Object.defineProperty(this, "responseType", {
                get: function() {
                    if (this.webClient.response) {
                        return typeof this.webClient.response;
                    }
                    else {
                        return "";
                    }
                },
                enumerable: true
            });
            Object.defineProperty(this, "status", {
                get: function() {
                    return status;
                },
                enumerable: true
            });
            Object.defineProperty(this, "statusText", {
                get: function() {
                    return statusText;
                },
                enumerable: true
            });
            Object.defineProperty(this, "withCredentials", {
                get: function() {
                    return false;
                },
                set: function(value) {
                    //does nothing, SMF does not support credentials
                },
                enumerable: true
            });
            /*Object.defineProperty(this, "upload", {
                get: function() {
                    return upload;
                }
            });*/
            Object.defineProperty(this, "responseXML", {
                get: function() {
                    try {
                        var parser = new DOMParser();
                        document = parser.parseFromString(me.responseText, "text/xml");
                        return document;
                    }
                    catch (exXML) {
                        return null;
                    }
                },
                enumerable: true
            });
            this.ontimeout = null;
            this.onabort = null;
            this.onload = null;
            this.onloadstart = null;
            this.onprogress = null;
            this.onerror = null;
            this.onloadend = null;
        }
        XMLHttpRequest.prototype.abort = function() {
            SMF.Net.cancelRequest(this.webClient);
            if (typeof this.onabort === 'function') {
                this.onabort.call(this);
            }
        };
        XMLHttpRequest.prototype.getAllResponseHeaders = function() {
            var headers = '';
            if (this.webClient.responseHeaders) {
                headers = this.webClient.responseHeaders.join("\r\n");
            }
            return headers;
        };
        XMLHttpRequest.prototype.getResponseHeader = function(header) {
            var value = null;
            var i;
            var headerX = /([a-zA-Z0-9_-]+):(.*)/g;
            var rHeader = [];
            if (this.webClient.responseHeaders) {
                for (i = 0; i < this.webClient.responseHeaders.length; i++) {
                    headerX.lastIndex = 0;
                    rHeader = headerX.exec(this.webClient.responseHeaders[i]);
                    if (rHeader) {
                        if (rHeader[1] === header) {
                            value = rHeader[2];
                            break;
                        }
                    }
                }
            }
            return value !== null ? value.trim() : value;
        };
        XMLHttpRequest.prototype.open = function(method, url, asynch, user, password) {
            this.readyState = 1;
            this.webClient.URL = url;
            this.webClient.httpMethod = method.toUpperCase();
            if (asynch !== undefined) {
                this.asynch = asynch;
            }
        };
        XMLHttpRequest.prototype.send = function(data) {
            this.webClient.request = data;
            this.webClient.run(this.asynch);
            if (typeof this.onloadstart === 'function') {
                this.onloadstart.call(this);
            }
        };
        XMLHttpRequest.prototype.overrideMimeType = function(mime) {
            var rMIME = /text\x2F.+|\w+\x2F.*(\x2B?)(xml|javascript|json)/g;
            if (mime === null) {
                this.webClient.responseHandling = SMF.Net.ResponseHandling.automatic;
            }
            else {
                if (rMIME.test(mime)) {
                    this.webClient.responseHandling = SMF.Net.ResponseHandling.forceText;
                }
                else {
                    this.webClient.responseHandling = SMF.Net.ResponseHandling.forceFile;
                }
            }
        };
        XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
            var i;
            var headerX = /(\w+):(.*)/g;
            var rHeader = [];
            var found = false;
            var h = this.webClient.requestHeaders;
            if (h) {
                for (i = 0; i < h; i++) {
                    headerX.lastIndex = 0;
                    rHeader = headerX.exec(h[i]);
                    if (rHeader) {
                        if (rHeader[1] === header) {
                            h[i] = header + ':' + value;
                            found = true;
                            break;
                        }
                    }
                }
            }
            if (!found) {
                h.push(header + ':' + value);
            }
            this.webClient.requestHeaders = h;
        };

        /*function XMLHttpRequestUpload() {
            var onabortList = [];
            var onstartList = null;
            var onprogressList = null;
            var onloadList = null;
            var onerrorList = null;
            var onloadendList = null;
            var ontimeoutList = null;
            this.addEventListener = function() {};
            this.dispatchEvent = function() {};
            this.removeEventListener = function() {};
            this.getEventHandler = function() {};
            this.setEventHandler = function() {};
            this.onabort = null;
            this.onstart = null;
            this.onprogress = null;
            this.onload = null;
            this.onerror = null;
            this.onloadend = null;
            this.ontimeout = null;
        }*/

        global.XMLHttpRequest = XMLHttpRequest;
    };

    for (i in injections) {
        injections[i]();
    }
})();