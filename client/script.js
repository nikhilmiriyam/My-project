const modal = document.getElementById('bookingModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const form = document.getElementById('bookingForm');
const message = document.getElementById('formMessage');
const modalSummary = document.getElementById('modalSummary');

const routeButtons = Array.from(document.querySelectorAll('.route-option'));
const travelTypeSelect = document.getElementById('travelType');
const seatCountSelect = document.getElementById('seatCount');
const travelDateInput = document.getElementById('travelDate');
const pickupAddressInput = document.getElementById('pickupAddress');
const fromLocationInput = document.getElementById('fromLocation');
const toLocationInput = document.getElementById('toLocation');
const vehicleTypeSelect = document.getElementById('vehicleType');
const vehicleTypeField = document.getElementById('vehicleTypeField');
const carModelSelect = document.getElementById('carModel');

const previewRoute = document.getElementById('previewRoute');
const previewPickup = document.getElementById('previewPickup');
const previewDestination = document.getElementById('previewDestination');
const previewType = document.getElementById('previewType');
const previewSeats = document.getElementById('previewSeats');
const previewDate = document.getElementById('previewDate');
const previewFare = document.getElementById('previewFare');
const previewNote = document.getElementById('previewNote');
const profileForm = document.getElementById('profileForm');
const profileMessage = document.getElementById('profileMessage');

const roleButtons = Array.from(document.querySelectorAll('.role-btn'));
const STORAGE_KEY = 'rideshare-user-data';
const USERS_KEY = 'rideshare-users';
const ACTIVE_USER_KEY = 'rideshare-active-user';
const BOOKINGS_KEY = 'rideshare-bookings';
const DASHBOARD_PAGE = '/dashboard.html';

const routeCatalog = [
  { label: 'Vijayawada → Gannavaram', from: 'Vijayawada', to: 'Gannavaram', fromFull: 'MG Road, Vijayawada 520001', toFull: 'Gannavaram Airport, Gannavaram 521102', distance: 28 },
  { label: 'Visakhapatnam → Rushikonda', from: 'Visakhapatnam', to: 'Rushikonda', fromFull: 'Dwaraka Nagar, Visakhapatnam 530016', toFull: 'Rushikonda Beach Road, Visakhapatnam 530045', distance: 18 },
  { label: 'Tirupati → Renigunta', from: 'Tirupati', to: 'Renigunta', fromFull: 'Alipiri, Tirupati 517501', toFull: 'Renigunta Airport Road, Tirupati 517520', distance: 14 }
];

function base64Encode(value) {
  return btoa(unescape(encodeURIComponent(value)));
}

function base64Decode(value) {
  return decodeURIComponent(escape(atob(value)));
}

function normalizeUserId(value) {
  return (value || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getAllUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (!legacy) return [];
    try {
      const parsed = JSON.parse(legacy);
      return [parsed];
    } catch (error) {
      return [];
    }
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function validateUser(user) {
  const errors = [];
  const normalizedUserId = normalizeUserId(user.userId || user.name);

  if (!user.name || user.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }

  if (!normalizedUserId || normalizedUserId.length < 4) {
    errors.push('User ID must be at least 4 characters.');
  }

  if (normalizeUserId(user.name) && normalizedUserId === normalizeUserId(user.name)) {
    errors.push('User ID must be different from your name.');
  }

  if (!/^\d{10}$/.test(user.phone || '')) {
    errors.push('Phone number must be exactly 10 digits.');
  }

  if (!user.gender) {
    errors.push('Please select a gender.');
  }

  const users = getAllUsers();
  const duplicate = users.find((candidate) => {
    const sameEmail = candidate.email?.toLowerCase() === (user.email || '').toLowerCase();
    const sameUserId = candidate.userId?.toLowerCase() === normalizedUserId;
    return sameEmail || sameUserId;
  });

  if (duplicate) {
    errors.push('That email or user ID is already in use.');
  }

  return { valid: errors.length === 0, errors };
}

function saveUser(user) {
  const normalizedUser = {
    ...user,
    name: (user.name || '').toString().trim(),
    userId: normalizeUserId(user.userId || user.name),
    email: (user.email || '').toString().trim().toLowerCase(),
    phone: (user.phone || '').toString().trim(),
    gender: (user.gender || '').toString().trim(),
    role: user.role || 'Passenger',
    password: (user.password || '').toString().trim()
  };

  const validation = validateUser(normalizedUser);
  if (!validation.valid) {
    throw new Error(validation.errors[0]);
  }

  const persistedUser = {
    ...normalizedUser,
    password: base64Encode(normalizedUser.password)
  };

  const users = getAllUsers();
  const existingIndex = users.findIndex((candidate) => candidate.email?.toLowerCase() === persistedUser.email?.toLowerCase() || candidate.userId?.toLowerCase() === persistedUser.userId?.toLowerCase());
  if (existingIndex >= 0) {
    users[existingIndex] = persistedUser;
  } else {
    users.push(persistedUser);
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedUser));
  return { ...persistedUser, password: normalizedUser.password };
}

function getStoredUser() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      password: parsed.password ? base64Decode(parsed.password) : ''
    };
  } catch (error) {
    return null;
  }
}

