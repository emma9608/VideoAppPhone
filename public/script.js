// here we will get the name to compare later
let faces = ['DelavalleCristian', 'CardozoGustavo', 'OderaMaica', 'BritoIan', 'JimRhodes', 'DeLavalleMaria', 'TonyStark']


<<<<<<< HEAD
// load all the faceapi content - it is the problem, i need take all that whitout a url 

Promise.all([
=======
// load all the faceapi content
Promise.all([

>>>>>>> a9db7b59cfee3ab552752d6a35004963fb7156a5
    faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/emma9608/Face-Api.Video/master/static/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/emma9608/Face-Api.Video/master/static/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/emma9608/Face-Api.Video/master/static/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/emma9608/Face-Api.Video/master/static/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://raw.githubusercontent.com/emma9608/Face-Api.Video/master/static/models')
]).then(start)

// take video

const video = document.getElementById('video');
async function start() {
    console.log('inició start')
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
    video: true
    navigator.getUserMedia({ video: {} },
        stream => video.srcObject = stream,
        err => console.log(err)
    )
    console.log('inició startvideo')

    //close the load spin
    video.addEventListener('play', () => {
        var x = document.getElementById("myDIV");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }

        //init video 
        const canvas = faceapi.createCanvasFromMedia(video);
        console.log('inició play')

        //bring the canvas from index.html
        document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };

        //take dimentions from canvas for faceapi
        faceapi.matchDimensions(canvas, displaySize);

        //setting interval to give time to the compare
        const timeValue = setInterval(async() => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors();
            const dist = faceapi.euclideanDistance([0, 0], [0, 10])
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
            results.forEach((result, i) => {
                //drawing the face box (it will be hided after)
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
                const dist = faceapi.euclideanDistance([0, 0], [0, 10])
                const nombre = result.toString().substring(0, result.toString().length - 7);
                console.log(nombre)
                    // sending on the name of the result
                if (nombre !== 'unknown') {
                    var url = 'http://localhost:5500/sendphotos';
                    var data = { nombre: nombre };

                    fetch(url, {
                            method: 'POST', // or 'PUT'
                            body: JSON.stringify(data), // data can be `string` or {object}!
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(res => res.json())
                        .catch(error => console.error('Error:', error))
                        .then(response => console.log('Success:', response));

                    clearInterval(timeValue)
                    return
                }




            })
        }, 4000);
    });
}

// taking on the photos, it will be changed to get just 1 repository of all the images to compare and send a ok or unknown
async function loadLabeledImages() {
    console.log('inició load')
    const labels = faces
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                // the url will be changed to the name of the DNI ingresed on the server database
                const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/emma9608/Face-Api.Video/master/static/labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }


            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })

    )

}