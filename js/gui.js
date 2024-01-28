//const btnShuffle = document.querySelector("shuffleButton");

//var reshuffleBtn = document.getElementById("shuffleButton");


document.getElementById('shuffleButton').addEventListener('click', function () {
  console.log("calling rshuffle");
  reshuffle();
});





toggleBtnColorActive = (btnName) => {
    btnName.style.opacity = "1.0";
  };
  
  toggleBtnColorDeact = (btnName) => {
    btnName.style.opacity = "0.7";
  };