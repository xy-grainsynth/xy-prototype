const PARAMS = {
  source: 0, //sample file number in GUI drop down list
  map: 3,
  attack: 0.3, //in seconds
  decay: 0.3, //in seconds
  density: 50,
  delay: 0.1,
  feedback: 0.1,
  spread: 0,
  pitch: 1,
  numcentr: 3
};



const pane = new Tweakpane({
  title: 'Granular Synthesis',
  expanded: true,
});

pane.addSeparator();


const snd = pane.addFolder({
  title: 'Sound',
});

// sound/tone context on and off
const btnSound = snd.addButton({
  title: '► | ◼︎',
  label: 'audio active',
});

//playing = false;

btnSound.on('click', () => {
  if (ctx.state == "running") {
    ctx.suspend().then(() => {
    });
    console.log(ctx.state);

  }
  else {
    ctx.resume().then(() => {
    });
    console.log(ctx.state);
  }
}
)


// sound/tone context on and off
const clearSound = snd.addButton({
  title: 'clear',
  label: 'clear',
});

clearSound.on('click', () => {
  ctx.close();
  ctx = new (window.AudioContext || window.webkitAudioContext);

  //master volume
  master = ctx.createGain();
  master.connect(ctx.destination);
})

const SourceInput =
  pane.addInput(PARAMS, 'source', { options: { "birds near water": 0, "river water": 1, "treebark": 2 } });
SourceInput.on('change', function (ev) {
  console.log(ev.value);
  if (ev.value == 0) {
    bufferSwitch(0);
  }
  if (ev.value == 1) {
    bufferSwitch(1);
  }
  if (ev.value == 2) {
    bufferSwitch(2);
  }
});


const instr = pane.addFolder({
  title: 'Canvas',
});

const mapInput = pane.addInput(PARAMS, 'map', { options: { map3: 2 } });
mapInput.on('change', function (ev) {
  console.log(ev.value);
  if (ev.value == 0) {
    loadmap(0);
  }
  if (ev.value == 1) {
    loadmap(1);
  }
  if (ev.value == 2) {
    loadmap(2);
  }
});


const cInput = pane.addInput(PARAMS, 'numcentr', { min: 1, max: 7, step: 1 });
cInput.on('change', function (ev) {
  numcentr = parseInt(ev.value);
  console.log(" att in gui " + num_centroids);
});

// sound/tone context on and off
const btnReshuffle = instr.addButton({
  title: 'reshuffle',
  label: 'reshuffle',
});


btnReshuffle.on('click', () => {
  reshuffle();
});

/*
// sound/tone context on and off
const btnPitch = instr.addButton({
  title: 'pitch',
  label: 'pitch',
});


btnPitch.on('click', () => {
  if(usepitch){
    usepitch = false;
  }
  else {
    usepitch = true;
  }
});

*/

const area = pane.addFolder({
  title: 'Grain Params',
  expanded: true
});



const attInput = area.addInput(PARAMS, 'attack', { min: 0.01, max: 1.0, step: 0.01 });
attInput.on('change', function (ev) {
  att = parseFloat(ev.value.toFixed(2));
  console.log(" att in gui " + att);
});

const decInput = area.addInput(PARAMS, 'decay', { min: 0.01, max: 1.0, step: 0.01 });
decInput.on('change', function (ev) {
  dec = parseFloat(ev.value.toFixed(2));
  console.log(" dec in gui " + dec);
});

const densInput = area.addInput(PARAMS, 'density', { min: 1, max: 100, step: 1 });
densInput.on('change', function (ev) {
  density = parseInt(ev.value);
});


const sprInput = area.addInput(PARAMS, 'spread', { min: 0, max: 10, step: 1 });
sprInput.on('change', function (ev) {
  spread = parseInt(ev.value);
});


const effects = pane.addFolder({
  title: 'Effekt Params',
  expanded: true
});


const delInput = effects.addInput(PARAMS, 'delay', { min: 0.0, max: 0.9, step: 0.1 });
delInput.on('change', function (ev) {
  del = parseFloat(ev.value.toFixed(1));
});


