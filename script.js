const tg = window.Telegram.WebApp;
tg.expand();

// Pobieramy zapisane dane użytkownika, jeśli istnieją
let currentQuestion = parseInt(localStorage.getItem('currentQuestion')) || 0;
let score = parseInt(localStorage.getItem('score')) || 0;
let username = localStorage.getItem('username') || "";
let questionCounter = currentQuestion;

const answersContainer = document.getElementById("answers");
const restartButton = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");
const usernameDisplay = document.getElementById("username-display");
const usernameContainer = document.getElementById("username-container");

// Mapping liter na wzory 5x5 – używamy gwiazdek (*) jako "włączonych" kropek
const letterPatterns = {
  "A": [
    "  *  ",
    " * * ",
    "*****",
    "*   *",
    "*   *"
  ],
  "B": [
    "**** ",
    "*   *",
    "**** ",
    "*   *",
    "**** "
  ],
  "C": [
    " ****",
    "*    ",
    "*    ",
    "*    ",
    " ****"
  ],
  "D": [
    "**** ",
    "*   *",
    "*   *",
    "*   *",
    "**** "
  ],
  "E": [
    "*****",
    "*    ",
    "***  ",
    "*    ",
    "*****"
  ],
  "F": [
    "*****",
    "*    ",
    "***  ",
    "*    ",
    "*    "
  ],
  "G": [
    " ****",
    "*    ",
    "*  **",
    "*   *",
    " ****"
  ],
  "H": [
    "*   *",
    "*   *",
    "*****",
    "*   *",
    "*   *"
  ],
  "I": [
    " *** ",
    "  *  ",
    "  *  ",
    "  *  ",
    " *** "
  ],
  "J": [
    "  ***",
    "   * ",
    "   * ",
    "*  * ",
    " **  "
  ],
  "K": [
    "*   *",
    "*  * ",
    "***  ",
    "*  * ",
    "*   *"
  ],
  "L": [
    "*    ",
    "*    ",
    "*    ",
    "*    ",
    "*****"
  ],
  "M": [
    "*   *",
    "** **",
    "* * *",
    "*   *",
    "*   *"
  ],
  "N": [
    "*   *",
    "**  *",
    "* * *",
    "*  **",
    "*   *"
  ],
  "O": [
    " *** ",
    "*   *",
    "*   *",
    "*   *",
    " *** "
  ],
  "P": [
    "**** ",
    "*   *",
    "**** ",
    "*    ",
    "*    "
  ],
  "Q": [
    " *** ",
    "*   *",
    "*   *",
    "*  **",
    " ****"
  ],
  "R": [
    "**** ",
    "*   *",
    "**** ",
    "*  * ",
    "*   *"
  ],
  "S": [
    " ****",
    "*    ",
    " *** ",
    "    *",
    "**** "
  ],
  "T": [
    "*****",
    "  *  ",
    "  *  ",
    "  *  ",
    "  *  "
  ],
  "U": [
    "*   *",
    "*   *",
    "*   *",
    "*   *",
    " *** "
  ],
  "V": [
    "*   *",
    "*   *",
    "*   *",
    " * * ",
    "  *  "
  ],
  "W": [
    "*   *",
    "*   *",
    "* * *",
    "** **",
    "*   *"
  ],
  "X": [
    "*   *",
    " * * ",
    "  *  ",
    " * * ",
    "*   *"
  ],
  "Y": [
    "*   *",
    " * * ",
    "  *  ",
    "  *  ",
    "  *  "
  ],
  "Z": [
    "*****",
    "   * ",
    "  *  ",
    " *   ",
    "*****"
  ]
};

// Funkcja ustawiająca nazwę użytkownika
function setUsername() {
    username = document.getElementById("username-input").value.trim();
    if (username) {
        localStorage.setItem('username', username);
        updateUsernameDisplay();
        // Ukrywamy kontener ustawiania nazwy
        usernameContainer.style.display = "none";
    }
}

// Aktualizacja widoku nazwy użytkownika – rysowanie liter z kropek i skalowanie, jeśli trzeba
function updateUsernameDisplay() {
    // Czyścimy poprzednią zawartość
    usernameDisplay.innerHTML = "";

    // Tworzymy kropkowe litery
    const name = username.toUpperCase();
    for (let char of name) {
        const pattern = letterPatterns[char];
        if (!pattern) continue;  // pomijamy nieobsługiwane znaki
        const letterContainer = document.createElement("div");
        letterContainer.classList.add("letter-container");

        for (let row of pattern) {
            const rowDiv = document.createElement("div");
            rowDiv.classList.add("letter-row");
            for (let ch of row) {
                if (ch === "*") {
                    const dot = document.createElement("div");
                    dot.classList.add("letter-dot");
                    rowDiv.appendChild(dot);
                } else {
                    const empty = document.createElement("div");
                    empty.classList.add("empty-letter");
                    rowDiv.appendChild(empty);
                }
            }
            letterContainer.appendChild(rowDiv);
        }
        usernameDisplay.appendChild(letterContainer);
    }

    // ---- AUTOMATYCZNE SKALOWANIE ----

    // Na początek resetujemy ewentualne poprzednie skalowanie:
    usernameDisplay.style.transform = "";

    // Szerokość dostępna to szerokość rodzica (np. #app) 
    // minus padding itp. – w praktyce clientWidth zwykle wystarcza.
    const availableWidth = usernameDisplay.parentElement.clientWidth;
    
    // Rzeczywista szerokość naszego "napisu" z kropek:
    const contentWidth = usernameDisplay.scrollWidth;

    // Jeśli zawartość jest szersza niż dostępna przestrzeń, skalujemy
    if (contentWidth > availableWidth) {
        const scale = availableWidth / contentWidth;
        usernameDisplay.style.transform = `scale(${scale})`;
        // Ustawiamy punkt odniesienia skali na środek (można też "left center")
        usernameDisplay.style.transformOrigin = "center";
    }
}



