const express = require('express'),
      fs = require('fs')
const pkg = require( './package.json' )
const app = express()
const protocol = 'https'
const port = 3000
const host = 'localhost'
const key_path = './certs/encrypted.key'
const cert_path = './certs/server.crt'

if (fs.existsSync('scrabble_words.txt')) {
  var wordList = fs.readFileSync('scrabble_words.txt').toString().split("\n")
}
else{
  console.error("Could not find list of scrabble words")
  process.exit(1)
}

wordList.sort((a, b) => a.length - b.length || a.localeCompare(b));
console.log("Read "+String(wordList.length)+" words from dictionary")

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/public_html/index.html')
})

app.get('/style.css', function(request, response) {
    response.sendFile(__dirname + '/public_html/style.css')
})

app.get('/main.js', function(request, response) {
    response.sendFile(__dirname + '/public_html/main.js')
})

app.get('/api/randomword', function(request, response) {
  let rand = Math.floor(Math.random()*wordList.length)
  while(wordList[rand].length < 6){
    rand = Math.floor(Math.random()*wordList.length)
  }
  response.send(wordList[rand].trim())
})

app.get('/api/getwords', function(request,response) {
  let word = request.query.word.trim().toUpperCase()
  let new_subwords = [word]
  let word_alpha = word.split('').sort()
  for( let i=0; i < wordList.length; i++  ){
    let word_temp = [...word_alpha]
    let key = wordList[i].trim()
    if(key.length > 2 && key.length <= word_alpha.length){
      let key_alpha = key.split('').sort()
      let j=0
      for( j=0; j < key_alpha.length; j++ ){
        let ind = word_temp.indexOf(key_alpha[j])
        if( ind >= 0 ){
          word_temp.splice(ind,1)
        }
        else{
          break
        }
      }
      if(j == key_alpha.length && key != word){  
        new_subwords.push(key)
      }
    }
  }
  response.send(new_subwords)
})

// Start a development HTTPS server.
const options = {
    key: fs.readFileSync( key_path ),
    cert: fs.readFileSync( cert_path ),
    passphrase : 'texttwistkey'
}
server = require( 'https' ).createServer( options, app )

server.listen( port, function() {
  console.log( 'Express server listening at: https://' + server.address().address + ":" + server.address().port )
})