function saveActiveUser(user) {
  if (!user) return;
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
}

function getActiveUser() {
  const stored = localStorage.getItem(ACTIVE_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    return null;
  }
}

function clearActiveUser() {
  localStorage.removeItem(ACTIVE_USER_KEY);
}

function getBookingSessions() {
  const stored = localStorage.getItem(BOOKINGS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveBookingSession(session) {
  const sessions = getBookingSessions();
  const nextSessions = [{ id: Date.now(), ...session }, ...sessions].slice(0, 12);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(nextSessions));
}

function setAuthMessage(messageText, isError = false) {
  const authMessage = document.querySelector('.auth-message');
  if (!authMessage) return;
  authMessage.textContent = messageText;
  authMessage.style.color = isError ? '#dc2626' : '#16a34a';
}

let activeRoute = {
  route: 'Custom route',
  from: 'Enter pickup location',
  to: 'Enter drop location',
  price: 120,
  distance: 0
};

const carRateMap = {
  basic: 1,
  economy: 1.15,
  sedan: 1.3,
  suv: 1.45,
  luxury: 1.8,
  'luxury-suv': 2.1
};
const googleApiKey = window.RIDESHARE_GOOGLE_API_KEY || '';
let routeSearchTimer = null;

function getCarMultiplier() {
  return carRateMap[carModelSelect?.value || 'basic'] || 1;
}

function getCarLabel() {
  const value = carModelSelect?.value || 'basic';
  return {
    basic: 'Basic Hatchback',
    economy: 'Economy Sedan',
    sedan: 'Premium Sedan',
    suv: 'SUV',
    luxury: 'Luxury Sedan',
    'luxury-suv': 'Luxury SUV'
  }[value] || 'Basic Hatchback';
}

function formatDate(value) {
  if (!value) {
    return 'Select a date';
  }

  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function buildRouteLabel(fromValue, toValue) {
  const fromText = (fromValue || '').trim();
  const toText = (toValue || '').trim();
  if (!fromText && !toText) return 'Custom route';
  if (!fromText) return `${toText} trip`;
  if (!toText) return `${fromText} trip`;
  return `${fromText} → ${toText}`;
}

function getPresetDistance(fromValue, toValue) {
  const fromText = (fromValue || '').trim().toLowerCase();
  const toText = (toValue || '').trim().toLowerCase();
  const matchedRoute = routeCatalog.find((route) => {
    const routeFrom = route.from.toLowerCase();
    const routeTo = route.to.toLowerCase();
    return fromText === routeFrom || toText === routeTo || fromText.includes(routeFrom) || toText.includes(routeTo);
  });
  return matchedRoute ? matchedRoute.distance : 0;
}

function getEstimatedFare(distanceKm) {
  const multiplier = getCarMultiplier();
  const wholeCarPremium = travelTypeSelect?.value === 'Whole Car' ? 1.12 : 1;
  return Math.max(80, Math.round(distanceKm * 8 * multiplier * wholeCarPremium));
}

function applyRoute(routeConfig) {
  const fromValue = routeConfig.fromFull || routeConfig.from;
  const toValue = routeConfig.toFull || routeConfig.to;

  activeRoute = {
    route: `${fromValue} → ${toValue}`,
    from: fromValue,
    to: toValue,
    price: getEstimatedFare(routeConfig.distance || 0),
    distance: routeConfig.distance || 0
  };

  if (!fromLocationInput?.value) {
    if (fromLocationInput) fromLocationInput.value = routeConfig.from;
  }
  if (!toLocationInput?.value) {
    if (toLocationInput) toLocationInput.value = routeConfig.to;
  }
  if (!pickupAddressInput?.value) {
    if (pickupAddressInput) pickupAddressInput.value = fromValue;
  }
  updatePreview();
}

async function getGeocode(query) {
  const endpoint = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' }
  });
  const results = await response.json();
  const first = Array.isArray(results) ? results[0] : null;
  if (!first) return null;
  return {
    lat: Number(first.lat),
    lon: Number(first.lon),
    label: first.display_name || query
  };
}

