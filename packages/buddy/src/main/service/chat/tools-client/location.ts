export function getLocation() {
  console.log('🚩 Get the current location');
  const cities = ['New York', 'Los Angeles', 'Chicago', 'San Francisco'];
  return cities[Math.floor(Math.random() * cities.length)];
}
