(function() {
    angular.module('videoRecorderApp').controller("VideoRecorderCtrl", VideoRecorderCtrl);

    function VideoRecorderCtrl($scope) {
        var vm = this;
        var mediaSource = new MediaSource();
        var mediaRecorder;
        var recordedBlobs;
        var sourceBuffer;
        var videoRecorder = document.getElementById('recorder');
        var videoPlayer = document.getElementById('player');
        var constraints = {
            audio: true,
            video: true
        };
        var myMediaDevices;
        // navigator.getUserMedia = (navigator.getUserMedia ||
        //     navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

        var init = init;
        var successCallback = successCallback;
        var errorCallback = errorCallback;
        var handleSourceOpen = handleSourceOpen;
        var handleStop = handleStop;
        var handleDataAvailable = handleDataAvailable;

        vm.startRecording = startRecording;
        vm.stopRecording = stopRecording;
        vm.play = play;

        init();

        /*Local Functions start*/
        function init() {
            // if (!navigator.getUserMedia) {
            //     console.log("The browser doesn't support.");
            // }
            // navigator.getUserMedia(constraints, successCallback, errorCallback);
            myMediaDevices = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ?
                navigator.mediaDevices : ((navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
                    getUserMedia: function(c) {
                        return new Promise(function(y, n) {
                            (navigator.mozGetUserMedia ||
                                navigator.webkitGetUserMedia).call(navigator, c, y, n);
                        });
                    }
                } : null);
            // mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
            var isSecureOrigin = location.protocol === 'https:' ||
                location.host.startsWith('localhost');
            if (!isSecureOrigin) {
                alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
                    '\n\nChanging protocol to HTTPS');
                location.protocol = 'HTTPS';
            }
        }

        function successCallback(stream) {
            window.stream = stream; // stream available to console
            console.log(window.URL);
            console.log(window.stream);
            if (window.URL) {
                videoRecorder.src = window.URL.createObjectURL(stream);
            } else {
                videoRecorder.src = stream;
            }
        }

        function errorCallback(error) {
            console.log('navigator.getUserMedia error: ', error);
        }

        function handleSourceOpen(event) {
            console.log('MediaSource opened');
            sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
            console.log('Source buffer: ', sourceBuffer);
        }

        function handleStop(event) {
            console.log('Recorder stopped: ', event);
        }

        function handleDataAvailable(event) {
            if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
            }
        }
        /*Local Functions end*/

        function startRecording() {
            getVideoPermissions().then(function() {
                var options = {
                    mimeType: 'video/webm'
                };
                recordedBlobs = [];
                try {
                    mediaRecorder = new MediaRecorder(window.stream, options);
                } catch (e0) {
                    console.log('Unable to create MediaRecorder with options Object: ', e0);
                    try {
                        options = {
                            mimeType: 'video/webm,codecs=vp9'
                        };
                        mediaRecorder = new MediaRecorder(window.stream, options);
                    } catch (e1) {
                        console.log('Unable to create MediaRecorder with options Object: ', e1);
                        try {
                            options = 'video/vp8'; // Chrome 47
                            mediaRecorder = new MediaRecorder(window.stream, options);
                        } catch (e2) {
                            alert('MediaRecorder is not supported by this browser.\n\n' +
                                'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
                            console.error('Exception while creating MediaRecorder:', e2);
                            return;
                        }
                    }
                }
                console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
                mediaRecorder.onstop = handleStop;
                mediaRecorder.ondataavailable = handleDataAvailable;
                mediaRecorder.start(10); // collect 10ms of data
                console.log('MediaRecorder started', mediaRecorder);
            });

        }

        function stopRecording() {
            videoRecorder.src = "";
            mediaRecorder.stop();
            console.log('Recorded Blobs: ', recordedBlobs);
            videoPlayer.controls = true;
        }

        function play() {
            var superBuffer = new Blob(recordedBlobs, {
                type: 'video/webm'
            });
            videoPlayer.src = window.URL.createObjectURL(superBuffer);
        }

        function getVideoPermissions() {
            return myMediaDevices.getUserMedia(constraints).then(function(stream) {
                window.stream = stream; // stream available to console
                console.log(window.URL);
                console.log(window.stream);
                if (window.URL) {
                    videoRecorder.src = window.URL.createObjectURL(stream);
                } else {
                    videoRecorder.src = stream;
                }
                return true;
            });
        }
    }
})();