function haversineDistance(pointA, pointB) {
  if (!pointA || !pointB) return 0;
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(pointB.lat - pointA.lat);
  const deltaLon = toRadians(pointB.lon - pointA.lon);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRadians(pointA.lat)) * Math.cos(toRadians(pointB.lat)) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

async function resolveRouteDistance() {
  const fromText = fromLocationInput?.value?.trim() || '';
  const toText = toLocationInput?.value?.trim() || '';
  if (!fromText || !toText) {
    activeRoute = {
      ...activeRoute,
      route: buildRouteLabel(fromText, toText),
      from: fromText || activeRoute.from,
      to: toText || activeRoute.to,
      distance: 0,
      price: getEstimatedFare(0)
    };
    updatePreview();
    return;
  }

  const presetDistance = getPresetDistance(fromText, toText);
  if (presetDistance) {
    activeRoute = {
      route: buildRouteLabel(fromText, toText),
      from: fromText,
      to: toText,
      price: getEstimatedFare(presetDistance),
      distance: presetDistance
    };
    updatePreview();
    return;
  }

  if (previewNote) previewNote.textContent = 'Fetching location and distance...';

  try {
    const [fromGeo, toGeo] = await Promise.all([getGeocode(fromText), getGeocode(toText)]);
    const distanceKm = Math.max(6, Math.round(haversineDistance(fromGeo, toGeo) || 18));
    activeRoute = {
      route: buildRouteLabel(fromText, toText),
      from: fromText,
      to: toText,
      price: getEstimatedFare(distanceKm),
      distance: distanceKm
    };
  } catch (error) {
    activeRoute = {
      route: buildRouteLabel(fromText, toText),
      from: fromText,
      to: toText,
      price: getEstimatedFare(18),
      distance: 18
    };
  }

  updatePreview();
}

function updatePreview() {
  const travelType = travelTypeSelect?.value || 'Shared Seat';
  const seatCount = Number(seatCountSelect?.value || 2);
  const pickup = pickupAddressInput?.value?.trim() || activeRoute.from;
  const selectedDate = travelDateInput?.value || '';

  const baseFare = activeRoute.price;
  const wholeCarSeats = travelType === 'Whole Car' ? Number(vehicleTypeSelect?.value || 4) : seatCount;
  const totalFare = travelType === 'Whole Car' ? baseFare * wholeCarSeats : baseFare * seatCount;
  const seatLabel = travelType === 'Whole Car' ? `${wholeCarSeats} Seater Whole Car` : `${seatCount} Seat${seatCount > 1 ? 's' : ''}`;
  const carLabel = getCarLabel();

  if (previewRoute) previewRoute.textContent = activeRoute.route;
  if (previewPickup) previewPickup.textContent = pickup;
  if (previewDestination) previewDestination.textContent = activeRoute.to;
  if (previewType) previewType.textContent = travelType;
  if (previewSeats) previewSeats.textContent = seatLabel;
  if (previewDate) previewDate.textContent = formatDate(selectedDate);
  if (previewFare) previewFare.textContent = `₹${totalFare}`;
  if (previewNote) previewNote.textContent = travelType === 'Whole Car'
    ? `Whole car booking selected with ${carLabel}.`
    : `${carLabel} booking is ready to confirm. Distance: ${activeRoute.distance || 0} km.`;

  if (travelType === 'Whole Car') {
    if (seatCountSelect) seatCountSelect.style.display = 'none';
    if (vehicleTypeField) vehicleTypeField.style.display = 'flex';
  } else {
    if (seatCountSelect) seatCountSelect.style.display = 'block';
    if (vehicleTypeField) vehicleTypeField.style.display = 'none';
  }
}

function openModal() {
  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-open-modal]').forEach((button) => {
  button.addEventListener('click', openModal);
});

closeModalBtn?.addEventListener('click', closeModal);

modal?.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

routeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    routeButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const selectedRoute = routeCatalog.find((route) => route.label === button.dataset.route) || routeCatalog[0];
    activeRoute = {
      ...activeRoute,
      route: selectedRoute.label,
      from: fromLocationInput?.value?.trim() || activeRoute.from,
      to: toLocationInput?.value?.trim() || activeRoute.to,
      price: getEstimatedFare(selectedRoute.distance || activeRoute.distance || 0),
      distance: selectedRoute.distance || activeRoute.distance || 0
    };
    updatePreview();
  });
});

function updateRouteFromSearch() {
  const fromValue = fromLocationInput?.value?.trim() || '';
  const toValue = toLocationInput?.value?.trim() || '';

  if (!fromValue && !toValue) {
    activeRoute = {
      ...activeRoute,
      route: 'Custom route',
      from: 'Enter pickup location',
      to: 'Enter drop location',
      price: getEstimatedFare(0),
      distance: 0
    };
    updatePreview();
    return;
  }

  activeRoute = {
    ...activeRoute,
    route: buildRouteLabel(fromValue, toValue),
    from: fromValue || activeRoute.from,
    to: toValue || activeRoute.to,
    price: getEstimatedFare(activeRoute.distance || 0)
  };
  updatePreview();
  if (routeSearchTimer) clearTimeout(routeSearchTimer);
  routeSearchTimer = window.setTimeout(() => {
    resolveRouteDistance();
  }, 350);
}

[travelTypeSelect, seatCountSelect, travelDateInput, pickupAddressInput, fromLocationInput, toLocationInput, vehicleTypeSelect, carModelSelect].forEach((element) => {
  element?.addEventListener('input', () => {
    if (element === fromLocationInput || element === toLocationInput) {
      updateRouteFromSearch();
    } else {
      updatePreview();
    }
  });
  element?.addEventListener('change', () => {
    if (element === fromLocationInput || element === toLocationInput) {
      updateRouteFromSearch();
    } else {
      updatePreview();
    }
  });
});

function initGooglePlacesAutocomplete() {
  if (!googleApiKey || !fromLocationInput || !toLocationInput) return;
  if (window.google?.maps?.places?.Autocomplete) {
    const fromAutocomplete = new window.google.maps.places.Autocomplete(fromLocationInput, {
      types: ['geocode'],
      componentRestrictions: { country: 'in' }
    });
    const toAutocomplete = new window.google.maps.places.Autocomplete(toLocationInput, {
      types: ['geocode'],
      componentRestrictions: { country: 'in' }
    });
    fromAutocomplete.addListener('place_changed', () => {
      const place = fromAutocomplete.getPlace();
      if (place?.formatted_address) {
        fromLocationInput.value = place.formatted_address;
      }
      updateRouteFromSearch();
    });
    toAutocomplete.addListener('place_changed', () => {
      const place = toAutocomplete.getPlace();
      if (place?.formatted_address) {
        toLocationInput.value = place.formatted_address;
      }
      updateRouteFromSearch();
    });
  }
}

function loadGoogleMapsScript() {
  if (!googleApiKey || document.getElementById('ride-share-google-maps')) return;
  const script = document.createElement('script');
  script.id = 'ride-share-google-maps';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
  script.async = true;
  script.onload = initGooglePlacesAutocomplete;
  document.head.appendChild(script);
}

roleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    roleButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const riderFields = document.getElementById('riderFields');
    if (riderFields) {
      riderFields.style.display = button.dataset.role === 'Rider' ? 'block' : 'none';
    }
  });
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const activeUser = getActiveUser() || getStoredUser();
  const name = activeUser?.name?.trim() || 'Guest';
  const selectedRoute = activeRoute.route;
  const travelType = travelTypeSelect?.value || 'Shared Seat';
  const seatCapacity = travelType === 'Whole Car' ? Number(vehicleTypeSelect?.value || 4) : Number(seatCountSelect?.value || 2);

  if (message) {
    message.textContent = `Thanks ${name}! Your ${selectedRoute} request has been confirmed.`;
  }
  if (modalSummary) {
    modalSummary.textContent = `${name}, your ${selectedRoute} booking is confirmed for ${formatDate(travelDateInput?.value || '')}.`;
  }

  if (activeUser) {
    saveBookingSession({
      route: activeRoute.route || selectedRoute,
      pickup: pickupAddressInput?.value?.trim() || activeRoute.from,
      destination: toLocationInput?.value?.trim() || activeRoute.to,
      travelType,
      seats: seatCapacity,
      date: travelDateInput?.value || '',
      fare: previewFare?.textContent || `₹${activeRoute.price}`,
      status: 'Upcoming',
      userName: activeUser.name,
      userEmail: activeUser.email,
      role: activeUser.role,
      phone: activeUser.phone || 'Not added',
      carModel: getCarLabel()
    });
  }

  openModal();
  form.reset();
  updatePreview();
});

