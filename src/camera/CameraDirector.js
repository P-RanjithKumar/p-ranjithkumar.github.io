import * as THREE from 'three';
import { CAMERA_KEYFRAMES } from './cameraKeyframes.js';
import { easing } from '../utils/easing.js';
import { math } from '../utils/math.js';

export class CameraDirector {
  constructor(camera, lookAtTarget) {
    this.camera = camera;
    this.lookAtTarget = lookAtTarget || new THREE.Vector3(0, 1, 0);
    this.currentLookAt = new THREE.Vector3().copy(this.lookAtTarget);
    
    // Scratch vectors for interpolation
    this._startPos = new THREE.Vector3();
    this._endPos = new THREE.Vector3();
    this._startLookAt = new THREE.Vector3();
    this._endLookAt = new THREE.Vector3();
  }
  
  update(scrollProgress, currentPhaseIndex, localProgress) {
    const frame = CAMERA_KEYFRAMES[currentPhaseIndex];
    if (!frame) return;
    
    // Use linear progress so the orbit speed is even and doesn't judder between phases
    const easedProgress = localProgress;
    
    // Interpolate Position
    this._startPos.set(frame.cameraStart.x, frame.cameraStart.y, frame.cameraStart.z);
    this._endPos.set(frame.cameraEnd.x, frame.cameraEnd.y, frame.cameraEnd.z);
    this.camera.position.lerpVectors(this._startPos, this._endPos, easedProgress);
    
    // Interpolate LookAt
    this._startLookAt.set(frame.lookAtStart.x, frame.lookAtStart.y, frame.lookAtStart.z);
    this._endLookAt.set(frame.lookAtEnd.x, frame.lookAtEnd.y, frame.lookAtEnd.z);
    this.currentLookAt.lerpVectors(this._startLookAt, this._endLookAt, easedProgress);
    
    this.camera.lookAt(this.currentLookAt);
  }
}
