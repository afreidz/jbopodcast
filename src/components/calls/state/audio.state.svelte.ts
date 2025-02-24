export default class AudioAnalyzer {
  private animationFrameId?: number;
  protected analyser: AnalyserNode;
  protected bufferLength: number;
  protected ac: AudioContext;

  protected _percentage: number = $state(0);
  protected _decibels: number = $state(-60);
  protected _level: "peaked" | "loud" | "normal" = $state("normal");

  constructor() {
    this.ac = new AudioContext();
    this.analyser = this.ac.createAnalyser();

    this.analyser.fftSize = 2048;
    this.analyser.maxDecibels = -0;
    this.analyser.minDecibels = -60;
    this.analyser.smoothingTimeConstant = 0.5;

    this.bufferLength = this.analyser.frequencyBinCount;
  }

  init(stream: MediaStream) {
    this.stop();

    const source = this.ac.createMediaStreamSource(stream);
    source.connect(this.analyser);
    this.animationFrameId = window.requestAnimationFrame(() => this.update());
  }

  get level() {
    return this._level;
  }

  get decibels() {
    return this._decibels;
  }

  get percentage() {
    return this._percentage;
  }

  stop() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  update() {
    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    let sumOfSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumOfSquares += buffer[i] ** 2;
    }

    this._decibels = 10 * Math.log10(sumOfSquares / buffer.length);

    const range = this.analyser.maxDecibels - this.analyser.minDecibels;
    this._percentage =
      ((this._decibels - this.analyser.minDecibels) / range) * 100;
    this._percentage = Math.max(0, Math.min(100, this._percentage));

    if (this._percentage > 90) {
      this._level = "peaked";
    } else if (this._percentage > 67) {
      this._level = "loud";
    } else {
      this._level = "normal";
    }

    this.animationFrameId = window.requestAnimationFrame(() => this.update());
  }
}
