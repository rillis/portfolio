document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

var languages = [];
var colors = {};

function addToPortfolio(item){
  var portfolio = document.getElementById('portfolio');

  var name = item["name"];
  var lang = item["language"];
  var desc = item["description"];
  if(desc==null){
    desc="";
  }
  if(!languages.includes(lang)){
    languages.push(lang);
  }

  var languageStr = "<span style='margin-left:10px;font-size:21px;color:"+colors[lang]["color"]+"'>⬤</span><span class='badge badge-pill badge-light' style='margin-left:5px;'>"+lang+"</span>";
  portfolio.innerHTML += "<div class='d-flex flex-column port-item'><div class='d-flex align-items-center port-title'>"+name+" "+languageStr+"</div><span class='port-description'>"+desc+"</span><a href='https://github.com/rillis/"+name+"' target='_blank'>Source</a></div><hr>";
}

function addToRibbon(item){
    var ribbon = document.getElementById('languageRibbon');
    ribbon.innerHTML += "<span class='badge badge-pill badge-light' style='margin-left:5px;'><span style='font-size:15px;margin-right:10px;color:"+colors[item]["color"]+"'>⬤</span>"+item+"</span>";
}


function updateRepos(){
  $.getJSON('https://api.github.com/users/rillis/repos', function(data) {
    console.log(Object.keys(data));
    data.forEach(addToPortfolio);
    languages.forEach(addToRibbon);
  }).fail(function(jqXHR) {
      console.log("fail github");
  });
}

$( document ).ready(function() {

  $.getJSON("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json", function(data) {
    console.log(Object.keys(data));
    colors = data;
    updateRepos();
  }).fail(function(jqXHR) {
      console.log("fail colors");
  });

});
