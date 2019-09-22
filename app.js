const express = require("express"),
  fs = require("fs"),
  pkg = require("./package.json");

const app = express();
const protocol = "https";
const port = 3000;
const host = "localhost";
const key_path = "./certs/encrypted.key";
const cert_path = "./certs/server.crt";

// Load list of Scrabble words
if (fs.existsSync("scrabble_words.txt")) {
  var wordList = fs
    .readFileSync("scrabble_words.txt")
    .toString()
    .split("\n");
  wordList = wordList.map(s => s.trim());
  // Sort word list by length & alphabetically
  wordList.sort((a, b) => a.length - b.length || a.localeCompare(b));
} else {
  console.error("Could not find list of scrabble words");
  process.exit(1);
}

// Load list of Scrabble definitions
if (fs.existsSync("scrabble_definitions.txt")) {
  var wordDefs = fs
    .readFileSync("scrabble_definitions.txt")
    .toString()
    .split("\n");
  // Convert definitions list into key-value pairs
  wordDefs = wordDefs.map(s => s.trim().split("\t"));
  wordDefs = objectify(wordDefs);
} else {
  console.error("Could not find list of scrabble definitions");
  process.exit(1);
}

console.log(
  "Read " + String(wordList.length) + " words & definitions from dictionary"
);

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/public_html/index.html");
});

app.get("/style.css", function(request, response) {
  response.sendFile(__dirname + "/public_html/style.css");
});

app.get("/main.js", function(request, response) {
  response.sendFile(__dirname + "/public_html/main.js");
});

// Get a random word from the dictionary that's not too hard or too easy
app.get("/api/randomword", function(request, response) {
  let rand = Math.floor(Math.random() * wordList.length);
  while (wordList[rand].length < 5 || wordList[rand].length > 9) {
    rand = Math.floor(Math.random() * wordList.length);
  }
  response.send(wordList[rand].trim());
});

// Get all subwords of the provided word from the dictionary
app.get("/api/getwords", function(request, response) {
  let word = request.query.word.trim().toUpperCase();
  let new_subwords = [word];
  let word_alpha = word.split("").sort();
  // Loop over entire dictionary
  for (let i = 0; i < wordList.length; i++) {
    let word_temp = [...word_alpha];
    let key = wordList[i].trim();
    if (key.length > 2 && key.length <= word_alpha.length) {
      let key_alpha = key.split("").sort();
      let j = 0;
      // Check all letters in the key against the letters in the current word
      for (j = 0; j < key_alpha.length; j++) {
        let ind = word_temp.indexOf(key_alpha[j]);
        if (ind >= 0) {
          word_temp.splice(ind, 1);
        } else {
          break;
        }
      }
      if (j == key_alpha.length && key != word) {
        new_subwords.push(key);
      }
    }
  }
  response.send(new_subwords);
});

// Get definintion of the provided word from the dictionary
app.get("/api/getdefinition", function(request, response) {
  let word = request.query.word.trim().toUpperCase();
  let def = wordDefs[word];
  response.send(def);
});

// Configure an HTTPS server
const options = {
  key: fs.readFileSync(key_path),
  cert: fs.readFileSync(cert_path),
  passphrase: "texttwistkey"
};
server = require("https").createServer(options, app);

server.listen(port, function() {
  console.log(
    "Express server listening at: https://" +
      server.address().address +
      ":" +
      server.address().port
  );
});

// Turn array into key-value pairs
function objectify(array) {
  return array.reduce(function(p, c) {
    p[c[0]] = c[1];
    return p;
  }, {});
}
