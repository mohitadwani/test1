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
        var myMediaDevices;
        var cameraStream;
        // navigator.getUserMedia = (navigator.getUserMedia ||
        //     navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

        var init = init;
        var successCallback = successCallback;
        var errorCallback = errorCallback;
        var handleSourceOpen = handleSourceOpen;
        var handleStop = handleStop;
        var handleDataAvailable = handleDataAvailable;
        var closeVideoCamera = closeVideoCamera;

        vm.startRecording = startRecording;
        vm.stopRecording = stopRecording;
        vm.play = play;
        vm.downloadVideo = downloadVideo;

        init();

        /*Local Functions start*/
        function init() {
            // if (!navigator.getUserMedia) {
            //     console.log("The browser doesn't support.");
            // }
            // navigator.getUserMedia(constraints, successCallback, errorCallback);
            console.log(MediaRecorder.isTypeSupported("video/mp4"));
            console.log(MediaRecorder.isTypeSupported("video/webm;codecs=h264,opus"));
            console.log('sodlfnjskdnfksdnkg');
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
            getVideoPermissions().then(function(stream) {
                cameraStream = stream;
                if (window.URL) {
                    videoRecorder.src = window.URL.createObjectURL(stream);
                } else {
                    videoRecorder.src = stream;
                }
                videoRecorder.volume = 0;
                console.log(videoRecorder.volume);
                var options = {
                    mimeType: 'video/webm'
                };
                recordedBlobs = [];
                try {
                    mediaRecorder = new MediaRecorder(cameraStream, options);
                } catch (e0) {
                    console.log('Unable to create MediaRecorder with options Object: ', e0);
                    try {
                        options = {
                            mimeType: 'video/webm,codecs=vp9'
                        };
                        mediaRecorder = new MediaRecorder(cameraStream, options);
                    } catch (e1) {
                        console.log('Unable to create MediaRecorder with options Object: ', e1);
                        try {
                            options = 'video/vp8'; // Chrome 47
                            mediaRecorder = new MediaRecorder(cameraStream, options);
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
            closeVideoCamera(cameraStream);
            // console.log('Recorded Blobs: ', recordedBlobs);
            videoPlayer.controls = true;
            var superBuffer = new Blob(recordedBlobs, {
                type: 'video/webm'
            });
            console.log(superBuffer);
            videoPlayer.src = window.URL.createObjectURL(superBuffer);
            // window.stream.stop();
        }

        function play() {}

        function getVideoPermissions() {
            var constraints = {
                audio: true,
                video: true
            };
            return myMediaDevices.getUserMedia(constraints).then(function(stream) {
                // window.stream = stream; // stream available to console
                // console.log(window.URL);
                console.log(stream);
                console.log(stream.getTracks());
                console.log(stream.getAudioTracks());
                return stream;
            });
        }

        function closeVideoCamera(stream) {
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }

        function downloadVideo() {
            var blob = new Blob(recordedBlobs, {
                type: 'video/webm'
            });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'test.webm';
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        }

        function download() {
            var blob = new Blob(recordedBlobs, {
                type: 'video/webm'
            });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'test.webm';
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        }
    }
})();