function renderDashboard() {
  if (document.body?.dataset.page !== 'dashboard') return;

  const activeUser = getActiveUser() || getStoredUser();
  if (activeUser) {
    saveActiveUser(activeUser);
  }

  const greeting = document.getElementById('dashboardGreeting');
  const summary = document.getElementById('dashboardSummary');
  const name = document.getElementById('dashboardName');
  const role = document.getElementById('dashboardRole');
  const userId = document.getElementById('dashboardUserId');
  const phone = document.getElementById('dashboardPhone');
  const email = document.getElementById('dashboardEmail');
  const nextTrip = document.getElementById('dashboardNextTrip');
  const status = document.getElementById('dashboardStatus');
  const sessionsBox = document.getElementById('dashboardSessions');

  if (!activeUser) {
    if (greeting) greeting.textContent = 'Hello there';
    if (summary) summary.textContent = 'Sign in to access your personalized lobby.';
    if (sessionsBox) sessionsBox.innerHTML = '<p class="preview-note">No saved sessions yet.</p>';
    return;
  }

  if (greeting) greeting.textContent = `Hello ${activeUser.name || 'there'}!`;
  if (summary) summary.textContent = `${activeUser.role || 'Passenger'} account ready for your next trip.`;
  if (name) name.textContent = activeUser.name || 'Guest';
  if (role) role.textContent = activeUser.role || 'Passenger';
  if (userId) userId.textContent = activeUser.userId || 'pending';
  if (phone) phone.textContent = activeUser.phone || 'Not added';
  if (email) email.textContent = activeUser.email || 'No email';
  if (nextTrip) nextTrip.textContent = getBookingSessions()[0]?.route || 'No upcoming ride';
  if (status) status.textContent = activeUser.gender || 'Verified';

  if (sessionsBox) {
    const sessions = getBookingSessions();
    if (!sessions.length) {
      sessionsBox.innerHTML = '<p class="preview-note">No booking sessions yet.</p>';
      return;
    }

    sessionsBox.innerHTML = sessions.map((session) => `
      <div class="summary-card">
        <div class="summary-row">
          <span>${session.route || 'Ride request'}</span>
          <strong>${session.status || 'Booked'}</strong>
        </div>
        <div class="summary-row">
          <span>${session.pickup || 'Pickup pending'}</span>
          <strong>${session.date ? formatDate(session.date) : 'Flexible'}</strong>
        </div>
        <div class="summary-row">
          <span>${session.travelType || 'Shared Seat'}</span>
          <strong>${session.fare || 'Fare pending'}</strong>
        </div>
        <div class="summary-row">
          <span>${session.seats || 2} seat${Number(session.seats || 2) > 1 ? 's' : ''}</span>
          <strong>${session.userName || 'User'}</strong>
        </div>
      </div>
    `).join('');
  }
}

function renderAccountPage() {
  if (document.body?.dataset.page !== 'account') return;
  const activeUser = getActiveUser() || getStoredUser();
  if (!activeUser || !profileForm) return;

  const nameInput = document.getElementById('profileName');
  const userIdInput = document.getElementById('profileUserId');
  const emailInput = document.getElementById('profileEmail');
  const phoneInput = document.getElementById('profilePhone');
  const genderInput = document.getElementById('profileGender');
  const roleInput = document.getElementById('profileRole');

  if (nameInput) nameInput.value = activeUser.name || '';
  if (userIdInput) userIdInput.value = activeUser.userId || '';
  if (emailInput) emailInput.value = activeUser.email || '';
  if (phoneInput) phoneInput.value = activeUser.phone || '';
  if (genderInput) genderInput.value = activeUser.gender || '';
  if (roleInput) roleInput.value = activeUser.role || 'Passenger';
}

