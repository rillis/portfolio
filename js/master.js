document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


var colors = {};
$.getJSON('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json', function(data) {
    colors = data;
});


function addPage(item) {
    var portfolio = document.getElementById('portfolio');

    var desc = item["description"];
    if(desc==null){
      desc="";
    }



    var languageStr = "<span style='margin-left:10px;font-size:21px;color:"+colors[item["language"]]["color"]+"'>⬤</span><span class='badge badge-pill badge-light' style='margin-left:5px;'>"+item["language"]+"</span>";

    portfolio.innerHTML += "<div class='d-flex flex-column port-item'><div class='d-flex align-items-center port-title'>"+item["name"]+" "+languageStr+"</div><span class='port-description'>"+desc+"</span><a href='https://github.com/rillis/"+item["name"]+"' target='_blank'>Source</a></div><hr>"

}

$.getJSON('https://api.github.com/users/rillis/repos', function(data) {
    data.sort(function (a, b) {
        return a["id"]<b["id"];
    });
    data.forEach(addPage);
});
