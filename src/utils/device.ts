import { Linking } from 'react-native';

import { showToast } from '@/store/toast';

/** Hands off to the phone's dialer. */
export async function callNumber(phone: string) {
  try {
    await Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  } catch {
    showToast('No dialer available on this device');
  }
}

/** Opens Google Maps (app if installed, otherwise the browser) with directions to the customer. */
export async function openDirections(lat: number, lng: number, navigate = false) {
  const params = `api=1&destination=${lat},${lng}&travelmode=driving${navigate ? '&dir_action=navigate' : ''}`;
  try {
    await Linking.openURL(`https://www.google.com/maps/dir/?${params}`);
  } catch {
    showToast('Could not open Google Maps');
  }
}