function renderHistoryPage() {
  if (document.body?.dataset.page !== 'history') return;
  const upcomingBox = document.getElementById('upcomingHistory');
  const bookedBox = document.getElementById('bookedHistory');
  const sessions = getBookingSessions();
  if (!upcomingBox || !bookedBox) return;

  const upcoming = sessions.filter((session) => session.status === 'Upcoming');
  const booked = sessions.filter((session) => session.status !== 'Upcoming');

  upcomingBox.innerHTML = upcoming.length
    ? upcoming.map((session) => `<div class="summary-card"><div class="summary-row"><span>${session.route || 'Ride'}</span><strong>${session.status || 'Upcoming'}</strong></div><div class="summary-row"><span>${session.pickup || 'Pickup pending'}</span><strong>${session.date ? formatDate(session.date) : 'Flexible'}</strong></div><div class="summary-row"><span>${session.travelType || 'Shared Seat'}</span><strong>${session.fare || 'Fare pending'}</strong></div></div>`).join('')
    : '<p class="preview-note">No upcoming rides yet.</p>';

  bookedBox.innerHTML = booked.length
    ? booked.map((session) => `<div class="summary-card"><div class="summary-row"><span>${session.route || 'Ride'}</span><strong>${session.status || 'Booked'}</strong></div><div class="summary-row"><span>${session.pickup || 'Pickup pending'}</span><strong>${session.date ? formatDate(session.date) : 'Flexible'}</strong></div><div class="summary-row"><span>${session.travelType || 'Shared Seat'}</span><strong>${session.fare || 'Fare pending'}</strong></div></div>`).join('')
    : '<p class="preview-note">No booked history yet.</p>';
}

function handleProfileSave(event) {
  event.preventDefault();
  const activeUser = getActiveUser() || getStoredUser();
  if (!activeUser) return;

  const formData = new FormData(profileForm);
  const updatedUser = {
    ...activeUser,
    name: formData.get('name')?.toString().trim() || activeUser.name,
    userId: normalizeUserId(formData.get('userId')?.toString().trim() || activeUser.userId || activeUser.name),
    email: formData.get('email')?.toString().trim().toLowerCase() || activeUser.email,
    phone: formData.get('phone')?.toString().trim() || activeUser.phone,
    role: formData.get('role')?.toString().trim() || activeUser.role,
    gender: formData.get('gender')?.toString().trim() || activeUser.gender,
    password: activeUser.password || ''
  };

  try {
    const saved = saveUser(updatedUser);
    saveActiveUser(saved);
    renderAccountPage();
    renderDashboard();
    if (profileMessage) profileMessage.textContent = 'Profile updated successfully.';
  } catch (error) {
    if (profileMessage) profileMessage.textContent = error.message;
  }
}

function handleLogout() {
  clearActiveUser();
  window.location.href = '/signin.html';
}

const authForms = Array.from(document.querySelectorAll('.auth-form'));
authForms.forEach((authForm) => {
  authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(authForm);
    const email = formData.get('email')?.toString().trim().toLowerCase() || '';
    const password = formData.get('password')?.toString().trim() || '';
    const name = formData.get('name')?.toString().trim() || '';
    const role = document.querySelector('.role-btn.active')?.dataset.role || 'Passenger';
    const gender = formData.get('gender')?.toString().trim() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const userId = formData.get('userId')?.toString().trim() || '';

    const isSignup = authForm.dataset.mode === 'signup';

    if (isSignup) {
      if (!name || !email || !password || !gender || !phone || !userId) {
        setAuthMessage('Please fill all signup fields including gender and phone.', true);
        return;
      }

      try {
        const user = saveUser({ name, email, role, password, gender, phone, userId });
        saveActiveUser(user);
        setAuthMessage(`Welcome ${name}! Your account is ready.`);
        window.location.href = DASHBOARD_PAGE;
      } catch (error) {
        setAuthMessage(error.message, true);
      }
      return;
    }

    const storedUser = getAllUsers().find((candidate) => candidate.email?.toLowerCase() === email && base64Decode(candidate.password || '') === password && (candidate.role || 'Passenger') === role);
    if (!storedUser) {
      setAuthMessage('No saved account found. Please sign up first.', true);
      return;
    }

    saveActiveUser({ ...storedUser, password: base64Decode(storedUser.password || '') });
    setAuthMessage(`Signed in as ${storedUser.name}.`);
    window.location.href = DASHBOARD_PAGE;
  });
});

document.querySelector('.logout-btn')?.addEventListener('click', handleLogout);
profileForm?.addEventListener('submit', handleProfileSave);
loadGoogleMapsScript();
renderDashboard();
renderAccountPage();
renderHistoryPage();
updatePreview();
