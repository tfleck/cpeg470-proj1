// Global variables to track state of the game
var currentWord = "";
var answerWords = [];
var numEnteredWords = 0;
var lastEnteredWord = "";

jQuery(document).ready(function($) {
  // Shuffle the order of the letters in the letter bank
  $("#twistBtn").click(function(event) {
    $("#letterInput").removeClass("is-valid");
    $("#letterInput").removeClass("is-invalid");
    let letterBtns = document.querySelector("#letterBank");
    for (let i = letterBtns.children.length; i >= 0; i--) {
      letterBtns.appendChild(letterBtns.children[(Math.random() * i) | 0]);
    }
  });

  // Populate input field with last entered word, valid or not
  $("#lastBtn").click(function(event) {
    $("#letterInput").removeClass("is-valid");
    $("#letterInput").removeClass("is-invalid");
    $("#enterBtn").prop("disabled", false);
    $("#letterInput").val(lastEnteredWord);
    let letterBtns = document.querySelector("#letterBank");
    for (let j = 0; j < lastEnteredWord.length; j++) {
      for (let i = 0; i < letterBtns.children.length; i++) {
        if (
          letterBtns.children[i].innerHTML ==
          lastEnteredWord.charAt(j).toUpperCase()
        ) {
          if (letterBtns.children[i].style.display != "none") {
            letterBtns.children[i].style.display = "none";
            break;
          }
        }
      }
    }
  });

  // Erase input field
  $("#clearBtn").click(function(event) {
    $("#letterInput").removeClass("is-valid");
    $("#letterInput").removeClass("is-invalid");
    $("#enterBtn").prop("disabled", true);
    $("#letterInput").val("");
    let letterBtns = document.querySelector("#letterBank");
    for (let i = 0; i < letterBtns.children.length; i++) {
      letterBtns.children[i].style.display = "block";
    }
  });

  // Validate input field, and update letter bank accordingly
  $("#letterInput").keyup(function(event) {
    $("#letterInput").removeClass("is-valid");
    $("#letterInput").removeClass("is-invalid");
    if (
      event.originalEvent != undefined &&
      event.originalEvent.code === "Enter"
    ) {
      if (!$("#enterBtn").is(":disabled")) {
        $("#enterBtn").click();
      }
    }
    let letterBtns = document.querySelector("#letterBank");
    let enteredWord = $("#letterInput").val();
    for (let i = 0; i < letterBtns.children.length; i++) {
      letterBtns.children[i].style.display = "block";
    }
    for (let j = 0; j < enteredWord.length; j++) {
      for (let i = 0; i < letterBtns.children.length; i++) {
        if (
          letterBtns.children[i].innerHTML ==
          enteredWord.charAt(j).toUpperCase()
        ) {
          if (letterBtns.children[i].style.display != "none") {
            letterBtns.children[i].style.display = "none";
            break;
          }
        }
      }
    }
    if (event.target.checkValidity()) {
      $("#enterBtn").prop("disabled", false);
    } else {
      $("#enterBtn").prop("disabled", true);
    }
  });

  // Check if word is valid, and reveal it in the table
  $("#enterBtn").click(function(event) {
    $("#letterInput").removeClass("is-valid");
    $("#letterInput").removeClass("is-invalid");
    let test_word = $("#letterInput")
      .val()
      .toUpperCase();
    lastEnteredWord = test_word;
    $("#letterInput").val("");
    if (answerWords.includes(test_word)) {
      if (
        $("#table" + test_word)
          .html()
          .indexOf("---") >= 0
      ) {
        $("#table" + test_word).fadeOut(150, function() {
          $("#table" + test_word).html(test_word);
          numEnteredWords++;
          $("#table" + test_word).fadeIn(250, function() {
            if (numEnteredWords == answerWords.length) {
              $("#introMsg").fadeOut(150, function() {
                $("#introMsg").html("You Win!!");
                $("#introMsg").fadeIn(250);
              });
            }
          });
        });
      }
      $("#letterInput").addClass("is-valid");
    } else {
      $("#letterInput").addClass("is-invalid");
    }
    let letterBtns = document.querySelector("#letterBank");
    for (let i = 0; i < letterBtns.children.length; i++) {
      letterBtns.children[i].style.display = "block";
    }
  });

  // Clear current game and create a fresh one
  $("#newGameBtn").click(function(event) {
    $("#introMsg").html("Loading game...");
    $("#wordTable").fadeOut(300, function() {
      getWordAndSubs();
    });
  });

  //Start game
  $("#wordTable").fadeOut(10, function() {
    getWordAndSubs();
  });
});

