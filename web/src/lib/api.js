const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

function pendingRequest(action, payload) {
  return Promise.resolve({
    status: 'not-configured',
    message: 'This action is not connected yet.',
    endpoint: `${apiBaseUrl}/${action}`,
    payload,
  })
}

export function createTicketCheckout(payload) {
  return pendingRequest('ticket-checkout', payload)
}

export function createSponsorshipCheckout(payload) {
  return pendingRequest('sponsorship-checkout', payload)
}

export function redeemCode(payload) {
  return pendingRequest('redeem-code', payload)
}