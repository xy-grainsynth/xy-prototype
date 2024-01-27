var rad = 15;
var shade = 150;

var bg = [];
var dots = []

//grain globals
var att;
var dec;
var audioBuffer;
var spread;

var ctx, master, cVerb, irBuff

var rate = 30.0;
var frate;

var posX, posY;


var points = [];
var centroids = [];
//var points2 = [];
//var centroids2 = [];

var buffer;

var pixel_r_val;

////////////////////////////////////////////////////////////////////////////////

// "loadbang"
window.onload = function () {

    //web audio setup
    ctx = new (window.AudioContext || window.webkitAudioContext);

    //master volume
    master = ctx.createGain();
    master.connect(ctx.destination);

    //create convolution verb
    cVerb = ctx.createConvolver();
    cVerb.connect(ctx.destination);

    //get IR
    irBuff;
    var getIr = new XMLHttpRequest();
    getIr.open("get", "samples/irs/Batcave.wav", true);
    getIr.responseType = "arraybuffer";

    getIr.onload = function () {
        ctx.decodeAudioData(getIr.response, function (buffer) {
            irBuff = buffer;
        });
    };

    getIr.send();

    var sliderRate;
    var sliderAtt;
    var sliderDec;

    //load buffer with page
    bufferSwitch(0);

    var switcher = document.getElementById("buffsel");
    switcher.addEventListener("input", function () {
        bufferSwitch(switcher.selectedIndex);
    });

    //call slider values
      //     sliderRate = document.getElementById("density").value;
  //      rate = parseFloat(sliderRate);
    setInterval(function () {
        sliderSpr = document.getElementById("spread").value;
        spread = parseFloat(sliderSpr);
    //   sliderRate = document.getElementById("density").value;
    //    rate = parseFloat(sliderRate);
        sliderAtt = document.getElementById("attack").value;
        att = parseFloat(sliderAtt);
        sliderDec = document.getElementById("decay").value;
        dec = parseFloat(sliderDec);
    }, 50);

    document.getElementById('startButton').addEventListener('click', function () {
        ctx.resume().then(() => {
        });
    });
}

//https://stackoverflow.com/questions/10592411/disable-scrolling-in-all-mobile-devices

window.addEventListener("scroll", preventMotion, false);
window.addEventListener("touchmove", preventMotion, false);

function preventMotion(event) {
    window.scrollTo(0, 0);
    event.preventDefault();
    event.stopPropagation();
}



////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////

//p5.js setup
function setup() {

    //initalize grain canvas
    gcanvas = createCanvas(windowWidth, windowHeight);
    gcanvas.class("grainCanvas");
    gcanvas.parent("canvasContainer");
    buffer = createGraphics(width, height);

    //visual background on canvas
    for (var i = 0; i < width; i++) {
        bg.push(new Clouds());
        bg[i].seed();
        points.push(new Points());
        points[i].x = bg[i].x;
        points[i].y = bg[i].y;
        //points.push = { x: bg[i].x, y: bg[i].y, cluster: -1 };
        bg[i].draw();
    }

    // the interaction cloud
    for (var i = 0; i < 40; i++) {
        dots.push(new Circles());
    }


    for (var i = 0; i < 220; i++) {
        centroids.push(new Centroids());
        centroids[i].point.x = random(windowWidth);
        centroids[i].point.y = random(windowHeight);
        //   centroids[i].point.x = random(width);
        //   centroids[i].point.y = random(height);
    }


    for (var i = 0; i < 5; i++) {
        kmeans();
    }

    /*
    points2.push(new Points2());
    points2[i].x = centroids[i].point.x;
    points2[i].y = centroids[i].point.y
*/


    /*
    for (var i = 0; i < 150; i++) {
        centroids2.push(new Centroids2());
        centroids2[i].point.x = random(width);
        centroids2[i].point.y = random(height);
        //   centroids[i].point.x = random(width);
        //   centroids[i].point.y = random(height);
    }
    
*/
    /*
    buffer.copy(
        // source
        gcanvas,
        // source x, y, w, h
        0, 0, windowWidth, windowHeight,
        // destination x, y, w, h
        0, 0, buffer.width, buffer.height);
    
    console.log(buffer);    buffer.copy(
        // source
        gcanvas,
        // source x, y, w, h
        0, 0, windowWidth, windowHeight,
        // destination x, y, w, h
        0, 0, buffer.width, buffer.height);
    
    console.log(buffer);
    */


    //   loadPixels();

    ellipseMode(RADIUS);
    noStroke();
}

