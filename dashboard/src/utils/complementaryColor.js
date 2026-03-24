export default function getComplementaryColor(hex) {
  const r = 255 - parseInt(hex.substr(1, 2), 16);
  const g = 255 - parseInt(hex.substr(3, 2), 16);
  const b = 255 - parseInt(hex.substr(5, 2), 16);

  const comp = (x) => x.toString(16).padStart(2, '0');
  return `#${comp(r)}${comp(g)}${comp(b)}`;
}