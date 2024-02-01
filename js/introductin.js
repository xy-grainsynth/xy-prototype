const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true,
      },
      scrollTo: { behavior: "smooth", block: "left" },
    },
  });


  tour.addStep({
    title: " ",
    text: `ClimaSynth is a web-based interactive application for creatively transforming environmental sound recordings in response \
    to climate change scenarios. Field recordings from Potsdam, Germany are linked to drought effects on landscapes and ecosystems. \
    Their stories are told from a non-human perspective through the voices of a river, birds and trees.\
    
    
    
    Instructions:
    
    Use mouse or touch to slowly interact with different environmental states represented by different visual densities.
    Trace paths and change spread values to navigate across environmental states.
    Listen to changing relationships within the microcosm of the recordings.
    Create your own versions. 

 

    riverwater – river flows are shrinking and moving differently as they are drying out

    birdsnearwater – bird voices are fading out and are replaced by insects

    treebark – tree barks are becoming warmer, drier and less flexible`,
    buttons: [
      {
        action() {
          return this.back();
        },
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action() {
          return this.next();
        },
        text: "Next",
      },
    ],
    id: "creating",
  });