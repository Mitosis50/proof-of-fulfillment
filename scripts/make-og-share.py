"""Paper share card. No person. Frozen copy only."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (243, 239, 230)
SHEET = (251, 248, 241)
INK = (26, 23, 20)
MUTED = (107, 100, 91)
SUBTLE = (138, 130, 120)
RULE = (201, 187, 171)
HOLD = (47, 74, 66)

serif = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
serif_b = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
sans = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
d.rectangle((72, 56, W - 72, H - 56), fill=SHEET, outline=RULE, width=2)
d.rectangle((88, 72, W - 88, H - 72), outline=RULE, width=1)

kicker = ImageFont.truetype(sans, 22)
hold = ImageFont.truetype(serif, 96)
body = ImageFont.truetype(serif, 42)
tag = ImageFont.truetype(sans, 24)

d.text((128, 120), "FULFILLED  ·  FULFILLMENT RECEIPT", fill=SUBTLE, font=kicker)
d.text((128, 188), "Holds", fill=HOLD, font=hold)
d.text((128, 310), "Tuition obligation.", fill=INK, font=body)
d.text((128, 368), "Not a person.", fill=INK, font=body)
d.text(
    (128, 470),
    "We verify the obligation. We do not publish the person.",
    fill=MUTED,
    font=tag,
)

img.save("public/og-share.png", "PNG", optimize=True)
img.convert("RGB").save("public/og.jpg", "JPEG", quality=88)
print("wrote public/og-share.png and public/og.jpg")
