const rooms = [
  {
    id: 'salle1',
    title: 'Salle 1',
    focus: 'Créer des visuels avec l’IA (images, design, illustrations…)',
  },
  {
    id: 'salle2',
    title: 'Salle 2',
    focus: 'Créer des vidéos, podcasts et musiques avec l’IA',
  },
  {
    id: 'salle3',
    title: 'Salle 3',
    focus: 'Développement IA, code et projets open source',
  },
  {
    id: 'salle4',
    title: 'Salle 4',
    focus: 'Automatiser : agents IA, workflows, assistants',
  },
  {
    id: 'salle5',
    title: 'Salle 5',
    focus: 'IA et business : IA en entreprise et entreprise IA',
  },
  {
    id: 'salle6',
    title: 'Salle 6',
    focus: 'Réflexion critique et éthique autour de l’IA',
  },
  {
    id: 'salle7',
    title: 'Salle 7',
    focus: 'ChatGPT et autres assistants : usages quotidiens et pro',
  },
];

const roomsMap = new Map(rooms.map((room) => [room.id, room]));

const DEFAULT_PARTICIPANTS = [
  {
    id: 'sample-amelie',
    name: 'Amélie Dupont',
    room: 'salle1',
    challenge: 'Trouver un workflow simple pour générer des visuels cohérents avec Midjourney et Stable Diffusion.',
    contribution: 'Partage de prompts testés et veille sur les outils de génération d’images.',
    comment: '',
    treated: false,
  },
  {
    id: 'sample-yann',
    name: 'Yann Leclerc',
    room: 'salle3',
    challenge: 'Brancher une API GPT sur un projet Node.js open source.',
    contribution: 'Coaching TypeScript et bonnes pratiques de revue de code.',
    comment: 'Disponible pour relire les dépôts GitHub des participants.',
    treated: false,
  },
  {
    id: 'sample-sarah',
    name: 'Sarah Benali',
    room: 'salle5',
    challenge: 'Structurer une offre IA pour les PME industrielles.',
    contribution: 'Retours d’expérience sur la mise en place d’IA générative dans des équipes marketing.',
    comment: '',
    treated: true,
  },
  {
    id: 'sample-olivier',
    name: 'Olivier Martin',
    room: 'salle4',
    challenge: 'Automatiser le scoring de leads avec des agents IA.',
    contribution: 'Peut partager des scénarios Make/Zapier et des scripts Python pour le suivi.',
    comment: '',
    treated: false,
  },
  {
    id: 'sample-lucie',
    name: 'Lucie Garnier',
    room: 'salle6',
    challenge: 'Mettre en place une charte éthique IA dans une association.',
    contribution: 'Vision RSE et ateliers de sensibilisation éthique.',
    comment: '',
    treated: false,
  },
];

const STORAGE_KEY = 'renaud-dekode-workshops-v1';
const LAST_KEY = 'renaud-dekode-last-participant';

const formSection = document.getElementById('form-section');
const reviewSection = document.getElementById('review-section');
const form = document.getElementById('participant-form');
const nameInput = document.getElementById('name');
const roomSelect = document.getElementById('room');
const challengeInput = document.getElementById('challenge');
const valueInput = document.getElementById('value');
const commentInput = document.getElementById('comment');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formFeedback = document.getElementById('form-feedback');
const summaryName = document.getElementById('summary-name');
const summaryRoom = document.getElementById('summary-room');
const summaryChallenge = document.getElementById('summary-challenge');
const summaryValue = document.getElementById('summary-value');
const summaryComment = document.getElementById('summary-comment');
const roomsContainer = document.getElementById('rooms-container');
const reviewMessage = document.getElementById('review-message');
const editBtn = document.getElementById('edit-btn');
const newEntryBtn = document.getElementById('new-entry-btn');

let participants = loadParticipants();
if (!participants) {
  participants = DEFAULT_PARTICIPANTS.map((participant) => ({ ...participant }));
  saveParticipants();
}

let lastParticipantId = loadLastParticipantId();
let editingParticipantId = null;

renderRooms();

