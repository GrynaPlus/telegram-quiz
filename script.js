const tg = window.Telegram.WebApp;
tg.expand();

// Generowanie 1000 poziomów (max 200 kulek, 20-90% czerwonych)
const quizData = Array.from({ length: 1000 }, (_, i) => {
    const totalDots = Math.min(30 + i * 2, 200); // Rośnie do max 200
    const redDots = Math.floor(totalDots * (0.2 + Math.random() * 0.7)); // 20% - 90%
    return { totalDots, redDots };
});

let currentQuestion = parseInt(localStorage.getItem('currentQuestion')) || 0;
let score = parseInt(localStorage.getItem('score')) || 0;
let questionCounter = currentQuestion;

const answersContainer = document.getElementById("answers");
const restartButton = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");

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

// Generowanie kropek w układzie czarna, czarna, czerwona (na przemian)
function generateDots(totalDots, redDots) {
    answersContainer.innerHTML = "";
    const dots = [];

    let redCount = 0;
    let blackCount = 0;

    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");

        // Co trzecia kropka jest czerwona (jeśli jeszcze są dostępne)
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

    // Generowanie odpowiedzi, zawsze z poprawną liczbą czerwonych kulek
    const options = generateOptions(redDots);
    options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.addEventListener("click", () => checkAnswer(option));
        answersContainer.appendChild(button);
    });

    // Opcja pominięcia poziomu co 5 rund
    if (currentQuestion % 5 === 0 && currentQuestion !== 0) {
        const skipButton = document.createElement("button");
        skipButton.textContent = "Pomiń poziom (Reklama)";
        skipButton.addEventListener("click", showSkipAd);
        answersContainer.appendChild(skipButton);
    }
}

// Generowanie poprawnych i losowych odpowiedzi (blisko prawidłowej)
function generateOptions(correctAnswer) {
    const range = Math.max(3, Math.floor(4 + currentQuestion * 0.4)); // Im dalej, tym większy zakres
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

// Sprawdzenie odpowiedzi
function checkAnswer(selectedAnswer) {
    if (selectedAnswer === quizData[currentQuestion].redDots) {
        score++;
        currentQuestion++;
        questionCounter++;

        // Zapisz postęp
        localStorage.setItem('currentQuestion', currentQuestion);
        localStorage.setItem('score', score);

        if (currentQuestion === 1000) {
            showFinalMessage();
        } else {
            // Reklamy w optymalnych momentach
            if (questionCounter % 5 === 0) showInterstitialAd();
            if (questionCounter % 7 === 0) showPopupAd();
            loadQuestion();
        }
    } else {
        showRewardAdOption();
    }
}

// Komunikat końcowy po 1000 poziomach
function showFinalMessage() {
    answersContainer.innerHTML = `<h2>Gratulacje Wariacie 420!</h2>`;
    restartButton.style.display = "block";
    tg.sendData(JSON.stringify({ score: score }));
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('score');
}

// Oferowanie obejrzenia reklamy po błędzie
function showRewardAdOption() {
    const message = document.createElement("p");
    message.innerHTML = "Źle! Chcesz obejrzeć reklamę, aby zachować postęp?";

    const yesButton = document.createElement("button");
    yesButton.textContent = "Tak, obejrzyj reklamę";
    yesButton.addEventListener("click", showRewardAd);

    const noButton = document.createElement("button");
    noButton.textContent = "Nie, zacznij od nowa";
    noButton.addEventListener("click", startQuiz);

    answersContainer.innerHTML = "";
    answersContainer.appendChild(message);
    answersContainer.appendChild(yesButton);
    answersContainer.appendChild(noButton);
}

// Obsługa reklamy nagradzanej (zachowanie postępu)
function showRewardAd() {
    show_9058300('rewardedads').then(() => {
        alert("Reklama obejrzana – kontynuujesz quiz!");
        loadQuestion();
    }).catch(() => {
        alert("Nie udało się załadować reklamy – zaczynasz od nowa.");
        startQuiz();
    });
}

// Obsługa reklamy nagradzanej (pominięcie poziomu)
function showSkipAd() {
    show_9058300('rewardedads').then(() => {
        alert("Poziom pominięty!");
        currentQuestion++;
        localStorage.setItem('currentQuestion', currentQuestion); // Dodano zapis postępu
        loadQuestion();
    }).catch(() => {
        alert("Nie udało się załadować reklamy.");
    });
}

// Obsługa reklamy pełnoekranowej (Interstitial Ad)
function showInterstitialAd() {
    show_9058300('inApp');
}

// Obsługa reklamy popup (Popup Ad)
function showPopupAd() {
    show_9058300('pop');
}

// Tasowanie tablicy (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Wznowienie gry z zapisanego stanu
if (currentQuestion > 0) {
    alert(`Wznawiasz grę od poziomu ${currentQuestion + 1}`);
    loadQuestion();
} else {
    startQuiz();
}
