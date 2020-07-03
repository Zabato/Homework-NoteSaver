// Dependencies
// =============================================================
var express = require("express");
var path = require("path");
var fs = require("fs");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = 3000;

// Sets up the Express app to handle data parsing
//everything will be saved with a rest service
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.get("/notes", function(req, res) {
    res.sendFile(path.join(__dirname,"public","notes.html"));
});

app.get("/api/notes",function(req, res){
    res.json(getDBContents());
});

app.post("/api/notes", function(req, res){
    let newNote = req.body;

    var currentNotes = getDBContents();

    var notesWithSameTitle = currentNotes.filter(function(item) {return item.title == newNote.title});

    if(notesWithSameTitle.length != 0){
      notesWithSameTitle[0].text = newNote.text;
      newNote = notesWithSameTitle[0];
    }else{
      newNote.id = newNote.title;
      currentNotes.push(newNote);
    }

    rewriteDBContents(currentNotes);

    res.json(newNote);
});

app.delete("/api/notes/:id", function (req, res) {
    var currentContents = getDBContents();
    var deletedItem = currentContents.filter(function (item) {
        return item.id === req.params.id;
    });

    var newDbContents = [];
    if(deletedItem.length !== 0){
      newDbContents = getDBContents().filter(function (item) {
        return item.id !== req.params.id;
      });

      rewriteDBContents(newDbContents);

      res.json(deletedItem[0]);
    }else{
      res.status(500).send("Invalid Id");
    }
});

app.get("*", function(req,res){
  res.sendFile(path.join(__dirname,"public","index.html"));
});

function getDBContents(){
  var file = fs.readFileSync(path.join(__dirname,"db","db.json"),'utf-8');
  return JSON.parse(file);
}

function rewriteDBContents(items) {
  fs.writeFileSync(path.join(__dirname,"db","db.json"),JSON.stringify(items,null, 2));
}

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});