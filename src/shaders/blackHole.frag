uniform float time;
varying vec2 vUv;

// Simple 2D procedural noise
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i + vec2(0.0, 0.0)), hash2(i + vec2(1.0, 0.0)), u.x),
               mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Fractal Brownian Motion for swirling plasma details
float fbm(vec2 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 4; i++) {
        f += w * noise2(p);
        p *= 2.0;
        w *= 0.5;
    }
    return f;
}

void main() {
    // Normalize coordinates from -1 to 1, then scale out to -1.5 to 1.5 to give margin
    vec2 uv = (vUv * 2.0 - 1.0) * 1.5;
    float r = length(uv);
    
    // Black Hole Event Horizon Radius
    float eh = 0.25;
    
    // Inside the Event Horizon -> Pure Black (Opaque)
    if (r < eh) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    
    // Gravitational Lensing effect (bending background coordinates)
    float lensStrength = 0.04 / (r - eh + 0.01);
    vec2 lensedUv = uv * (1.0 - lensStrength);
    
    // --- ACCRETION DISK (Gargantua Style) ---
    // The disk is mathematically flat on the XZ plane, but gravity bends the light 
    // from the back of the disk *over* and *under* the black hole.
    
    // 1. Front part of the disk
    float diskFront = 0.0;
    vec2 frontUv = uv;
    frontUv.y *= 6.0; // Squish vertically to simulate looking at it edge-on
    float frontR = length(frontUv);
    
    if (frontR > eh * 1.5 && frontR < 1.4) {
        float falloff = smoothstep(1.4, eh * 1.5, frontR);
        // Add swirling rotation over time
        float angle = atan(frontUv.y, frontUv.x);
        float n = fbm(vec2(frontR * 6.0, angle * 4.0 - time * 1.5));
        
        // Doppler effect (blue shift coming towards camera, red shift going away)
        // x < 0 is coming towards us (brighter), x > 0 is moving away (dimmer)
        float doppler = 1.0 - uv.x * 0.5; 
        
        diskFront = n * falloff * doppler;
    }
    
    // 2. Back part of the disk (Light bent over/under the hole)
    float diskBack = 0.0;
    vec2 backUv = uv;
    // Bending math creates a halo around the black hole for the back of the disk
    float bentR = length(vec2(backUv.x * 1.2, backUv.y * 1.5));
    
    if (bentR > eh && bentR < 0.7) {
        // Exclude the front overlap area
        if (abs(uv.y) > 0.08 || r < eh + 0.02) {
            float falloff = smoothstep(0.7, eh, bentR);
            float angle = atan(backUv.y, backUv.x);
            float n = fbm(vec2(bentR * 10.0, angle * 4.0 + time * 1.0));
            diskBack = n * falloff * 0.7; // Slightly dimmer since it's bent light
        }
    }
    
    // Color Palette (Interstellar fiery orange / white heat)
    vec3 diskColor = vec3(1.0, 0.45, 0.15); // Core orange
    vec3 hotWhite = vec3(1.0, 0.9, 0.8);    // Inner hot white
    
    // Mix colors based on intensity
    vec3 frontColor = mix(diskColor, hotWhite, smoothstep(0.0, 1.0, diskFront));
    vec3 backColor = mix(diskColor, hotWhite, smoothstep(0.0, 1.0, diskBack));
    
    vec3 finalColor = diskFront * frontColor * 2.5 + diskBack * backColor * 1.5;
    
    // Add a glowing photon sphere (halo) right at the event horizon
    float halo = smoothstep(eh + 0.03, eh, r);
    finalColor += hotWhite * halo * 1.5;
    
    // Add some deep space blue/purple hue
    float diskMask = smoothstep(0.0, 0.5, diskFront + diskBack);
    finalColor += vec3(0.02, 0.0, 0.08) * lensStrength * (1.0 - diskMask);
    
    // Calculate alpha to make the billboard transparent outside the features
    // Event horizon MUST be fully opaque (alpha 1) to block background stars
    float ehAlpha = 1.0 - smoothstep(eh - 0.01, eh, r);
    float diskAlpha = smoothstep(0.0, 0.1, diskFront + diskBack);
    float haloAlpha = halo * 0.8;
    float tintAlpha = smoothstep(1.0, 0.0, r) * lensStrength * 0.5; // Soft fade out for tint
    
    float alpha = max(ehAlpha, max(diskAlpha, max(haloAlpha, tintAlpha)));
    
    gl_FragColor = vec4(finalColor, alpha);
}