function getWordAndSubs() {
  $.get("/api/randomword", function(data) {
    currentWord = data;
    $.get("/api/getwords?word=" + currentWord, function(data) {
      answerWords = data;
      // If game will take too long, find another
      if (answerWords.length > 50) {
        getWordAndSubs();
      } else {
        // Set up game front end
        answerWords.sort((a, b) => a.length - b.length || a.localeCompare(b));
        populateLetterBank();
        populateWordTable();
        $("#wordTable").fadeIn(500);
        $("#introMsg").html("Find all of the subwords!");
        $("#twistBtn").click();
      }
    });
  });
}

function populateLetterBank() {
  $("#letterBank").html("");
  let word_arr = currentWord.split("").sort();
  word_arr.forEach(function(w) {
    $("#letterBank").append(
      '<button type="button" class="btn btn-outline-primary flex-fill word-button">' +
        w +
        '</button>'
    );
  });
  setLetterListener();
}

function setLetterListener() {
  $("#letterBank button").click(function(event) {
    $("#letterInput").val($("#letterInput").val() + event.target.innerText);
    if (
      $("#letterInput").val().length >= 3 &&
      $("#letterInput").val().length <= 32
    ) {
      $("#enterBtn").prop("disabled", false);
    } else {
      $("#enterBtn").prop("disabled", true);
    }
  });
}

function populateWordTable() {
  $("#letterNumHeaders").html("");
  $("#wordTableBody").html("");
  let prevLen = 2;
  let ind = 1;
  // Add all subwords to table
  // Need to make sure all words are in the correct columns & rows
  answerWords.forEach(function(w) {
    if (w.length > prevLen) {
      $("#letterNumHeaders").append(
        '<th scope="col">' + w.length + " Chars</th>"
      );
      prevLen = w.length;
      ind = 1;
    }
    if ($("#wordTableBody tr:nth-child(" + ind + ")").length > 0) {
      let newWordElem = "";
      let numCells = $("#wordTableBody tr:nth-child(" + ind + ")")[0].cells
        .length;
      for (let i = numCells; i < w.length - 3; i++) {
        if (
          $(
            "#letterNumHeaders th:nth-child(" + (i + 1) + ")"
          )[0].innerHTML.indexOf(i + 3) >= 0
        ) {
          newWordElem += "<td></td>";
        }
      }
      newWordElem += '<td><div class="tableWord" id="table' + w + '">';
      for (let i = 0; i < w.length; i++) {
        newWordElem += "-";
      }
      newWordElem += "</div></td>";
      $("#wordTableBody tr:nth-child(" + ind + ")").append(newWordElem);
    } else if (
      $("#wordTableBody tr:nth-child(" + ind + ")").length == 0 &&
      w.length > 3
    ) {
      let newWordElem = "<tr>";
      for (let i = 0; i < w.length - 3; i++) {
        newWordElem += "<td></td>";
      }
      newWordElem += '<td><div class="tableWord" id="table' + w + '">';
      for (let i = 0; i < w.length; i++) {
        newWordElem += "-";
      }
      newWordElem += "</div></td></tr>";
      $("#wordTableBody").append(newWordElem);
    } else {
      let newWordElem = '<tr><td><div class="tableWord" id="table' + w + '">';
      for (let i = 0; i < w.length; i++) {
        newWordElem += "-";
      }
      newWordElem += "</div></td></tr>";
      $("#wordTableBody").append(newWordElem);
    }
    ind++;
  });
  setTableWordListener();
}

function setTableWordListener() {
  $("table .tableWord").click(function(event) {
    if (event.currentTarget.innerHTML.indexOf("---") < 0) {
      let clickedWord = event.currentTarget.id.substring(5);
      $.get("/api/getdefinition?word=" + clickedWord, function(data) {
        $("#definitionModalLabel").html(clickedWord);
        $("#definitionModalBody").html(data);
        $("#definitionModal").modal("toggle");
      });
    }
  });
}

function showAlert(message, alertClass) {
  $("#alert_placeholder").hide();
  $("#alert_placeholder").html(
    `<div class="alert alert-dismissable ` +
      alertClass +
      `" id="topAlert" role="alert">
      <span>` +
      message +
      `</span>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times</span>
      </button>
    </div>`
  );
  $("#alert_placeholder").slideToggle(400);
  window.setTimeout(function() {
    $("#topAlert").slideToggle(400, function() {
      $(this).remove();
    });
  }, 5000);
}
