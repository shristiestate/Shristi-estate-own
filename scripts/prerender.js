import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Dist directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

const templatePath = path.join(distDir, 'index.html');
const templateHtml = fs.readFileSync(templatePath, 'utf-8');

// Load custom page SEO overrides from data/pages-seo.json if present
const pagesSeoPath = path.join(rootDir, 'data', 'pages-seo.json');
const customSeoMap = new Map();
if (fs.existsSync(pagesSeoPath)) {
  try {
    const customList = JSON.parse(fs.readFileSync(pagesSeoPath, 'utf-8'));
    if (Array.isArray(customList)) {
      customList.forEach(item => {
        if (item && item.path) customSeoMap.set(item.path, item);
      });
      console.log(`Loaded ${customSeoMap.size} custom page SEO configs from data/pages-seo.json`);
    }
  } catch (e) {
    console.warn('Could not parse data/pages-seo.json:', e.message);
  }
}

// Define static metadata and semantic fallback content for each key route
const routesToPrerender = [
  {
    path: '/office-space',
    title: 'Office Space for Rent in Noida | Furnished & Bare Shell Offices | Shristi Estate',
    description: 'Explore verified commercial office spaces for rent, lease, and sale across Noida Sector 62, Noida Expressway, and Delhi NCR. Grade-A corporate towers with 100% DG backup.',
    canonical: 'https://shristiestate.in/office-space',
    h1: 'Office Space for Rent & Lease in Noida & Delhi NCR',
    content: `
      <p>Shristi Estate offers premium, verified commercial office spaces in Noida's premier business districts. Discover fully furnished office suites, plug-and-play IT workstations, and bare-shell corporate floors in iThum, Corenthum, Candor TechSpace, and Advant Navis.</p>
      <h2>Why Lease Office Space with Shristi Estate?</h2>
      <ul>
        <li>Grade-A certified corporate campuses with 3-tier security</li>
        <li>100% DG power backup and high-speed elevators</li>
        <li>Strategic proximity to Metro stations and expressway corridors</li>
        <li>Tailored lease flexibility from 500 sq ft to 50,000+ sq ft</li>
      </ul>
      <h2>Frequently Asked Questions</h2>
      <dl>
        <dt>What is the average rental rate for office space in Noida?</dt>
        <dd>Commercial office rentals range from ₹35 to ₹65/sq ft in Sector 62, and ₹55 to ₹95/sq ft along the Noida-Greater Noida Expressway depending on Grade-A status and furnishing.</dd>
        <dt>What is the typical lock-in period for corporate leases?</dt>
        <dd>Standard commercial lease agreements in Noida operate on 3-year or 9-year terms with an initial 3-year lock-in period and predetermined 5% annual or 15% triennial escalations.</dd>
      </dl>
    `,
    faqSchema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the average rental rate for office space in Noida?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Commercial office rentals in Noida typically range from ₹35 to ₹65/sq ft in Sector 62 and ₹55 to ₹95/sq ft along the Noida Expressway."
          }
        },
        {
          "@type": "Question",
          "name": "What is the typical lock-in period for corporate leases?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Standard corporate lease agreements in Noida operate on 3-year or 9-year terms with a 3-year lock-in period."
          }
        }
      ]
    }
  },
  {
    path: '/it-business-parks',
    title: 'IT & Business Parks in Noida | Grade-A Corporate Campuses | Shristi Estate',
    description: 'Discover Grade-A IT/ITeS business parks and SEZ corporate campuses in Noida Sector 62 and Greater Noida Expressway. High-speed fiber, central AC, multi-level parking.',
    canonical: 'https://shristiestate.in/it-business-parks',
    h1: 'Grade-A IT & Business Parks in Noida & Greater Noida',
    content: `
      <p>Explore world-class IT and corporate campuses across Noida and Greater Noida. Featuring pre-certified green buildings, central air conditioning, dual power substations, and enterprise amenities.</p>
      <h2>Featured IT Hubs</h2>
      <ul>
        <li>iThum Tower & Corenthum (Sector 62, Noida)</li>
        <li>Candor TechSpace & Oxygen Business Park (Noida Expressway)</li>
        <li>Advant Navis Business Park (Sector 142, Noida)</li>
        <li>Logix Cyber Park (Sector 62, Noida)</li>
      </ul>
      <h2>Frequently Asked Questions</h2>
      <dl>
        <dt>Can non-IT companies lease space in Noida IT Parks?</dt>
        <dd>Yes, institutional IT/ITeS business parks accommodate consulting firms, telecom, fintech, and knowledge-based enterprises under local industrial authority guidelines.</dd>
      </dl>
    `
  },
  {
    path: '/warehouses',
    title: 'Warehouses & Logistics Hubs for Rent in Noida | Shristi Estate',
    description: 'Find verified warehouses, logistics centers, and cold storage facilities for rent in Noida Sector 80, Sector 83, and Greater Noida. High clearance, dock levelers, 40ft container access.',
    canonical: 'https://shristiestate.in/warehouses',
    h1: 'Warehouses & Logistics Centers in Noida & Greater Noida',
    content: `
      <p>High-efficiency Grade-A logistics warehouses with up to 12m clear height, laser-screed flooring, automated dock levelers, and seamless connectivity to Yamuna Expressway and Eastern Peripheral Expressway (EPE).</p>
      <h2>Logistics Capabilities</h2>
      <ul>
        <li>FM2 grade heavy load bearing industrial flooring</li>
        <li>Dedicated truck aprons and container parking</li>
        <li>NFPA compliant fire hydrants and automatic ESFR sprinklers</li>
      </ul>
    `
  },
  {
    path: '/factory-industrial',
    title: 'Industrial Sheds & Factories for Rent in Noida | Shristi Estate',
    description: 'Verified industrial manufacturing units, factory sheds, and heavy-power plots for rent in Noida Sector 83, Sector 85, and Greater Noida Ecotech zones.',
    canonical: 'https://shristiestate.in/factory-industrial',
    h1: 'Industrial Manufacturing Factories & Sheds in Noida',
    content: `
      <p>Strategic industrial properties in Noida and Greater Noida zoned for manufacturing, light fabrication, electronics assembly, and textiles with heavy sanctioned power connections.</p>
    `
  },
  {
    path: '/land',
    title: 'Commercial & Industrial Land Plots in Noida | Shristi Estate',
    description: 'Clear-title commercial plots, institutional land, and industrial land plots for sale or lease across Noida, Greater Noida, and Yamuna Expressway.',
    canonical: 'https://shristiestate.in/land',
    h1: 'Commercial & Industrial Plots in Noida & Yamuna Expressway',
    content: `
      <p>Institutional and commercial plot investments in high-growth corridors near Jewar International Airport and Yamuna Expressway.</p>
    `
  },
  {
    path: '/shops',
    title: 'Commercial Shops & Retail Spaces in Noida | Shristi Estate',
    description: 'High-street retail shops, food court spaces, and commercial showrooms for rent and sale in Noida Sector 18, Sector 62, and Greater Noida.',
    canonical: 'https://shristiestate.in/shops',
    h1: 'Commercial Shops & Retail Showrooms in Noida',
    content: `
      <p>Prime high-footfall retail shops and anchor showroom locations across bustling commercial hubs and high-street shopping arcades.</p>
    `
  },
  {
    path: '/locations',
    title: 'Commercial Real Estate Locations in Noida & NCR | Shristi Estate',
    description: 'Browse commercial micro-markets across Noida, Greater Noida, and Yamuna Expressway. Sector 62, Expressway, Sector 63, Sector 83, Sector 85, and Sector 18.',
    canonical: 'https://shristiestate.in/locations',
    h1: 'Commercial Micro-Markets Across Noida & Delhi NCR',
    content: `
      <p>Comprehensive commercial real estate advisory across key industrial, tech, and retail corridors in Noida and Greater Noida.</p>
      <ul>
        <li><a href="/locations/sector-62">Sector 62: Prime IT/ITeS & Institutional Hub</a></li>
        <li><a href="/locations/noida-expressway">Noida Expressway: Grade-A Corporate Campuses</a></li>
        <li><a href="/locations/sector-63">Sector 63: Commercial & Industrial Cluster</a></li>
        <li><a href="/locations/sector-83">Sector 83: Industrial & Manufacturing Zone</a></li>
        <li><a href="/locations/sector-85">Sector 85: Heavy Industrial & Logistics Corridor</a></li>
        <li><a href="/locations/sector-18">Sector 18: Central Business & High-Street Retail District</a></li>
        <li><a href="/locations/greater-noida">Greater Noida: Industrial Parks & Logistics Hubs</a></li>
      </ul>
    `
  },
  {
    path: '/locations/sector-62',
    title: 'Commercial Real Estate in Sector 62 Noida | Office Space & IT Parks | Shristi Estate',
    description: 'Verified office spaces and IT parks in Sector 62 Noida. iThum, Corenthum, Logix Cyber Park. Walking distance from Electronic City Metro Station.',
    canonical: 'https://shristiestate.in/locations/sector-62',
    h1: 'Commercial Real Estate in Sector 62 Noida',
    content: `
      <p>Sector 62 is Noida's premier institutional and IT corridor. Adjacent to NH-24 / Delhi-Meerut Expressway and connected by Noida Electronic City Metro Station.</p>
      <h2>Top Commercial Towers in Sector 62</h2>
      <ul>
        <li>The iThum Tower (Plot No. A-40)</li>
        <li>The Corenthum (Plot No. A-41)</li>
        <li>Logix Cyber Park (Plot No. C-28/29)</li>
        <li>Stellar IT Park (Plot No. C-25)</li>
      </ul>
    `
  },
  {
    path: '/locations/noida-expressway',
    title: 'Office Space on Noida Expressway | Grade-A IT Parks | Shristi Estate',
    description: 'Corporate office space and SEZ campuses on Noida-Greater Noida Expressway. Advant Navis, Candor TechSpace, Oxygen Business Park, Assotech Business Cresterra.',
    canonical: 'https://shristiestate.in/locations/noida-expressway',
    h1: 'Commercial Properties along Noida-Greater Noida Expressway',
    content: `
      <p>The Noida-Greater Noida Expressway is the leading destination for Fortune 500 multinationals and corporate headquarters in Delhi NCR.</p>
    `
  },
  {
    path: '/about',
    title: 'About Shristi Estate | Leading Commercial Real Estate Advisory Noida',
    description: 'Learn about Shristi Estate and founder Sanjeet Kumar. Over 15 years of trusted commercial real estate advisory across Noida, Greater Noida, and Delhi NCR.',
    canonical: 'https://shristiestate.in/about',
    h1: 'About Shristi Estate - Commercial Property Consultants',
    content: `
      <p>Shristi Estate is a premier commercial real estate advisory firm headquartered in iThum Tower, Sector 62, Noida. Founded by Sanjeet Kumar, we specialize in corporate office leasing, warehouse acquisitions, industrial properties, and land plot advisory.</p>
    `
  },
  {
    path: '/contact',
    title: 'Contact Shristi Estate | Commercial Real Estate Advisory Noida',
    description: 'Get in touch with Shristi Estate. Call +91 87500 98666 or visit our office at Unit No. 1035, 10th Floor, Tower-B, iThum Tower, Sector-62, Noida.',
    canonical: 'https://shristiestate.in/contact',
    h1: 'Contact Shristi Estate Commercial Advisors',
    content: `
      <p>Speak directly with our commercial leasing specialists for office spaces, warehouses, or industrial properties.</p>
      <address>
        <strong>Shristi Estate</strong><br>
        Unit No. 1035, 10th Floor, Tower-B, iThum Tower, Plot No. A-40, Sector-62, Noida, UP 201309<br>
        Phone: +91 87500 98666 | Email: contact@shristiestate.in
      </address>
      <h2>Transit &amp; Strategic Landmarks</h2>
      <ul>
        <li>Electronic City Metro Station (Blue Line): 400m walking distance</li>
        <li>Delhi-Meerut Expressway (NH-24): Direct 2-minute highway merge</li>
        <li>Jewar International Airport: 45 minutes via Yamuna Expressway</li>
        <li>Dedicated multi-level parking &amp; visitor bays on-site</li>
      </ul>
      <p><a href="https://maps.google.com/?q=The+iThum+Plot+A-40+Sector+62+Noida" target="_blank" rel="noopener noreferrer">View Headquarters on Google Maps</a></p>
    `
  }
];

