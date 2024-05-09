var target = "elementId";
var obj = document.getElementById(target);

if (obj) {
    obj.innerHTML = "Just a test";
} else {
    console.log("Element not found with ID:", target);
}
