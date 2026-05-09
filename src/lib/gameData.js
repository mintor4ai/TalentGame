export const TALENT = [
  {
    id: 't1', name: 'Ana Ruiz', role: 'Residente', level: 'senior',
    foraneo: false, salary: 14, salTier: 'm',
    stats: { energia: 90, calidad: 85, antiguedad: 80, actitud: 90 },
    actas: 0, dc: false,
    desc: '7 años sin incidentes. La más confiable del pool. Todos la quieren y nadie quiere cederla.',
    avatar: '👩‍💼',
  },
  {
    id: 't2', name: 'Bruno Salinas', role: 'Jefe de Obra', level: 'senior',
    foraneo: true, salary: 22, salTier: 'h',
    stats: { energia: 75, calidad: 88, antiguedad: 70, actitud: 80 },
    actas: 0, dc: false,
    desc: 'Foráneo. Viáticos incluidos. Excelente track en proyectos de estructura.',
    avatar: '👨‍🔧',
  },
  {
    id: 't3', name: 'Carla Mendoza', role: 'Residente', level: 'junior',
    foraneo: false, salary: 8, salTier: 's',
    stats: { energia: 95, calidad: 65, antiguedad: 30, actitud: 88 },
    actas: 0, dc: false,
    desc: '2 años. La más barata. Mucha energía, aún aprendiendo a leer planos sin girarlos.',
    avatar: '👩‍🦱',
  },
  {
    id: 't4', name: 'Diego Lara', role: 'Superintendente', level: 'senior',
    foraneo: false, salary: 20, salTier: 'h',
    stats: { energia: 70, calidad: 92, antiguedad: 90, actitud: 68 },
    actas: 1, dc: false,
    desc: '12 años. Técnicamente el mejor. 1 acta por discusión con cliente. Cuidado.',
    avatar: '👨‍💼',
  },
  {
    id: 't5', name: 'Elena Torres', role: 'Jefe de Obra', level: 'senior',
    foraneo: true, salary: 24, salTier: 'h',
    stats: { energia: 85, calidad: 90, antiguedad: 65, actitud: 85 },
    actas: 0, dc: false,
    desc: 'Foránea. La mejor JO del mercado. Lo sabe. Su salario también lo sabe.',
    avatar: '👩‍🔧',
  },
  {
    id: 't6', name: 'Fidel Vargas', role: 'Residente', level: 'junior',
    foraneo: true, salary: 16, salTier: 'm',
    stats: { energia: 78, calidad: 60, antiguedad: 25, actitud: 62 },
    actas: 2, dc: false,
    desc: 'Foráneo junior. 2 actas por impuntualidad. Barato pero con historial. Lotería pura.',
    avatar: '👨‍🦯',
  },
  {
    id: 't7', name: 'Gaby Mora', role: 'Superintendente', level: 'junior',
    foraneo: false, salary: 10, salTier: 's',
    stats: { energia: 92, calidad: 70, antiguedad: 40, actitud: 95 },
    actas: 0, dc: false,
    desc: '4 años. Actitud 95 — la mejor del pool. Le falta experiencia en obra grande.',
    avatar: '👩‍🦰',
  },
  {
    id: 't8', name: 'Héctor Ibarra', role: 'Jefe de Obra', level: 'junior',
    foraneo: false, salary: 10, salTier: 's',
    stats: { energia: 88, calidad: 68, antiguedad: 35, actitud: 78 },
    actas: 0, dc: false,
    desc: '3 años. En formación. Nunca ha fallado, nunca ha brillado. El promedio confiable.',
    avatar: '👨‍🦱',
  },
  {
    id: 't9', name: 'Irma Castillo', role: 'Especialista DC', level: 'senior',
    foraneo: false, salary: 35, salTier: 'h',
    stats: { energia: 80, calidad: 95, antiguedad: 60, actitud: 90 },
    actas: 0, dc: true,
    desc: 'Única con cert. Tier III activa. Cobra lo que quiere. Y lo vale. No hay plan B.',
    avatar: '👩‍💻',
  },
  {
    id: 't10', name: 'Jorge Núñez', role: 'Superintendente', level: 'senior',
    foraneo: true, salary: 28, salTier: 'h',
    stats: { energia: 65, calidad: 88, antiguedad: 85, actitud: 68 },
    actas: 1, dc: false,
    desc: 'Foráneo senior. 1 acta de actitud. Gran experiencia en infraestructura pesada.',
    avatar: '👨‍🦳',
  },
]

