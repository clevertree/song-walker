const DEFAULT_VELOCITY = 1;
const DEFAULT_DURATION = 1;
const DEFAULT_FREQUENCY = 432 * 12;

export default function OscillatorInstrument(audioCtx) {
    const destination = audioCtx.destination;
    let lastDuration = DEFAULT_DURATION;
    let lastFrequency = DEFAULT_FREQUENCY
    let lastVelocity = DEFAULT_VELOCITY
    return function playNote(frequency, startTime, duration, velocity) {
        // const gainNode = audioCtx.createGain(); //to get smooth rise/fall
        if (duration) {
            lastDuration = duration;
        } else {
            duration = lastDuration
        }
        if (frequency) {
            lastFrequency = frequency;
        } else {
            frequency = lastFrequency
        }
        const endTime = startTime + duration;
        const oscillator = audioCtx.createOscillator();
        oscillator.frequency.value = frequency;
        oscillator.connect(destination);
        oscillator.start(startTime);
        oscillator.stop(endTime);

        console.log("note start: ", {startTime, duration});
        oscillator.onended = () => {
            console.log("note finished: ", {startTime, duration});
        };
    }
}

