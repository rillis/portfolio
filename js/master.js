document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

var languages = [];
var languagesSelected = [];
var colors = {};

function langua(l){
  var lsLen = Object.keys(languagesSelected).length;
  var lLen = Object.keys(languages).length;
  if(lsLen == lLen){
    languagesSelected = [];
    languagesSelected.push(l);
    update();
  }else{
    if(!languagesSelected.includes(l)){
      languagesSelected.push(l);
      update();
    }else{
      const index = languagesSelected.indexOf(l);
      if (index > -1) { // only splice array when item is found
        languagesSelected.splice(index, 1); // 2nd parameter means remove one item only
      }
      update();
    }
  }
  console.log(l);
}

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

  if(languagesSelected.includes(lang) || Object.keys(languagesSelected).length == 0 ){
    portfolio.innerHTML += "<div class='d-flex flex-column port-item'><div class='d-flex align-items-center port-title'>"+name+" "+languageStr+"</div><span class='port-description'>"+desc+"</span><a href='https://github.com/rillis/"+name+"' target='_blank'>Source</a></div><hr>";
  }
}

function addToRibbon(item){
    var ribbon = document.getElementById('languageRibbon');
    if(!languagesSelected.includes(item)){
      ribbon.innerHTML += "<span class='badge badge-pill badge-light ribbon-badge disabled' style='margin-left:5px;' onClick='langua(&quot;"+item+"&quot;);'><span style='font-size:15px;margin-right:10px;color:"+colors[item]["color"]+"'>⬤</span>"+item+"</span>";
    }else{
      ribbon.innerHTML += "<span class='badge badge-pill badge-light ribbon-badge enabled' style='margin-left:5px;' onClick='langua(&quot;"+item+"&quot;);'><span style='font-size:15px;margin-right:10px;color:"+colors[item]["color"]+"'>⬤</span>"+item+"</span>";
    }
}


function updateRepos(){
  $.getJSON('https://api.github.com/users/rillis/repos', function(data) {
    console.log(Object.keys(data));
    data.forEach(addToPortfolio);

    if(Object.keys(languagesSelected).length == 0){
      languagesSelected = languages;
    }
    languages.forEach(addToRibbon);

  }).fail(function(jqXHR) {
      console.log("fail github");
  });
}

function update(){

  $.getJSON("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json", function(data) {
    var portfolio = document.getElementById('portfolio');
    portfolio.innerHTML = '<h5>Filters:</h5><div class="d-flex align-items-center port-title" id="languageRibbon"> </div><hr>';
    console.log(Object.keys(data));
    colors = data;
    updateRepos();
  }).fail(function(jqXHR) {
      console.log("fail colors");
  });
}

$( document ).ready(function() {
  update();
});