export const EXTERNAL_TALENT_TEMPLATE = {
  id: 'ext', name: 'Externo de Emergencia', role: 'Variable', level: 'junior',
  foraneo: false, salary: 50, salTier: 'h',
  stats: { energia: 70, calidad: 55, antiguedad: 10, actitud: 75 },
  actas: 0, dc: false,
  desc: 'Contratado de emergencia. $50k. Junior, sin historial, disponible inmediatamente.',
  avatar: '🆕',
  isExternal: true,
}

export const OBRAS = [
  {
    id: 'o1',
    name: 'Torre Altara',
    emoji: '🏢',
    type: 'edificio',
    color: 'blue',
    slots: [
      { id: 's1', role: 'Superintendente', tier: 'critical', personId: null },
      { id: 's2', role: 'Jefe de Obra', tier: 'high', personId: null },
      { id: 's3', role: 'Residente', tier: 'medium', personId: null },
    ],
  },
  {
    id: 'o2',
    name: 'Puente Río Norte',
    emoji: '🌉',
    type: 'infraestructura',
    color: 'emerald',
    slots: [
      { id: 's4', role: 'Superintendente', tier: 'critical', personId: null },
      { id: 's5', role: 'Jefe de Obra', tier: 'high', personId: null },
      { id: 's6', role: 'Residente', tier: 'medium', personId: null },
    ],
  },
  {
    id: 'o3',
    name: 'Data Center Nube9',
    emoji: '🖥️',
    type: 'datacenter',
    color: 'purple',
    slots: [
      { id: 's7', role: 'Superintendente', tier: 'critical', personId: null },
      { id: 's8', role: 'Jefe de Obra', tier: 'high', personId: null },
      { id: 's9', role: 'Residente', tier: 'medium', personId: null },
      { id: 's10', role: 'Especialista DC', tier: 'critical', personId: null, dcOnly: true },
    ],
  },
]

export const EVENTS_BY_ROUND = {
  2: [
    {
      message: '⚡ EVENTO: Torre Altara se retrasa 3 semanas. El Superintendente fue reasignado.',
      type: 'event',
      action: { type: 'clear_slot', obraId: 'o1', slotId: 's1' },
      difficulty: 1,
    },
  ],
  3: [
    {
      message: '⚡ EVENTO: Baja médica en Puente Río Norte. El Jefe de Obra está incapacitado.',
      type: 'event',
      action: { type: 'clear_slot', obraId: 'o2', slotId: 's5' },
      difficulty: 2,
    },
  ],
}

export const DIFFICULTY_EVENTS = {
  3: {
    1: [
      {
        message: '⚡ EVENTO: La DG prometió nueva obra sin presupuesto. Presupuesto -$30k.',
        type: 'bad',
        action: { type: 'reduce_budget', amount: 30 },
      },
    ],
    3: [
      {
        message: '⚡ EVENTO: COVID doble — 2 colaboradores positivos. 2 slots vacíos simultáneos.',
        type: 'bad',
        action: { type: 'covid_double' },
      },
    ],
  },
}

export function getInitialGameState(difficulty = 2) {
  return {
    obras: JSON.parse(JSON.stringify(OBRAS)),
    talent: JSON.parse(JSON.stringify(TALENT)),
    extra_talent: [],
    transfers: [],
    frozen_obras: [],
  }
}
