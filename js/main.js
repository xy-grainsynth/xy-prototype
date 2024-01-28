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

var rate = 10.0;
var frate;

var posX, posY;


var points = [];
var centroids = [];
//var points2 = [];
//var centroids2 = [];

var buffer;

var pixel_r_val;

var area_map = {};
var num_cluster = 0;
var clus_colors = [];


var pol;


var xlist = [];
var ylist = [];

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

    document.getElementById('shuffleButton').addEventListener('click', function () {
        console.log("calling rshuffle");
        reshuffle();
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
  //  buffer = createGraphics(width, height);

    //visual background on canvas
    for (var i = 0; i < windowWidth; i++) {
        bg.push(new Clouds());
        bg[i].seed();
        points.push(new Points());
        points[i].x = bg[i].x;
        points[i].y = bg[i].y;
        xlist.push(bg[i].x);
        ylist.push(bg[i].y);
        //points.push = { x: bg[i].x, y: bg[i].y, cluster: -1 };
        bg[i].draw();
    }

    // the interaction cloud
    for (var i = 0; i < 40; i++) {
        dots.push(new Circles());
    }


    //    var map_x = {};
    //    var map_y = {};

    //    var x = [];
    //    var y = [];

    var num_centroids = 220;

    for (var i = 0; i < num_centroids; i++) {
        centroids.push(new Centroids());

        centroids[i].point.x = random(width);
        centroids[i].point.y = random(height);

        //     map_x[centroids[i].point.x] = centroids[i];

        //    if (centroids[i].point.x in map_x){ 
        //     console.log(centroids[i].point.x);
        //     console.log(map_x[centroids[i].point.x])};
        //     map_y[centroids[i].point.y] = centroids[i];
        //       x.push(centroids[i].point.x);
        //      y.push(centroids[i].point.y);
    }

    // cluster the cloud centers using k means
    for (var i = 0; i < 5; i++) {
        kmeans();
    }

/*
    var pointclusters = [];

    for (var i = 0; i < xlist.length; i++){
        for(j = 0; j < ylist.length; j++){

        }
    }

*/


    area_map = {};
    num_cluster = 0;
    var new_centroids = centroids;

    for (var i = 0; i < new_centroids.length - 1; i++) {

        var centroid_a = new_centroids[i];

        var map = {};
        var distances = [];

        for (var j = 1; j < new_centroids.length; j++) {
            var centroid_b = new_centroids[j];
            var distance = dist(centroid_a.point.x, centroid_a.point.y, centroid_b.point.x, centroid_b.point.y);
            if (int(distance)) {
                distances.push(int(distance));
                map[int(distance)] = centroid_b;
            }
        }
        var closest = sort(distances); // centroids sorted by distance from centroid a

        new_centroids = [];
        var area_cluster = [];


        var red = rand(0, 255);
        var green = rand(0, 255);
        var blue = rand(0, 255);
        clus_colors.push([red, green, blue]);

        for (var k = 0; k < closest.length; k++) {

            if (closest[k] < 200) { // initial proximity value setting

                var clus = map[closest[k]];
                clus.color.r = red;
                clus.color.g = green;
                clus.color.b = blue;
                clus.cluster = num_cluster;
                area_cluster.push(clus);
          //         closest.shift();      // clusters are more organic
                centroid_a.color.r = red;
                centroid_a.color.g = green;
                centroid_a.color.b = blue;
                centroid_a.cluster = num_cluster;
                //        console.log("setting cluster " + num_cluster + " " + centroid_a.cluster);

                area_cluster.push(centroid_a);
                area_map[num_cluster] = area_cluster;


                //      console.log("are clusetr num " + num_cluster);
                //                console.log(area_cluster);

                //           console.log(area_cluster);
            }
            else {
                new_centroids.push(map[closest[k]]);
            }


        }

        if (area_cluster.length == 0) {
            //    console.log("centroid a");
            //    console.log(centroid_a)
            centroid_a.color.r = red;
            centroid_a.color.g = green;
            centroid_a.color.b = blue;
            centroid_a.cluster = num_cluster;
            area_cluster.push(centroid_a);
            area_map[num_cluster] = area_cluster;
        }

        num_cluster++;

    }

    /*

    console.log(area_map);

    for (var i = 0; i < clus_colors.length; i++) {
        console.log("i " + i + " " + clus_colors[i]);
    }

    
    for (var i = 0; i < num_cluster - 1; i++) {
        console.log(" i " + i);
        console.log(area_map[i]);
    }
*/

/*
    for (j = 0; j < num_cluster; j++) {
        pol = new Polygon();
        var ar = [];
        var c = area_map[j];
    //    console.log(" j " + j);
    //    console.log(c);
        for (var i = 0; i < c.length; i++) {
            ar.push({ x: c[i].point.x, y: c[i].point.y });
        }
        pol.ar = ar;
        pol.draw();
    }
    */
    /*
        for(var r = 0; r < num_cluster ; r++){
            var cl = area_map[r];
            console.log("cluster "+r);
            for (var g = 0 ; g < cl.length; g++){
                console.log(cl[g]);
            }
        }
    */


    /*
    }
    }
    /*
    var x_sorted = sort(x);
    var y_sorted = sort(y);
    
    var area_map = {};
    //    var distances = [];
    var y_new = y_sorted;
    
    console.log("x sorted "+ x_sorted);
    
    console.log("y sorted "+ y_sorted);
    
    while (x_sorted.length > 0) {
    console.log(" in while ");
    for (var i = 0; i < x_sorted.length; i++) {
    console.log("map_x"+map_x);
    console.log("x " + x_sorted[i]);
    var centroid_a = map_x[x_sorted[i]];
    console.log(centroid_a);
    var map_dist = {};
    var dists = [];
    
     
    for (j = 0; j < y_sorted.length; j++) {
        
        console.log("y " + y_sorted[j] );
        var centroid_b = map_y[y_sorted[j]];
        console.log(centroid_b);
        var distance = int(dist(centroid_a.point.x, centroid_b.point.y, centroid_b.point.x, centroid_b.point.y));
      
        if (distance) {
            dists.push(distance);
    //          console.log("dist "+distance);
            //centroids_valid[centroid];
            map_dist[distance] = centroid_b;
        }
       // console.log(map_dist);
    }
    var closest_b = sort(dists);
    
    //console.log("closest "+closest_b.length);
    
    
    var area_cluster = [];
    
    var r = rand(0, 255);
    var g = rand(0, 255);
    var b = rand(0, 255);
    console.log(r + " " + g + " " + b);
    centroid_a.color.r = r;
    centroid_a.color.g = g;
    centroid_a.color.b = b;
    area_cluster.push(centroid_a);
    
    if (closest_b.length > 0) {
        console.log("closest _b ist non zero");
        for (var k = 0; k < 10; k++) {
            console.log("dist "+k+ " " + closest_b[k]);
            var close_centroid = map_dist[closest_b[k]];
            console.log(close_centroid);
            close_centroid.color.r = r;
            close_centroid.color.g = g;
            close_centroid.color.b = b;
            area_cluster.push(close_centroid);
    
            closest_b.shift();
        }
        var y_new = [];
        for (var k = 10; k < closest_b.length; k++) {
            console.log("dist "+ closest_b[k]);
            var centr = map_dist[closest_b[k]];
             console.log("centr "+centr.point.y);
            y_new.push(map_dist[closest_b[k]].point.y);
        }
        y_sorted = sort(y_new);
    
    
    
        console.log (" new y sorted "+ y_sorted);
        
        map_y_new = {};
        map_x_new = {};
        var x_new = [];
        
        for(var l=0; l < y_sorted.length;l++){
            console.log(y_sorted[l]);
            var centroid = map_y[y_sorted[l]];
            map_y_new[y_sorted[l]] = centroid;
            map_x_new[centroid.point.x] = centroid; 
            x_new.push(centroid.point.x);
        }
        map_x = map_x_new;
        map_y = map_y_new;
        x_sorted = sort(x_new);
        
    
    }
    
    console.log(area_cluster);
    
    area_map[x_sorted[i]] = area_cluster;
    
    
     
    }
    }
    
    */

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




    ellipseMode(RADIUS);
    noStroke();
}

//p5.js draw
function draw() {
    //track circle movement
    posX = mouseX;
    posY = (mouseY * 0.9) - (windowHeight * 0.1);

    /*
        var cluster = area_map[0];
        console.log(cluster);
        var area = new Area();
        area.ar = cluster;
        area.draw();
        */


    loadPixels();


    clear();

    //re-draw border post-grid
    for (var i = 0; i < bg.length; i++) {
        bg[i].draw();
    }

    /*
        // draw points
        for (var i = 0; i < points.length; i++) {
            points[i].draw();
        }
    */

/*

    // draw centroids
    for (var i = 0; i < centroids.length; i++) {
        centroids[i].draw();
    }
*/


    //    noFill();
    //     strokeWeight(14);


    for (j = 0; j < num_cluster; j++) {
        pol = new Polygon();
        var ar = [];
        var c = area_map[j];
    //    console.log(" j " + j);
    //    console.log(c);
        for (var i = 0; i < c.length; i++) {
            ar.push({ x: c[i].point.x, y: c[i].point.y });
        }
        pol.ar = ar;
        pol.draw();
    }

    /*
    for (j = 0; j < num_cluster; j++) {
        pol = new Polygon();
        var ar = [];
        var c = area_map[j];
        console.log(" j " + j);
        console.log(c);
        for (var i = 0; i < c.length; i++) {
            ar.push({ x: c[i].point.x, y: c[i].point.y });
        }
        pol.ar = ar;
        pol.draw();
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

            var map = {};
            var distances = [];
            var centroids_valid = [];
            for (var i = 0; i < centroids.length; i++) {
                var centroid = centroids[i];
                var distance = dist(mouseX, mouseY, centroid.point.x, centroid.point.y);
                // console.log(" mouse " + mouseX + " " + mouseY + " " + " centroids " + centroid.point.x + " " + centroid.point.y + " distance " + distance);
                if (int(distance)) {
                    distances[i] = int(distance);
                    centroids_valid[centroid];

                    //     const sym = Symbol(distances[i]);
                    //         console.log("distance "+distance + " " +sym.toString());
                    map[int(distance)] = centroid;
                }

            }




            var sorted_map = {};


            var closest = sort(distances);
            /*
            for (i = 0; i < closest.length; i++) {
                console.log(closest[i] + " " + map[closest[i]]);
            }
*/

            var clus_map = {};
            var vals = [];
            var keys = [];
            console.log("##################################### " + num_cluster);
            for (var i = 0; i < 7; i++) {
                var cur_cl = map[closest[i]];
                //  console.log(cur_cl);
                /*
                var r =  cur_cl.color.r;
                var g =  cur_cl.color.g;
                var b =  cur_cl.color.b;
                cur_cl.color.r = 0;
                cur_cl.color.g = 0;
                cur_cl.color.b = 0;
                */
                cur_cl.draw();
       //         grains(posX, posY);
                /*
                cur_cl.color.r = r;
                cur_cl.color.g = g;
                cur_cl.color.b = b;
                */
                keys.push(cur_cl.cluster);
                //     console.log(cur_cl.cluster);
                //   if(cur_cl.cluster in clus_map){
                clus_map[cur_cl.cluster] = clus_map[cur_cl.cluster] + 1;
                //   }

            }
            //    console.log(vals);
         //   console.log(" keys " + uniq(keys));

            var num_keys = uniq(keys);
            //    var uniq = [new Set(keys)];

            for (var i = 0; i < uniq.length; i++) {
     //           console.log("key " + keys[i]);
                vals.push(clus_map[uniq[i]])
            }

            if (num_keys.length == 1) {
                //    console.    console.log();log("num keys 1 "+ uniq.length    console.log(););
                att = 0.7;
                dec = 0.7;
                rate = rand(80, 90);
                grains(posX, posY);

            }
            if (num_keys.length == 2) {
                //    console.log("num keys 2 "+ uniq.length);
                att = rand(0.4, 0.5);
                dec = rand(0.5, 0.6);
                rate = rand(15, 20);
              //  grains(posX, posY);
                grains(posX, posY);

            }
            else if (num_keys.length == 3) {
                //    console.log("num keys 3 "+ uniq.length);
                att = 0.01;
                dec = 0.01;
                rate = rand(15,30);
                grains(posX, posY);
                
            } else if (num_keys.length == 4) {
                //    console.log("num keys 3 "+ uniq.length);
                att = 0.1;
                dec = 0.1;
                rate = 10;
                grains(posX, posY);
            }



            /*
            //console.log(closest);
            var sorted_centroids = [];
 
            //for (var i = 0; i < centroids.length;)
 
 
            for (var i = 0; i < distances.length; i++) {
                var target = distances[i];
                var targ_centroid = centroids[i];
          //      console.log("i "+ i + " target "+target);
         //       console.log("target centroid x y "+targ_centroid.point.x+" "+targ_centroid.point.y) 
                for (var j = i - 1; j >= 0 && (distances[j] > target); j--) {
               //     console.log(distances[j]);
                    distances[j + 1] = distances[j];
                    sorted_centroids[j + 1] = sorted_centroids[j];
                }
                distances[j + 1] = target
                sorted_centroids[j + 1] = targ_centroid;
            }
 
*/



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

          // grains(posX, posY);

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
        //   console.log(index + " " + pixels[index] + " " + pixels[index + 1] + " " + pixels[index + 2]);



        // cloud circles setting - rgb value 180, opacity value 30
        if (pixels[index] == 0) {
            rate = rand(1, 7);
        }
        /*
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
            frate = rand(25, 35);
        }
        else if (pixels[index] == 178) {
            frate = rand(15, 25);
        }
        else if (pixels[index] == 177) {
            frate = rand(30, 80);
        }
        else if (pixels[index] == 176) {
            frate = rand(80, 100);
        }
        else frate = rand(90, 100);
        //    console.log("pixel r val " + pixels[index] + " " + " frame rate " + frate);

        */
        frate = rate;
        frameRate(frate);
    }
}

