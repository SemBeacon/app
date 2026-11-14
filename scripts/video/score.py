"""Synthesises the soundtrack (ambient pad + beacon pings) for the announcement video.
Usage: python3 scripts/video/score.py out.wav   (needs numpy)"""
import sys
import numpy as np

SR, DUR = 44100, 74.0
t = np.arange(int(SR * DUR)) / SR
note = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# Pad: Am - F - C - G, 8 s per chord, detuned saw-ish stacks with slow swell
chords = [(57, 60, 64, 69), (53, 57, 60, 65), (48, 55, 60, 64), (55, 59, 62, 67)]
pad = np.zeros_like(t)
for i in range(int(DUR // 8) + 1):
    a, b = i * 8, min((i + 1) * 8 + 1.5, DUR)  # overlap to crossfade
    m = (t >= a) & (t < b)
    if not m.any():
        continue
    tt = t[m] - a
    env = np.minimum(tt / 2.0, 1) * np.minimum((b - a - tt) / 1.5, 1)
    voice = np.zeros_like(tt)
    for n in chords[i % 4]:
        for det in (-0.12, 0.0, 0.12):
            f = note(n) * 2 ** (det / 12)
            voice += np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)
    pad[m] += voice * env / 24

# Sub bass on chord roots
bass = np.zeros_like(t)
for i in range(int(DUR // 8) + 1):
    m = (t >= i * 8) & (t < (i + 1) * 8)
    if m.any():
        tt = t[m] - i * 8
        bass[m] = np.sin(2 * np.pi * note(chords[i % 4][0] - 12) * tt) * np.minimum(tt / 1, 1) * np.minimum((8 - tt) / 1, 1) * 0.12

# Soft pulse (a beacon "advertising interval"): every 2 s
pulse = np.zeros_like(t)
for k in np.arange(1, DUR - 1, 2.0):
    m = (t >= k) & (t < k + 1.2)
    tt = t[m] - k
    pulse[m] += np.sin(2 * np.pi * note(81) * tt) * np.exp(-tt * 6) * 0.025

# Pings at scene changes, with a short echo tail
pings = np.zeros_like(t)
for k, p in [(0.6, 88), (5.2, 93), (10.4, 88), (33.9, 91), (57.4, 93), (66.4, 88)]:
    for rep, g in enumerate((1.0, 0.35, 0.12)):
        s = k + rep * 0.32
        m = (t >= s) & (t < s + 2.5)
        tt = t[m] - s
        pings[m] += (np.sin(2 * np.pi * note(p) * tt) + 0.4 * np.sin(2 * np.pi * note(p + 12) * tt)) * np.exp(-tt * 3.2) * 0.11 * g

mix = pad + bass + pulse + pings
# Gentle stereo widening via a short delay on the right
d = int(0.017 * SR)
right = np.concatenate([np.zeros(d), mix[:-d]]) * 0.95
fade = np.minimum(t / 1.5, 1) * np.minimum((DUR - t) / 3.0, 1)
out = np.stack([mix * fade, right * fade], axis=1)
out = out / np.abs(out).max() * 0.7
import wave
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
