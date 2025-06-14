// Voice Test Interactive Functionality
// =====================================

// Global test state
let testState = {
    currentScreen: 'welcome',
    userName: '',
    answers: {
        q1: '',
        q2: [],
        q3: 50
    },
    recording: {
        mediaRecorder: null,
        audioBlob: null,
        isRecording: false,
        startTime: null,
        timer: null
    },
    contactInfo: {
        phone: '',
        email: '',
        messenger: ''
    }
};

// Voice animal definitions
const voiceAnimals = {
    lion: {
        emoji: '🦁',
        name: 'Лев',
        type: 'Лидерский',
        description: 'У вас мощный, уверенный голос с природной командной интонацией. Люди инстинктивно прислушиваются к вашим словам и доверяют вашему мнению.',
        characteristics: {
            strength: 'Высокая',
            timbre: 'Глубокий',
            influence: 'Максимальное'
        }
    },
    owl: {
        emoji: '🦉',
        name: 'Сова',
        type: 'Мудрый',
        description: 'Ваш голос обладает особой глубиной и вдумчивостью. Вы умеете донести сложную информацию простыми словами.',
        characteristics: {
            strength: 'Средняя',
            timbre: 'Глубокий',
            influence: 'Интеллектуальное'
        }
    },
    dolphin: {
        emoji: '🐬',
        name: 'Дельфин',
        type: 'Дружелюбный',
        description: 'У вас мелодичный, располагающий голос. Люди чувствуют себя комфортно в вашем присутствии.',
        characteristics: {
            strength: 'Средняя',
            timbre: 'Мелодичный',
            influence: 'Эмоциональное'
        }
    },
    eagle: {
        emoji: '🦅',
        name: 'Орёл',
        type: 'Командный',
        description: 'Ваш голос чёткий и целеустремлённый. Вы умеете мотивировать и вести за собой.',
        characteristics: {
            strength: 'Высокая',
            timbre: 'Чёткий',
            influence: 'Мотивирующее'
        }
    },
    cat: {
        emoji: '🐱',
        name: 'Кошка',
        type: 'Гипнотический',
        description: 'У вас мягкий, обволакивающий голос с особой притягательностью. Вы можете очаровать собеседника.',
        characteristics: {
            strength: 'Средняя',
            timbre: 'Мягкий',
            influence: 'Убеждающее'
        }
    },
    hummingbird: {
        emoji: '🐦',
        name: 'Колибри',
        type: 'Энергичный',
        description: 'Ваш голос быстрый, яркий и энергичный. Вы легко заряжаете окружающих своим энтузиазмом.',
        characteristics: {
            strength: 'Высокая',
            timbre: 'Яркий',
            influence: 'Вдохновляющее'
        }
    }
};

// Initialize test
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu инициализируется в main.js
    initializeTest();
    setupEventListeners();
    createWaveVisualizer();
});

// Mobile Menu функциональность обрабатывается в main.js

function initializeTest() {
    // Check if user came directly to test section
    const hash = window.location.hash;
    if (hash === '#test') {
        scrollToTest();
    }
    
    // Initialize counter animation
    animateCounter();
    
    // Setup frequency waves
    createFrequencyWaves();
}

function setupEventListeners() {
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Handle browser back button
    window.addEventListener('popstate', function(event) {
        if (testState.currentScreen !== 'welcome') {
            resetTest();
        }
    });
}

// Main test flow functions
function startTest() {
    const testSection = document.getElementById('test');
    testSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add pulse effect to test container
    const testContainer = document.getElementById('testContainer');
    testContainer.classList.add('pulse-effect');
    setTimeout(() => {
        testContainer.classList.remove('pulse-effect');
    }, 1000);
}

function startTestFlow() {
    const nameInput = document.getElementById('userName');
    const userName = nameInput.value.trim();
    
    if (!userName) {
        nameInput.classList.add('error');
        showNotification('Пожалуйста, введите ваше имя', 'error');
        return;
    }
    
    testState.userName = userName;
    nameInput.classList.remove('error');
    
    showScreen('question1Screen');
    trackEvent('test_started', { name: userName });
}

function selectOption(question, value) {
    testState.answers[question] = value;
    
    // Update UI
    const options = document.querySelectorAll(`input[name="${question}"]`);
    options.forEach(option => {
        const card = option.closest('.option-card');
        if (option.value === value) {
            card.classList.add('selected');
            option.checked = true;
        } else {
            card.classList.remove('selected');
            option.checked = false;
        }
    });
    
    // Enable next button
    const nextBtn = document.getElementById(`${question}Next`);
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.classList.remove('btn--disabled');
    }
    
    // Add selection animation
    setTimeout(() => {
        const selectedCard = document.querySelector(`input[name="${question}"][value="${value}"]`).closest('.option-card');
        selectedCard.classList.add('selected-animation');
        setTimeout(() => {
            selectedCard.classList.remove('selected-animation');
        }, 600);
    }, 100);
}