//p5.js draw
function draw() {
    //track circle movement
    posX = mouseX;
    posY = (mouseY * 0.9) - (windowHeight * 0.1);


    loadPixels();


    clear();

    //re-draw border post-grid
    for (var i = 0; i < bg.length; i++) {
        bg[i].draw();
    }


    // draw points
    for (var i = 0; i < points.length; i++) {
        points[i].draw();
    }

/*

    // draw centroids
    for (var i = 0; i < centroids.length; i++) {
        centroids[i].draw();
    }


*/


    /*

    // draw centroids
    for (var i = 0; i < centroids2.length; i++) {
        points2[i].draw();
    }
    */

    //limit drawing to within canvas
    if (posX > 0 && posX < windowWidth && posY > windowHeight * 0.0005 && posY < windowHeight) {
        if (mouseIsPressed) {

            var distances = [];
            for (var i = 0; i < centroids.length; i++) {
                var centroid = centroids[i];
                var distance = dist(mouseX, mouseY, centroid.point.x, centroid.point.y);
                // console.log(" mouse " + mouseX + " " + mouseY + " " + " centroids " + centroid.point.x + " " + centroid.point.y + " distance " + distance);
                distances[i] = int(distance);

            }

            var closest = sort(distances);
            //console.log(closest);
            var sorted_centroids = [];

            //for (var i = 0; i < centroids.length;)


            for (var i = 0; i < distances.length; i++) {
                var target = distances[i];
                var targ_centroid = centroids[i];
                for (var j = i - 1; j >= 0 && (distances[j] > target); j--) {
                    distances[j + 1] = distances[j];
                    sorted_centroids[j + 1] = sorted_centroids[j];
                }
                distances[j + 1] = target
                sorted_centroids[j + 1] = targ_centroid;
            }
            //  console.log("distances "+distances);
            //  console.log("sorted centroids "+sorted_centroids);

            for (var i = 0; i < 50; i++) {
                centroids.draw
            }




            /*
            //  Red.
            pixels[index] = 0;
            // Green.
            pixels[index + 1] = 0;
            // Blue.
            pixels[index + 2] = 0;
            // Alpha.
            pixels[index + 3] = 255;
*/

            //  updatePixels();

            //  loadPixels();

            /*
            let d = pixelDensity();
            console.log("pix dens " + d);
            for (let i = 0; i < d; i += 1) {
                for (let j = 0; j < d; j += 1) {
                    let index = 4 * ((mouseY * d + j) * width * d + (mouseX * d + i));
                    // Red.
                    console.log("index " + index + " " + "color at " + mouseX + " " + mouseY + " " + pixels[index] + " " + pixels[index + 1] + " " + pixels[index + 2]);
                    pixels[index] = 0;
                    // Green.
                    pixels[index + 1] = 0;
                    // Blue.
                    pixels[index + 2] = 0;
                    // Alpha.
                    pixels[index + 3] = 255;
                }
            }
            */




            /*
            for (var i = 0; i < centroids.length; i++) {
                points2[i].x = centroids[i].point.x;
                points2[i].y = centroids[i].point.y
            }
            */
            //   kmeansCentroids();
            
            /*
            //draw circle when mouse is pressed
            for (var i = 0; i < dots.length; i++) {
                dots[i].clicked(mouseX, mouseY, rad, shade);
            }
*/
            
            grains(posX, posY);

        }

        // draw mouse pointer coordinates
        //   textSize(10);
        //   text(mouseX + ", " + mouseY, 20, 20)

        stroke(0);
        strokeWeight(4);
        noFill();
        noStroke();
        /*
        if (rate > 400) {
            frate = 100;
        } else {
            frate = rate;
        }
        */
        //    frate = posX;


        var index = (mouseX + (mouseY * windowWidth)) * 4;
        console.log(index + " " + pixels[index] + " " + pixels[index + 1] + " " + pixels[index + 2]);



        if (pixels[index] == 0) {
            frate = rand(1, 7);
        }
        else if (pixels[index] == 182) {
            frate = rand(7, 10);
        }
        else if (pixels[index] == 181) {
            frate = rand(7, 10);
        }
        else if (pixels[index] == 180) {
            frate = rand(10, 15);
        }
        else if (pixels[index] == 179) {
            frate = rand(25,35);
        }
        else if (pixels[index] == 178) {
            frate = rand(15,25);
        }
        else if (pixels[index] == 177) {
            frate = rand(30, 80);
        }
        else if (pixels[index] == 176) {
            frate = rand(80, 100);
        }
        else frate = rand(90,100);
        console.log("pixel r val " + pixels[index] + " " + " frame rate " + frate);
        frameRate(frate);
    }
}

