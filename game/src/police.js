// Tarnwick PD in the air and on the road: the police helicopter with its
// spotlight cone, the flanking cruisers, and the dispatch roster. The helicopter
// is the chase's proof of escalation — in v8 it is large, top-centre, and its
// cone visibly hits the road ahead of the hero car.

/** Draw the helicopter: body, tail, spinning rotor, searchlight cone. */
export function drawHeli(ctx, x, y, span, rotorAngle, coneTarget) {
  const bodyW = span * 0.42;
  const bodyH = span * 0.16;
  ctx.save();
  // Spotlight cone: from the heli down to the road ahead (translucent gold).
  const grad = ctx.createLinearGradient(x, y + bodyH, coneTarget.x, coneTarget.y);
  grad.addColorStop(0, 'rgba(255, 230, 150, 0.5)');
  grad.addColorStop(1, 'rgba(255, 230, 150, 0.05)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x - span * 0.06, y + bodyH * 0.6);
  ctx.lineTo(x + span * 0.06, y + bodyH * 0.6);
  ctx.lineTo(coneTarget.x + span * 0.16, coneTarget.y);
  ctx.lineTo(coneTarget.x - span * 0.16, coneTarget.y);
  ctx.closePath();
  ctx.fill();
  // Light pool where the cone lands.
  ctx.fillStyle = 'rgba(255, 230, 150, 0.28)';
  ctx.beginPath();
  ctx.ellipse(coneTarget.x, coneTarget.y, span * 0.17, span * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tail boom + fin.
  ctx.fillStyle = '#1c2733';
  ctx.fillRect(x + bodyW * 0.4, y - bodyH * 0.28, span * 0.3, bodyH * 0.28);
  ctx.beginPath();
  ctx.moveTo(x + bodyW * 0.4 + span * 0.3, y - bodyH * 0.28);
  ctx.lineTo(x + bodyW * 0.4 + span * 0.3, y - bodyH * 0.9);
  ctx.lineTo(x + bodyW * 0.4 + span * 0.24, y - bodyH * 0.28);
  ctx.closePath();
  ctx.fill();
  // Body.
  ctx.fillStyle = '#22303e';
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW * 0.5, bodyH * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Canopy.
  ctx.fillStyle = '#9fc4d9';
  ctx.beginPath();
  ctx.ellipse(x - bodyW * 0.18, y - bodyH * 0.12, bodyW * 0.2, bodyH * 0.26, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Skids.
  ctx.strokeStyle = '#10161d';
  ctx.lineWidth = Math.max(2, span * 0.012);
  ctx.beginPath();
  ctx.moveTo(x - bodyW * 0.34, y + bodyH * 0.62);
  ctx.lineTo(x + bodyW * 0.34, y + bodyH * 0.62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - bodyW * 0.24, y + bodyH * 0.42);
  ctx.lineTo(x - bodyW * 0.3, y + bodyH * 0.62);
  ctx.moveTo(x + bodyW * 0.24, y + bodyH * 0.42);
  ctx.lineTo(x + bodyW * 0.3, y + bodyH * 0.62);
  ctx.stroke();
  // Rotor: two blades spinning (drawn as a blurred disc + blade line).
  ctx.fillStyle = 'rgba(220, 230, 240, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y - bodyH * 0.85, span * 0.5, span * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 24, 30, 0.85)';
  ctx.lineWidth = Math.max(2, span * 0.014);
  const a = rotorAngle % Math.PI;
  ctx.beginPath();
  ctx.moveTo(x - Math.cos(a) * span * 0.5, y - bodyH * 0.85 - Math.sin(a) * span * 0.05);
  ctx.lineTo(x + Math.cos(a) * span * 0.5, y - bodyH * 0.85 + Math.sin(a) * span * 0.05);
  ctx.stroke();
  // "POLICE" marking.
  ctx.fillStyle = '#f4ede2';
  ctx.font = `bold ${Math.max(9, span * 0.05)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POLICE', x + bodyW * 0.05, y + bodyH * 0.08);
  ctx.restore();
}

/** A police cruiser flanking the player (same car drawing, police livery). */
export function cruiserColor() {
  return '#22303e';
}
