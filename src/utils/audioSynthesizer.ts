/**
 * Real Web Audio API procedural sound synthesizer.
 * Generates natural ambient soundscapes offline without external audio files.
 */

export type AmbienceType = 'rain' | 'fire' | 'cafe' | 'binaural';

class AmbienceSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentType: AmbienceType | null = null;
  private activeNodes: Array<{ stop?: () => void; disconnect: () => void }> = [];
  private timerId: number | null = null;
  private timerRemainingSeconds = 0;
  private timerCallback: ((remaining: number) => void) | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    if (!this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public play(type: AmbienceType, volume = 0.5) {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.currentType = type;
    this.setVolume(volume);

    switch (type) {
      case 'rain':
        this.createRainSound();
        break;
      case 'fire':
        this.createFireSound();
        break;
      case 'cafe':
        this.createCafeSound();
        break;
      case 'binaural':
        this.createBinauralSound();
        break;
    }
  }

  private createRainSound() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise approximation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(120, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(highpass);
    highpass.connect(this.masterGain);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter, highpass);
  }

  private createFireSound() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Low rumble with random pop bursts
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      // Random crackle pop
      const crackle = Math.random() < 0.0008 ? (Math.random() * 2 - 1) * 0.8 : 0;
      output[i] = last * 1.5 + crackle;
    }

    const fireSource = this.ctx.createBufferSource();
    fireSource.buffer = noiseBuffer;
    fireSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(600, this.ctx.currentTime);

    fireSource.connect(lowpass);
    lowpass.connect(this.masterGain);
    fireSource.start();

    this.activeNodes.push(fireSource, lowpass);
  }

  private createCafeSound() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      left[i] = (Math.random() * 2 - 1) * 0.15;
      right[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const cafeSource = this.ctx.createBufferSource();
    cafeSource.buffer = noiseBuffer;
    cafeSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    cafeSource.connect(filter);
    filter.connect(this.masterGain);
    cafeSource.start();

    this.activeNodes.push(cafeSource, filter);
  }

  private createBinauralSound() {
    if (!this.ctx || !this.masterGain) return;
    const merger = this.ctx.createChannelMerger(2);

    // 210Hz left
    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(210, this.ctx.currentTime);

    // 216Hz right (6Hz difference = Theta relaxation state)
    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(216, this.ctx.currentTime);

    const gainL = this.ctx.createGain();
    const gainR = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gainR.gain.setValueAtTime(0.25, this.ctx.currentTime);

    oscLeft.connect(gainL);
    oscRight.connect(gainR);
    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);

    merger.connect(this.masterGain);
    oscLeft.start();
    oscRight.start();

    this.activeNodes.push(oscLeft, oscRight, gainL, gainR, merger);
  }

  public setTimer(minutes: number, onTick?: (remaining: number) => void) {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    if (minutes <= 0) {
      this.timerRemainingSeconds = 0;
      return;
    }

    this.timerRemainingSeconds = minutes * 60;
    this.timerCallback = onTick || null;
    if (this.timerCallback) {
      this.timerCallback(this.timerRemainingSeconds);
    }

    this.timerId = window.setInterval(() => {
      this.timerRemainingSeconds -= 1;
      if (this.timerCallback) {
        this.timerCallback(this.timerRemainingSeconds);
      }
      if (this.timerRemainingSeconds <= 0) {
        this.stop();
      }
    }, 1000);
  }

  public stop() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.timerRemainingSeconds = 0;
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch {
        // ignore already stopped nodes
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentType = null;
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentType: this.currentType,
      timerRemainingSeconds: this.timerRemainingSeconds,
    };
  }
}

export const soundSynthesizer = new AmbienceSynthesizer();