////////////////////////////////////////////////////////////////////////////////

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function Circles() {
    this.x;
    this.y;
    this.clicked = function (x, y, startRad, color) {
        tx = -30 * (spread / 2);
        ty = 30 * (spread / 2);
        this.x = x+ rand(tx, ty);
        this.y = y+ rand(tx, ty);
        fill(color, color, 255, 50);
        ellipse(this.x, this.y, startRad, startRad);
    }
}


function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

////////////////////////////////////////////////////////////////////////////////

function grains(pos, pitch) {

    var grain = ctx.createBufferSource();
    var contour = ctx.createGain();
    var verbLevel = ctx.createGain();
    var len, factor, position, randFactor;

    contour.gain.setValueAtTime(0, ctx.currentTime);
    contour.gain.linearRampToValueAtTime(0.5 * rand(0.2, 1), ctx.currentTime + att); // volume ramp is a bit randomized 
    contour.gain.linearRampToValueAtTime(0, ctx.currentTime + (att + dec) + 0.1);
    //contour.gain.linearRampToValueAtTime(0.6 * rand(0.5, 1), ctx.currentTime + grain_x_mapped);
    //contour.gain.linearRampToValueAtTime(0, ctx.currentTime + (grain_x_mapped + grain_y_mapped));

    contour.connect(verbLevel);
    contour.connect(master);

    //verbLevel.gain.setValueAtTime(0.6, ctx.currentTime);
    //verbLevel.connect(master);


    var gRate = (2.5 * (0.8 - (pitch / windowHeight))) + 0.5;
    //console.log("posY "+posY + " - pitch/wh "+ pitch/windowHeight + " - reverse pitch val "+0.8 - (pitch/windowHeight) + " -grate " + gRate);

    grain.buffer = audioBuffer;
    len = grain.buffer.duration;
    factor = pos;
    position = windowWidth;
    //spread
    randFactor = spread; // smaller randFactor makes larger density, larger randFactor makes density smaller and the sounds more recognizable, its the grain length, spread

    //grainsize = map(pos, 0, windowWidth, 0.01, 1.00);


    if (gRate < 1) {
        grain.playbackRate.value = 0.5;
    } else {
        grain.playbackRate.value = gRate;
    }

    grain.connect(contour);

    playtime = att + dec;
    randval = rand(0, spread);
    startPos = (len * (pos / position)) + randval;
    // grain start point = buf len * mouse position / x dimension + rand
    //grain.start(ctx.currentTime, (len * factor / position) + rand(0, randFactor));
    grain.start(ctx.currentTime, startPos);
    //console.log("len "+len + " - start  "+ startPos + " - randval " + randval +  " - playtime "+playtime);

    //stop old grains
    grain.stop(ctx.currentTime + playtime + 0.1);
}

function bufferSwitch(input) {
    var getSound = new XMLHttpRequest();
    if (input == 0) {
        getSound.open("get", "samples/audio/riverwater.wav", true);
    }
    else if (input == 1) {
        getSound.open("get", "samples/audio/dryleaveseq.wav", true);
    }
    else if (input == 2) {
        getSound.open("get", "samples/audio/birdsnearwater.wav", true);
    }
    else {
        //nothing
    }
    getSound.responseType = "arraybuffer";
    getSound.onload = function () {
        ctx.decodeAudioData(getSound.response, function (buffer) {
            audioBuffer = buffer;
        });
    };
    getSound.send();
}


function Clouds() {
    this.x;
    this.y;

    this.seed = function () {
        this.x = randomGaussian(windowWidth / 2, windowWidth / 2);
        this.y = randomGaussian(windowHeight / 2, windowHeight / 2);
    }

    this.draw = function () {
        noStroke();
        fill(180, 30)
        ellipse(this.x, this.y, 50, 50);
    }
}

function randomX() {
    return Math.random() * windowWidth;
}

