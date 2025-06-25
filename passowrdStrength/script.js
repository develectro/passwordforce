document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const timeEstimateSpan = document.getElementById('time-estimate');
    const mainContainer = document.getElementById('main-container');

    // Assumption: A high-end system can make 10 billion (10^10) guesses per second.
    // This is a simplified model. Real-world performance depends on the hashing algorithm.
    const GUESSES_PER_SECOND = 10_000_000_000;

    const updateStrength = () => {
        const password = passwordInput.value;
        
        if (password.length === 0) {
            mainContainer.style.backgroundColor = 'var(--color-neutral)';
            timeEstimateSpan.textContent = '...';
            return;
        }

        const charsetSize = getCharsetSize(password);
        // Use BigInt for calculations to avoid overflow with large numbers.
        const combinations = BigInt(charsetSize) ** BigInt(password.length);
        
        // Convert BigInt to number for division. May result in Infinity for very large numbers.
        const timeInSeconds = Number(combinations) / GUESSES_PER_SECOND;

        updateUI(timeInSeconds);
    };

    const getCharsetSize = (password) => {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/[0-9]/.test(password)) size += 10;
        if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Common symbols !@#$%^&*()...
        return size > 0 ? size : 1; // Avoid size 0 for empty/unknown chars
    };

    const updateUI = (seconds) => {
        timeEstimateSpan.textContent = formatTime(seconds);

        // Thresholds for color change
        const oneHour = 3600;
        const oneCentury = 31536000 * 100;

        if (seconds < oneHour) { // Less than an hour is weak
            mainContainer.style.backgroundColor = 'var(--color-weak)';
        } else if (seconds < oneCentury) { // Between an hour and a century is medium
            mainContainer.style.backgroundColor = 'var(--color-medium)';
        } else { // More than a century is strong
           mainContainer.style.backgroundColor = 'var(--color-strong)';
        }
    };

    const formatTime = (seconds) => {
        if (seconds === Infinity) return 'eons';
        if (seconds < 1e-6) return 'instantly';
        if (seconds < 0.001) return `${(seconds * 1e6).toPrecision(3)} microseconds`;
        if (seconds < 1) return `${(seconds * 1000).toPrecision(3)} milliseconds`;
        
        const timeUnits = [
            { value: 3.154e+18, name: 'quintillion years' },
            { value: 3.154e+15, name: 'quadrillion years' },
            { value: 3.154e+12, name: 'trillion years' },
            { value: 3.154e+9, name: 'billion years' },
            { value: 3.154e+6, name: 'million years' },
            { value: 31536000, name: 'years' },
            { value: 86400, name: 'days' },
            { value: 3600, name: 'hours' },
            { value: 60, name: 'minutes' },
        ];

        for (const unit of timeUnits) {
            if (seconds >= unit.value) {
                const count = seconds / unit.value;
                return `${count.toPrecision(3)} ${unit.name}`;
            }
        }
        return `${seconds.toPrecision(3)} seconds`;
    };

    passwordInput.addEventListener('input', updateStrength);
    
    // Initial call for empty state
    updateStrength();
});