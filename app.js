function analyzeText() {
    const textInput = document.getElementById('textInput');
    const text = textInput.value;

    if (!text.trim()) {
        alert('Veuillez entrer du texte à analyser.');
        return;
    }

    // Compter les occurrences de chaque lettre
    const letterCounts = {};
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    // Initialiser le compteur pour chaque lettre
    for (let letter of alphabet) {
        letterCounts[letter] = 0;
    }

    // Compter les lettres (en ignorant la casse et les accents)
    let totalLetters = 0;
    const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (let char of normalizedText) {
        if (alphabet.includes(char)) {
            letterCounts[char]++;
            totalLetters++;
        }
    }

    // Afficher les résultats
    displayResults(letterCounts, text.length, totalLetters);
}

function displayResults(letterCounts, totalChars, totalLetters) {
    const resultsDiv = document.getElementById('results');
    const letterCountsDiv = document.getElementById('letterCounts');
    const totalCharsSpan = document.getElementById('totalChars');
    const totalLettersSpan = document.getElementById('totalLetters');

    // Afficher les statistiques
    totalCharsSpan.textContent = totalChars;
    totalLettersSpan.textContent = totalLetters;

    // Vider les résultats précédents
    letterCountsDiv.innerHTML = '';

    // Créer une carte pour chaque lettre
    for (let letter in letterCounts) {
        const count = letterCounts[letter];
        const letterItem = document.createElement('div');
        letterItem.className = 'letter-item';

        // Ajouter une classe spéciale pour les lettres avec 0 occurrence
        if (count === 0) {
            letterItem.classList.add('zero');
        }

        letterItem.innerHTML = `
            <span class="letter">${letter}</span>
            <span class="count">${count}</span>
        `;

        letterCountsDiv.appendChild(letterItem);
    }

    // Afficher la section des résultats
    resultsDiv.classList.remove('hidden');

    // Faire défiler jusqu'aux résultats
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAll() {
    const textInput = document.getElementById('textInput');
    const resultsDiv = document.getElementById('results');

    textInput.value = '';
    resultsDiv.classList.add('hidden');
    textInput.focus();
}

// Permettre l'analyse avec la touche Enter (Ctrl+Enter)
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');

    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            analyzeText();
        }
    });

    // Focus automatique sur le textarea
    textInput.focus();
});
