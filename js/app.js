// Sidebar close with click
function closesb() {
    document.getElementById('options-box').style.width = '0px';
    document.getElementById('open').style.display = 'block';
    document.getElementById('close').style.display = 'none';
    document.getElementById('options-box').style.display = 'none';
    document.getElementById('map-box').style.left = '30px';
    document.getElementById('close').style.left = '0px';
}

// Sidebar open with click
function opensb() {
    document.getElementById('options-box').style.display = 'block';
    document.getElementById('open').style.display = 'none';
    document.getElementById('close').style.display = 'block';
    document.getElementById('options-box').style.width = '290px';
    document.getElementById('close').style.left = '290px';
    document.getElementById('map-box').style.left = '320px';
}