let myData;
let downloadTimer;
let players = [];
let currentPlayerIndex = -1;
let currentQuestion;
let audience = {name: "Зал", id: "audience", score: 0};
let timeLimit = 5;
let timerDelay = 1000 // 1s
let questionCounter = localStorage.getItem("questionCounter") ? JSON.parse(localStorage.getItem("questionCounter")) : 0;
let audienceFinish = 0;

const body = document.querySelector('body')

function createData() {
  const startData = Detail
  // const startData = DataTest
  // const startData = TestDetail
  // const startData = TestData
  const savedData = localStorage.getItem("myData")
  myData = savedData ? JSON.parse(savedData) : startData
};

function createPlayer(currentValue, index) {
  return {name: currentValue.trim(), id: "p" + index++, score: 0};
};

function createPlayers() {
  const savedPlayers = localStorage.getItem("players")
  const savedAudience = localStorage.getItem("audience")
  if (!savedPlayers) {
    let playerList = prompt("Введите ВСЕ имена через запятую", "Игрок1, Игрок2, Игрок3");

    let array = playerList.split(',');
    let index = 0;
    players = array.map(x => createPlayer(x, index++));
  } else {
    players = JSON.parse(savedPlayers)
  }

  if (savedAudience) {
    audience = JSON.parse(savedAudience)
  }
};

function finishForAudience(counter) {
  return myData.questions.length - counter < players.length;
};

function gameOver(counter) {
  console.log('counter ----', counter);
  console.log('myData.questions.length ----', myData.questions.length);
  console.log('myData.questions.length - counter === 0 ----', myData.questions.length - counter === 0);
  return myData.questions.length - counter === 0;
};

function selectNextPlayer() {
  if (currentPlayerIndex === players.length - 1)
  currentPlayerIndex = -1;
  let player = players[++currentPlayerIndex].name;

  if (currentPlayerIndex === 0 && finishForAudience(questionCounter)) {
    audienceFinish = 1;
  }

  if (audienceFinish === 1) {
    player = audience.name;
  }
  const $gamer__name = $(".gamer__name")[0]
  $gamer__name.innerHTML = player + "!";
  $(".game__win-player")[0].innerHTML = "Молодец, " + player + "!";

  if (gameOver(questionCounter)) {
    $(".table").addClass('game-over');
  }
};

function startQuestion(id) {
  questionCounter++;
  console.log('questionCounter ----', questionCounter);
  currentQuestion = myData.questions.find(x => x.id === id);

  let category = myData.categories[currentQuestion.categoryId];

  $(".game__question")[0].innerHTML = currentQuestion.question;
  $(".game__answer")[0].innerHTML = currentQuestion.answer;
  $(".parameters__category")[0].innerHTML = category;
  $(".parameters__points")[0].innerHTML = currentQuestion.questionValue;
  $(".question").removeClass('disabled');
  $(".table").addClass('disabled');
  startCountdown();
};

function generateGameCell(currentValue) {
  const currentRow = "#table__row-" + currentValue.categoryId + ">.table__points"
  const gameCell = `<li onclick="startQuestion('${currentValue.id}')" class="table__point table__point-${currentValue.id} ${currentValue.disabled ? 'disabled' : ''}">${currentValue.questionValue}</li>`
  $(currentRow).append(gameCell);
};

function generateGameRow(currentValue, index) {
  const gameRowHTML = `<div id="table__row-${index}" class="table__row"><h2 class="table__category">${currentValue}</h2><ul class="table__points"></ul></div>`
  $(".table").append(gameRowHTML);
};

function timeIsUp() {
  setTimeout(() => {
    $(".game__end-time").removeClass('hide');
  }, timerDelay)
};

function startCountdown() {
  let reverseCounter = 100;
  const interval = 100 / timeLimit;
  const $gameTime = $('.game__time')
  $gameTime.css('transition-duration', (timerDelay / 1000) + 's')
  $gameTime.css('width', (reverseCounter) + '%')

  setTimeout(() => {
    $gameTime.css('width', (reverseCounter -= interval) + '%')
  }, 0)

  downloadTimer = setInterval(function () {
    $gameTime.css('width', (reverseCounter -= interval) + '%')
    if (reverseCounter <= 0) {
      clearInterval(downloadTimer);
      timeIsUp();
    }
  }, timerDelay)
};

