import re

with open('src/pages/LandingPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = re.sub(
    r"import \{ motion, useScroll, useTransform, useMotionValue, useSpring, useInView \} from 'framer-motion';",
    "import { motion, useInView } from 'framer-motion';",
    content
)

# 2. Remove FloatingParticles
content = re.sub(
    r'// Floating particles component.*?// 3D Product Mockup Component',
    '// 3D Product Mockup Component',
    content,
    flags=re.DOTALL
)

# 3. Remove SplineBackground, NoiseTexture, SpotlightCard
content = re.sub(
    r'// 3D Spline Background using HTML Canvas.*?export default function LandingPage\(\) \{',
    'export default function LandingPage() {',
    content,
    flags=re.DOTALL
)

# 4. Remove useScroll hooks and mouse effect
content = re.sub(
    r'  const heroRef = useRef\(null\);\n  const \{ scrollYProgress \}.*?  useEffect\(\(\) => \{\n    fetchStats\(\);\n  \}, \[\]\);',
    '  useEffect(() => {\n    fetchStats();\n  }, []);',
    content,
    flags=re.DOTALL
)

# 5. Remove instances in JSX
content = content.replace('        <SplineBackground />\n        <NoiseTexture />\n', '')
content = content.replace('          <SplineBackground />\n', '')

# 6. Update hero section ref
content = content.replace('      <section ref={heroRef} ', '      <section ')

# 7. Update hero div (which has style heroOpacity)
content = re.sub(
    r'<motion\.div\s+style=\{\{ opacity: heroOpacity, scale: heroScale, y: heroY \}\}\s+className="container mx-auto px-6 relative z-10 text-center max-w-5xl"\s+>',
    '<motion.div\n            initial={{ opacity: 0, scale: 0.95, y: -20 }}\n            whileInView={{ opacity: 1, scale: 1, y: 0 }}\n            viewport={{ once: true }}\n            transition={{ duration: 0.6 }}\n            className="container mx-auto px-6 relative z-10 text-center max-w-5xl"\n          >',
    content,
    flags=re.DOTALL
)

# 8. Update dashboard image parallax
content = re.sub(
    r'<motion\.div\s+style=\{\{\s+y: heroImageY,\s+rotateX: heroImageRotateX,\s+scale: heroImageScale,\s+transformStyle: \'preserve-3d\'\s+\}\}',
    '<motion.div\n              style={{ transformStyle: \'preserve-3d\' }}',
    content,
    flags=re.DOTALL
)

with open('src/pages/LandingPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("LandingPage updated successfully")
