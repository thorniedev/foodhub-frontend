const fs = require('fs');
const file = 'src/components/home/features/Model.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add constraintsRef
content = content.replace(
  'export default function Model() {\n  const [mounted, setMounted] = useState(false);',
  'export default function Model() {\n  const constraintsRef = useRef<HTMLDivElement>(null);\n  const [mounted, setMounted] = useState(false);'
);

// 2. Add constraints container and drag props
content = content.replace(
  '  return (\n    <>\n      <motion.button\n        type="button"\n        // aria-label="Open FoodHub AI assistant"\n        onClick={openModal}\n        initial={{',
  '  return (\n    <>\n      <div ref={constraintsRef} className="fixed inset-0 z-[100] pointer-events-none" />\n      <motion.button\n        type="button"\n        // aria-label="Open FoodHub AI assistant"\n        onClick={openModal}\n        drag\n        dragConstraints={constraintsRef}\n        dragElastic={0.1}\n        dragMomentum={false}\n        initial={{'
);

// 3. Add pointer-events-auto
content = content.replace(
  'className="group fixed bottom-[calc(10px+env(safe-area-inset-bottom))] right-2 z-[100] cursor-pointer border-0 bg-transparent p-0 outline-none md:bottom-10 md:right-10 md:left-auto md:translate-x-0"',
  'className="group fixed bottom-[calc(10px+env(safe-area-inset-bottom))] right-2 z-[101] cursor-pointer border-0 bg-transparent p-0 outline-none md:bottom-10 md:right-10 md:left-auto md:translate-x-0 pointer-events-auto"'
);

// 4. Remove the tooltips (using regex to match from {/* AI recommendation preview */} down to just before {/* Main AI core */})
content = content.replace(
  /\{\/\*\s*AI recommendation preview\s*\*\/\}.*?(?=\{\/\*\s*Main AI core\s*\*\/\})/s,
  ''
);

fs.writeFileSync(file, content);
console.log('Patched successfully');
