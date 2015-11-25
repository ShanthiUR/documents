var uploader = document.getElementById("uploader");  
var reader = new FileReader();

reader.onload = function(e) {
  var contents = e.target.result;
  //console.log("contents :"+contents);
  var data = d3.csv.parse(contents);
  //console.log("data :"+data);
  parallel_coordinates(data);

  // remove button, since re-initializing doesn't work for now
  uploader.parentNode.removeChild(uploader);
};

uploader.addEventListener("change", handleFiles, false);  

function handleFiles() {
  var file = this.files[0];
  reader.readAsText(file);
};
