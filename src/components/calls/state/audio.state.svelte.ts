export default class AudioAnalyzer {
  protected interval: NodeJS.Timeout | null = null;
  protected analyser: AnalyserNode;
  protected bufferLength: number;
  protected gainNode: GainNode;
  protected data: Uint8Array;
  protected ac: AudioContext;

  protected _gain: number = $state(0);
  protected _percent: number = $state(0);
  protected _level: "loud" | "soft" | "normal" = $state("normal");

  constructor() {
    this.ac = new AudioContext();
    this.gainNode = this.ac.createGain();
    this.analyser = this.ac.createAnalyser();

    this.analyser.fftSize = 256;

    this.bufferLength = this.analyser.frequencyBinCount;
    this.data = new Uint8Array(this.bufferLength);

    this.gainNode.connect(this.analyser);
  }

  init(stream: MediaStream) {
    const source = this.ac.createMediaStreamSource(stream);
    source.connect(this.gainNode);

    this.interval = setInterval(() => {
      this.update();
    }, 10);

    this.update();
  }

  get gain() {
    return this._gain;
  }

  get level() {
    return this._level;
  }

  get percentage() {
    return this._percent;
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  setGain(value: number): void {
    if (value >= 0 && value <= 2) {
      this.gainNode.gain.value = value;
      this._gain = this.gainNode.gain.value;
    }
  }

  protected update() {
    this.analyser.getByteFrequencyData(this.data);
    const sum = this.data.reduce((acc, val) => acc + val, 0);
    const average = sum / this.bufferLength;
    const percentage = (average / 255) * 100;

    let level = "normal";
    if (percentage < 30) level = "soft";
    else if (percentage > 70) level = "loud";

    this._level = level as "loud" | "soft" | "normal";
    this._percent = percentage;
  }
}