////////////////////////////////////////////////////////////////////////////////

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}



function reshuffle() {
    num_cluster = 0;
    area_map = {};
    var prox_val = rand(150, 500); // proximity value
    var new_centroids = centroids;
    for (var i = 0; i < new_centroids.length - 1; i++) {
        var centroid_a = new_centroids[i];

        //cluster every 10 centroids into a polygon
        var map = {};
        var distances = [];

        for (var j = 1; j < new_centroids.length; j++) {
            var centroid_b = new_centroids[j];
            var distance = dist(centroid_a.point.x, centroid_a.point.y, centroid_b.point.x, centroid_b.point.y);
            if (int(distance)) {
                distances.push(int(distance));
                map[int(distance)] = centroid_b;
            }

        }

        var closest = sort(distances);

        var area_cluster = [];

        new_centroids = [];

        var red = rand(0, 255);
        var green = rand(0, 255);
        var blue = rand(0, 255);
        clus_colors.push([red, green, blue]);

        for (var k = 0; k < closest.length; k++) {

            if (closest[k] < prox_val) {


                var clus = map[closest[k]];
                clus.color.r = red;
                clus.color.g = green;
                clus.color.b = blue;
                clus.cluster = num_cluster;
                area_cluster.push(clus);
               //         closest.shift();      // clusters are more organic
                centroid_a.color.r = red;
                centroid_a.color.g = green;
                centroid_a.color.b = blue;
                centroid_a.cluster = num_cluster;
                console.log("setting cluster " + num_cluster + " " + centroid_a.cluster);

                area_cluster.push(centroid_a);
                area_map[num_cluster] = [];
                area_map[num_cluster] = area_cluster;

            } else {
                new_centroids.push(map[closest[k]]);
            }
            if (area_cluster.length == 0) {
                //     console.log("centroid a");
                //     console.log(centroid_a)
                centroid_a.color.r = red;
                centroid_a.color.g = green;
                centroid_a.color.b = blue;
                centroid_a.cluster = num_cluster;
                area_cluster.push(centroid_a);
                area_map[num_cluster] = [];
                area_map[num_cluster] = area_cluster;
            }
        }
        num_cluster++;
    }

    console.log("Proximity value " + prox_val);
    /*
        for (var i = 0; i < clus_colors.length; i++) {
            console.log("i " + i + " " + clus_colors[i]);
        }
        */

}


