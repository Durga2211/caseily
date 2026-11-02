/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DIWALI AMBIENT SOUND SYNTHESIZER (Web Audio API)
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates an ambient Indian classical meditative drone & chime (Sa-Pa harmonic)
 * using pure Web Audio API synthesis without downloading external audio files.
 * OFF by default, respects browser autoplay policies.
 * ─────────────────────────────────────────────────────────────────────────────
 */

class DiwaliAmbientSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
    this.intervals = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  play() {
    if (this.isPlaying) return;
    if (!this.init()) return;

    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Master volume set gently to 0.12 (soft background atmosphere)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(0.12, now + 2);
    this.masterGain.connect(this.ctx.destination);

    // Warm Tanpura harmonic frequencies (Root C# = ~138.59 Hz, Fifth G# = ~207.65 Hz)
    const baseFreqs = [138.59, 207.65, 277.18, 415.30];

    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Soft triangle/sine tone
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Lowpass filter for warm, relaxing analog sound
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + idx * 200, now);

      // Slow amplitude modulation to mimic meditative breathing
      gain.gain.setValueAtTime(0.02 + idx * 0.015, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      this.oscillators.push(osc);
    });

    // Gentle random temple bell chime every 7-10 seconds
    const chimeTimer = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      this.playBellChime();
    }, 7500);

    this.intervals.push(chimeTimer);
  }

  playBellChime() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    // Pentatonic high bell note (e.g. 830Hz - 1100Hz)
    const notes = [830.6, 932.3, 1108.7, 1244.5];
    const chosenNote = notes[Math.floor(Math.random() * notes.length)];

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(chosenNote, now);

    // Sharp ping attack, long gentle metallic decay
    chimeGain.gain.setValueAtTime(0.04, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    chimeOsc.start(now);
    chimeOsc.stop(now + 3.6);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + 0.8);
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        this.oscillators = [];
        this.intervals.forEach(id => clearInterval(id));
        this.intervals = [];
      }, 900);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }
}

export const diwaliAudio = new DiwaliAmbientSynth();
