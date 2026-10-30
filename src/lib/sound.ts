/**
 * Web Audio API プロシージャルシンセサイザーモジュール
 * 外部音声ファイル不要・完全コード生成サウンド (Rule Shifter仕様)
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.ensureContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Pass音 (Connect):
   * ペンタトニックスケール上昇 [C5(523Hz), D5(587Hz), E5(659Hz), G5(784Hz), A5(880Hz)]
   */
  public playPass(stepIndex: number = 0) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0];
    const freq = pentatonic[stepIndex % pentatonic.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const now = ctx.currentTime;
    const duration = 0.12;
    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Reject音 (Error):
   * 130Hz ➔ 65Hz 下降ソー波 ＋ 低域フィルタ (0.15s)
   */
  public playReject() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    const duration = 0.15;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(this.volume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * 相転移音 (Phase Shift):
   * [440Hz, 659Hz, 880Hz, 1318Hz] アルペジオシマー (0.40s)
   */
  public playPhaseShift() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const freqs = [440.0, 659.25, 880.0, 1318.51];
    const now = ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const noteStart = now + idx * 0.08;
      const duration = 0.22;
      gain.gain.setValueAtTime(this.volume * 0.3, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + duration);
    });
  }

  /**
   * Undo音 (Rollback):
   * 380Hz ➔ 240Hz 下降トライアングル (0.08s)
   */
  public playUndo() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    const duration = 0.08;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + duration);

    gain.gain.setValueAtTime(this.volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * 手詰まり音 (Dead End):
   * 110Hz ➔ 60Hz 重低音2連パルス (0.20s)
   */
  public playDeadEnd() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.1].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now + delay);
      osc.frequency.exponentialRampToValueAtTime(60, now + delay + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.4, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.08);
    });
  }

  /**
   * スライドカメラ音:
   * 400Hz ➔ 600Hz ピープ (0.06s)
   */
  public playSlide() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    const duration = 0.06;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + duration);

    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * クリアファンファーレ:
   * [C5, G5, C6, E6] 壮大な長三和音コード (0.60s)
   */
  public playClear() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [
      { freq: 523.25, time: 0 },
      { freq: 783.99, time: 0.12 },
      { freq: 1046.5, time: 0.24 },
      { freq: 1318.51, time: 0.36 },
    ];
    const now = ctx.currentTime;

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      const noteDuration = 0.45;
      const start = now + note.time;
      gain.gain.setValueAtTime(this.volume * 0.35, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + noteDuration);
    });
  }
}

export const soundService = new SoundService();
