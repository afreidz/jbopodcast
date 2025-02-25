import type { Member } from "$/actions/members";
import { BaseStreamState } from "$/state/remote.stream.state.svelte";

type CompressorValues = {
  knee: number;
  ratio: number;
  attack: number;
  release: number;
  threshold: number;
};

type LowpassValues = {
  Q: number;
  frequency: number;
};

const EQFREQS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;

type EqualizerValues = {
  [k in number]: number;
};

export default class LocalStreamState extends BaseStreamState {
  public type: "local" = "local";

  protected lowpass: BiquadFilterNode;
  protected equalizer: BiquadFilterNode[] = [];
  protected compressor: DynamicsCompressorNode;

  protected _gainValue: number = $state(
    Number(localStorage.getItem("gain") || 1)
  );

  protected _lowpassValues: LowpassValues = $state({
    frequency: Number(localStorage.getItem("lowpass-freq") || 20000),
    Q: Number(localStorage.getItem("lowpass-q") || 1),
  });

  protected _compressorValues: CompressorValues = $state({
    knee: Number(localStorage.getItem("compressor-knee") || 0),
    ratio: Number(localStorage.getItem("compressor-ratio") || 1),
    attack: Number(localStorage.getItem("compressor-attack") || 0.001),
    release: Number(localStorage.getItem("compressor-releast") || 0.001),
    threshold: Number(localStorage.getItem("compressor-threshold") || 0),
  });

  protected _eqvalues: EqualizerValues = $derived(
    EQFREQS.reduce((values, freq) => {
      values[freq] = Number(localStorage.getItem(`eq-${freq}-gain`) || 1);
      return values;
    }, {} as EqualizerValues)
  );

  constructor(member: Member, stream?: MediaStream) {
    super(member);
    this.gainNode = this.ac.createGain();
    this.lowpass = this.ac.createBiquadFilter();
    this.compressor = this.ac.createDynamicsCompressor();

    // Setup gain
    this.gainNode.gain.setValueAtTime(this._gainValue, this.ac.currentTime);

    // Setup lowpass filter
    this.lowpass.type = "lowpass";
    this.lowpass.Q.setValueAtTime(this._lowpassValues.Q, this.ac.currentTime);
    this.lowpass.frequency.setValueAtTime(
      this._lowpassValues.frequency,
      this.ac.currentTime
    );

    // Setup compressor filter
    this.compressor.threshold.setValueAtTime(
      this._compressorValues.threshold,
      this.ac.currentTime
    );
    this.compressor.knee.setValueAtTime(
      this._compressorValues.knee,
      this.ac.currentTime
    );
    this.compressor.ratio.setValueAtTime(
      this._compressorValues.ratio,
      this.ac.currentTime
    );
    this.compressor.attack.setValueAtTime(
      this._compressorValues.attack,
      this.ac.currentTime
    );
    this.compressor.release.setValueAtTime(
      this._compressorValues.release,
      this.ac.currentTime
    );

    // Setup equalizer filters
    this.equalizer = EQFREQS.map((freq) => {
      const filter = this.ac.createBiquadFilter();
      filter.Q.value = 1.4;
      filter.type = "peaking";
      filter.frequency.value = freq;
      filter.gain.value = this._eqvalues[freq];
      return filter;
    });

    if (stream) this.connectStream(stream);
  }

  get gain() {
    return this._gainValue;
  }

  get compressorValues() {
    return this._compressorValues;
  }

  set gain(v: number) {
    localStorage.setItem("gain", v.toString());
    this._gainValue = Math.max(Math.min(v, 2), 0);
    this.gainNode.gain.setValueAtTime(this._gainValue, this.ac.currentTime);
  }

  connectStream(stream: MediaStream) {
    const source = this.ac.createMediaStreamSource(stream);

    source.connect(this.lowpass);
    this.lowpass.connect(this.compressor);

    let node: AudioNode = this.compressor;
    this.equalizer.forEach((eqn) => {
      node.connect(eqn);
      node = eqn;
    });

    node.connect(this.gainNode);
    this.gainNode.connect(this.analyser);

    const dest = this.ac.createMediaStreamDestination();
    this.gainNode.connect(dest);

    const filteredStream = new MediaStream([
      ...stream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    this.animationFrameId = window.requestAnimationFrame(() => this.update());
    this._stream = filteredStream;
  }
}
