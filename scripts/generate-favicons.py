import struct
import zlib
import math
import os
import base64

def write_png_bytes(width, height, rgba_data):
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # Filter type 0 (None)
        raw.extend(rgba_data[y * width * 4 : (y + 1) * width * 4])
    compressed = zlib.compress(bytes(raw), level=9)
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr)))
    png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', zlib.crc32(b'IDAT' + compressed)))
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', zlib.crc32(b'IEND')))
    return bytes(png)

def read_png(filename):
    with open(filename, 'rb') as f:
        data = f.read()
    pos = 8
    chunks = []
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        ctype = data[pos+4:pos+8]
        cdata = data[pos+8:pos+8+length]
        chunks.append((ctype, cdata))
        pos += 8 + length + 4
    ihdr = [c[1] for c in chunks if c[0] == b'IHDR'][0]
    idat = b''.join([c[1] for c in chunks if c[0] == b'IDAT'])
    w, h = struct.unpack('>II', ihdr[:8])
    raw = zlib.decompress(idat)
    stride = 1 + w * 4
    bpp = 4
    unfiltered = bytearray(w * h * 4)

    def paeth(a, b, c):
        p = a + b - c
        pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
        return a if pa <= pb and pa <= pc else (b if pb <= pc else c)

    prev = bytearray(w * 4)
    for y in range(h):
        ftype = raw[y * stride]
        row = bytearray(raw[y * stride + 1 : (y + 1) * stride])
        curr = bytearray(w * 4)
        for x in range(w * 4):
            filt = row[x]
            left = curr[x - bpp] if x >= bpp else 0
            up = prev[x]
            upleft = prev[x - bpp] if x >= bpp else 0
            if ftype == 0: v = filt
            elif ftype == 1: v = (filt + left) & 0xff
            elif ftype == 2: v = (filt + up) & 0xff
            elif ftype == 3: v = (filt + ((left + up) // 2)) & 0xff
            elif ftype == 4: v = (filt + paeth(left, up, upleft)) & 0xff
            curr[x] = v
        unfiltered[y * w * 4 : (y + 1) * w * 4] = curr
        prev = curr
    return w, h, unfiltered

def make_ico(png_list):
    # png_list is list of (width, height, png_bytes)
    header = struct.pack('<HHH', 0, 1, len(png_list))
    entries = []
    offset = 6 + len(png_list) * 16
    for w, h, data in png_list:
        w_b = w if w < 256 else 0
        h_b = h if h < 256 else 0
        entry = struct.pack('<BBBBHHII', w_b, h_b, 0, 0, 1, 32, len(data), offset)
        entries.append(entry)
        offset += len(data)
    return header + b''.join(entries) + b''.join([d for _, _, d in png_list])

def main():
    w_d, h_d, px_d = read_png('public/logo-icon-dark.png')

    # Crop tight to non-transparent pixels
    min_x, max_x, min_y, max_y = w_d, 0, h_d, 0
    for y in range(h_d):
        for x in range(w_d):
            if px_d[(y * w_d + x) * 4 + 3] > 10:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y

    crop_w = max_x - min_x + 1
    crop_h = max_y - min_y + 1
    cropped = bytearray(crop_w * crop_h * 4)
    for cy in range(crop_h):
        for cx in range(crop_w):
            for c in range(4):
                cropped[(cy * crop_w + cx) * 4 + c] = px_d[((min_y + cy) * w_d + (min_x + cx)) * 4 + c]

    def render_badge(size, is_circle=True, corner_radius_pct=0.22):
        out = bytearray(size * size * 4)
        center = size / 2.0
        radius = size * 0.485

        for y in range(size):
            for x in range(size):
                if is_circle:
                    dist = math.hypot(x + 0.5 - center, y + 0.5 - center)
                    if dist <= radius + 1.0:
                        alpha = max(0.0, min(1.0, radius + 1.0 - dist))
                        if alpha > 0:
                            t = y / size
                            r = int(0x0C * (1 - t) + 0x05 * t)
                            g = int(0x1B * (1 - t) + 0x0B * t)
                            b = int(0x32 * (1 - t) + 0x16 * t)
                            if dist > radius - 1.5:
                                rim = (dist - (radius - 1.5)) / 1.5
                                r = int(r * (1 - rim) + 0x24 * rim)
                                g = int(g * (1 - rim) + 0x3A * rim)
                                b = int(b * (1 - rim) + 0x5C * rim)
                            idx = (y * size + x) * 4
                            out[idx + 0] = r
                            out[idx + 1] = g
                            out[idx + 2] = b
                            out[idx + 3] = int(alpha * 255)
                else:
                    # Rounded rect for apple-touch-icon
                    r_cr = size * corner_radius_pct
                    dx = max(0.0, abs(x + 0.5 - center) - (center - r_cr))
                    dy = max(0.0, abs(y + 0.5 - center) - (center - r_cr))
                    dist = math.hypot(dx, dy)
                    if dist <= r_cr + 1.0:
                        alpha = max(0.0, min(1.0, r_cr + 1.0 - dist))
                        if alpha > 0:
                            t = y / size
                            r = int(0x0C * (1 - t) + 0x05 * t)
                            g = int(0x1B * (1 - t) + 0x0B * t)
                            b = int(0x32 * (1 - t) + 0x16 * t)
                            idx = (y * size + x) * 4
                            out[idx + 0] = r
                            out[idx + 1] = g
                            out[idx + 2] = b
                            out[idx + 3] = int(alpha * 255)

        # Composite white building
        target_h = int(size * 0.70)
        scale = target_h / crop_h
        target_w = int(crop_w * scale)
        ox = (size - target_w) // 2
        oy = (size - target_h) // 2

        for y in range(target_h):
            sy = y / scale
            y0 = int(sy)
            y1 = min(crop_h - 1, y0 + 1)
            fy = sy - y0

            for x in range(target_w):
                sx = x / scale
                x0 = int(sx)
                x1 = min(crop_w - 1, x0 + 1)
                fx = sx - x0

                p00 = (y0 * crop_w + x0) * 4
                p10 = (y0 * crop_w + x1) * 4
                p01 = (y1 * crop_w + x0) * 4
                p11 = (y1 * crop_w + x1) * 4

                a00, a10, a01, a11 = cropped[p00+3], cropped[p10+3], cropped[p01+3], cropped[p11+3]
                alpha_f = ((a00 * (1-fx) + a10 * fx) * (1-fy) + (a01 * (1-fx) + a11 * fx) * fy) / 255.0

                if alpha_f > 0.01:
                    t_idx = ((oy + y) * size + (ox + x)) * 4
                    bg_a = out[t_idx + 3] / 255.0

                    r_val = ((cropped[p00] * (1-fx) + cropped[p10] * fx) * (1-fy) + (cropped[p01] * (1-fx) + cropped[p11] * fx) * fy)
                    g_val = ((cropped[p00+1] * (1-fx) + cropped[p10+1] * fx) * (1-fy) + (cropped[p01+1] * (1-fx) + cropped[p11+1] * fx) * fy)
                    b_val = ((cropped[p00+2] * (1-fx) + cropped[p10+2] * fx) * (1-fy) + (cropped[p01+2] * (1-fx) + cropped[p11+2] * fx) * fy)

                    out_r = int(r_val * alpha_f + out[t_idx] * (1 - alpha_f))
                    out_g = int(g_val * alpha_f + out[t_idx+1] * (1 - alpha_f))
                    out_b = int(b_val * alpha_f + out[t_idx+2] * (1 - alpha_f))

                    out[t_idx + 0] = min(255, out_r)
                    out[t_idx + 1] = min(255, out_g)
                    out[t_idx + 2] = min(255, out_b)
                    out[t_idx + 3] = int(min(1.0, alpha_f + bg_a * (1 - alpha_f)) * 255)

        return out

    # Generate 192x192
    p192_data = render_badge(192, is_circle=True)
    p192_bytes = write_png_bytes(192, 192, p192_data)
    with open('public/logo-icon.png', 'wb') as f:
        f.write(p192_bytes)
    print('Updated public/logo-icon.png (192x192)')

    # Generate 48x48 (Google Search official recommendation)
    p48_data = render_badge(48, is_circle=True)
    p48_bytes = write_png_bytes(48, 48, p48_data)
    with open('public/favicon-48x48.png', 'wb') as f:
        f.write(p48_bytes)
    print('Created public/favicon-48x48.png (48x48)')

    # Generate 32x32
    p32_data = render_badge(32, is_circle=True)
    p32_bytes = write_png_bytes(32, 32, p32_data)
    with open('public/favicon-32x32.png', 'wb') as f:
        f.write(p32_bytes)
    print('Created public/favicon-32x32.png (32x32)')

    # Generate 16x16
    p16_data = render_badge(16, is_circle=True)
    p16_bytes = write_png_bytes(16, 16, p16_data)

    # Pack favicon.ico with 48, 32, 16
    ico_bytes = make_ico([
        (48, 48, p48_bytes),
        (32, 32, p32_bytes),
        (16, 16, p16_bytes)
    ])
    with open('public/favicon.ico', 'wb') as f:
        f.write(ico_bytes)
    print('Updated public/favicon.ico (48x48, 32x32, 16x16)')

    # Generate apple-touch-icon.png (180x180 squircle)
    p180_data = render_badge(180, is_circle=False, corner_radius_pct=0.22)
    p180_bytes = write_png_bytes(180, 180, p180_data)
    with open('public/apple-touch-icon.png', 'wb') as f:
        f.write(p180_bytes)
    print('Created public/apple-touch-icon.png (180x180)')

    # Generate public/favicon.svg
    b64_192 = base64.b64encode(p192_bytes).decode('ascii')
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 192 192">
  <image href="data:image/png;base64,{b64_192}" width="192" height="192" />
</svg>'''
    with open('public/favicon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content.strip())
    print('Updated public/favicon.svg')

if __name__ == '__main__':
    main()