function stopCountdown() {
  const $gameTime = $('.game__time')
  $gameTime.css('width', $gameTime.width())
  clearInterval(downloadTimer);
};

function finalizeQuestion() {
  $('.question').addClass('disabled');
  $('.table').removeClass('disabled');

  $(".game__answer").addClass('hide');
  $(".game__end-time").addClass('hide');
  $(".game__result").addClass('disable');
  $(".game__start").removeClass('disable');

  selectNextPlayer();
}

function showAnswer() {
  stopCountdown();
  $(".game__result").removeClass('disable');
  $(".game__start").addClass('disable');
  $(".game__answer").removeClass('hide');
  $(".table__point-" + currentQuestion.id).addClass('disabled')

  if (audienceFinish > 0) {
    $(".game__win-player").css('display', 'none');
  }

  currentQuestion.disabled = true
  saveDataToLocalStorage()
};

function playerWin() {
  let player = players[currentPlayerIndex];
  player.score += currentQuestion.questionValue;

  const gamer = $(`#${player.name} > span`)
  gamer.text(player.score)

  saveDataToLocalStorage()
  finalizeQuestion();
};

function playerLoose() {
  finalizeQuestion();
};

function audienceWin() {
  audience.score += currentQuestion.questionValue;
  $(`#${audience.id} > span`)[0].innerHTML = audience.score;
  saveDataToLocalStorage()
  finalizeQuestion();
};

function createScoreTable() {
  const gamersWrap = $(".players")
  //Добавил всех игроков в таблицу
  players.forEach(player => {
    gamersWrap.append(`<li id="${player.name}"><h3>${player.name}</h3> <span>${player.score}</span> </li>`)
  })

  const gamers = $(".players > li")
  gamers.each(index => {
    gamers[index].addEventListener('click', e => {
      changePlayerScore(e, index)
    });
  })
  //Добавил зал в таблицу
  gamersWrap.append(`<li id="${audience.id}"><h3>${audience.name}</h3> <span>${audience.score}</span> </li>`);

  const $audience = $(`#${audience.id}`)[0]
  $audience.addEventListener('click', e => {
    changePlayerScore(e)
  });
};

function startGame() {
  createPlayers();
  body.classList.remove('start-state')
  body.classList.add('play-state')
  createScoreTable();
  selectNextPlayer();
};

$(document).ready(function () {
  createData();

  myData.categories.forEach(generateGameRow);
  myData.questions.forEach(generateGameCell);
});

const editGameHandler = () => {
  const $gameSettings = document.querySelector('.game-settings')
  $gameSettings.innerHTML = 'Save'
  const $players = $('.players > li')

  $gameSettings.removeEventListener('click', editGameHandler)
  $gameSettings.addEventListener('click', () => {
    $players.each(function (index) {
      $players[index].removeEventListener('click', changePlayerScore)
    })
  })

  $players.each(function (index) {
    $players[index].addEventListener('click', e => {
      changePlayerScore(e, index)
    })
  });
}

const changePlayerScore = (e, index) => {
  let score
  let player = index ? players[index] : audience;
  let playerID = index ? player.name : player.id;

  const askNewScore = () => {
    score = prompt("Введите новый счёт", player.score)
  };

  askNewScore()

  if (isNaN(score)) {
    return askNewScore()
  }

  player.score = +score;

  const gamer = $(`#${playerID} > span`)
  gamer.text(player.score)
  saveDataToLocalStorage()
}
const saveDataToLocalStorage = () => {
  localStorage.setItem("players", JSON.stringify(players))
  localStorage.setItem("myData", JSON.stringify(myData))
  localStorage.setItem("audience", JSON.stringify(audience))
  localStorage.setItem("questionCounter", JSON.stringify(questionCounter))
}

const reset = () => {
  const localStorageKeys = ['questionCounter', 'audience', 'myData', 'players']

  localStorageKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  })

  document.location.reload()
}