const songSource =
    `lead=loadPreset("FluidR3/AcousticGrandPiano")
osc=loadInstrument("Oscillator", {'type':'square'})
perc=loadPreset("FluidR3/DrumKitRoom1")

instrument=lead
@track1
instrument=perc
@beat1

[track1]
durationDefault=1/4
C5 /2
C4 /2
G4 /2
Eb4 /2
Eb5 /2
F5 /2
Eb5 /2
D5 /2
C5 /2
C4 /2
G4 /2
Eb4 /2
D5 /2
C4 /2
Bb4 /2

[beat1]
velocityDivisor=10
chh     abd     /2
chh:3           /2
chh     as      /2
chh:3           /2
chh     abd     /2
chh:3   abd:6   /2
chh     as      /2
chh:3           /4
chh:3           /4
chh     abd     /2
chh:3           /2
chh     as      /2
chh:3           /2
chh     abd     /2
chh:3   abd:6   /2
chh     as      /2
ohh:3           /2


`
export default songSource
