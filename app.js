let currentChart = null;

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

    // Compter les lettres en distinguant majuscules et minuscules
    let totalLetters = 0;
    let totalUppercase = 0;
    let totalLowercase = 0;

    for (let char of text) {
        // Normaliser les accents
        const normalizedChar = char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const lowerChar = normalizedChar.toLowerCase();

        if (alphabet.includes(lowerChar)) {
            letterCounts[lowerChar]++;
            totalLetters++;

            // Vérifier si c'est une majuscule ou minuscule
            if (normalizedChar === normalizedChar.toUpperCase()) {
                totalUppercase++;
            } else {
                totalLowercase++;
            }
        }
    }

    // Afficher les résultats
    displayResults(letterCounts, text.length, totalLetters, totalUppercase, totalLowercase);
}

function getColorIntensity(count, maxCount) {
    if (count === 0) return null;

    // Créer 5 niveaux d'intensité
    const percentage = count / maxCount;

    if (percentage <= 0.2) return 'intensity-1';
    if (percentage <= 0.4) return 'intensity-2';
    if (percentage <= 0.6) return 'intensity-3';
    if (percentage <= 0.8) return 'intensity-4';
    return 'intensity-5';
}

function displayResults(letterCounts, totalChars, totalLetters, totalUppercase, totalLowercase) {
    const resultsDiv = document.getElementById('results');
    const letterCountsDiv = document.getElementById('letterCounts');
    const totalCharsSpan = document.getElementById('totalChars');
    const totalLettersSpan = document.getElementById('totalLetters');
    const totalUppercaseSpan = document.getElementById('totalUppercase');
    const totalLowercaseSpan = document.getElementById('totalLowercase');

    // Afficher les statistiques
    totalCharsSpan.textContent = totalChars;
    totalLettersSpan.textContent = totalLetters;
    totalUppercaseSpan.textContent = totalUppercase;
    totalLowercaseSpan.textContent = totalLowercase;

    // Trouver le nombre maximum d'occurrences pour les couleurs graduées
    const maxCount = Math.max(...Object.values(letterCounts));

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
        } else {
            // Ajouter la classe d'intensité de couleur
            const intensityClass = getColorIntensity(count, maxCount);
            letterItem.classList.add(intensityClass);
        }

        letterItem.innerHTML = `
            <span class="letter">${letter}</span>
            <span class="count">${count}</span>
        `;

        letterCountsDiv.appendChild(letterItem);
    }

    // Créer le graphique camembert
    createPieChart(letterCounts);

    // Afficher la section des résultats
    resultsDiv.classList.remove('hidden');

    // Faire défiler jusqu'aux résultats
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function createPieChart(letterCounts) {
    const ctx = document.getElementById('letterChart').getContext('2d');

    // Détruire le graphique précédent s'il existe
    if (currentChart) {
        currentChart.destroy();
    }

    // Filtrer les lettres avec au moins 1 occurrence
    const labels = [];
    const data = [];
    const colors = [];

    // Générer des couleurs variées pour le camembert
    const colorPalette = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#fee140', '#30cfd0',
        '#a8edea', '#fed6e3', '#c471f5', '#fa71cd',
        '#ffd89b', '#19547b', '#ff6e7f', '#bfe9ff',
        '#ffecd2', '#fcb69f', '#ff9a9e', '#fecfef',
        '#f6d365', '#fda085', '#fbc2eb', '#a6c1ee',
        '#fdcbf1', '#e6dee9'
    ];

    Object.entries(letterCounts).forEach(([letter, count], index) => {
        if (count > 0) {
            labels.push(letter.toUpperCase());
            data.push(count);
            colors.push(colorPalette[index % colorPalette.length]);
        }
    });

    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function switchView(viewType) {
    const cardsView = document.getElementById('cardsView');
    const chartView = document.getElementById('chartView');
    const cardsBtn = document.getElementById('cardsViewBtn');
    const chartBtn = document.getElementById('chartViewBtn');

    if (viewType === 'cards') {
        cardsView.classList.remove('hidden');
        chartView.classList.add('hidden');
        cardsBtn.classList.add('active');
        chartBtn.classList.remove('active');
    } else {
        cardsView.classList.add('hidden');
        chartView.classList.remove('hidden');
        cardsBtn.classList.remove('active');
        chartBtn.classList.add('active');
    }
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
