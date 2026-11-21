const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
const tokenStorageKey = 'tedx-admin-token'
let adminToken = null

export const apiRoutes = {
  event: '/event',
  sponsorWall: '/sponsors/wall',
  referralLeaderboard: '/referrals/leaderboard',
  referrals: '/referrals',
  ticketCheckout: '/tickets/checkout',
  sponsorshipCheckout: '/sponsorships/checkout',
  redeemCode: '/sponsored-codes/redeem',
  adminLogin: '/admin/login',
  adminOverview: '/admin/overview',
  adminSettings: '/admin/settings',
  adminTicketTypes: '/admin/ticket-types',
  adminOrders: '/admin/orders',
  adminAttendees: '/admin/attendees',
  adminSponsors: '/admin/sponsors',
  adminReferrals: '/admin/referrals/leaderboard',
  adminSpeakers: '/admin/speakers',
}

export function setAdminToken(token) {
  adminToken = token || null
  if (typeof window === 'undefined') return
  if (adminToken) window.sessionStorage.setItem(tokenStorageKey, adminToken)
  else window.sessionStorage.removeItem(tokenStorageKey)
}

export function clearAdminToken() {
  setAdminToken(null)
}

export function hasAdminSession() {
  return Boolean(getAdminToken())
}

function getAdminToken() {
  if (adminToken) return adminToken
  if (typeof window === 'undefined') return null
  adminToken = window.sessionStorage.getItem(tokenStorageKey)
  return adminToken
}

function errorMessage(payload, status) {
  if (payload?.message) return payload.message
  if (payload?.errors) {
    return Object.values(payload.errors).flat().join(' ')
  }
  return `Request failed (${status}). Please try again.`
}

export async function apiRequest(path, { method = 'GET', body, query, auth = false } = {}) {
  const search = query ? `?${new URLSearchParams(query)}` : ''
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? getAdminToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}${search}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Unable to reach the API. Check your connection and try again.')
  }

  const raw = await response.text()
  let payload = null
  if (raw) {
    try {
      payload = JSON.parse(raw)
    } catch {
      payload = { message: raw }
    }
  }
  if (!response.ok) {
    const error = new Error(errorMessage(payload, response.status))
    error.status = response.status
    error.payload = payload
    throw error
  }
  return payload
}

const call = (path, method, body, options = {}) => apiRequest(path, { method, body, ...options })
const admin = (path, method = 'GET', body, options = {}) => call(path, method, body, { ...options, auth: true })

export const getEvent = () => apiRequest(apiRoutes.event)
export const getSponsorWall = () => apiRequest(apiRoutes.sponsorWall)
export const getReferralLeaderboard = () => apiRequest(apiRoutes.referralLeaderboard)
export const createReferral = (payload) => call(apiRoutes.referrals, 'POST', payload)
export const createTicketCheckout = (payload) => call(apiRoutes.ticketCheckout, 'POST', payload)
export const createSponsorshipCheckout = (payload) => call(apiRoutes.sponsorshipCheckout, 'POST', payload)
export const redeemCode = (payload) => call(apiRoutes.redeemCode, 'POST', payload)

export async function adminLogin(payload) {
  const response = await call(apiRoutes.adminLogin, 'POST', payload)
  const token = response?.token || response?.access_token || response?.data?.token
  if (!token) throw new Error('The API did not return an admin token.')
  setAdminToken(token)
  return response
}

export const getAdminOverview = () => admin(apiRoutes.adminOverview)
export const getAdminSettings = () => admin(apiRoutes.adminSettings)
export const updateAdminSettings = (payload) => admin(apiRoutes.adminSettings, 'PATCH', payload)
export const getAdminTicketTypes = () => admin(apiRoutes.adminTicketTypes)
export const createAdminTicketType = (payload) => admin(apiRoutes.adminTicketTypes, 'POST', payload)
export const updateAdminTicketType = (id, payload) => admin(`${apiRoutes.adminTicketTypes}/${id}`, 'PUT', payload)
export const deleteAdminTicketType = (id) => admin(`${apiRoutes.adminTicketTypes}/${id}`, 'DELETE')
export const getAdminOrders = () => admin(apiRoutes.adminOrders)
export const getAdminAttendees = (search = '') => admin(apiRoutes.adminAttendees, 'GET', undefined, { query: search ? { search } : undefined })
export const updateAttendeeCheckIn = (id, checkedIn) => admin(`${apiRoutes.adminAttendees}/${id}/check-in`, 'PATCH', { checked_in: checkedIn })
export const getAdminSponsors = () => admin(apiRoutes.adminSponsors)
export const getAdminReferrals = () => admin(apiRoutes.adminReferrals)
export const getAdminSpeakers = () => admin(apiRoutes.adminSpeakers)
export const createAdminSpeaker = (payload) => admin(apiRoutes.adminSpeakers, 'POST', payload)
export const updateAdminSpeaker = (id, payload) => admin(`${apiRoutes.adminSpeakers}/${id}`, 'PUT', payload)
export const deleteAdminSpeaker = (id) => admin(`${apiRoutes.adminSpeakers}/${id}`, 'DELETE')