if (lastParticipantId && participants.some((participant) => participant.id === lastParticipantId)) {
  showReview(lastParticipantId);
} else {
  showForm('create');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = {
    name: nameInput.value.trim(),
    room: roomSelect.value,
    challenge: challengeInput.value.trim(),
    contribution: valueInput.value.trim(),
    comment: commentInput.value.trim(),
  };

  const validationMessage = validateForm(formData);
  if (validationMessage) {
    formFeedback.textContent = validationMessage;
    return;
  }

  formFeedback.textContent = '';

  if (form.dataset.mode === 'edit' && editingParticipantId) {
    const index = participants.findIndex((participant) => participant.id === editingParticipantId);
    if (index === -1) {
      // Participant missing, fallback to create flow
      handleCreateParticipant(formData);
      return;
    }
    participants[index] = {
      ...participants[index],
      ...formData,
    };
    lastParticipantId = editingParticipantId;
    saveParticipants();
    saveLastParticipantId(lastParticipantId);
    const updatedParticipant = participants[index];
    renderRooms();
    exitEditMode();
    updateReviewMessage(updatedParticipant, 'update');
  } else {
    handleCreateParticipant(formData);
  }
});

form.addEventListener('input', () => {
  formFeedback.textContent = '';
});

editBtn.addEventListener('click', () => {
  if (!lastParticipantId) {
    return;
  }
  const participant = participants.find((item) => item.id === lastParticipantId);
  if (!participant) {
    return;
  }
  enterEditMode(participant);
});

cancelEditBtn.addEventListener('click', () => {
  reviewMessage.textContent = 'Modifications annulées, vos informations précédentes sont conservées.';
  exitEditMode();
});

newEntryBtn.addEventListener('click', () => {
  editingParticipantId = null;
  form.dataset.mode = 'create';
  submitBtn.textContent = 'Valider ma participation';
  cancelEditBtn.hidden = true;
  form.reset();
  showForm('create');
  reviewMessage.textContent =
    'Ajoutez une nouvelle participation si vous organisez plusieurs salles ou inscrivez un collègue.';
});

function validateForm({ name, room, challenge, contribution }) {
  if (!name) {
    return 'Merci d’indiquer votre nom.';
  }
  if (!room) {
    return 'Merci de sélectionner une salle.';
  }
  if (!challenge) {
    return 'Précisez la problématique que vous souhaitez aborder.';
  }
  if (!contribution) {
    return 'Indiquez ce que vous pouvez apporter aux autres.';
  }
  return '';
}

function handleCreateParticipant(formData) {
  editingParticipantId = null;
  form.dataset.mode = 'create';
  submitBtn.textContent = 'Valider ma participation';
  cancelEditBtn.hidden = true;
  const newParticipant = {
    id: generateId(),
    treated: false,
    ...formData,
  };
  participants.push(newParticipant);
  lastParticipantId = newParticipant.id;
  saveParticipants();
  saveLastParticipantId(lastParticipantId);
  renderRooms();
  form.reset();
  showReview(lastParticipantId);
  updateReviewMessage(newParticipant, 'create');
}

function enterEditMode(participant) {
  editingParticipantId = participant.id;
  form.dataset.mode = 'edit';
  nameInput.value = participant.name;
  roomSelect.value = participant.room;
  challengeInput.value = participant.challenge;
  valueInput.value = participant.contribution;
  commentInput.value = participant.comment;
  submitBtn.textContent = 'Enregistrer les modifications';
  cancelEditBtn.hidden = false;
  formFeedback.textContent = '';
  showForm('edit');
  reviewMessage.textContent = 'Modifiez vos informations puis enregistrez ou annulez.';
}

function exitEditMode() {
  editingParticipantId = null;
  form.dataset.mode = 'create';
  submitBtn.textContent = 'Valider ma participation';
  cancelEditBtn.hidden = true;
  form.reset();
  showReview(lastParticipantId);
}

function showForm() {
  formSection.classList.remove('hidden');
  reviewSection.classList.add('hidden');
  requestAnimationFrame(() => scrollIntoViewSmooth(formSection));
}

function showReview(participantId) {
  if (!participantId) {
    showForm('create');
    return;
  }
  const participant = participants.find((item) => item.id === participantId);
  if (!participant) {
    showForm('create');
    return;
  }
  renderSummary(participant);
  reviewSection.classList.remove('hidden');
  formSection.classList.add('hidden');
  requestAnimationFrame(() => scrollIntoViewSmooth(reviewSection));
}

