const songSource = `
lead=loadInstrument("./instruments/oscillator", {duration: 1/4T})
lead2=loadInstrument("./instruments/oscillator", {'type':'square'})


wut='ohok';omfg='1230WewfwUT2of' ; rully='yup' bpm=120
instrument=lead
@track1 3/8 
instrument=lead2
@track1 5/8 3T; dsfC 5; blah blah 3 fefs

[track1]

C5:1/4D; 1/4;
C4:1/4D:0.8;1/4;
G4:1/4 1/4
Eb4:1/4D:0.8 1/4
Eb5:1/4T 1/4
F5:1/4T 1/4
Eb5:1/4T 1/4
D5:1/4T 1/4
C5:1/4D 1/4
C4:1/4D:0.8 1/4
G4:1/4 1/4
Eb4:1/4D:0.8 1/4
D5:1/4 1/4
C4:1/4:.8 1/4
Bb4:1/4 1/4


`
export default songSource