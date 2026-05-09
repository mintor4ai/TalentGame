export const ROLES = {
  DIRECTOR_TORRE: 'Director Torre Altara',
  DIRECTOR_PUENTE: 'Director Puente Río Norte',
  DIRECTOR_DC: 'Director Data Center Nube9',
  GERENTE_RH: 'Gerente de RH',
}

export const ROLE_EMOJIS = {
  [ROLES.DIRECTOR_TORRE]: '🏢',
  [ROLES.DIRECTOR_PUENTE]: '🌉',
  [ROLES.DIRECTOR_DC]: '🖥️',
  [ROLES.GERENTE_RH]: '🤝',
}

export const ROLE_COLORS = {
  [ROLES.DIRECTOR_TORRE]: 'blue',
  [ROLES.DIRECTOR_PUENTE]: 'emerald',
  [ROLES.DIRECTOR_DC]: 'purple',
  [ROLES.GERENTE_RH]: 'amber',
}

export const ROLE_TO_OBRA = {
  [ROLES.DIRECTOR_TORRE]: 'o1',
  [ROLES.DIRECTOR_PUENTE]: 'o2',
  [ROLES.DIRECTOR_DC]: 'o3',
  [ROLES.GERENTE_RH]: null,
}

export const OBRA_TO_ROLE = {
  o1: ROLES.DIRECTOR_TORRE,
  o2: ROLES.DIRECTOR_PUENTE,
  o3: ROLES.DIRECTOR_DC,
}

export const VETO_TIMEOUT_SECONDS = 20
export const ROUND_DURATION_SECONDS = 300 // 5 minutes per round
export const MAX_ROUNDS = 4
export const IDLE_COST_PER_OBRA = 8
export const GAP_COST = 8
export const FORANEO_MOBILITY_COST = 10
export const EXTERNAL_HIRE_COST = 50
export const INITIAL_BUDGET = 300

export const DIFFICULTY_LABELS = {
  1: 'Fácil',
  2: 'Normal',
  3: 'Difícil',
}

export const LOG_TYPES = {
  INFO: 'info',
  GOOD: 'good',
  BAD: 'bad',
  EVENT: 'event',
  WARN: 'warn',
}

export const LOG_COLORS = {
  info: 'text-blue-300',
  good: 'text-green-400',
  bad: 'text-red-400',
  event: 'text-yellow-400',
  warn: 'text-orange-400',
}

export const LOG_ICONS = {
  info: 'ℹ️',
  good: '✅',
  bad: '🚫',
  event: '⚡',
  warn: '⚠️',
}