function toggleOption(question, value) {
    const checkbox = document.querySelector(`input[name="${question}"][value="${value}"]`);
    const card = checkbox.closest('.option-card');
    
    if (checkbox.checked) {
        testState.answers[question].push(value);
        card.classList.add('selected');
    } else {
        const index = testState.answers[question].indexOf(value);
        if (index > -1) {
            testState.answers[question].splice(index, 1);
        }
        card.classList.remove('selected');
    }
    
    // Add animation
    card.classList.add('toggle-animation');
    setTimeout(() => {
        card.classList.remove('toggle-animation');
    }, 300);
}

function updateSliderValue() {
    const slider = document.getElementById('frequencySlider');
    const valueDisplay = document.getElementById('sliderValue');
    const waves = document.getElementById('frequencyWaves');
    
    const value = slider.value;
    testState.answers.q3 = parseInt(value);
    valueDisplay.textContent = `${value}%`;
    
    // Update wave animation intensity
    updateWaveIntensity(value / 100);
    
    // Update slider thumb color
    const percentage = value / 100;
    slider.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${value}%, var(--surface-secondary) ${value}%, var(--surface-secondary) 100%)`;
}

function nextQuestion(questionNumber) {
    const screenMap = {
        2: 'question2Screen',
        3: 'question3Screen',
        4: 'recordingScreen',
        5: 'contactsScreen'
    };
    
    const nextScreen = screenMap[questionNumber];
    if (nextScreen) {
        showScreen(nextScreen);
        
        // Track progress
        trackEvent('question_completed', {
            question: questionNumber - 1,
            answer: testState.answers[`q${questionNumber - 1}`]
        });
    }
}

function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.test-screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        testState.currentScreen = screenId;
        
        // Add entrance animation
        targetScreen.style.opacity = '0';
        targetScreen.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            targetScreen.style.transition = 'all 0.5s ease';
            targetScreen.style.opacity = '1';
            targetScreen.style.transform = 'translateY(0)';
        }, 50);
    }
}

// Voice recording functionality
function toggleRecording() {
    if (testState.recording.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        testState.recording.mediaRecorder = new MediaRecorder(stream);
        testState.recording.chunks = [];
        
        testState.recording.mediaRecorder.ondataavailable = function(event) {
            testState.recording.chunks.push(event.data);
        };
        
        testState.recording.mediaRecorder.onstop = function() {
            testState.recording.audioBlob = new Blob(testState.recording.chunks, { type: 'audio/wav' });
            showRecordingActions();
        };
        
        testState.recording.mediaRecorder.start();
        testState.recording.isRecording = true;
        testState.recording.startTime = Date.now();
        
        updateRecordingUI(true);
        startRecordingTimer();
        startWaveAnimation();
        
        trackEvent('recording_started');
        
    } catch (error) {
        console.error('Recording error:', error);
        showNotification('Не удалось получить доступ к микрофону', 'error');
    }
}

function stopRecording() {
    if (testState.recording.mediaRecorder && testState.recording.isRecording) {
        testState.recording.mediaRecorder.stop();
        testState.recording.isRecording = false;
        
        // Stop all tracks
        testState.recording.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        updateRecordingUI(false);
        stopRecordingTimer();
        stopWaveAnimation();
        
        trackEvent('recording_completed', {
            duration: Date.now() - testState.recording.startTime
        });
    }
}

function reRecord() {
    testState.recording.audioBlob = null;
    hideRecordingActions();
    resetRecordingTimer();
}

function updateRecordingUI(isRecording) {
    const recordBtn = document.getElementById('recordBtn');
    const recordIcon = recordBtn.querySelector('.record-icon');
    const recordText = recordBtn.querySelector('.record-text');
    
    if (isRecording) {
        recordBtn.classList.add('recording');
        recordIcon.textContent = '⏹️';
        recordText.textContent = 'Остановить запись';
    } else {
        recordBtn.classList.remove('recording');
        recordIcon.textContent = '🎙️';
        recordText.textContent = 'Начать запись';
    }
}

function startRecordingTimer() {
    testState.recording.timer = setInterval(() => {
        const elapsed = Date.now() - testState.recording.startTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        const timerDisplay = document.getElementById('recordingTimer');
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        // Auto-stop after 60 seconds
        if (seconds >= 60) {
            stopRecording();
        }
    }, 100);
}

function stopRecordingTimer() {
    if (testState.recording.timer) {
        clearInterval(testState.recording.timer);
    }
}

function resetRecordingTimer() {
    const timerDisplay = document.getElementById('recordingTimer');
    timerDisplay.textContent = '00:00';
}

function showRecordingActions() {
    const actions = document.getElementById('recordingActions');
    actions.style.display = 'flex';
    actions.style.opacity = '0';
    
    setTimeout(() => {
        actions.style.transition = 'opacity 0.3s ease';
        actions.style.opacity = '1';
    }, 50);
}

function hideRecordingActions() {
    const actions = document.getElementById('recordingActions');
    actions.style.display = 'none';
}

// Contact form handling
function handleContactSubmit(event) {
    event.preventDefault();
    
    const phone = document.getElementById('contactPhone').value;
    const email = document.getElementById('contactEmail').value;
    const messenger = document.getElementById('contactMessenger').value;
    const agreement = document.getElementById('agreement').checked;
    
    // Validation
    if (!phone || !messenger || !agreement) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{10,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        showNotification('Введите корректный номер телефона', 'error');
        return;
    }
    
    testState.contactInfo = { phone, email, messenger };
    
    // Show result screen
    showScreen('resultScreen');
    generateResult();
    
    trackEvent('contact_submitted', testState.contactInfo);
}

// Result generation
function generateResult() {
    const resultGeneration = document.getElementById('resultGeneration');
    const resultDisplay = document.getElementById('resultDisplay');
    
    // Show generation animation
    resultGeneration.style.display = 'block';
    resultDisplay.style.display = 'none';
    
    // Determine result based on answers
    setTimeout(() => {
        const animal = determineVoiceAnimal();
        displayResult(animal);
        
        // Hide generation, show result
        setTimeout(() => {
            resultGeneration.style.display = 'none';
            resultDisplay.style.display = 'block';
            
            // Add entrance animation
            resultDisplay.style.opacity = '0';
            resultDisplay.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                resultDisplay.style.transition = 'all 0.6s ease';
                resultDisplay.style.opacity = '1';
                resultDisplay.style.transform = 'scale(1)';
            }, 50);
            
        }, 500);
    }, 3000);
}

function determineVoiceAnimal() {
    const { q1, q2, q3 } = testState.answers;
    
    // Simple algorithm to determine voice animal based on answers
    let scores = {
        lion: 0,
        owl: 0,
        dolphin: 0,
        eagle: 0,
        cat: 0,
        hummingbird: 0
    };
    
    // Question 1 scoring
    switch (q1) {
        case 'speaking':
            scores.lion += 3;
            scores.eagle += 2;
            scores.owl += 1;
            break;
        case 'singing':
            scores.cat += 3;
            scores.dolphin += 2;
            scores.hummingbird += 2;
            break;
        case 'confidence':
            scores.lion += 2;
            scores.eagle += 3;
            scores.hummingbird += 1;
            break;
        case 'curious':
            scores.owl += 3;
            scores.dolphin += 2;
            scores.cat += 1;
            break;
    }
    
    // Question 2 scoring
    q2.forEach(issue => {
        switch (issue) {
            case 'quiet':
                scores.cat += 2;
                scores.dolphin += 2;
                break;
            case 'fatigue':
                scores.owl += 1;
                scores.cat += 1;
                break;
            case 'tension':
                scores.lion += 1;
                scores.eagle += 1;
                break;
            case 'monotone':
                scores.hummingbird += 2;
                scores.dolphin += 1;
                break;
        }
    });
    
    // Question 3 scoring (frequency of professional use)
    if (q3 > 70) {
        scores.lion += 2;
        scores.eagle += 2;
    } else if (q3 > 40) {
        scores.owl += 2;
        scores.dolphin += 1;
    } else {
        scores.cat += 1;
        scores.hummingbird += 1;
    }
    
    // Find highest scoring animal
    const topAnimal = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    return voiceAnimals[topAnimal];
}

function displayResult(animal) {
    // Update animal display
    const animalAvatar = document.querySelector('.animal-avatar');
    const animalName = document.querySelector('.animal-name');
    
    animalAvatar.textContent = animal.emoji;
    animalName.textContent = animal.name;
    
    // Update description
    const resultDescription = document.getElementById('resultDescription');
    resultDescription.innerHTML = `
        <h3>Ваш тип голоса: ${animal.type}</h3>
        <p>${animal.description}</p>
        
        <div class="result-characteristics">
            <div class="characteristic">
                <span class="char-label">Сила:</span>
                <span class="char-value">${animal.characteristics.strength}</span>
            </div>
            <div class="characteristic">
                <span class="char-label">Тембр:</span>
                <span class="char-value">${animal.characteristics.timbre}</span>
            </div>
            <div class="characteristic">
                <span class="char-label">Влияние:</span>
                <span class="char-value">${animal.characteristics.influence}</span>
            </div>
        </div>
    `;
    
    // Store result for sharing
    testState.result = animal;
    
    trackEvent('result_generated', {
        animal: animal.name,
        type: animal.type
    });
}

// Utility functions
function shareResult() {
    const result = testState.result;
    if (!result) return;
    
    const shareText = `Я прошёл голосовой тест и узнал, что мой голос - ${result.name} (${result.type})! 🎤✨\n\nПройди тест сам: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Результат голосового теста',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Результат скопирован в буфер обмена!', 'success');
        });
    }
    
    trackEvent('result_shared', { animal: result.name });
}

