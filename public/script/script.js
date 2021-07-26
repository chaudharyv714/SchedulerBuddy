//alert("hello!");

var trig = document.getElementsByClassName('trigger');

for (var i = 0; i < trig.length; i++) {
    var trigmodal = document.getElementById("desModal" + i);

    // Get the button that opens the modal
    var trigbtn = document.getElementById("trigBtn" + i);

    // Get the <span> element that closes the modal
    var trigspan = document.getElementById("close" + i)

    // When the user clicks on the button, open the modal
    trigbtn.onclick = function () {
        trigmodal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    trigspan.onclick = function () {
        trigmodal.style.display = "none";
    }
}

var formmodal = document.getElementById('addtaskModal');
var formbtn = document.getElementById('addtaskbutton');
var formspan = document.getElementById('formclose');

formbtn.onclick = function () {
    formmodal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
formspan.onclick = function () {
    formmodal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == formmodal) {
        formmodal.style.display = "none";
    }
    if (event.target == trigmodal) {
        trigmodal.style.display = "none";
    }
}

var today = new Date();
//console.log(today)
var deadline = document.getElementsByClassName('deadline');
for (let i = 0; i < deadline.length; i++) {
    console.log(deadline);
    let taskdate = new Date(deadline[i].innerText.slice(11));
    let diffdate = taskdate - today;
    if (diffdate < 0) {
        console.log(diffdate);
        let lateitem = deadline[i].parentElement.parentElement.parentElement.parentElement;
        //lateitem.style.border = "2px solid red";
        lateitem.style.borderRadius = "2px";
        lateitem.style.background = "linear-gradient(45deg,rgba(255,9,9,0.5),white)";
    }
}