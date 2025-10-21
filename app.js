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
    let vowelCount = 0;
    let consonantCount = 0;
    const vowels = 'aeiouy';
    const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (let char of normalizedText) {
        if (alphabet.includes(char)) {
            letterCounts[char]++;
            totalLetters++;

            if (vowels.includes(char)) {
                vowelCount++;
            } else {
                consonantCount++;
            }
        }
    }

    // Afficher les résultats
    displayResults(letterCounts, text.length, totalLetters, vowelCount, consonantCount, text);
}

let currentChart = null;
let originalText = '';
let selectedLetter = null;

function displayResults(letterCounts, totalChars, totalLetters, vowelCount, consonantCount, text) {
    const resultsDiv = document.getElementById('results');
    const letterCountsDiv = document.getElementById('letterCounts');
    const totalCharsSpan = document.getElementById('totalChars');
    const totalLettersSpan = document.getElementById('totalLetters');
    const totalVowelsSpan = document.getElementById('totalVowels');
    const totalConsonantsSpan = document.getElementById('totalConsonants');
    const textInput = document.getElementById('textInput');
    const highlightedTextDiv = document.getElementById('highlightedText');

    // Sauvegarder le texte original et réinitialiser le surlignage
    originalText = text;
    selectedLetter = null;
    textInput.classList.remove('hidden');
    highlightedTextDiv.classList.add('hidden');

    // Afficher les statistiques
    totalCharsSpan.textContent = totalChars;
    totalLettersSpan.textContent = totalLetters;
    totalVowelsSpan.textContent = vowelCount;
    totalConsonantsSpan.textContent = consonantCount;

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

        // Ajouter un gestionnaire de clic pour surligner les occurrences
        if (count > 0) {
            letterItem.style.cursor = 'pointer';
            letterItem.addEventListener('click', () => highlightLetter(letter));
        }

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
    const ctx = document.getElementById('letterChart');

    // Détruire le graphique existant s'il y en a un
    if (currentChart) {
        currentChart.destroy();
    }

    // Filtrer les lettres avec un compte > 0 et préparer les données
    const labels = [];
    const data = [];
    const colors = [];

    for (let letter in letterCounts) {
        if (letterCounts[letter] > 0) {
            labels.push(letter.toUpperCase());
            data.push(letterCounts[letter]);
            // Générer des couleurs variées pour chaque lettre
            colors.push(generateColor(letter.charCodeAt(0)));
        }
    }

    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        },
                        generateLabels: function(chart) {
                            const datasets = chart.data.datasets;
                            const labels = chart.data.labels;
                            return labels.map((label, i) => ({
                                text: `${label}: ${datasets[0].data[i]}`,
                                fillStyle: datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                            }));
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

function generateColor(seed) {
    // Générer une couleur vive et agréable basée sur le code ASCII de la lettre
    const hue = (seed * 37) % 360;
    const saturation = 70 + (seed % 20);
    const lightness = 50 + (seed % 15);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function highlightLetter(letter) {
    const textInput = document.getElementById('textInput');
    const highlightedTextDiv = document.getElementById('highlightedText');

    // Si la même lettre est cliquée, désélectionner
    if (selectedLetter === letter) {
        textInput.classList.remove('hidden');
        highlightedTextDiv.classList.add('hidden');
        selectedLetter = null;
        return;
    }

    selectedLetter = letter;

    // Normaliser le texte pour la recherche
    const normalizedOriginal = originalText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let highlightedHTML = '';

    // Parcourir le texte original caractère par caractère
    for (let i = 0; i < originalText.length; i++) {
        const originalChar = originalText[i];
        const normalizedChar = normalizedOriginal[i].toLowerCase();

        // Si c'est la lettre recherchée, l'entourer avec un span rouge
        if (normalizedChar === letter) {
            highlightedHTML += `<span class="highlight-red">${escapeHtml(originalChar)}</span>`;
        } else {
            highlightedHTML += escapeHtml(originalChar);
        }
    }

    // Remplacer les retours à la ligne par des <br>
    highlightedHTML = highlightedHTML.replace(/\n/g, '<br>');

    // Afficher le texte surligné et cacher le textarea
    highlightedTextDiv.innerHTML = highlightedHTML;
    textInput.classList.add('hidden');
    highlightedTextDiv.classList.remove('hidden');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function clearAll() {
    const textInput = document.getElementById('textInput');
    const resultsDiv = document.getElementById('results');
    const highlightedTextDiv = document.getElementById('highlightedText');

    textInput.value = '';
    textInput.classList.remove('hidden');
    highlightedTextDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');
    selectedLetter = null;
    originalText = '';
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