const fbInput = effects.addInput(PARAMS, 'feedback', { min: 0.0, max: 0.9, step: 0.1 });
fbInput.on('change', function (ev) {
  fb = parseFloat(ev.value.toFixed(1));
});

const pInput = effects.addInput(PARAMS, 'pitch', { min: 0.47, max: 10, step: 0.01 });
pInput.on('change', function (ev) {
  pitch = parseFloat(ev.value.toFixed(2));
});

/*
pane.addSeparator();



const area1 = pane.addFolder({
    title: '1 cluster area',
    expanded: true
});


const attInput1 = area1.addInput(PARAMS, 'attack1', { min: 0.01, max: 1.0, step: 0.01 });
attInput1.on('change', function (ev) {
    att1 = parseFloat(ev.value.toFixed(2));
});

const decInput1 = area1.addInput(PARAMS, 'decay1', { min: 0.01, max: 1.0, step: 0.01 });
decInput1.on('change', function (ev) {
    dec1 = parseFloat(ev.value.toFixed(2));
});

const densInput1 = area1.addInput(PARAMS, 'density1', { min: 1, max: 100, step: 1 });
densInput1.on('change', function (ev) {
    density1 = parseInt(ev.value);
});

pane.addSeparator();



const area2 = pane.addFolder({
  title: '2 cluster area',
  expanded: true
});


const attInput2 = area2.addInput(PARAMS, 'attack2', { min: 0.01, max: 1.0, step: 0.01 });
attInput2.on('change', function (ev) {
  att2 = parseFloat(ev.value.toFixed(2));
});

const decInput2 = area2.addInput(PARAMS, 'decay2', { min: 0.01, max: 1.0, step: 0.01 });
decInput2.on('change', function (ev) {
  dec2 = parseFloat(ev.value.toFixed(2));
});

const densInput2 = area2.addInput(PARAMS, 'density2', { min: 1, max: 100, step: 1 });
densInput2.on('change', function (ev) {
  density2 = parseInt(ev.value);
});


pane.addSeparator();



const area3 = pane.addFolder({
  title: '3 cluster area',
  expanded: true
});


const attInput3 = area3.addInput(PARAMS, 'attack3', { min: 0.01, max: 1.0, step: 0.01 });
attInput3.on('change', function (ev) {
  att3 = parseFloat(ev.value.toFixed(2));
});

const decInput3 = area3.addInput(PARAMS, 'decay3', { min: 0.01, max: 1.0, step: 0.01 });
decInput3.on('change', function (ev) {
  dec3 = parseFloat(ev.value.toFixed(2));
});

const densInput3 = area3.addInput(PARAMS, 'density3', { min: 1, max: 100, step: 1 });
densInput3.on('change', function (ev) {
  density3 = parseInt(ev.value);
});


pane.addSeparator();



const area4 = pane.addFolder({
  title: '4 cluster area',
  expanded: true
});


const attInput4 = area4.addInput(PARAMS, 'attack4', { min: 0.01, max: 1.0, step: 0.01 });
attInput4.on('change', function (ev) {
  att4 = parseFloat(ev.value.toFixed(2));
});

const decInput4 = area4.addInput(PARAMS, 'decay4', { min: 0.01, max: 1.0, step: 0.01 });
decInput.on('change', function (ev) {
  dec4 = parseFloat(ev.value.toFixed(2));
});

const densInput4 = area4.addInput(PARAMS, 'density4', { min: 1, max: 100, step: 1 });
densInput4.on('change', function (ev) {
  density4 = parseInt(ev.value);
});
*/

const grain = pane.addFolder({
  title: 'Grain Params',
  expanded: true
});




pane.addMonitor(PARAMS, 'density', { view: 'graph', min: 1, max: 100 });
pane.addMonitor(PARAMS, 'attack', { view: 'graph', min: 0.01, max: 1.0 });
pane.addMonitor(PARAMS, 'decay', { view: 'graph', min: 0.01, max: 1.0 });




/*

document.getElementById('shuffleButton').addEventListener('click', function () {
  console.log("calling rshuffle");
  reshuffle();
});


*/


toggleBtnColorActive = (btnName) => {
  btnName.style.opacity = "1.0";
};

toggleBtnColorDeact = (btnName) => {
  btnName.style.opacity = "0.7";
};