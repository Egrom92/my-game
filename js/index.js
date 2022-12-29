
let myData;
let downloadTimer;
let players;
let currentPlayerIndex = -1;
let currentQuestion;
let audienceScore = 0;
let timeLimit = 30;
let questionCounter = 0;
let audienceName = "Зал";
let audienceFinish = 0;

function createDataTest(){
  myData = DataTest
};

function createData1(){
  myData = Detail
};

function createData2(){
  myData = Data2;
};

function createPlayer(currentValue, index){
  let item = {name:currentValue.trim(), id: "p" + index++, score:0};
  return item;
};

function createPlayers(){
  let playerList = prompt("Введите ВСЕ имена через запятую", "Игрок1, Игрок2, Игрок3");

  let array = playerList.split(',');
  let index = 0;
  players = array.map(x => createPlayer(x, index++));
};

function finishForAudience(counter){
  return myData.questions.length - counter < players.length;
};

function gameOver(counter){
  return myData.questions.length - counter === 0;
};

function selectNextPlayer(){
  if (currentPlayerIndex === players.length-1)
    currentPlayerIndex = -1;

  let player = players[++currentPlayerIndex].name;

  if (currentPlayerIndex === 0 && finishForAudience(questionCounter)){
    audienceFinish = 1;
  }

  if (audienceFinish === 1){
    player = audienceName;
  }

  $("#playerToReply")[0].innerHTML = "Играет " + player + "!";
  $("#playerWin")[0].innerHTML = "Молодец, " + player + "!";
  if (gameOver(questionCounter)){
    $("#playerToReply")[0].innerHTML = "Всё!";
  }
};

function startQuestion(id){
  questionCounter++;
  currentQuestion = myData.questions.find(x => x.id === id);
  let category = myData.categories[currentQuestion.categoryId];

  $("#questionText")[0].innerHTML = currentQuestion.question;
  $("#answerText")[0].innerHTML = currentQuestion.answer;
  $("#questionTitle")[0].innerHTML = "(" + category + " " + currentQuestion.questionValue + ")";

  $("#currentQuestion").css('display', 'block');
  $(".resultButton").css('display', 'none');
  $("#showAnswer").css('display', 'block');
  $("#answerText").css('display', 'none');
  $("#timeIsUp").css('display', 'none');

  $("#"+id).css("visibility", "hidden");
  $("#gameTable").css("visibility", "hidden");
  document.getElementById("pbar").value = timeLimit;
  startCountdown();
};

function generateGameCell(currentValue){
  let row = $("."+currentValue.categoryId)[0];
  let cell = row.insertCell(-1);
  let node = document.createElement("a");
  node.href="#";
  node.innerHTML = currentValue.questionValue;
  node.id = currentValue.id;
  cell.appendChild(node);
  node.onclick = function(){
    startQuestion(currentValue.id);
  };
};

function generateGameRow(currentValue, index){
  let table = $("#gameTable")[0];
  let node = document.createElement("th");
  node.innerHTML = currentValue;
  rowToAdd = table.insertRow(-1);
  rowToAdd.appendChild(node);
  rowToAdd.classList.add(index);
};

function timeIsUp(){
  $("#timeIsUp").css('display', 'block');
};

function startCountdown(){
  let reverseCounter = timeLimit;
  downloadTimer = setInterval(function(){
    document.getElementById("pbar").value = --reverseCounter;
    if(reverseCounter <= 0){
      clearInterval(downloadTimer);
      timeIsUp();
    }
  },1000);
};

function stopCountdown(){
  clearInterval(downloadTimer);
};

function finalizeQuestion(){
  $("#currentQuestion").css('display', 'none');
  $("#answerText").css('display', 'none');
  $("#gameTable").css("visibility", "visible");
  selectNextPlayer();
};

function showAnswer(){
  stopCountdown();
  $("#showAnswer").css('display', 'none');
  $(".resultButton").css('display', 'block');
  if (audienceFinish > 0){
    $("#playerWin").css('display', 'none');
  }
  $("#answerText").css('display', 'block');
};

function playerWin(){
  let player = players[currentPlayerIndex];
  player.score += currentQuestion.questionValue;
  $("#"+player.id)[0].innerHTML = player.score;
  finalizeQuestion();
};

function playerLoose(){
  finalizeQuestion();
};

function audienceWin(){
  audienceScore += currentQuestion.questionValue;
  $("#audienceScore")[0].innerHTML = audienceScore;
  finalizeQuestion();
};

function createScoreTable(){
  let table = $("#players")[0];
  let rowNames = table.createTHead().insertRow(0);
  players.forEach(function(currentValue){
    let cell = rowNames.insertCell(-1);
    cell.innerHTML = currentValue.name;
  });

  let rowScores = table.insertRow(-1);
  players.forEach(function(currentValue){
    let cell = rowScores.insertCell(-1);
    cell.innerHTML = currentValue.score;
    cell.id = currentValue.id;
  });

  rowNames.insertCell(-1).innerHTML = audienceName;
  let tmp = rowScores.insertCell(-1);
  tmp.innerHTML = audienceScore;
  tmp.id = "audienceScore";
};

function startGame(){
  createPlayers();
  createScoreTable();
  selectNextPlayer();
  $("#playersDiv").css('visibility', 'visible');
  $("#gameTable").css('visibility', 'visible');
  $("#gameRules").css('display', 'none');

};

$(document).ready(function(){
  //createDataTest();
  createData1();
  //createData2();
  myData.categories.forEach(generateGameRow);
  myData.questions.forEach(generateGameCell);
  document.getElementById("pbar").max = timeLimit;
});