// Jeżeli nazwa już istnieje – od razu wyświetlamy ją i ukrywamy kontener ustawiania nazwy
if (username) {
    updateUsernameDisplay();
    usernameContainer.style.display = "none";
}

// Reszta kodu gry (quiz, reklamy itd.) pozostaje bez zmian

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    questionCounter = 0;
    localStorage.setItem('currentQuestion', 0);
    localStorage.setItem('score', 0);
    restartButton.style.display = "none";
    loadQuestion();
}

function loadQuestion() {
    answersContainer.innerHTML = "";
    const { totalDots, redDots } = quizData[currentQuestion];
    generateDots(totalDots, redDots);
    scoreElement.textContent = `Wynik: ${score}/1000`;
}

const quizData = Array.from({ length: 1000 }, (_, i) => {
    const totalDots = Math.min(30 + i * 2, 200);
    const redDots = Math.floor(totalDots * (0.2 + Math.random() * 0.7));
    return { totalDots, redDots };
});

function generateDots(totalDots, redDots) {
    answersContainer.innerHTML = "";
    const dots = [];
    let redCount = 0;
    let blackCount = 0;
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if ((blackCount + 1) % 3 === 0 && redCount < redDots) {
            dot.classList.add("red");
            redCount++;
        } else {
            blackCount++;
        }
        dots.push(dot);
    }
    shuffleArray(dots);
    dots.forEach(dot => answersContainer.appendChild(dot));
    const options = generateOptions(redDots);
    options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.addEventListener("click", () => checkAnswer(option));
        answersContainer.appendChild(button);
    });
    if (currentQuestion % 5 === 0 && currentQuestion !== 0) {
        const skipButton = document.createElement("button");
        skipButton.textContent = "Pomiń poziom (Reklama)";
        skipButton.addEventListener("click", showSkipRewardAdOption);
        answersContainer.appendChild(skipButton);
    }
}

function generateOptions(correctAnswer) {
    const range = Math.max(3, Math.floor(4 + currentQuestion * 0.4));
    const options = new Set([correctAnswer]);
    while (options.size < 4) {
        let randomOffset = Math.floor(Math.random() * range) - Math.floor(range / 2);
        let newOption = correctAnswer + randomOffset;
        if (newOption > 0 && newOption !== correctAnswer) {
            options.add(newOption);
        }
    }
    return shuffleArray(Array.from(options));
}

function checkAnswer(selectedAnswer) {
    if (selectedAnswer === quizData[currentQuestion].redDots) {
        score++;
        currentQuestion++;
        questionCounter++;
        localStorage.setItem('currentQuestion', currentQuestion);
        localStorage.setItem('score', score);
        if (questionCounter % 10 === 0) {
            showExtraRewardAd();
        }
        if (currentQuestion === 1000) {
            showFinalMessage();
        } else {
            loadQuestion();
        }
    } else {
        showRewardAdOption();
    }
}

function showFinalMessage() {
    answersContainer.innerHTML = `<h2>Gratulacje Wariacie 420!</h2>`;
    restartButton.style.display = "block";
    tg.sendData(JSON.stringify({ score: score }));
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('score');
}

function showRewardAdOption() {
    answersContainer.innerHTML = "";
    const message = document.createElement("p");
    message.innerHTML = "Źle! Chcesz obejrzeć reklamę, aby zachować postęp?";
    const yesButton = document.createElement("button");
    yesButton.textContent = "Tak, obejrzyj reklamę";
    yesButton.addEventListener("click", showRewardAd);
    const noButton = document.createElement("button");
    noButton.textContent = "Nie, utracisz postęp";
    noButton.addEventListener("click", startQuiz);
    answersContainer.appendChild(message);
    answersContainer.appendChild(yesButton);
    answersContainer.appendChild(noButton);
}

function showRewardAd() {
    show_9058300().then(() => {
        alert('You have seen a rewarded ad!');
        loadQuestion();
    }).catch(() => {
        alert("Nie udało się załadować reklamy – zaczynasz od nowa.");
        startQuiz();
    });
}

function showExtraRewardAd() {
    show_9058300().then(() => {
        alert('Bonus! You have seen an extra rewarded ad and earned a bonus point!');
        score++;
        localStorage.setItem('score', score);
    }).catch(() => {
        alert("Nie udało się załadować bonusowej reklamy.");
    });
}

function showSkipRewardAdOption() {
    answersContainer.innerHTML = "";
    const message = document.createElement("p");
    message.innerHTML = "Czy chcesz obejrzeć reklamę, aby pominąć poziom?";
    const yesButton = document.createElement("button");
    yesButton.textContent = "Tak, obejrzyj reklamę";
    yesButton.addEventListener("click", showRewardAdSkip);
    const noButton = document.createElement("button");
    noButton.textContent = "Nie, pozostań na poziomie";
    noButton.addEventListener("click", loadQuestion);
    answersContainer.appendChild(message);
    answersContainer.appendChild(yesButton);
    answersContainer.appendChild(noButton);
}

function showRewardAdSkip() {
    show_9058300().then(() => {
        alert("You have seen a rewarded ad. Level skipped!");
        currentQuestion++;
        localStorage.setItem('currentQuestion', currentQuestion);
        loadQuestion();
    }).catch(() => {
        alert("Nie udało się załadować reklamy.");
        loadQuestion();
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

if (currentQuestion > 0) {
    alert(`Wznawiasz grę od poziomu ${currentQuestion + 1}`);
    loadQuestion();
} else {
    startQuiz();
}