function generatePreRenderedHtml(routeConfig) {
  let html = templateHtml;

  const custom = customSeoMap.get(routeConfig.path);
  const effectiveTitle = custom?.title || routeConfig.title;
  const effectiveDescription = custom?.description || routeConfig.description;
  const effectiveCanonical = custom?.canonicalUrl || routeConfig.canonical;
  const effectiveOgTitle = custom?.ogTitle || effectiveTitle;
  const effectiveOgDescription = custom?.ogDescription || effectiveDescription;
  const effectiveOgImage = custom?.ogImage;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${effectiveTitle}</title>`);

  // Replace Meta Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${effectiveDescription}" />`
  );

  // Replace Canonical Link
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/,
    `<link rel="canonical" href="${effectiveCanonical}" />`
  );

  // Replace OG Tags
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${effectiveOgTitle}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${effectiveOgDescription}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/,
    `<meta property="og:url" content="${effectiveCanonical}" />`
  );

  if (effectiveOgImage) {
    html = html.replace(
      /<meta property="og:image" content=".*?" \/>/,
      `<meta property="og:image" content="${effectiveOgImage}" />`
    );
  }

  // Replace Semantic Fallback inside #root
  const fallbackRegex = /<div style="display:none">[\s\S]*?<\/div>/;
  const newFallback = `<div style="display:none">
        <h1>${routeConfig.h1}</h1>
        ${routeConfig.content}
        <nav aria-label="Commercial Directory">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/office-space">Office Spaces for Rent</a></li>
            <li><a href="/it-business-parks">IT &amp; Business Parks</a></li>
            <li><a href="/warehouses">Warehouses &amp; Logistics</a></li>
            <li><a href="/factory-industrial">Industrial &amp; Factories</a></li>
            <li><a href="/locations">Commercial Locations</a></li>
            <li><a href="/properties">All Commercial Properties</a></li>
            <li><a href="/contact">Contact Advisory</a></li>
          </ul>
        </nav>
      </div>`;

  html = html.replace(fallbackRegex, newFallback);

  // Add FAQ Schema if present
  if (routeConfig.faqSchema) {
    const faqScript = `\n    <script type="application/ld+json">\n    ${JSON.stringify(routeConfig.faqSchema, null, 2)}\n    </script>`;
    html = html.replace('</head>', `${faqScript}\n  </head>`);
  }

  return html;
}

console.log('--- Starting Static Route Pre-Rendering (SSG) ---');
for (const route of routesToPrerender) {
  const renderedHtml = generatePreRenderedHtml(route);
  const routeRelPath = route.path.replace(/^\//, '');
  const targetDir = path.join(distDir, routeRelPath);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), renderedHtml, 'utf-8');
  console.log(`✓ Generated SSG snapshot: dist/${routeRelPath}/index.html (${(renderedHtml.length / 1024).toFixed(1)} KB)`);
}
console.log('--- Pre-Rendering Complete ---');
