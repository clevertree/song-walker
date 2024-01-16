const songSource = `
lead=loadPreset("FluidR3/AcousticGrandPiano")
osc=loadInstrument("Oscillator", {'type':'square'})
perc=loadPreset("FluidR3/DrumKitRoom1")

instrument=lead
@track1
instrument=perc
@beat1

[track1]

durationDivisor=16
noteDuration=1/6
C5 1
C4 1
G4 1
Eb4 1
Eb5 1
F5 1
Eb5 1
D5 1
C5 1
C4 1
G4 1
Eb4 1
D5 1
C4 1
Bb4 1

[beat1]
durationDivisor=16
velocityDivisor=10
hat     kick    2
hat:3           2
hat     snare   2
hat:3           2
hat     kick    2
hat:3   kick:6  2
hat     snare   2
hat:3           1
hat:3           1


`
export default songSource

