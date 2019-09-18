var currentWord = ""
var answerWords = []
var lastEnteredWord = ""

jQuery( document ).ready( function( $ ) {
  
  $( '#twistBtn' ).click( function( event )
  {
    $('#letterInput').removeClass( 'is-valid' )
    $('#letterInput').removeClass( 'is-invalid' )
    let letterBtns = document.querySelector('#letterBank');
    for (let i = letterBtns.children.length; i >= 0; i--) {
        letterBtns.appendChild(letterBtns.children[Math.random() * i | 0]);
    }
  })
  
  $( '#lastBtn' ).click( function( event )
  {
    $('#letterInput').removeClass( 'is-valid' )
    $('#letterInput').removeClass( 'is-invalid' )
    $( '#enterBtn' ).prop( 'disabled', false )
    $( '#letterInput' ).val( lastEnteredWord )
    let letterBtns = document.querySelector('#letterBank');
    for(let j = 0; j < lastEnteredWord.length; j++){
      for (let i = 0; i < letterBtns.children.length; i++) {
        if( letterBtns.children[i].innerHTML == lastEnteredWord.charAt(j).toUpperCase())
        {
          if(letterBtns.children[i].style.display != 'none')
          {
            letterBtns.children[i].style.display = 'none'
            break 
          }
        }
      } 
    }
  })
  
  $( '#clearBtn' ).click( function( event )
  {
    $('#letterInput').removeClass( 'is-valid' )
    $('#letterInput').removeClass( 'is-invalid' )
    $( '#enterBtn' ).prop( 'disabled', true )
    $( '#letterInput' ).val( '' )
    let letterBtns = document.querySelector('#letterBank');
    for (let i = 0; i < letterBtns.children.length; i++) {
      letterBtns.children[i].style.display = 'block'
    }
  })
  
  $( '#letterInput' ).keyup( function( event )
  {
    $('#letterInput').removeClass( 'is-valid' )
    $('#letterInput').removeClass( 'is-invalid' )
    if( event.originalEvent != undefined && event.originalEvent.code === "Enter")
    {
      if( ! $( '#enterBtn' ).is( ':disabled' ) )
      {
         $( '#enterBtn' ).click()
      }
    }
    let letterBtns = document.querySelector('#letterBank');
    let enteredWord = $('#letterInput').val()
    for (let i = 0; i < letterBtns.children.length; i++) {
      letterBtns.children[i].style.display = 'block'
    }
    for(let j = 0; j < enteredWord.length; j++){
      for (let i = 0; i < letterBtns.children.length; i++) {
        if( letterBtns.children[i].innerHTML == enteredWord.charAt(j).toUpperCase())
        {
          if(letterBtns.children[i].style.display != 'none')
          {
            letterBtns.children[i].style.display = 'none'
            break 
          }
        }
      } 
    }
    if( event.target.checkValidity() )
    {
      $( '#enterBtn' ).prop( 'disabled', false )
    }
    else{
      $( '#enterBtn' ).prop( 'disabled', true )
    }
  })
  
  $( '#enterBtn' ).click( function( event )
  {  
    $('#letterInput').removeClass( 'is-valid' )
    $('#letterInput').removeClass( 'is-invalid' )
    let test_word = $( '#letterInput' ).val().toUpperCase()
    lastEnteredWord = test_word
    $( '#letterInput' ).val( '' )
    if(answerWords.includes(test_word)){
      $( '#table'+test_word ).html(test_word)
      $('#letterInput').addClass( 'is-valid' )
    }
    else{
      $('#letterInput').addClass( 'is-invalid' )
    }
    let letterBtns = document.querySelector('#letterBank');
    for (let i = 0; i < letterBtns.children.length; i++) {
      letterBtns.children[i].style.display = 'block'
    }
  })
  
  $( '#newGameBtn' ).click( function( event )
  {
    $('#introMsg').html('Loading game...')
    $( '#letterNumHeaders' ).html('')
    $( '#wordTableBody' ).html('')
    $( '#letterBank' ).html('')
    getWordAndSubs()
  })
  
  getWordAndSubs()
})

function getWordAndSubs(){
  $.get( '/api/randomword', function( data )
  {
    currentWord = data
    $.get( '/api/getwords?word='+currentWord, function( data )
    {
      answerWords = data
      if(answerWords.length > 100){
        getWordAndSubs()
      }
      else{
        answerWords.sort((a, b) => a.length - b.length || a.localeCompare(b));
        $( '#letterBank' ).html('')
        let word_arr = currentWord.split('').sort()
        word_arr.forEach( function( w )
        {
          $( '#letterBank' ).append(`
            <button type="button" class="btn btn-outline-primary flex-fill word-button">`+w+`</button>
          `) 
        })
        populateWordTable()
        $('#introMsg').html('Find all of the subwords!')
        setLetterListener()
        $( '#twistBtn' ).click()
      }
    })
  })
}
  
function populateWordTable(){
  $( '#letterNumHeaders' ).html('')
  $( '#wordTableBody' ).html('')
  let prevLen = 0
  let ind = 1
  answerWords.forEach( function( w ){
    if(w.length > prevLen){
      $( '#letterNumHeaders' ).append(`
        <th scope="col">`+w.length+` Letters</th>
      `)
      prevLen = w.length
      ind = 1
    }
    if( $( '#wordTableBody tr:nth-child('+ind+')').length > 0 ){
      let newWordElem = '<td><div id="table'+w+'">'
      for(let i=0; i < w.length; i++)
      {
        newWordElem += '-'
      }
      newWordElem += '</div></td>'
      $( '#wordTableBody tr:nth-child('+ind+')').append(newWordElem)
    }
    else if( $( '#wordTableBody tr:nth-child('+ind+')').length == 0 && w.length > 3 ){
      let newWordElem = '<tr>'
      for(let i=0; i < w.length-3; i++)
      {
        newWordElem += '<td></td>'
      }
      newWordElem += '<td><div id="table'+w+'" class="word-cell">'
      for(let i=0; i < w.length; i++)
      {
        newWordElem += '-'
      }
      newWordElem += '</div></td></tr>'
      $( '#wordTableBody' ).append(newWordElem)
    }
    else{
      let newWordElem = '<tr><td><div id="table'+w+'"">'
      for(let i=0; i < w.length; i++)
      {
        newWordElem += '-'
      }
      newWordElem += '</div></td></tr>'
      $( '#wordTableBody' ).append(newWordElem) 
    }
    ind++
  })
}

function setLetterListener()
{
  $( '#letterBank button').click( function( event )
  {
    $( '#letterInput' ).val($( '#letterInput' ).val()+event.target.innerText)
    if($( '#letterInput' ).val().length >= 3 && $( '#letterInput' ).val().length <= 32){
      $( '#enterBtn' ).prop( 'disabled', false )
    }
    else{
      $( '#enterBtn' ).prop( 'disabled', true )
    }
  })
}

function showAlert( message, alertClass )
{
  $( '#alert_placeholder' ).hide()
  $( '#alert_placeholder' ).html( `<div class='alert alert-dismissable ` + alertClass + `' id='topAlert' role='alert'>
      <span>` + message + `</span>
      <button type='button' class='close' data-dismiss='alert' aria-label='Close'>
          <span aria-hidden='true'>&times</span>
      </button>
  </div>` )
  $( '#alert_placeholder' ).slideToggle( 400 )
  window.setTimeout( function()
  {
    $( '#topAlert' ).slideToggle( 400, function()
    {
      $( this ).remove() 
    })
  }, 5000)
}
