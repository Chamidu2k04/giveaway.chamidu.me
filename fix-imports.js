const fs = require('fs');
const files = [
  'src/app/admin/giveaways/new/page.tsx',
  'src/app/giveaway/[slugId]/thank-you/page.tsx',
  'src/app/page.tsx',
  'src/components/EntryForm.tsx',
  'src/components/Footer.tsx',
  'src/components/Navbar.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('Youtube')) {
      content = content.replace(/import\s+\{\s*([^}]*?)\bYoutube\b([^}]*?)\s*\}\s+from\s+['"]lucide-react['"];/, (match, p1, p2) => {
        const rest = [p1, p2].join('').replace(/,\s*,/g, ',').replace(/(^,\s*|\s*,$)/g, '').trim();
        let res = `import { Youtube } from "@/components/YoutubeIcon";\n`;
        if (rest) {
          res += `import { ${rest} } from "lucide-react";`;
        }
        return res;
      });
      fs.writeFileSync(f, content);
      console.log('Fixed', f);
    }
  }
});