function redirectToMain() {
    window.location.href = 'index.html#pricing';
}

function resetTest() {
    testState = {
        currentScreen: 'welcome',
        userName: '',
        answers: { q1: '', q2: [], q3: 50 },
        recording: { mediaRecorder: null, audioBlob: null, isRecording: false, startTime: null, timer: null },
        contactInfo: { phone: '', email: '', messenger: '' }
    };
    
    showScreen('welcomeScreen');
    
    // Reset all form inputs
    document.getElementById('userName').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessenger').value = '';
    document.getElementById('agreement').checked = false;
    
    // Reset slider
    document.getElementById('frequencySlider').value = 50;
    updateSliderValue();
}

// Animation functions
function createWaveVisualizer() {
    const visualizer = document.getElementById('recordingVisualizer');
    if (!visualizer) return;
    
    const waveBars = visualizer.querySelector('.wave-bars');
    if (!waveBars) return;
    
    // Create wave bars
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        bar.style.animationDelay = `${i * 0.1}s`;
        waveBars.appendChild(bar);
    }
}

function startWaveAnimation() {
    const waveBars = document.querySelectorAll('.wave-bar');
    waveBars.forEach(bar => {
        bar.classList.add('active');
    });
}

function stopWaveAnimation() {
    const waveBars = document.querySelectorAll('.wave-bar');
    waveBars.forEach(bar => {
        bar.classList.remove('active');
    });
}

