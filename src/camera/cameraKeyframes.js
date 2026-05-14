export const CAMERA_KEYFRAMES = [
  { 
    // Phase 0: Start at feet, front view
    cameraStart: { x: 0.00, y: 0.20, z: 2.00 },
    cameraEnd:   { x: -1.56, y: 0.50, z: 1.25 },
    lookAtStart: { x: 0, y: 0.10, z: 0 },
    lookAtEnd:   { x: 0, y: 0.40, z: 0 }
  },
  { 
    // Phase 1: Orbiting to her right, moving up shins
    cameraStart: { x: -1.56, y: 0.50, z: 1.25 },
    cameraEnd:   { x: -1.95, y: 0.80, z: -0.44 },
    lookAtStart: { x: 0, y: 0.40, z: 0 },
    lookAtEnd:   { x: 0, y: 0.70, z: 0 }
  },
  { 
    // Phase 2: Passing back-right, moving up knees
    cameraStart: { x: -1.95, y: 0.80, z: -0.44 },
    cameraEnd:   { x: -0.87, y: 1.10, z: -1.80 },
    lookAtStart: { x: 0, y: 0.70, z: 0 },
    lookAtEnd:   { x: 0, y: 1.00, z: 0 }
  },
  { 
    // Phase 3: Behind the model, moving up thighs
    cameraStart: { x: -0.87, y: 1.10, z: -1.80 },
    cameraEnd:   { x: 0.87, y: 1.40, z: -1.80 },
    lookAtStart: { x: 0, y: 1.00, z: 0 },
    lookAtEnd:   { x: 0, y: 1.30, z: 0 }
  },
  { 
    // Phase 4: Passing back-left, moving up waist
    cameraStart: { x: 0.87, y: 1.40, z: -1.80 },
    cameraEnd:   { x: 1.95, y: 1.70, z: -0.44 },
    lookAtStart: { x: 0, y: 1.30, z: 0 },
    lookAtEnd:   { x: 0, y: 1.60, z: 0 }
  },
  { 
    // Phase 5: Sweeping around her left side, moving up chest
    cameraStart: { x: 1.95, y: 1.70, z: -0.44 },
    cameraEnd:   { x: 1.56, y: 2.00, z: 1.25 },
    lookAtStart: { x: 0, y: 1.60, z: 0 },
    lookAtEnd:   { x: 0, y: 1.90, z: 0 }
  },
  { 
    // Phase 6: Finalizing orbit, returning to front and facing the face
    cameraStart: { x: 1.56, y: 2.00, z: 1.25 },
    cameraEnd:   { x: 0.00, y: 2.20, z: 2.00 },
    lookAtStart: { x: 0, y: 1.90, z: 0 },
    lookAtEnd:   { x: 0, y: 2.00, z: 0 }
  }
];
