const songSource = `
lead=loadInstrument("oscillator", {'type': 'sine'})
lead2=loadInstrument("oscillator", {'type':'triangle'})

instrument=lead
@track1 3/8 
instrument=lead2
@track1 5/8 

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

