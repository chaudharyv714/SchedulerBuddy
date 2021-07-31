

//navbar
var menu = document.getElementById('menubutton');
var navLink = document.getElementById('navLink');
var menustate = 0;
menu.onclick = function () {

    if (menustate) {
        navLink.style.display = "none";
        menustate = 0;
    }
    else {
        navLink.style.display = "block";
        menustate = 1;
    }
}




//modal for description boxes
var trig = document.getElementsByClassName('trigger');
for (let i = 0; i < trig.length; i++) {

    (function (index) {
        var trigmodal = document.getElementById("desModal" + i);
        var trigbtn = document.getElementById("trigBtn" + i);
        var trigspan = document.getElementById("close" + i)

        trigbtn.onclick = function () {
            console.log(index);
            trigmodal.style.display = "block";

        }
        trigspan.onclick = function () {
            trigmodal.style.display = "none";

        }

    })(i)
}


//modal for addition forms
var formmodal = document.getElementById('addtaskModal');
var formbtn = document.getElementById('addtaskbutton');
var formspan = document.getElementById('formclose');

formbtn.onclick = function () {
    formmodal.style.display = "block";
}
formspan.onclick = function () {
    formmodal.style.display = "none";
}

//modal end function
window.onclick = function (event) {
    if (event.target == formmodal) {
        formmodal.style.display = "none";
    }

}

//overdue item special aesthetics
var today = new Date();
var deadline = document.getElementsByClassName('deadline');
for (let i = 0; i < deadline.length; i++) {
    let taskdate = new Date(deadline[i].innerText.slice(11));
    let diffdate = taskdate - today;
    if (diffdate < 0) {
        let lateitem = deadline[i].parentElement.parentElement.parentElement.parentElement;
        lateitem.style.borderRadius = "2px";
        lateitem.style.background = "linear-gradient(45deg,rgba(255,9,9,0.5),white)";
    }
}

