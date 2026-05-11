export function playEventAlert() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const beepAt = (t, freq, duration) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + t)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + t + duration)
      gain.gain.setValueAtTime(0.35, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + duration)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + duration)
    }
    beepAt(0.0, 880, 0.18)
    beepAt(0.22, 880, 0.18)
    beepAt(0.44, 660, 0.30)
  } catch (_) {
    // Audio not available
  }
}
