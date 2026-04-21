// Minimal stroke icon set
const Icon = ({ d, size = 20, stroke = 'currentColor', fill = 'none', sw = 1.8, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

const IconPlus = (p) => <Icon {...p} d="M12 5v14M5 12h14" />;
const IconMinus = (p) => <Icon {...p} d="M5 12h14" />;
const IconSettings = (p) => <Icon {...p} d={<>
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
</>} />;
const IconUndo = (p) => <Icon {...p} d={<>
  <path d="M3 7v6h6" />
  <path d="M3 13a9 9 0 1 0 3-6.7L3 9" />
</>} />;
const IconMore = (p) => <Icon {...p} fill="currentColor" stroke="none" d={<>
  <circle cx="5" cy="12" r="1.6" />
  <circle cx="12" cy="12" r="1.6" />
  <circle cx="19" cy="12" r="1.6" />
</>} />;
const IconClose = (p) => <Icon {...p} d="M18 6 6 18M6 6l12 12" />;
const IconCheck = (p) => <Icon {...p} d="M20 6 9 17l-5-5" />;
const IconChevR = (p) => <Icon {...p} d="m9 6 6 6-6 6" />;
const IconChevL = (p) => <Icon {...p} d="m15 6-6 6 6 6" />;
const IconChart = (p) => <Icon {...p} d={<>
  <path d="M3 3v18h18" />
  <path d="m7 15 4-4 3 3 5-6" />
</>} />;
const IconTable = (p) => <Icon {...p} d={<>
  <rect x="3" y="3" width="18" height="18" rx="2" />
  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
</>} />;
const IconShare = (p) => <Icon {...p} d={<>
  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
  <path d="m16 6-4-4-4 4" />
  <path d="M12 2v13" />
</>} />;
const IconTrophy = (p) => <Icon {...p} d={<>
  <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
  <path d="M17 4h3v3a3 3 0 0 1-3 3M7 4H4v3a3 3 0 0 0 3 3" />
</>} />;
const IconFlag = (p) => <Icon {...p} d={<>
  <path d="M4 22V4" />
  <path d="M4 4h13l-2 4 2 4H4" />
</>} />;
const IconHistory = (p) => <Icon {...p} d={<>
  <path d="M3 12a9 9 0 1 0 3-6.7L3 9" />
  <path d="M3 3v6h6M12 7v5l3 2" />
</>} />;
const IconHome = (p) => <Icon {...p} d={<>
  <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
</>} />;
const IconFolder = (p) => <Icon {...p} d={<>
  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
</>} />;
const IconEdit = (p) => <Icon {...p} d={<>
  <path d="M12 20h9" />
  <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" />
</>} />;
const IconTrash = (p) => <Icon {...p} d={<>
  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
    <path d="M5 6h14l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
</>} />;
const IconCopy = (p) => <Icon {...p} d={<>
  <rect x="9" y="9" width="13" height="13" rx="2" />
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
</>} />;
const IconCrown = (p) => <Icon {...p} fill="currentColor" stroke="none" d="M3 7l4 4 5-7 5 7 4-4-2 12H5z" />;
const IconX = IconClose;

Object.assign(window, {
  Icon, IconPlus, IconMinus, IconSettings, IconUndo, IconMore, IconClose, IconCheck,
  IconChevR, IconChevL, IconChart, IconTable, IconShare, IconTrophy, IconFlag,
  IconHistory, IconHome, IconFolder, IconEdit, IconTrash, IconCopy, IconCrown, IconX
});