function createFrequencyWaves() {
    const container = document.getElementById('frequencyWaves');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        const wave = document.createElement('div');
        wave.className = 'frequency-wave';
        wave.style.animationDelay = `${i * 0.1}s`;
        container.appendChild(wave);
    }
}

function updateWaveIntensity(intensity) {
    const waves = document.querySelectorAll('.frequency-wave');
    waves.forEach((wave, index) => {
        const scale = 0.3 + (intensity * 0.7);
        wave.style.transform = `scaleY(${scale})`;
        wave.style.opacity = 0.3 + (intensity * 0.7);
    });
}

function animateCounter() {
    const counter = document.querySelector('.counter__number');
    if (!counter) return;
    
    const target = 1500;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        counter.textContent = Math.floor(current) + '+';
    }, 16);
}

function scrollToTest() {
    const testSection = document.getElementById('test');
    if (testSection) {
        testSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Analytics tracking
function trackEvent(event, data = {}) {
    console.log('Analytics:', event, data);
    
    // Here you can add real analytics tracking
    // Example: gtag('event', event, data);
    
    // Store in localStorage for demo
    const events = JSON.parse(localStorage.getItem('testEvents') || '[]');
    events.push({
        event,
        data,
        timestamp: new Date().toISOString(),
        user: testState.userName || 'anonymous'
    });
    localStorage.setItem('testEvents', JSON.stringify(events));
}

// Error handling
window.addEventListener('error', function(event) {
    console.error('Test error:', event.error);
    trackEvent('error', {
        message: event.error.message,
        filename: event.filename,
        lineno: event.lineno
    });
});

// Export functions for global access
window.startTest = startTest;
window.startTestFlow = startTestFlow;
window.selectOption = selectOption;
window.toggleOption = toggleOption;
window.nextQuestion = nextQuestion;
window.updateSliderValue = updateSliderValue;
window.toggleRecording = toggleRecording;
window.reRecord = reRecord;
window.shareResult = shareResult;
window.redirectToMain = redirectToMain;