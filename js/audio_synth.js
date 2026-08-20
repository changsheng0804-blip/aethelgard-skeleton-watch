/**
 * audio_synth.js
 * Procedural mechanical watch escapement sound generator using Web Audio API.
 * Synthesizes authentic crisp Swiss lever escapement tick-tock sounds without external audio files.
 */

const WatchAudio = {
  ctx: null,
  isEnabled: false,
  lastTickTime: 0,
  tickState: false, // Alternate tick and tock frequency

  init: function () {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio API not supported on this device.", e);
    }
  },

  toggle: function () {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  },

  playTick: function () {
    if (!this.isEnabled || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.tickState = !this.tickState;

      // 1. High-frequency metal transient click (Impulse Jewel hit)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(this.tickState ? 4200 : 3800, now);
      filter.Q.setValueAtTime(12, now);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(this.tickState ? 3400 : 3000, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);

      // 2. Micro metallic resonance (escapement wheel ring)
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ringOsc.type = "sine";
      ringOsc.frequency.setValueAtTime(this.tickState ? 6400 : 5900, now);
      ringGain.gain.setValueAtTime(0.03, now);
      ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      ringOsc.connect(ringGain);
      ringGain.connect(this.ctx.destination);

      ringOsc.start(now);
      ringOsc.stop(now + 0.06);
    } catch (e) {
      // Audio context error recovery
    }
  }
};
