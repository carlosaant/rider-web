'use strict';

async function getLocationData(longitude, latitude) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
  const response = await fetch(url);
  return await response.json();
}

function getMaxSpeed(positions) {
  let maxSpeed = 0;
  positions.forEach(position => {
    if (position.speed != null && position.speed > maxSpeed) {
      maxSpeed = position.speed;
    }
  });

  return (maxSpeed * 3.6).toFixed(1);
}

function getDistance(positions) {
  const earthRadiusKm = 6371;
  let totalDistance = 0;
  for (let i = 0; i < positions.length - 1; i++) {
    //o laço só e executado se 2 posiçoes estiverem, no caso longitude e latitude
    //quando i foi menor que o tamanho-1 ele nao vai acessar o ultimo elemento, oque ocasionaria um erro
    const p1 = {
      latitude: positions[i].latitude,
      longitude: positions[i].longitude
    };
    const p2 = {
      latitude: positions[i + 1].latitude,
      longitude: positions[i + 1].longitude
    };

    const deltaLatitude = toRadius(p2.latitude - p1.latitude);
    const deltaLongitude = toRadius(p2.longitude - p1.longitude);
    const a =
      Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
      Math.sin(deltaLongitude / 2) *
        Math.sin(deltaLongitude / 2) *
        Math.cos(toRadius(p1.latitude)) *
        Math.cos(toRadius(p2.latitude));
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;
    totalDistance += distance;
  }

  function toRadius(degree) {
    return (degree * Math.PI) / 180;
  }

  return totalDistance.toFixed(2);
}

function getDuration(ride) {
  const interval = ride.stopTime - ride.startTime;
  function formatDuration(duration) {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
  return formatDuration(interval);
}

function getStartDate(ride) {
  const d = new Date(ride.startTime);
  const day = d.toLocaleString('en-US', { day: 'numeric' });
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.toLocaleString('en-US', { year: 'numeric' });
  const hour = d.toLocaleString('en-US', { hour: '2-digit', hour12: false });
  const minute = d.toLocaleString('en-US', { minute: '2-digit' });

  return `${hour}:${minute} - ${month} ${day}, ${year}`;
}