function randomY() {
    return Math.random() * windowHeight;
}



function Centroids({ a, b, c }) {
    this.color = { r: a, g: b, b: c };
    this.point = { x: 0, y: 0 };

    this.draw = function () {
        noStroke();
        fill(this.color.r, this.color.g, this.color.b)
        ellipse(this.point.x, this.point.y, 10, 10);
    }
}



function Centroids() {
    this.color = { r: 250, g: 250, b: 250 };
    this.point = { x: 0, y: 0 };

    this.draw = function () {
        noStroke();
        fill(this.color.r, this.color.g, this.color.b)
        ellipse(this.point.x, this.point.y, 10, 10);
    }
}


function Points() {
    this.x = 0;
    this.y = 0;
    this.cluster = -1;

    this.draw = function () {
        noStroke();
        if (this.cluster == -1) {
            fill(255)
        } else {
            var centroid1 = centroids[this.cluster];
            fill(centroid1.color.r, centroid1.color.g, centroid1.color.b)
        }
        ellipse(this.x, this.y, 3, 3);
    }
}





/*
##############################################################################
##############################################################################
##############################################################################
##############################################################################
##############################################################################
##############################################################################
*/




function kmeans() {
    // assign points to clusters
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        var distances = []
        var minDistance = 0;
        for (var j = 0; j < centroids.length; j++) {
            var centroid = centroids[j];
            var newDistance = dist(point.x, point.y, centroid.point.x, centroid.point.y);
            if (minDistance == 0 || newDistance < minDistance) {
                minDistance = newDistance
                point.cluster = j
            }
        }
    }

    // move centroids to the centers of all clustered points
    for (var i = 0; i < centroids.length; i++) {
        var centroid = centroids[i];
        var myPoints = points.filter(function (point) {
            return point.cluster == i;
        })
        var newX = myPoints.map(function (point) {
            return point.x
        })
        centroid.point.x = getMean(newX)

        var newY = myPoints.map(function (point) {
            return point.y
        })
        centroid.point.y = getMean(newY)
    }
}

function getMean(values) {
    return round(values.reduce(function (sum, value) { return sum + value }, 0) / values.length)
}


/*
*
* https://dev.to/nielsenjared/how-to-code-the-array-partition-algorithm-in-javascript-and-python-1m0n
*
*/


const swap = (arr, left, right) => {
    let temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;

    return arr;
}

const partition = (arr, left = 0, right = arr.length - 1) => {

    let index = left;
    let pivot = arr[right];

    for (let i = left; i < right; i++) {
        if (arr[i] < pivot) {
            swap(arr, index, i);
            index++;
        }
    }
    swap(arr, index, right);

    return index;
}




/*

function Centroids2() {
    this.color = { r: 200, g: 200, b: 200 };
    this.point = { x: 0, y: 0 };

    this.draw = function () {
        noStroke();
        fill(this.color.r, this.color.g, this.color.b)
        ellipse(this.point.x, this.point.y, 10, 10);
    }
}



function Points2() {
    this.x = 0;
    this.y = 0;
    this.cluster = -1;

    this.draw = function () {
        noStroke();
        if (this.cluster == -1) {
            fill(255)
        } else {
            var centroid2 = centroids2[this.cluster];
            fill(centroid2.color.r, centroid2.color.g, centroid2.color.b)
        }
        ellipse(this.x, this.y, 3, 3);
    }
}

function kmeansCentroids() {
    // assign points to clusters
    for (var i = 0; i < points2.length; i++) {
        var point = points2[i];
        var distances = []
        var minDistance = 0;
        for (var j = 0; j < centroids2.length; j++) {
            var centroid = centroids2[j];
            var newDistance = dist(point.x, point.y, centroid.point.x, centroid.point.y);
            if (minDistance == 0 || newDistance < minDistance) {
                minDistance = newDistance
                point.cluster = j
            }
        }
    }

    // move centroids to the centers of all clustered points
    for (var i = 0; i < centroids2.length; i++) {
        var centroid = centroids2[i];
        var myPoints = centroids.filter(function (centr) {
            return centr.cluster == i;
        })
        var newX = myPoints.map(function (point) {
            return point.x
        })
        centroid.point.x = getMean(newX)

        var newY = myPoints.map(function (point) {
            return point.y
        })
        centroid.point.y = getMean(newY)
    }
}
*/



