import re

with open('out/client/15_landing_partner_2.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("function openScreen(target) {", "function openScreen(target) {\n      if (typeof pauseVideo === 'function') pauseVideo();")

with open('out/client/15_landing_partner_2.html', 'w', encoding='utf-8') as f:
    f.write(content)