function Circles() {
    this.x;
    this.y;
    this.clicked = function (x, y, startRad, color) {
        tx = -30 * (spread / 2);
        ty = 30 * (spread / 2);
        this.x = x + rand(tx, ty);
        this.y = y + rand(tx, ty);
        fill(color, color, 255, 50);
        ellipse(this.x, this.y, startRad, startRad);
    }
}


function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function uniq(a) {
    var seen = {};
    return a.filter(function (item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
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

    /*
        if (gRate < 1) {
            grain.playbackRate.value = 0.5;
        } else {
            grain.playbackRate.value = gRate;
        }
    
    */
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


function Polygon() {
    /*
        this.p1 = new Points();
        this.p2 = new Points()
        this.p2.x = 680;
        this.p2.y = 190;
        this.p3 = new Points();
        this.p3.x = 210;
        this.p3.y = 170;
        this.p4 =  new Points();
        this.p4.x = 320;
        this.p4.y = 910;
        
        this.p1.x = 840;
        this.p1.y = 910;
    */

    this.ar = [{ x: 840, y: 910 }, { x: 680, y: 190 }, { x: 210, y: 170 }, { x: 320, y: 910 }];


    /*
       
       this.p1 = {x:840,y:910};
       this.p2 = {x:680,y:190};
       this.p3 = {x:210,y:170};
       this.p4 = {x:320,y:910};
   
       this.ar = [this.p1,this.p2,this.p3,this.p4];
       */

    //   console.log(this.p1.x + " "+this.p2.x+" "+this.p3.x+ " "+this.p4.x);

    this.draw = function () {
        //     noStroke();
        noFill();
        stroke(170, 130);

        strokeWeight(10);

        var l = this.ar.length;

        beginShape();
        curveVertex(this.ar[0].x, this.ar[0].y);
        for (var i = 0; i < this.ar.length; i++) {
            curveVertex(this.ar[i].x, this.ar[i].y);
        }
        curveVertex(this.ar[l - 1].x, this.ar[l - 1].y);
        endShape(CLOSE);
    }
}


function Area() {
    console.log("in area ");
    this.ar = [];
    this.draw = function () {
        noStroke();
        noFill();

        for (var i = 0; i < this.ar.length - 1; i++) {
            line(this.ar[i].point.x, this.ar[i].point.y, this.ar[i + 1].point.x, this.ar[i + 1].point.y);
        }

        /*
        beginShape();
        curveVertex(this.ar[0].point.x, this.ar[0].point.y);
        for (var i = 1; i < this.ar.length - 2; i++) {
            curveVertex(this.ar[i].point.x, this.ar[i + 1].point.y);
        }
        curveVertex(this.ar[this.ar.length - 1].point.x, this.ar[this.ar.length - 1].point.y);
        endShape();
        */
    }

}






function Centroids() {
    this.color = { r: 250, g: 250, b: 250 };
    this.point = { x: 0, y: 0 };
    this.cluster = 0;

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



