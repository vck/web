---
title: 'Training Detection Models That Survive the Field'
description: 'Data curation, augmentation for ugly conditions, and evaluation beyond mAP — a field manual for training detectors that hold up on deployment.'
pubDate: 'Sep 02 2026'
tags: ['Computer Vision', 'Training']
---

The gap between validation mAP and field performance is where detection projects die. I've trained models for orchards at noon and ports at midnight — here's the discipline that closes the gap.

## Data beats architecture, every time

Switching YOLOv8-s to YOLOv8-m might buy 2 points of mAP. Fixing your dataset routinely buys 10. Spend your budget here:

- **Collect from the deployment cameras**, not from the web. Same sensor, same angles, same lighting. Web-scraped data trains a model for somebody else's problem.
- **Label what you'll be graded on.** If night shift matters, night data must be a first-class split, not 3% of the set.
- **Audit labels before training.** A day spent fixing boxes — tight, consistent, one policy for occlusion and truncation — outperforms most hyperparameter tuning. Mislabeled small objects actively teach the model to be wrong.

## Augment for ugly, not for benchmarks

Default augmentation pipelines are tuned for COCO leaderboards. Field conditions are harsher: rain, glare, dust, motion blur, extreme low light. Build augmentation around your deployment:

- Brightness/contrast/exposure jitter wide enough to cover dawn-to-midnight lux swings.
- Motion blur and compression artifacts if the feed is a re-encoded RTSP stream (it usually is).
- Mosaic and mixup for small-object density, but verify they don't destroy the spatial priors your scene actually has (e.g., horizon lines in CCTV).

## Start from pretrained, freeze wisely

Train from COCO-pretrained weights unless you have millions of boxes. Freeze the backbone for the first epochs to stabilize the head, then unfreeze with a lower backbone learning rate. Full fine-tuning from epoch zero on a small dataset is how you destroy good features and memorize noise.

## Hyperparameters that actually matter

- **Image size**: train at (or near) deployment resolution. Training at 640 and deploying at 1280 shifts the feature statistics.
- **Learning rate schedule**: cosine decay with a short warmup is boring and works. One-cycle can train faster but is touchier on small data.

$$\eta_t = \eta_{min} + \tfrac{1}{2}(\eta_{max} - \eta_{min})\left(1 + \cos\frac{t\pi}{T}\right)$$
- **Class imbalance**: if one class dominates 10:1, reweight the loss or oversample — otherwise the model learns that "always guess background" is a fine strategy.

## Evaluate like the field will

- Report **per-class recall at your operating confidence threshold**, not just mAP@0.5. The threshold you'll deploy at is the only one that counts.
- Keep a **held-out field set** from different days/cameras than training. Same-day validation lies.
- Measure **latency and memory on the target device** as first-class metrics. A 55-mAP model that can't run on your Jetson is a 0-mAP model.
- Log failure modes, not just scores: missed small objects? False positives on shadows? Each failure mode maps to a data fix, which maps to the next training round.
- **Stop at the bottom of the validation curve**, not at a fixed epoch count. Training loss will keep falling long after the model starts memorizing noise — the validation minimum is the model you ship.

<figure>
  <img src="/images/loss-curves.svg" alt="Training loss keeps falling while validation loss bottoms out and rises; early stopping marks the model to ship" loading="lazy" />
  <figcaption>Fig. 1 — Train until validation stops improving, then stop. Really stop.</figcaption>
</figure>

## The loop

Collect field data → audit labels → train from pretrained → evaluate per-class at operating threshold on held-out field footage → fix the data the failures point at → repeat. Most "model problems" are data problems wearing a trench coat. Run the loop and the field stops being scary.
