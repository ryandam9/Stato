self.addEventListener('message', function (msg) {
    let payload = msg.data;
    let url = payload['end-point'];

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(payload));

    xhr.onload = function () {
        let result;

        if (this.status === 201) {
            result = JSON.parse(this.responseText);
        } else {
            result = {
                'status': 'failure',
                'data': 'Unknown error while connecting to the server'
            }
        }

        self.postMessage(result);
    }
}, false);
