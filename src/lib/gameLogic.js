import { TALENT, OBRAS } from './gameData.js'
import { GAP_COST, FORANEO_MOBILITY_COST, EXTERNAL_HIRE_COST } from './constants.js'

const TIER_POINTS = { critical: 20, high: 12, medium: 6 }
const SENIOR_BONUS = 8
const FORANEO_PENALTY = 3
const ACTA_PENALTY = 4
const LOW_ACTITUD_PENALTY = 5

export function calcSlotScore(person) {
  if (!person) return 0
  let score = 0
  if (person.level === 'senior') score += SENIOR_BONUS
  if (person.foraneo) score -= FORANEO_PENALTY
  if (person.stats.calidad > 50) score += (person.stats.calidad - 50) / 10
  score -= person.actas * ACTA_PENALTY
  if (person.stats.actitud < 70) score -= LOW_ACTITUD_PENALTY
  return score
}

export function calcObraUtilidad(obra, allTalent) {
  const slots = obra.slots
  let raw = 0
  let maxRaw = 0

  for (const slot of slots) {
    const tierPts = TIER_POINTS[slot.tier] || 6
    maxRaw += tierPts + SENIOR_BONUS + (90 - 50) / 10

    if (slot.personId) {
      const person = allTalent.find(t => t.id === slot.personId)
      if (person) {
        raw += tierPts + calcSlotScore(person)
      }
    }
  }

  const utilidad = Math.min(100, Math.round((raw / maxRaw) * 100))
  return Math.max(0, utilidad)
}

export function calcAllUtilidades(obras, allTalent) {
  return obras.map(obra => ({
    obraId: obra.id,
    utilidad: calcObraUtilidad(obra, allTalent),
  }))
}

export function getAssignedPersonIds(obras) {
  const ids = new Set()
  for (const obra of obras) {
    for (const slot of obra.slots) {
      if (slot.personId) ids.add(slot.personId)
    }
  }
  return ids
}

export function getIdleTalent(obras, allTalent) {
  const assigned = getAssignedPersonIds(obras)
  return allTalent.filter(t => !assigned.has(t.id))
}

export function calcRoundCosts(obras, allTalent, budget) {
  const idle = getIdleTalent(obras, allTalent)
  const activeObras = obras.filter(o => !o.frozen).length || obras.length

  let totalCost = 0
  const breakdown = []

  for (const person of idle) {
    const costPerObra = Math.round(person.salary / activeObras)
    totalCost += person.salary
    breakdown.push({
      type: 'idle',
      message: `😴 ${person.name} ocioso/a: -$${person.salary}k`,
      amount: person.salary,
    })
  }

  let gaps = 0
  for (const obra of obras) {
    for (const slot of obra.slots) {
      if (!slot.personId) gaps++
    }
  }

  if (gaps > 0) {
    totalCost += gaps * GAP_COST
    breakdown.push({
      type: 'gap',
      message: `📭 ${gaps} slot(s) vacío(s): -$${gaps * GAP_COST}k`,
      amount: gaps * GAP_COST,
    })
  }

  return { totalCost, breakdown, newBudget: budget - totalCost }
}

export function canAssignToSlot(person, slot, obra) {
  if (!person || !slot) return false
  if (slot.personId) return false

  if (slot.dcOnly && !person.dc) return false

  const roleMap = {
    'Superintendente': ['Superintendente'],
    'Jefe de Obra': ['Jefe de Obra'],
    'Residente': ['Residente'],
    'Especialista DC': ['Especialista DC'],
  }

  const allowed = roleMap[slot.role] || []
  return allowed.includes(person.role)
}

export function findCompatibleSlots(person, obras) {
  const compatible = []
  for (const obra of obras) {
    for (const slot of obra.slots) {
      if (canAssignToSlot(person, slot, obra)) {
        compatible.push({ obraId: obra.id, slotId: slot.id })
      }
    }
  }
  return compatible
}

export function applyAssignment(obras, personId, obraId, slotId) {
  return obras.map(obra => {
    if (obra.id !== obraId) return obra
    return {
      ...obra,
      slots: obra.slots.map(slot => {
        if (slot.id !== slotId) return slot
        return { ...slot, personId }
      }),
    }
  })
}

export function removePersonFromObras(obras, personId) {
  return obras.map(obra => ({
    ...obra,
    slots: obra.slots.map(slot =>
      slot.personId === personId ? { ...slot, personId: null } : slot
    ),
  }))
}

export function calcOptimalAssignment(obras, allTalent) {
  const obrasCopy = JSON.parse(JSON.stringify(obras))
  const available = JSON.parse(JSON.stringify(allTalent))

  for (const obra of obrasCopy) {
    for (const slot of obra.slots) {
      slot.personId = null
    }
  }

  const sortedSlots = []
  for (const obra of obrasCopy) {
    for (const slot of obra.slots) {
      sortedSlots.push({ obra, slot, tierScore: TIER_POINTS[slot.tier] || 6 })
    }
  }
  sortedSlots.sort((a, b) => b.tierScore - a.tierScore)

  const assigned = new Set()

  for (const { obra, slot } of sortedSlots) {
    const candidates = available
      .filter(p => !assigned.has(p.id) && canAssignToSlot(p, slot, obra))
      .sort((a, b) => {
        const sa = TIER_POINTS[slot.tier] + calcSlotScore(a)
        const sb = TIER_POINTS[slot.tier] + calcSlotScore(b)
        return sb - sa
      })

    if (candidates.length > 0) {
      slot.personId = candidates[0].id
      assigned.add(candidates[0].id)
    }
  }

  return obrasCopy
}

export function determineWinner(obras, allTalent, players) {
  const utilidades = calcAllUtilidades(obras, allTalent)
  const allAbove70 = utilidades.every(u => u.utilidad >= 70)

  if (allAbove70) {
    return { type: 'all_win', utilidades }
  }

  const sorted = [...utilidades].sort((a, b) => b.utilidad - a.utilidad)
  const winnerId = sorted[0].obraId

  const winnerRole = { o1: 'Director Nave Industrial Altara', o2: 'Director Puente Río Norte', o3: 'Director Data Center Nube9' }[winnerId]
  const winnerPlayer = players?.find(p => p.role === winnerRole)

  return { type: 'single_win', utilidades, winnerId, winnerPlayer }
}

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function generatePlayerId() {
  return crypto.randomUUID()
}
