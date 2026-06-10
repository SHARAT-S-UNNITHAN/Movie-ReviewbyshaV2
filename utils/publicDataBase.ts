export function getPublicDataBase() {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    return pathname.startsWith('/Movie-ReviewbyshaV2') ? '/Movie-ReviewbyshaV2' : '';
  }

  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}
