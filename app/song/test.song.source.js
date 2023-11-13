const songSource = `    Eb4:1/4D:0.8 1/4    D5:1/4 1/4
    C4:1/4:.8 1/4
    Bb4:1/4 1/4
    
    import Instrument from "./instruments/oscillator";

    loadInstrument('lead', Instrument, 
    
    {type: 'pulse', pulseWidth: 0,
     envelope:{mixer: 1}});
    loadInstrument('lead2', Instrument, {type: 'square', envelope:{mixer: 0.5}});
    setBeatsPerMinute(120)

    setInstrument('lead')
    startTrack(groupOne)
    3/8
    setInstrument('lead2')
    startTrack(groupOne)
    5/8
    3T



@groupOne

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