function renderSummary(participant) {
  summaryName.textContent = participant.name;
  summaryRoom.textContent = getRoomDisplay(participant.room);
  summaryChallenge.textContent = participant.challenge;
  summaryValue.textContent = participant.contribution;
  summaryComment.textContent = participant.comment ? participant.comment : '—';
}

function renderRooms() {
  roomsContainer.innerHTML = '';
  rooms.forEach((room) => {
    const card = document.createElement('article');
    card.className = 'room-card';

    const header = document.createElement('header');
    const title = document.createElement('h4');
    title.textContent = room.title;
    const focus = document.createElement('p');
    focus.textContent = room.focus;
    header.append(title, focus);
    card.append(header);

    const list = document.createElement('div');
    list.className = 'participant-list';
    const roomParticipants = participants.filter((participant) => participant.room === room.id);

    if (!roomParticipants.length) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'Aucun participant inscrit pour le moment.';
      list.append(emptyMessage);
    } else {
      roomParticipants.forEach((participant) => {
        list.append(createParticipantItem(participant));
      });
    }

    card.append(list);
    roomsContainer.append(card);
  });
}

function createParticipantItem(participant) {
  const wrapper = document.createElement('div');
  wrapper.className = 'participant-item';
  if (participant.treated) {
    wrapper.classList.add('treated');
  }
  const checkboxId = `treated-${participant.id}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = checkboxId;
  checkbox.checked = Boolean(participant.treated);
  checkbox.addEventListener('change', () => {
    participant.treated = checkbox.checked;
    if (participant.treated) {
      wrapper.classList.add('treated');
    } else {
      wrapper.classList.remove('treated');
    }
    saveParticipants();
  });

  const label = document.createElement('label');
  label.setAttribute('for', checkboxId);

  const name = document.createElement('strong');
  name.textContent = participant.name;

  const challenge = document.createElement('span');
  challenge.textContent = `Problématique : ${participant.challenge}`;

  const contribution = document.createElement('span');
  contribution.textContent = `Apport : ${participant.contribution}`;

  label.append(name, challenge, contribution);

  if (participant.comment) {
    const comment = document.createElement('span');
    comment.textContent = `Commentaire : ${participant.comment}`;
    comment.classList.add('participant-comment');
    label.append(comment);
  }

  wrapper.append(checkbox, label);
  return wrapper;
}

function loadParticipants() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed
      .filter((participant) => participant && typeof participant.id === 'string')
      .map((participant) => ({
        id: participant.id,
        name: participant.name ?? '',
        room: participant.room ?? '',
        challenge: participant.challenge ?? '',
        contribution: participant.contribution ?? '',
        comment: participant.comment ?? '',
        treated: Boolean(participant.treated),
      }));
  } catch (error) {
    console.error('Impossible de charger les participants', error);
    return null;
  }
}

function saveParticipants() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
  } catch (error) {
    console.error('Impossible de sauvegarder les participants', error);
  }
}

function loadLastParticipantId() {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch (error) {
    console.error('Impossible de charger le dernier participant', error);
    return null;
  }
}

function saveLastParticipantId(value) {
  try {
    if (value) {
      localStorage.setItem(LAST_KEY, value);
    } else {
      localStorage.removeItem(LAST_KEY);
    }
  } catch (error) {
    console.error('Impossible de sauvegarder le dernier participant', error);
  }
}

function getRoomDisplay(roomId) {
  const room = roomsMap.get(roomId);
  if (!room) {
    return roomId;
  }
  return `${room.title} – ${room.focus}`;
}

function generateId() {
  return `participant-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function updateReviewMessage(participant, mode) {
  const roomLabel = getRoomDisplay(participant.room);
  if (mode === 'update') {
    reviewMessage.textContent = `${participant.name}, vos informations pour ${roomLabel} ont été mises à jour.`;
  } else {
    reviewMessage.textContent = `Merci ${participant.name} ! Rendez-vous dans ${roomLabel}.`;
  }
}

function scrollIntoViewSmooth(element) {
  if (!element) {
    return;
  }
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}
